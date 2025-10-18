// carrito.component.ts
import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CarritoService, ItemCarrito } from '../../../services/carrito.service';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.css']
})
export class CarritoComponent implements OnInit {
  @Input() mostrarCarrito: boolean = false;
  @Output() mostrarCarritoChange = new EventEmitter<boolean>();
  
  @Input() carritoVisible: boolean = false;
  @Output() carritoVisibleChange = new EventEmitter<boolean>();

  private carritoService = inject(CarritoService);
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

  descuentosValidos: { [codigo: string]: number } = {
    '11': 20,
    'DESC20': 20,
    'NAVIDAD': 15,
    'BLACKFRIDAY': 30,
    'VIP15': 15
  };

  async ngOnInit(): Promise<void> {
    console.log('🛒 CarritoComponent inicializado');
    
    // Cargar carrito desde backend primero
    try {
      await this.carritoService.cargarCarritoDesdeBackend();
      console.log('✅ Carrito cargado desde backend');
    } catch (error) {
      console.error('❌ Error cargando carrito desde backend:', error);
    }
    
    // Suscribirse a los cambios del carrito
    this.carritoService.carrito$.subscribe(carrito => {
      this.carrito = carrito;
      console.log('🔄 Carrito actualizado:', carrito.length, 'productos');
    });
  }

  // 🔹 TOGGLE CARRITO
  toggleCarrito(): void {
    console.log('🔄 === TOGGLE CARRITO ===');
    console.log('👀 Estado anterior:', this.carritoVisible ? 'visible' : 'oculto');
    
    this.carritoVisible = !this.carritoVisible;
    this.carritoVisibleChange.emit(this.carritoVisible);
    
    console.log('👀 Estado nuevo:', this.carritoVisible ? 'visible' : 'oculto');
    console.log('🛒 Productos en carrito:', this.carrito.length);
  }

  // 🔹 CERRAR CARRITO
  cerrarCarrito(): void {
    console.log('❌ Cerrando carrito');
    this.carritoVisible = false;
    this.carritoVisibleChange.emit(false);
  }

  // 🔹 ELIMINAR PRODUCTO (ACTUALIZADO - ASÍNCRONO)
  async eliminarProducto(productoId: number): Promise<void> {
    console.log('🗑️ === ELIMINANDO PRODUCTO DEL CARRITO ===');
    console.log('📦 Producto ID a eliminar:', productoId);
    
    this.eliminandoProducto = productoId;
    
    try {
      await this.carritoService.eliminarProducto(productoId);
      console.log('✅ Producto eliminado del carrito y backend');
    } catch (error) {
      console.error('❌ Error eliminando producto:', error);
      alert('Error al eliminar el producto. Intente nuevamente.');
    } finally {
      this.eliminandoProducto = null;
    }
  }

  // 🔹 AJUSTAR CANTIDAD (ACTUALIZADO - ASÍNCRONO)
  async ajustarCantidad(productoId: number, cambio: number): Promise<void> {
    console.log('⚖️ === AJUSTANDO CANTIDAD ===');
    console.log('📦 Producto ID:', productoId, 'Cambio:', cambio);
    
    this.ajustandoCantidad = productoId;
    
    try {
      await this.carritoService.ajustarCantidad(productoId, cambio);
      console.log('✅ Cantidad ajustada en carrito y backend');
    } catch (error) {
      console.error('❌ Error ajustando cantidad:', error);
      alert('Error al ajustar la cantidad. Intente nuevamente.');
    } finally {
      this.ajustandoCantidad = null;
    }
  }

  // 🔹 APLICAR DESCUENTO
  aplicarDescuento(): void {
    console.log('🎫 === SOLICITANDO APLICAR DESCUENTO ===');
    
    this.mostrarInputDescuento = true;
    console.log('📝 Mostrando input de descuento');
    
    setTimeout(() => {
      const input = document.querySelector('.discount-input');
      if (input) {
        (input as HTMLElement).focus();
        console.log('🎯 Input de descuento enfocado');
      }
    });
  }

