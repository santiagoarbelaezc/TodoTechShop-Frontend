import { Component, Input, Output, EventEmitter, AfterViewInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductoDto } from '../../../models/producto/producto.dto';
import { Router } from '@angular/router';
import { CarritoService } from '../../../services/carrito.service';
import { ProductoService } from '../../../services/producto.service';
import { Subscription, firstValueFrom } from 'rxjs'; // 🔥 NUEVAS IMPORTACIONES

@Component({
  selector: 'app-carrusel-productos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carrusel-productos.component.html',
  styleUrls: ['./carrusel-productos.component.css']
})
export class CarruselProductosComponent implements AfterViewInit, OnDestroy { // 🔥 IMPLEMENTA OnDestroy

  // ===========================
  // 🔹 INPUTS Y OUTPUTS
  // ===========================
  @Input() productos: ProductoDto[] = [];
  @Input() titulo: string = '';
  @Input() carouselId: string = '';

  @Output() productoSeleccionado = new EventEmitter<ProductoDto>();
  @Output() productoAgregado = new EventEmitter<ProductoDto>();

  // ===========================
  // 🔹 INYECCIONES
  // ===========================
  private router = inject(Router);
  private carritoService = inject(CarritoService);
  private productoService = inject(ProductoService);

  // 🔥 NUEVO: Suscripción para escuchar cambios
  private productosActualizadosSubscription?: Subscription;

  // ===========================
  // 🔹 CICLO DE VIDA
  // ===========================
  ngAfterViewInit(): void {
    console.log(`🎠 Carrusel "${this.carouselId}" inicializado con ${this.productos.length} productos`);
    this.setupCarouselScroll();
    this.suscribirACambiosDeProductos(); // 🔥 NUEVO: Suscribirse a cambios
  }

  ngOnDestroy(): void {
    // 🔥 IMPORTANTE: Limpiar suscripción para evitar memory leaks
    if (this.productosActualizadosSubscription) {
      this.productosActualizadosSubscription.unsubscribe();
      console.log('🧹 Suscripción a productos actualizados limpiada');
    }
  }

  // ===========================
  // 🔹 NUEVO MÉTODO: SUSCRIBIRSE A CAMBIOS
  // ===========================
  private suscribirACambiosDeProductos(): void {
    this.productosActualizadosSubscription = this.carritoService.productosActualizados$
      .subscribe((productosIds: number[]) => {
        console.log('🔄 Carrusel recibió actualización de productos:', productosIds);
        
        if (productosIds.length > 0) {
          this.actualizarProductosEnCarrusel(productosIds);
        }
      });
  }

  // ===========================
  // 🔹 NUEVO MÉTODO: ACTUALIZAR PRODUCTOS EN CARRUSEL
  // ===========================
  private async actualizarProductosEnCarrusel(productosIds: number[]): Promise<void> {
    console.log('🔄 Actualizando productos en carrusel:', productosIds);
    
    for (const productoId of productosIds) {
      try {
        // Obtener la información actualizada del producto desde el backend
        const productoActualizado = await firstValueFrom(
          this.productoService.obtenerProductoPorId(productoId)
        );
        
        console.log('📦 Producto actualizado recibido:', productoActualizado.nombre, productoActualizado.stock);

        // Actualizar el producto en el array local
        const index = this.productos.findIndex(p => p.id === productoId);
        if (index !== -1) {
          this.productos[index] = { ...this.productos[index], ...productoActualizado };
          console.log(`✅ Producto ${productoActualizado.nombre} actualizado en carrusel`);
        }
        
      } catch (error) {
        console.error(`❌ Error actualizando producto ${productoId} en carrusel:`, error);
      }
    }
  }

  // ===========================
  // 🔹 ACCIONES DEL CARRUSEL
  // ===========================
  scrollCarousel(direction: 'prev' | 'next'): void {
    console.log(`🔄 Scroll del carrusel ${this.carouselId} hacia: ${direction}`);
    
    const carousel = document.getElementById(`carousel-${this.carouselId}`);
    if (!carousel) {
      console.warn('⚠️ No se encontró el elemento del carrusel:', this.carouselId);
      return;
    }

    const scrollAmount = 325;
    const currentScroll = carousel.scrollLeft;

    carousel.scrollTo({
      left: direction === 'next' 
        ? currentScroll + scrollAmount 
        : currentScroll - scrollAmount,
      behavior: 'smooth'
    });

    this.updateCarouselIndicators();
  }

