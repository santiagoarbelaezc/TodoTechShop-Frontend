// carrito.component.ts
import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CarritoService, ItemCarrito, ResultadoOperacion } from '../../../services/carrito/carrito.service';
import { ProductoService } from '../../../services/producto.service';
import { ProductoDto } from '../../../models/producto/producto.dto';
import { EstadoProducto } from '../../../models/enums/estado-producto.enum';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.css']
})
export class CarritoComponent implements OnInit, OnDestroy {
  @Input() mostrarCarrito: boolean = false;
  @Output() mostrarCarritoChange = new EventEmitter<boolean>();
  
  @Input() carritoVisible: boolean = false;
  @Output() carritoVisibleChange = new EventEmitter<boolean>();

  private carritoService = inject(CarritoService);
  private productoService = inject(ProductoService);
  private router = inject(Router);

  carrito: ItemCarrito[] = [];
  
  // Estados para descuentos
  mostrarInputDescuento: boolean = false;
  codigoDescuento: string = '';
  aplicandoDescuento: boolean = false;
  errorDescuento: string = '';

  // Estados de carga
  eliminandoProducto: number | null = null;
  ajustandoCantidad: number | null = null;
  cancelandoOrden: boolean = false;
  procesandoPago: boolean = false;

  // 🔥 CORREGIDO: Solo suscripción al carrito
  private carritoSubscription!: Subscription;

  descuentosValidos: { [codigo: string]: number } = {
    '11': 20,
    'DESC20': 20,
    'NAVIDAD': 15,
    'BLACKFRIDAY': 30,
    'VIP15': 15
  };

  async ngOnInit(): Promise<void> {
    console.log('🛒 CarritoComponent inicializado');
    
    // 🔥 CORREGIDO: Solo suscribirse al carrito
    this.carritoSubscription = this.carritoService.carrito$.subscribe(carrito => {
      this.carrito = carrito;
      console.log('🔄 Carrito actualizado:', carrito.length, 'productos');
    });
    
    // Cargar carrito desde backend
    try {
      await this.carritoService.cargarCarritoDesdeBackend();
      console.log('✅ Carrito cargado desde backend');
    } catch (error) {
      console.error('❌ Error cargando carrito desde backend:', error);
    }
  }

  ngOnDestroy(): void {
    if (this.carritoSubscription) {
      this.carritoSubscription.unsubscribe();
    }
  }

  // 🔥 SIMPLIFICADO: Verificar carrito para pago
  private async verificarCarritoParaPago(): Promise<boolean> {
    console.log('🔍 Verificando carrito para proceso de pago...');
    
    if (this.carrito.length === 0) {
      this.mostrarError('El carrito está vacío');
      return false;
    }

    console.log('✅ Carrito válido para pago');
    return true;
  }

  // 🔹 TOGGLE CARRITO
  toggleCarrito(): void {
    console.log('🔄 Toggle carrito');
    this.carritoVisible = !this.carritoVisible;
    this.carritoVisibleChange.emit(this.carritoVisible);
  }

  // 🔹 CERRAR CARRITO
  cerrarCarrito(): void {
    console.log('❌ Cerrando carrito');
    this.carritoVisible = false;
    this.carritoVisibleChange.emit(false);
  }

  // 🔥 ELIMINAR PRODUCTO
  async eliminarProducto(productoId: number): Promise<void> {
    console.log('🗑️ Eliminando producto ID:', productoId);
    
    this.eliminandoProducto = productoId;
    
    try {
      const resultado: ResultadoOperacion = await this.carritoService.eliminarProducto(productoId);
      
      if (resultado.exito) {
        console.log('✅ Producto eliminado exitosamente');
        this.mostrarExito('Producto eliminado del carrito');
      } else {
        this.mostrarError(resultado.mensaje || 'Error al eliminar el producto');
      }
    } catch (error: any) {
      console.error('❌ Error eliminando producto:', error);
      this.mostrarError(error.message || 'Error inesperado al eliminar producto');
    } finally {
      this.eliminandoProducto = null;
    }
  }

  // 🔥 AJUSTAR CANTIDAD - CORREGIDO CON VALIDACIÓN DE ESTADO Y STOCK
  async ajustarCantidad(productoId: number, cambio: number): Promise<void> {
    console.log('⚖️ Ajustando cantidad - Producto:', productoId, 'Cambio:', cambio);
    
    // 🔥 CORREGIDO: Verificar si puede incrementar antes de proceder
    if (cambio > 0) {
      const puedeIncrementar = await this.puedeIncrementar(productoId);
      if (!puedeIncrementar.puede) {
        this.mostrarErrorStock(puedeIncrementar.mensaje || 'No se puede incrementar la cantidad');
        return;
      }
    }
    
    this.ajustandoCantidad = productoId;
    
    try {
      const resultado: ResultadoOperacion = await this.carritoService.ajustarCantidad(productoId, cambio);
      
      if (resultado.exito) {
        console.log('✅ Cantidad ajustada exitosamente');
      } else {
        this.mostrarErrorStock(resultado.mensaje || 'Error al ajustar la cantidad');
      }
    } catch (error: any) {
      console.error('❌ Error ajustando cantidad:', error);
      this.mostrarError(error.message || 'Error inesperado al ajustar cantidad');
    } finally {
      this.ajustandoCantidad = null;
    }
  }

