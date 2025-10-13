import { Component, AfterViewInit, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../../services/producto.service';
import { NavbarInicioComponent } from '../navbar-inicio/navbar-inicio.component';

import { ProductoPruebaService } from '../../../services/producto-prueba.service';
import { AuthService } from '../../../services/auth.service';
import { CategoriaDto } from '../../../models/categoria.dto';
import { ProductoDto } from '../../../models/producto/producto.dto';

interface DetalleCarrito {
  cantidad: number;
  subtotal: number;
  producto?: ProductoDto;
}

@Component({
  selector: 'app-buscar-inicio',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarInicioComponent],
  templateUrl: './buscar-inicio.component.html',
  styleUrls: ['./buscar-inicio.component.css']
})
export class BuscarInicioComponent implements AfterViewInit {

  carrito: { detalle: DetalleCarrito, nombreProducto: string }[] = [];

  private productoService = inject(ProductoService);
  private productoPruebaService = inject(ProductoPruebaService);

  productos: ProductoDto[] = [];
  productosFiltrados: ProductoDto[] = [];
  categorias: CategoriaDto[] = [];

  terminoBusqueda: string = '';
  categoriaSeleccionada: string = 'todas';
  precioMin: number = 0;
  precioMax: number = 10000000;
  ordenarPor: string = 'nombre';

  mostrarCarrito = false;
  carritoVisible = false;

  mostrarInputDescuento: boolean = false;
  codigoDescuento: string = '';
  aplicandoDescuento: boolean = false;
  errorDescuento: string = '';

  descuentosValidos: { [codigo: string]: number } = {
    '11': 20,
    'DESC20': 20,
    'NAVIDAD': 15,
    'BLACKFRIDAY': 30,
    'VIP15': 15
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  // Método para controlar el scroll del carrusel
  scrollCarousel(direction: 'prev' | 'next', carouselId: string): void {
    const carousel = document.getElementById(`carousel-${carouselId}`);
    if (!carousel) return;

    const scrollAmount = 325; // Ancho del item + gap
    const currentScroll = carousel.scrollLeft;
    
    if (direction === 'next') {
      carousel.scrollTo({
        left: currentScroll + scrollAmount,
        behavior: 'smooth'
      });
    } else {
      carousel.scrollTo({
        left: currentScroll - scrollAmount,
        behavior: 'smooth'
      });
    }
  }

  @HostListener('window:scroll', [])
  onScroll(): void {
    const bannerAltura = 300;
    this.mostrarCarrito = window.scrollY > bannerAltura;
  }

  ngAfterViewInit(): void {
    this.inicializarDatos();
    this.inicializarCarritoEjemplo();
  }

  private inicializarDatos(): void {
    // Obtener todos los productos y categorías
    this.productos = this.productoPruebaService.obtenerTodosLosProductos();
    this.categorias = this.productoPruebaService.obtenerTodasLasCategorias();
    this.productosFiltrados = [...this.productos];
    
    console.log('Datos inicializados:', {
      totalProductos: this.productos.length,
      categorias: this.categorias.length
    });
  }

  private inicializarCarritoEjemplo(): void {
    // Carrito de ejemplo con algunos productos
    const producto1 = this.productoPruebaService.obtenerProductoPorId(1); // iPhone 13
    const producto6 = this.productoPruebaService.obtenerProductoPorId(6); // HP Pavilion

    if (producto1 && producto6) {
      this.carrito = [
        {
          detalle: {
            cantidad: 2,
            subtotal: producto1.precio * 2,
            producto: producto1
          },
          nombreProducto: producto1.nombre
        },
        {
          detalle: {
            cantidad: 1,
            subtotal: producto6.precio,
            producto: producto6
          },
          nombreProducto: producto6.nombre
        }
      ];
    }
  }

  // Método para buscar productos
  buscarProductos(): void {
    if (!this.terminoBusqueda.trim()) {
      this.productosFiltrados = [...this.productos];
    } else {
      this.productosFiltrados = this.productoPruebaService.buscarProductos(this.terminoBusqueda);
    }
    this.aplicarFiltros();
  }

  // Método para aplicar filtros
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
  }

  // Método para ordenar productos
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

  // Limpiar filtros
  limpiarFiltros(): void {
    this.terminoBusqueda = '';
    this.categoriaSeleccionada = 'todas';
    this.precioMin = 0;
    this.precioMax = 10000000;
    this.ordenarPor = 'nombre';
    this.productosFiltrados = [...this.productos];
  }

