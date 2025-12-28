import { Component, AfterViewInit, HostListener, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { NavbarInicioComponent } from './navbar-inicio/navbar-inicio.component';
import { CarritoComponent } from './carrito/carrito.component';
import { ProductoService } from '../../services/producto.service';
import { CarritoService, ResultadoOperacion } from '../../services/carrito/carrito.service';
import { ProductoDto } from '../../models/producto/producto.dto';
import { CarruselProductosComponent } from './carrusel-productos/carrusel-productos.component';
import { NavbarStateService } from '../../services/navbar-state.service';
import { DetalleOrdenService} from '../../services/detalle-orden.service';
import { ValidationResultDto } from '../../models/validacion/stock-validation.models';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NavbarInicioComponent,
    CarritoComponent,
    CarruselProductosComponent
  ],
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements AfterViewInit, OnInit, OnDestroy {

  private productoService = inject(ProductoService);
  private carritoService = inject(CarritoService);
  private detalleOrdenService = inject(DetalleOrdenService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private navbarStateService = inject(NavbarStateService);

  productosActivos: ProductoDto[] = [];
  productosGaming: ProductoDto[] = [];
  productosIphone: ProductoDto[] = [];
  productosAsus: ProductoDto[] = [];
  productosSamsung: ProductoDto[] = [];

  // 🔥 NUEVO: Información de stock en tiempo real
  infoStockProductos: { [productoId: number]: ValidationResultDto } = {};

  mostrarCarrito = false;
  carritoVisible = false;

  loading = true;
  error: string | null = null;

  // 🔥 MEJORADO: Estados para manejo de carga
  agregandoProductos: { [productoId: number]: boolean } = {};
  validandoStocks: { [productoId: number]: boolean } = {};

  // 🔥 NUEVO: Suscripciones
  private productosActualizadosSubscription!: Subscription;

  ngOnInit(): void {
    console.log('🔄 Iniciando componente de Inicio...');
    
    // ✅ Establecer la sección activa en el navbar
    this.navbarStateService.setSeccionActiva('inicio');
    
    this.cargarProductos();
    this.suscribirAProductosActualizados();
  }

  ngAfterViewInit(): void {
    this.inicializarCarruseles();
  }

  ngOnDestroy(): void {
    // 🔥 NUEVO: Limpiar suscripciones
    if (this.productosActualizadosSubscription) {
      this.productosActualizadosSubscription.unsubscribe();
    }
  }

  // 🔥 NUEVO: Suscribirse a actualizaciones de productos
  private suscribirAProductosActualizados(): void {
    this.productosActualizadosSubscription = this.carritoService.productosActualizados$.subscribe(
      (productosActualizados: number[]) => {
        if (productosActualizados.length > 0) {
          console.log('🔄 Productos actualizados recibidos:', productosActualizados);
          // Actualizar información de stock para productos específicos
          productosActualizados.forEach(productoId => {
            this.actualizarInfoStockProducto(productoId);
          });
        }
      }
    );
  }

  // ✅ Cargar productos desde el servicio
  private cargarProductos(): void {
    this.loading = true;
    this.error = null;

    this.productoService.obtenerProductosActivos().subscribe({
      next: async (productos) => {
        this.productosActivos = productos;
        this.organizarProductosPorCategoria();
        
        // 🔥 NUEVO: Cargar información de stock para todos los productos
        await this.cargarInfoStockProductos();
        
        this.loading = false;
        console.log('✅ Productos cargados correctamente:', productos.length);
      },
      error: (err) => {
        console.error('❌ Error al cargar productos:', err);
        this.error = 'Error al cargar los productos. Intente nuevamente.';
        this.loading = false;
      }
    });
  }

  // 🔥 NUEVO: Cargar información de stock para todos los productos
  private async cargarInfoStockProductos(): Promise<void> {
    console.log('📊 Cargando información de stock para productos...');
    
    const promesas = this.productosActivos.map(async (producto) => {
      try {
        this.validandoStocks[producto.id] = true;
        const infoStock = await this.detalleOrdenService.obtenerStockDisponible(producto.id).toPromise();
        if (infoStock) {
          this.infoStockProductos[producto.id] = infoStock;
        }
      } catch (error) {
        console.error(`❌ Error cargando stock para producto ${producto.nombre}:`, error);
      } finally {
        this.validandoStocks[producto.id] = false;
      }
    });

    await Promise.all(promesas);
    console.log('✅ Información de stock cargada para todos los productos');
  }

  // 🔥 NUEVO: Actualizar información de stock de un producto específico
  private async actualizarInfoStockProducto(productoId: number): Promise<void> {
    try {
      this.validandoStocks[productoId] = true;
      const infoStock = await this.detalleOrdenService.obtenerStockDisponible(productoId).toPromise();
      if (infoStock) {
        this.infoStockProductos[productoId] = infoStock;
        console.log(`🔄 Stock actualizado para producto ${productoId}:`, infoStock.stockActual);
      }
    } catch (error) {
      console.error(`❌ Error actualizando stock para producto ${productoId}:`, error);
    } finally {
      this.validandoStocks[productoId] = false;
    }
  }

  // ✅ Filtrar productos por categoría
  private organizarProductosPorCategoria(): void {
    this.productosGaming = this.productosActivos.filter(p =>
      p.categoria.nombre.toLowerCase().includes('gaming') ||
      p.nombre.toLowerCase().includes('gamer') ||
      p.nombre.toLowerCase().includes('rtx')
    );

    this.productosIphone = this.productosActivos.filter(p =>
      p.nombre.toLowerCase().includes('iphone') ||
      p.marca.toLowerCase().includes('apple')
    );

    this.productosAsus = this.productosActivos.filter(p =>
      p.marca.toLowerCase().includes('asus') ||
      p.nombre.toLowerCase().includes('asus')
    );

    this.productosSamsung = this.productosActivos.filter(p =>
      p.marca.toLowerCase().includes('samsung') ||
      p.nombre.toLowerCase().includes('samsung')
    );
  }

  // ✅ Scroll del carrusel
  scrollCarousel(direction: 'prev' | 'next', carouselId: string): void {
    const carousel = document.getElementById(`carousel-${carouselId}`);
    if (!carousel) return;

    const scrollAmount = 325;
    carousel.scrollTo({
      left: carousel.scrollLeft + (direction === 'next' ? scrollAmount : -scrollAmount),
      behavior: 'smooth'
    });
  }

  // ✅ Mostrar carrito cuando se hace scroll
  @HostListener('window:scroll')
  onScroll(): void {
    this.mostrarCarrito = window.scrollY > 300;
  }

  private inicializarCarruseles(): void {
    const carousels = document.querySelectorAll('.carousel');
    carousels.forEach(carousel => {
      carousel.addEventListener('wheel', (event) => {
        event.preventDefault();
        (carousel as HTMLElement).scrollLeft += (event as WheelEvent).deltaY;
      });
    });
  }

  // ✅ Ver detalle de producto
  verDetalleProducto(producto: ProductoDto): void {
    this.productoService.seleccionarProducto(producto);
    this.router.navigate(['/descripcion-producto']);
  }

  // 🔥 OPTIMIZADO: Agregar producto al carrito con nueva lógica
  async agregarAlCarrito(producto: ProductoDto, event?: Event): Promise<void> {
    if (event) event.stopPropagation();

    console.log('🛒 Agregando producto al carrito:', producto.nombre);

    // 🔥 NUEVO: Validación usando información de stock en tiempo real
    const infoStock = this.infoStockProductos[producto.id];
    if (infoStock && !infoStock.valido) {
      this.mostrarErrorStock(infoStock.mensaje || 'Producto no disponible');
      return;
    }

    // Estado de carga para evitar múltiples clics
    this.agregandoProductos[producto.id] = true;

    try {
      const resultado: ResultadoOperacion = await this.carritoService.agregarProducto(producto);

      if (resultado.exito) {
        console.log('✅ Producto agregado exitosamente al carrito');
        
        // 🔥 NUEVO: Actualizar información de stock local
        await this.actualizarInfoStockProducto(producto.id);
        
        this.mostrarExito(`${producto.nombre} agregado al carrito`);
      } else {
        console.error('❌ Error al agregar producto:', resultado.mensaje);
        this.mostrarErrorStock(resultado.mensaje || 'Error al agregar el producto al carrito');
        
        // 🔥 NUEVO: Actualizar información de stock en caso de error
        await this.actualizarInfoStockProducto(producto.id);
      }

    } catch (error: any) {
      console.error('❌ Error inesperado al agregar producto:', error);
      this.mostrarError('Error inesperado. Intente nuevamente.');
      
      // 🔥 NUEVO: Actualizar información de stock en caso de error
      await this.actualizarInfoStockProducto(producto.id);
    } finally {
      this.agregandoProductos[producto.id] = false;
    }
  }

  // 🔥 NUEVO: Verificar si se está agregando un producto
  estaAgregandoProducto(productoId: number): boolean {
    return this.agregandoProductos[productoId] === true;
  }

  // 🔥 NUEVO: Verificar si se está validando stock de un producto
  estaValidandoStock(productoId: number): boolean {
    return this.validandoStocks[productoId] === true;
  }

  // ✅ Comunicación con componente carrito
  onCarritoVisibleChange(visible: boolean): void {
    this.carritoVisible = visible;
  }

  // ✅ Obtener imagen de producto
  obtenerImagenProducto(producto: ProductoDto): string {
    if (!producto.imagenUrl) return 'assets/images/default-product.png';
    if (producto.imagenUrl.startsWith('http')) return producto.imagenUrl;
    return producto.imagenUrl.startsWith('assets/') ? producto.imagenUrl : `assets/${producto.imagenUrl}`;
  }

  // ✅ Formatear precios
  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(precio);
  }

  // 🔥 OPTIMIZADO: Stock y clases visuales usando información en tiempo real
  tieneStockBajo(producto: ProductoDto): boolean {
    const infoStock = this.infoStockProductos[producto.id];
    return infoStock ? infoStock.stockCritico === true && infoStock.valido === true : producto.stock <= 3 && producto.stock > 0;
  }

  tieneStockDisponible(producto: ProductoDto): boolean {
    const infoStock = this.infoStockProductos[producto.id];
    return infoStock ? infoStock.valido === true : producto.stock > 0;
  }

  obtenerTextoStock(producto: ProductoDto): string {
    const infoStock = this.infoStockProductos[producto.id];
    
    if (infoStock) {
      if (!infoStock.valido) {
        return infoStock.mensaje || 'Sin stock';
      }
      if (infoStock.stockCritico) {
        return `Últimas ${infoStock.stockActual} unidades`;
      }
      return `Stock: ${infoStock.stockActual}`;
    }

    // Fallback a información local
    if (producto.stock === 0) return 'Sin stock';
    if (this.tieneStockBajo(producto)) return `Últimas ${producto.stock} unidades`;
    return `Stock: ${producto.stock}`;
  }

  obtenerClaseStock(producto: ProductoDto): string {
    const infoStock = this.infoStockProductos[producto.id];
    
    if (infoStock) {
      if (!infoStock.valido) {
        return 'stock-agotado';
      }
      if (infoStock.stockCritico) {
        return 'stock-bajo';
      }
      return 'stock-normal';
    }

    // Fallback a información local
    if (producto.stock === 0) return 'stock-agotado';
    if (this.tieneStockBajo(producto)) return 'stock-bajo';
    return 'stock-normal';
  }

  // 🔥 NUEVO: Verificar si el botón de agregar debe estar deshabilitado
  estaBotonAgregarDeshabilitado(producto: ProductoDto): boolean {
    return this.estaAgregandoProducto(producto.id) || 
           this.estaValidandoStock(producto.id) ||
           !this.tieneStockDisponible(producto);
  }

  // ✅ Recargar en caso de error
  recargarProductos(): void {
    this.cargarProductos();
  }

  // 🔥 MEJORADO: Métodos para mostrar mensajes al usuario
  private mostrarError(mensaje: string): void {
    console.error('❌ Error:', mensaje);
    // En una implementación real, usarías un servicio de notificaciones
    alert(`❌ ${mensaje}`);
  }

  private mostrarErrorStock(mensaje: string): void {
    console.error('🚨 Error de stock:', mensaje);
    alert(`⚠️ ${mensaje}`);
  }

  private mostrarExito(mensaje: string): void {
    console.log('✅ Éxito:', mensaje);
    alert(`✅ ${mensaje}`);
  }

  // ✅ Navegación (métodos mantenidos por compatibilidad)
  irAInicio(): void { 
    this.router.navigate(['/inicio']); 
  }
  
  irAPhone(): void { 
    this.router.navigate(['/phone']); 
  }
  
  irAGaming(): void { 
    this.router.navigate(['/gaming']); 
  }
  
  irAAccesorios(): void { 
    this.router.navigate(['/accesorios']); 
  }
  
  irALaptops(): void { 
    this.router.navigate(['/laptops']); 
  }

  salir(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}