  // 🔥 SIMPLIFICADO: PAGAR CARRITO - SIN VALIDACIONES DE STOCK
  async pagarCarrito(): Promise<void> {
    console.log('💳 Iniciando proceso de pago');
    console.log('🛒 Productos en carrito:', this.carrito.length);
    
    if (this.carrito.length === 0) {
      this.mostrarError('El carrito está vacío');
      return;
    }

    this.procesandoPago = true;

    try {
      // 🔥 CORREGIDO: Solo verificar que el carrito no esté vacío
      const carritoValido = await this.verificarCarritoParaPago();
      if (!carritoValido) {
        this.procesandoPago = false;
        return;
      }

      // Sincronizar carrito antes de proceder al pago
      console.log('🔄 Sincronizando carrito antes del pago...');
      const exito = await this.carritoService.sincronizarCarritoCompleto();
      
      if (exito) {
        console.log('✅ Carrito sincronizado, navegando a resumen...');
        this.router.navigate(['/ordenVenta/resumen-orden']).then(() => {
          console.log('✅ Navegación completada');
          this.cerrarCarrito();
        });
      } else {
        this.mostrarError('Error al sincronizar el carrito. Por favor intente nuevamente.');
      }
      
    } catch (error: any) {
      console.error('❌ Error en el proceso de pago:', error);
      this.mostrarError(error.message || 'Error al procesar el pago. Intente nuevamente.');
    } finally {
      this.procesandoPago = false;
    }
  }

  // 🔥 CANCELAR ORDEN
  async cancelarOrden(): Promise<void> {
    console.log('❌ Solicitando cancelación de orden');

    if (this.carrito.length === 0) {
      this.mostrarInfo('El carrito ya está vacío');
      return;
    }

    const confirmacion = confirm(
      '¿Está seguro de que desea cancelar la orden y vaciar el carrito?\n\n' +
      `Se eliminarán ${this.carrito.length} producto(s) del carrito.`
    );
    
    if (!confirmacion) {
      console.log('✅ Cancelación cancelada por el usuario');
      return;
    }

    this.cancelandoOrden = true;
    
    try {
      const resultado: ResultadoOperacion = await this.carritoService.vaciarCarrito();
      
      if (resultado.exito) {
        console.log('✅ Orden cancelada y carrito vaciado');
        this.mostrarExito('Orden cancelada y carrito vaciado');
      } else {
        this.mostrarError(resultado.mensaje || 'Error al cancelar la orden');
      }
    } catch (error: any) {
      console.error('❌ Error cancelando orden:', error);
      this.mostrarError(error.message || 'Error inesperado al cancelar la orden');
    } finally {
      this.cancelandoOrden = false;
    }
  }

  // 🔹 MÉTODOS DE DESCUENTO
  aplicarDescuento(): void {
    console.log('🎫 Solicitando aplicar descuento');
    this.mostrarInputDescuento = true;
    
    setTimeout(() => {
      const input = document.querySelector('.discount-input');
      if (input) {
        (input as HTMLElement).focus();
      }
    });
  }

  validarDescuento(): void {
    console.log('🔍 Validando descuento:', this.codigoDescuento);

    if (!this.codigoDescuento.trim()) {
      this.errorDescuento = 'Por favor ingresa un código de descuento';
      return;
    }

    this.aplicandoDescuento = true;
    this.errorDescuento = '';

    const codigo = this.codigoDescuento.toUpperCase().trim();
    const porcentaje = this.descuentosValidos[codigo];

    if (porcentaje === undefined) {
      this.errorDescuento = 'Código no válido';
      this.aplicandoDescuento = false;
      return;
    }

    // Simular aplicación de descuento
    setTimeout(() => {
      console.log(`✅ Descuento del ${porcentaje}% aplicado`);
      this.mostrarInputDescuento = false;
      this.codigoDescuento = '';
      this.aplicandoDescuento = false;
      this.mostrarExito(`¡Descuento del ${porcentaje}% aplicado exitosamente!`);
    }, 1000);
  }

  cancelarInputDescuento(): void {
    this.mostrarInputDescuento = false;
    this.codigoDescuento = '';
    this.errorDescuento = '';
  }