  // Método para ver detalle del producto
  verDetalleProducto(producto: ProductoDto): void {
    this.productoService.seleccionarProducto(producto);
    this.router.navigate(['/descripcion-producto']);
  }

  // Método para agregar al carrito
  agregarAlCarrito(producto: ProductoDto, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    if (producto.stock <= 0) {
      console.warn('Producto sin stock disponible.');
      return;
    }

    const itemExistente = this.carrito.find(item => 
      item.detalle.producto?.id === producto.id
    );

    if (itemExistente) {
      itemExistente.detalle.cantidad++;
      itemExistente.detalle.subtotal = itemExistente.detalle.cantidad * producto.precio;
    } else {
      this.carrito.push({
        detalle: {
          cantidad: 1,
          subtotal: producto.precio,
          producto: producto
        },
        nombreProducto: producto.nombre
      });
    }

    producto.stock--;
    console.log('Producto agregado al carrito:', producto.nombre);
  }

  eliminarProducto(index: number): void {
    const item = this.carrito[index];
    if (item.detalle.producto) {
      item.detalle.producto.stock += item.detalle.cantidad;
    }
    this.carrito.splice(index, 1);
    console.log('Producto eliminado del carrito');
  }

  ajustarCantidad(index: number, cambio: number): void {
    const item = this.carrito[index];
    const producto = item.detalle.producto;
    
    if (!producto) return;

    if (cambio > 0) {
      if (producto.stock > 0) {
        item.detalle.cantidad++;
        producto.stock--;
      }
    } else {
      if (item.detalle.cantidad > 1) {
        item.detalle.cantidad--;
        producto.stock++;
      }
    }

    item.detalle.subtotal = item.detalle.cantidad * producto.precio;
  }

  toggleCarrito(): void {
    this.carritoVisible = !this.carritoVisible;
  }

  aplicarDescuento() {
    this.mostrarInputDescuento = true;
    setTimeout(() => {
      const input = document.querySelector('.discount-input');
      if (input) (input as HTMLElement).focus();
    });
  }

  validarDescuento() {
    console.log('Validando descuento:', this.codigoDescuento);

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

    setTimeout(() => {
      console.log(`Descuento del ${porcentaje}% aplicado`);
      this.cargarDetallesCarrito();
      this.mostrarInputDescuento = false;
      this.codigoDescuento = '';
      this.aplicandoDescuento = false;
    }, 1000);
  }

  private cargarDetallesCarrito(): void {
    console.log('Carrito actualizado con descuento aplicado');
  }

  pagarCarrito() {
    this.router.navigate(['/caja']).then(() => {
      console.log('Navegando a caja para pagar');
    });
  }

  cancelarOrden(): void {
    this.carrito.forEach(item => {
      if (item.detalle.producto) {
        item.detalle.producto.stock += item.detalle.cantidad;
      }
    });
    
    this.carrito = [];
    console.log('Orden cancelada y stock restaurado');
  }

  // Método auxiliar para obtener imagen del producto
  obtenerImagenProducto(producto: ProductoDto): string {
    return producto.imagenUrl || 'assets/images/default-product.png';
  }

  // Método para formatear precio
  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(precio);
  }

  // Método para verificar si un producto tiene stock bajo
  tieneStockBajo(producto: ProductoDto): boolean {
    return producto.stock <= 3;
  }

  // Método para obtener el texto de stock
  obtenerTextoStock(producto: ProductoDto): string {
    if (producto.stock === 0) {
      return 'Sin stock';
    } else if (this.tieneStockBajo(producto)) {
      return `Últimas ${producto.stock} unidades`;
    } else {
      return `Stock: ${producto.stock}`;
    }
  }

  // Método para obtener la clase CSS del stock
  obtenerClaseStock(producto: ProductoDto): string {
    if (producto.stock === 0) {
      return 'stock-agotado';
    } else if (this.tieneStockBajo(producto)) {
      return 'stock-bajo';
    } else {
      return 'stock-normal';
    }
  }

  // Método para obtener productos agrupados por categoría para el carrusel
  obtenerProductosPorCategoria(): {categoria: CategoriaDto, productos: ProductoDto[]}[] {
    return this.categorias.map(categoria => ({
      categoria,
      productos: this.productosFiltrados.filter(p => p.categoria.id === categoria.id)
    })).filter(grupo => grupo.productos.length > 0);
  }
}