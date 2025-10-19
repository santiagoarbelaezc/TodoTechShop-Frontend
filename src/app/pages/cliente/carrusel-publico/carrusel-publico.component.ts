import { Component, Input, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductoDto } from '../../../models/producto/producto.dto';
import { ProductoService } from '../../../services/producto.service';

@Component({
  selector: 'app-carrusel-publico',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carrusel-publico.component.html',
  styleUrls: ['./carrusel-publico.component.css']
})
export class CarruselPublicoComponent implements AfterViewInit {

  // ===========================
  // 🔹 INPUTS
  // ===========================
  @Input() productos: ProductoDto[] = [];
  @Input() titulo: string = '';
  @Input() carouselId: string = '';

  // ===========================
  // 🔹 INYECCIONES
  // ===========================
  private router = inject(Router);
  private productoService = inject(ProductoService);

  // ===========================
  // 🔹 CICLO DE VIDA
  // ===========================
  ngAfterViewInit(): void {
    console.log(`🎠 Carrusel Público "${this.carouselId}" inicializado con ${this.productos.length} productos`);
    this.setupCarouselScroll();
  }

  // ===========================
  // 🔹 ACCIONES DEL CARRUSEL
  // ===========================
  scrollCarousel(direction: 'prev' | 'next'): void {
    console.log(`🔄 Scroll del carrusel público ${this.carouselId} hacia: ${direction}`);
    
    const carousel = document.getElementById(`carousel-publico-${this.carouselId}`);
    if (!carousel) {
      console.warn('⚠️ No se encontró el elemento del carrusel público:', this.carouselId);
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
  }

  private setupCarouselScroll(): void {
    const carousel = document.getElementById(`carousel-publico-${this.carouselId}`);
    if (!carousel) return;

    carousel.addEventListener('wheel', (event) => {
      const isScrollingHorizontally = Math.abs((event as WheelEvent).deltaX) > Math.abs((event as WheelEvent).deltaY);
      
      if (isScrollingHorizontally) {
        event.preventDefault();
        carousel.scrollLeft += (event as WheelEvent).deltaX;
      }
    });

    console.log(`🖱️ Scroll inteligente activado para carrusel público ${this.carouselId}`);
  }

  // ===========================
  // 🔹 ACCIONES DE PRODUCTOS - PÚBLICAS
  // ===========================
  verDetalleProducto(producto: ProductoDto): void {
    console.log('👀 Viendo detalle de producto (público):', producto.nombre);
    
    // Para el catálogo público, redirigir al login
    this.router.navigate(['/login'], { 
      queryParams: { 
        returnUrl: '/descripcion-producto',
        message: 'Inicia sesión para ver detalles completos del producto'
      } 
    });
  }

  agregarAlCarrito(producto: ProductoDto, event?: Event): void {
    console.log('🛒 Intentando agregar al carrito (público):', producto.nombre);

    if (event) {
      event.stopPropagation();
    }

    // Para el catálogo público, redirigir al login
    this.router.navigate(['/login'], { 
      queryParams: { 
        returnUrl: '/inicio',
        message: 'Inicia sesión para agregar productos al carrito y realizar compras'
      } 
    });
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
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(precio);
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