  // 🔥 CORREGIDO: Verificar si un producto puede incrementarse usando ProductoService
  async puedeIncrementar(productoId: number): Promise<{ puede: boolean; mensaje?: string }> {
    try {
      // Obtener información actualizada del producto desde el servicio
      const producto = await this.productoService.obtenerProductoPorIdPublico(productoId).toPromise();
      
      if (!producto) {
        return { puede: false, mensaje: 'Producto no encontrado' };
      }

      // Verificar estado del producto
      if (producto.estado !== EstadoProducto.ACTIVO) {
        let mensaje = '';
        switch (producto.estado) {
          case EstadoProducto.INACTIVO:
            mensaje = 'Producto inactivo';
            break;
          case EstadoProducto.DESCONTINUADO:
            mensaje = 'Producto descontinuado';
            break;
          case EstadoProducto.AGOTADO:
            mensaje = 'Producto agotado';
            break;
          default:
            mensaje = 'Producto no disponible';
        }
        return { puede: false, mensaje };
      }

      // Verificar stock disponible considerando la cantidad actual en carrito
      const itemEnCarrito = this.carrito.find(item => item.producto.id === productoId);
      const cantidadActual = itemEnCarrito ? itemEnCarrito.cantidad : 0;
      const stockDisponible = producto.stock - cantidadActual;

      if (stockDisponible <= 0) {
        return { 
          puede: false, 
          mensaje: `Stock insuficiente. Máximo disponible: ${producto.stock} unidades` 
        };
      }

      return { puede: true };

    } catch (error) {
      console.error('❌ Error verificando disponibilidad del producto:', error);
      // En caso de error, usar la información local del carrito como fallback
      const itemEnCarrito = this.carrito.find(item => item.producto.id === productoId);
      if (itemEnCarrito) {
        const producto = itemEnCarrito.producto;
        
        // Verificar estado usando la información local
        if (producto.estado !== EstadoProducto.ACTIVO) {
          return { puede: false, mensaje: 'Producto no disponible' };
        }

        // Verificar stock usando la información local
        const stockDisponible = producto.stock - itemEnCarrito.cantidad;
        if (stockDisponible <= 0) {
          return { 
            puede: false, 
            mensaje: `Stock insuficiente. Máximo disponible: ${producto.stock} unidades` 
          };
        }
      }
      
      return { puede: false, mensaje: 'Error al verificar disponibilidad' };
    }
  }

  // 🔥 CORREGIDO: Obtener clase CSS para el botón basado en disponibilidad
  getClaseBotonIncrementar(productoId: number): string {
    const baseClass = 'quantity-btn bounce-entrance';
    
    // Verificación síncrona para la clase CSS (usamos información local)
    const item = this.carrito.find(item => item.producto.id === productoId);
    if (item) {
      const producto = item.producto;
      const stockDisponible = producto.stock - item.cantidad;
      
      if (producto.estado !== EstadoProducto.ACTIVO || stockDisponible <= 0) {
        return `${baseClass} disabled`;
      }
    }
    
    return baseClass;
  }

  // 🔥 CORREGIDO: Obtener tooltip para el botón deshabilitado
  getTooltipIncrementar(productoId: number): string {
    const item = this.carrito.find(item => item.producto.id === productoId);
    if (!item) {
      return 'Producto no encontrado';
    }

    const producto = item.producto;
    
    // Verificar estado del producto
    if (producto.estado !== EstadoProducto.ACTIVO) {
      switch (producto.estado) {
        case EstadoProducto.INACTIVO:
          return 'Producto inactivo';
        case EstadoProducto.DESCONTINUADO:
          return 'Producto descontinuado';
        case EstadoProducto.AGOTADO:
          return 'Producto agotado';
        default:
          return 'Producto no disponible';
      }
    }

    // Verificar stock disponible
    const stockDisponible = producto.stock - item.cantidad;
    if (stockDisponible <= 0) {
      return `Sin stock disponible (máximo: ${producto.stock})`;
    }

    return `Aumentar cantidad (${stockDisponible} disponibles)`;
  }

  // 🔥 CORREGIDO: Verificar si hay productos no disponibles en el carrito
  hayProductosNoDisponibles(): boolean {
    return this.carrito.some(item => {
      const producto = item.producto;
      const stockDisponible = producto.stock - item.cantidad;
      return producto.estado !== EstadoProducto.ACTIVO || stockDisponible <= 0;
    });
  }

  // 🔹 MÉTODOS DE CONVENIENCIA
  obtenerTotal(): number {
    return this.carritoService.obtenerTotal();
  }

  obtenerCantidadTotal(): number {
    return this.carritoService.obtenerCantidadTotal();
  }

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(precio);
  }

  estaEliminando(productoId: number): boolean {
    return this.eliminandoProducto === productoId;
  }

  estaAjustandoCantidad(productoId: number): boolean {
    return this.ajustandoCantidad === productoId;
  }

  // 🔥 MÉTODOS DE NOTIFICACIÓN
  private mostrarErrorStock(mensaje: string): void {
    console.error('🚨 Error de stock:', mensaje);
    alert(`⚠️ ${mensaje}`);
  }

  private mostrarError(mensaje: string): void {
    console.error('❌ Error:', mensaje);
    alert(`❌ ${mensaje}`);
  }

  private mostrarExito(mensaje: string): void {
    console.log('✅ Éxito:', mensaje);
    alert(`✅ ${mensaje}`);
  }

  private mostrarInfo(mensaje: string): void {
    console.log('ℹ️ Info:', mensaje);
    alert(`ℹ️ ${mensaje}`);
  }
}