  private setupCarouselScroll(): void {
    const carousel = document.getElementById(`carousel-${this.carouselId}`);
    if (!carousel) return;

    // 🔧 SOLUCIÓN: Permitir scroll vertical normal
    carousel.addEventListener('wheel', (event) => {
      // Solo aplicar scroll horizontal si el usuario está desplazándose horizontalmente
      // o si el elemento ya tiene scroll horizontal activo
      const isScrollingHorizontally = Math.abs((event as WheelEvent).deltaX) > Math.abs((event as WheelEvent).deltaY);
      
      if (isScrollingHorizontally) {
        event.preventDefault();
        carousel.scrollLeft += (event as WheelEvent).deltaX;
      }
      // Si es scroll vertical, no hacer nada - permitir scroll normal de la página
    });

    console.log(`🖱️ Scroll inteligente activado para carrusel ${this.carouselId}`);
  }

  private updateCarouselIndicators(): void {
    console.log(`📊 Actualizando indicadores del carrusel: ${this.carouselId}`);
    // Lógica para actualizar indicadores si es necesario
  }

  // ===========================
  // 🔹 ACCIONES DE PRODUCTOS - ACTUALIZADAS
  // ===========================
  verDetalleProducto(producto: ProductoDto): void {
    console.log('👀 === VIENDO DETALLE DE PRODUCTO ===');
    
    // 🔥 OBTENER LA VERSIÓN MÁS ACTUALIZADA DEL PRODUCTO
    const productoActual = this.obtenerProductoActualizado(producto.id) || producto;
    
    console.log('📋 Producto seleccionado:', {
      id: productoActual.id,
      nombre: productoActual.nombre,
      precio: productoActual.precio,
      stock: productoActual.stock
    });
    
    // 🔥 ALMACENAR EL PRODUCTO ACTUALIZADO EN EL SERVICIO
    this.productoService.seleccionarProducto(productoActual);
    console.log('✅ Producto almacenado en servicio');
    
    // 🔥 EMITIR EL EVENTO AL COMPONENTE PADRE (INICIO)
    this.productoSeleccionado.emit(productoActual);
    
    // 🔥 REDIRIGIR AL COMPONENTE DE DESCRIPCIÓN
    console.log('🔄 Navegando a /descripcion-producto');
    this.router.navigate(['/descripcion-producto']);
  }

  // ===========================
  // 🔹 MÉTODO ACTUALIZADO: AGREGAR AL CARRITO
  // ===========================
  async agregarAlCarrito(producto: ProductoDto, event?: Event): Promise<void> {
    console.log('🛒 === AGREGANDO PRODUCTO AL CARRITO ===');
    console.log('📦 Producto:', producto.nombre);

    if (event) {
      event.stopPropagation();
      console.log('✅ Evento de clic prevenido');
    }

    if (producto.stock <= 0) {
      console.warn('❌ Producto sin stock disponible:', producto.nombre);
      alert('Producto sin stock disponible.');
      return;
    }

    try {
      // 🔥 USAR EL SERVICIO DEL CARRITO PARA AGREGAR EL PRODUCTO
      await this.carritoService.agregarProducto(producto);
      
      // 🔥 YA NO ACTUALIZAMOS EL STOCK LOCALMENTE - SE HARÁ AUTOMÁTICAMENTE VÍA LA SUSCRIPCIÓN
      // producto.stock--; // ❌ ELIMINAR ESTA LÍNEA
      
      // 🔥 EMITIR EL EVENTO AL COMPONENTE PADRE
      this.productoAgregado.emit(producto);

      console.log('✅ Producto agregado al carrito:', producto.nombre);
      alert(`${producto.nombre} agregado al carrito`);
      
    } catch (error) {
      console.error('❌ Error agregando producto al carrito:', error);
      alert('Error al agregar el producto al carrito');
    }
  }

  // ===========================
  // 🔹 NUEVO MÉTODO AUXILIAR: OBTENER PRODUCTO ACTUALIZADO
  // ===========================
  obtenerProductoActualizado(productoId: number): ProductoDto | undefined {
    return this.productos.find(p => p.id === productoId);
  }

  // ===========================
  // 🔹 MÉTODOS AUXILIARES
  // ===========================
  obtenerImagenProducto(producto: ProductoDto): string {
    if (producto.imagenUrl) {
      let url = producto.imagenUrl;
      if (!url.startsWith('assets/') && !url.startsWith('http')) {
        url = 'assets/' + url;
      }
      return url;
    }
    return 'assets/images/default-product.png';
  }

  formatearPrecio(precio: number): string {
    const precioFormateado = new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(precio);
    return precioFormateado;
  }

  tieneStockBajo(producto: ProductoDto): boolean {
    return producto.stock <= 3;
  }

  obtenerTextoStock(producto: ProductoDto): string {
    if (producto.stock === 0) return 'Sin stock';
    if (this.tieneStockBajo(producto)) return `Últimas ${producto.stock} unidades`;
    return `Stock: ${producto.stock}`;
  }

  obtenerClaseStock(producto: ProductoDto): string {
    if (producto.stock === 0) return 'stock-agotado';
    if (this.tieneStockBajo(producto)) return 'stock-bajo';
    return 'stock-normal';
  }
}