  // 🔹 VALIDAR DESCUENTO
  validarDescuento(): void {
    console.log('🔍 === VALIDANDO DESCUENTO ===');
    console.log('📝 Código ingresado:', this.codigoDescuento);

    if (!this.codigoDescuento.trim()) {
      console.warn('❌ Código de descuento vacío');
      this.errorDescuento = 'Por favor ingresa un código de descuento';
      return;
    }

    this.aplicandoDescuento = true;
    this.errorDescuento = '';
    console.log('⏳ Aplicando descuento...');

    const codigo = this.codigoDescuento.toUpperCase().trim();
    const porcentaje = this.descuentosValidos[codigo];

    console.log('🔑 Código normalizado:', codigo);
    console.log('📊 Porcentaje encontrado:', porcentaje);

    if (porcentaje === undefined) {
      console.warn('❌ Código no válido:', codigo);
      this.errorDescuento = 'Código no válido';
      this.aplicandoDescuento = false;
      return;
    }

    // Simular aplicación de descuento
    setTimeout(() => {
      console.log(`✅ Descuento del ${porcentaje}% aplicado correctamente`);
      this.mostrarInputDescuento = false;
      this.codigoDescuento = '';
      this.aplicandoDescuento = false;
      alert(`¡Descuento del ${porcentaje}% aplicado exitosamente!`);
    }, 1000);
  }

  // 🔹 PAGAR CARRITO (ACTUALIZADO)
  async pagarCarrito(): Promise<void> {
    console.log('💳 === INICIANDO PAGO ===');
    console.log('🛒 Productos en carrito:', this.carrito.length);
    
    if (this.carrito.length === 0) {
      console.warn('❌ Carrito vacío, no se puede pagar');
      alert('El carrito está vacío');
      return;
    }

    try {
      // Sincronizar carrito completo con backend antes de pagar
      const exito = await this.carritoService.sincronizarCarritoCompleto();
      
      if (exito) {
        console.log('✅ Carrito sincronizado exitosamente, navegando a resumen de orden...');
        this.router.navigate(['/ordenVenta/resumen-orden']).then(() => {
          console.log('✅ Navegación a caja completada');
          this.cerrarCarrito();
        });
      } else {
        console.error('❌ Error al sincronizar carrito con el backend');
        alert('Error al procesar el carrito. Intente nuevamente.');
      }
    } catch (error) {
      console.error('❌ Error en el proceso de pago:', error);
      alert('Error al procesar el pago. Intente nuevamente.');
    }
  }

  // 🔹 CANCELAR ORDEN (ACTUALIZADO - ASÍNCRONO)
  async cancelarOrden(): Promise<void> {
    console.log('❌ === CANCELANDO ORDEN ===');
    console.log('🛒 Productos en carrito:', this.carrito.length);

    if (this.carrito.length === 0) {
      console.warn('⚠️ Carrito ya está vacío');
      alert('El carrito ya está vacío');
      return;
    }

    const confirmacion = confirm('¿Está seguro de que desea cancelar la orden y vaciar el carrito?');
    console.log('🤔 Confirmación del usuario:', confirmacion);
    
    if (!confirmacion) {
      console.log('✅ Cancelación cancelada por el usuario');
      return;
    }

    this.cancelandoOrden = true;
    
    try {
      await this.carritoService.vaciarCarrito();
      console.log('✅ Orden cancelada y carrito vaciado (local y backend)');
      alert('Orden cancelada y carrito vaciado');
    } catch (error) {
      console.error('❌ Error cancelando orden:', error);
      alert('Error al cancelar la orden. Intente nuevamente.');
    } finally {
      this.cancelandoOrden = false;
    }
  }

  // 🔹 OBTENER TOTAL
  obtenerTotal(): number {
    return this.carritoService.obtenerTotal();
  }

  // 🔹 OBTENER CANTIDAD TOTAL
  obtenerCantidadTotal(): number {
    return this.carritoService.obtenerCantidadTotal();
  }

  // 🔹 FORMATEAR PRECIO
  formatearPrecio(precio: number): string {
    const precioFormateado = new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(precio);
    
    return precioFormateado;
  }

  // 🔹 CANCELAR INPUT DESCUENTO
  cancelarInputDescuento(): void {
    this.mostrarInputDescuento = false;
    this.codigoDescuento = '';
    this.errorDescuento = '';
  }

  // 🔹 VERIFICAR SI SE ESTÁ ELIMINANDO UN PRODUCTO
  estaEliminando(productoId: number): boolean {
    return this.eliminandoProducto === productoId;
  }

  // 🔹 VERIFICAR SI SE ESTÁ AJUSTANDO LA CANTIDAD DE UN PRODUCTO
  estaAjustandoCantidad(productoId: number): boolean {
    return this.ajustandoCantidad === productoId;
  }
}