import { Component, AfterViewInit, HostListener, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../../services/producto.service';
import { CarritoService } from '../../../services/carrito.service';
import { AuthService } from '../../../services/auth.service';
import { NavbarStateService } from '../../../services/navbar-state.service';
import { NavbarInicioComponent } from '../navbar-inicio/navbar-inicio.component';
import { CarritoComponent } from '../carrito/carrito.component';
import { CarruselProductosComponent } from '../carrusel-productos/carrusel-productos.component';
import { ProductoPruebaService } from '../../../services/producto-prueba.service';
import { CategoriaDto } from '../../../models/categoria.dto';
import { ProductoDto } from '../../../models/producto/producto.dto';

@Component({
  selector: 'app-buscar-inicio',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    NavbarInicioComponent,
    CarritoComponent,
    CarruselProductosComponent
  ],
  templateUrl: './buscar-inicio.component.html',
  styleUrls: ['./buscar-inicio.component.css']
})
export class BuscarInicioComponent implements AfterViewInit, OnInit {

  private productoService = inject(ProductoService);
  private carritoService = inject(CarritoService);
  private productoPruebaService = inject(ProductoPruebaService);
  private authService = inject(AuthService);
  private navbarStateService = inject(NavbarStateService);
  private router = inject(Router);

  productos: ProductoDto[] = [];
  productosFiltrados: ProductoDto[] = [];
  categorias: CategoriaDto[] = [];
  productosPorCategoria: {categoria: CategoriaDto, productos: ProductoDto[]}[] = [];

  terminoBusqueda: string = '';
  categoriaSeleccionada: string = 'todas';
  precioMin: number = 0;
  precioMax: number = 10000000;
  ordenarPor: string = 'nombre';

  mostrarCarrito = false;
  carritoVisible = false;

  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    console.log('🔄 Iniciando componente de Búsqueda...');
    
    // ✅ ESTABLECER LA SECCIÓN ACTIVA EN EL NAVBAR
    this.navbarStateService.setSeccionActiva('buscar');
    console.log('🎯 Sección activa establecida: buscar');
    
    this.cargarProductos();
  }

  ngAfterViewInit(): void {
    console.log('🎯 Inicializando vista de búsqueda...');
  }

  // ✅ Cargar productos desde el servicio
  private cargarProductos(): void {
    this.loading = true;
    this.error = null;

    try {
      // Usar el servicio de prueba para obtener productos
      this.productos = this.productoPruebaService.obtenerTodosLosProductos();
      this.categorias = this.productoPruebaService.obtenerTodasLasCategorias();
      this.productosFiltrados = [...this.productos];
      this.organizarProductosPorCategoria();
      
      this.loading = false;
      console.log('✅ Productos cargados correctamente:', this.productos.length);
    } catch (err) {
      console.error('❌ Error al cargar productos:', err);
      this.error = 'Error al cargar los productos. Intente nuevamente.';
      this.loading = false;
    }
  }

  // ✅ Organizar productos por categoría para los carruseles
  private organizarProductosPorCategoria(): void {
    this.productosPorCategoria = this.categorias
      .map(categoria => ({
        categoria,
        productos: this.productosFiltrados.filter(p => p.categoria.id === categoria.id)
      }))
      .filter(grupo => grupo.productos.length > 0);
  }

  // ✅ Método para buscar productos
  buscarProductos(): void {
    if (!this.terminoBusqueda.trim()) {
      this.productosFiltrados = [...this.productos];
    } else {
      this.productosFiltrados = this.productoPruebaService.buscarProductos(this.terminoBusqueda);
    }
    this.aplicarFiltros();
    this.organizarProductosPorCategoria();
  }

  // ✅ Método para aplicar filtros
  aplicarFiltros(): void {
    let productosFiltrados = [...this.productos];

    // Filtro por término de búsqueda
    if (this.terminoBusqueda.trim()) {
      productosFiltrados = this.productoPruebaService.buscarProductos(this.terminoBusqueda);
    }

    // Filtro por categoría
    if (this.categoriaSeleccionada !== 'todas') {
      const categoriaId = parseInt(this.categoriaSeleccionada);
      productosFiltrados = productosFiltrados.filter(producto => 
        producto.categoria.id === categoriaId
      );
    }

    // Filtro por precio
    productosFiltrados = productosFiltrados.filter(producto => 
      producto.precio >= this.precioMin && producto.precio <= this.precioMax
    );

    // Ordenar
    productosFiltrados = this.ordenarProductos(productosFiltrados);

    this.productosFiltrados = productosFiltrados;
    this.organizarProductosPorCategoria();
  }

  // ✅ Método para ordenar productos
  private ordenarProductos(productos: ProductoDto[]): ProductoDto[] {
    switch (this.ordenarPor) {
      case 'precio-asc':
        return productos.sort((a, b) => a.precio - b.precio);
      case 'precio-desc':
        return productos.sort((a, b) => b.precio - a.precio);
      case 'nombre':
        return productos.sort((a, b) => a.nombre.localeCompare(b.nombre));
      case 'stock':
        return productos.sort((a, b) => b.stock - a.stock);
      default:
        return productos;
    }
  }

  // ✅ Limpiar filtros
  limpiarFiltros(): void {
    this.terminoBusqueda = '';
    this.categoriaSeleccionada = 'todas';
    this.precioMin = 0;
    this.precioMax = 10000000;
    this.ordenarPor = 'nombre';
    this.productosFiltrados = [...this.productos];
    this.organizarProductosPorCategoria();
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

  // ✅ Mostrar carrito cuando se hace scroll
  @HostListener('window:scroll')
  onScroll(): void {
    this.mostrarCarrito = window.scrollY > 300;
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
}