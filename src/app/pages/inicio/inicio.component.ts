import { Component, AfterViewInit, HostListener, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { NavbarInicioComponent } from './navbar-inicio/navbar-inicio.component';
import { CarritoComponent } from './carrito/carrito.component';
import { ProductoService } from '../../services/producto.service';
import { CarritoService } from '../../services/carrito.service';
import { ProductoDto } from '../../models/producto/producto.dto';
import { CarruselProductosComponent } from './carrusel-productos/carrusel-productos.component';
import { NavbarStateService } from '../../services/navbar-state.service'; // ✅ NUEVO SERVICIO

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
export class InicioComponent implements AfterViewInit, OnInit {

  private productoService = inject(ProductoService);
  private carritoService = inject(CarritoService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private navbarStateService = inject(NavbarStateService); // ✅ INYECTAR SERVICIO

  productosActivos: ProductoDto[] = [];
  productosGaming: ProductoDto[] = [];
  productosIphone: ProductoDto[] = [];
  productosAsus: ProductoDto[] = [];
  productosSamsung: ProductoDto[] = [];

  mostrarCarrito = false;
  carritoVisible = false;

  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    console.log('🔄 Iniciando componente de Inicio...');
    
    // ✅ ESTABLECER LA SECCIÓN ACTIVA EN EL NAVBAR
    this.navbarStateService.setSeccionActiva('inicio');
    console.log('🎯 Sección activa establecida: inicio');
    
    this.cargarProductos();
  }

  ngAfterViewInit(): void {
    console.log('🎯 Inicializando vista...');
    this.inicializarCarruseles();
  }

  // ✅ Cargar productos desde el servicio
  private cargarProductos(): void {
    this.loading = true;
    this.error = null;

    this.productoService.obtenerProductosActivos().subscribe({
      next: (productos) => {
        this.productosActivos = productos;
        this.organizarProductosPorCategoria();
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

  // ✅ Agregar producto al carrito
  agregarAlCarrito(producto: ProductoDto, event?: Event): void {
    if (event) event.stopPropagation();

    if (producto.stock <= 0) {
      alert('Producto sin stock disponible.');
      return;
    }

    this.carritoService.agregarProducto(producto);
    producto.stock--;
    alert(`${producto.nombre} agregado al carrito`);
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

  // ✅ Stock y clases visuales
  tieneStockBajo(producto: ProductoDto): boolean {
    return producto.stock <= 3 && producto.stock > 0;
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

  // ✅ Recargar en caso de error
  recargarProductos(): void {
    this.cargarProductos();
  }

  // ✅ Navegación (estos métodos ya no son necesarios aquí ya que están en el navbar)
  // Se mantienen por compatibilidad pero pueden eliminarse si no se usan
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