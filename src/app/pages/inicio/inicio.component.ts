import { Component, AfterViewInit, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { NavbarInicioComponent } from './navbar-inicio/navbar-inicio.component';
import { ProductoService } from '../../services/producto.service';
import { ProductoPruebaService } from '../../services/producto-prueba.service';
import { ProductoDTO, CategoriaDTO } from '../../models/producto.dto';

interface DetalleCarrito {
  cantidad: number;
  subtotal: number;
  producto?: ProductoDTO;
}

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarInicioComponent],
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements AfterViewInit {

  carrito: { detalle: DetalleCarrito, nombreProducto: string }[] = [];

  private productoService = inject(ProductoService);
  private productoPruebaService = inject(ProductoPruebaService);

  productos: ProductoDTO[] = [];
  productosAsus: ProductoDTO[] = [];
  productosIphone: ProductoDTO[] = [];
  productosSamsung: ProductoDTO[] = [];
  productosHp: ProductoDTO[] = [];

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
    
    // Actualizar indicadores (opcional)
    this.updateCarouselIndicators(carouselId);
  }

  // Método opcional para actualizar indicadores del carrusel
  private updateCarouselIndicators(carouselId: string): void {
    // Esta función puede usarse para actualizar los puntos indicadores
    // si decides implementar una funcionalidad más completa
    console.log(`Actualizando indicadores para carrusel: ${carouselId}`);
  }

  // También puedes añadir este método para manejar el scroll automáticamente
  setupCarouselScroll(): void {
    // Configuración adicional para el comportamiento del carrusel
    const carousels = document.querySelectorAll('.carousel');
    
    carousels.forEach(carousel => {
      carousel.addEventListener('wheel', (event) => {
        event.preventDefault();
        carousel.scrollLeft += (event as WheelEvent).deltaY;
      });
    });
  }

  @HostListener('window:scroll', [])
  onScroll(): void {
    const bannerAltura = 300;
    this.mostrarCarrito = window.scrollY > bannerAltura;
  }

  ngAfterViewInit(): void {
    this.inicializarProductos();
    this.inicializarCarruseles();
    this.inicializarCarritoEjemplo();
  }

  private inicializarProductos(): void {
    // Obtener productos desde el servicio de prueba
    this.productos = this.productoPruebaService.obtenerTodosLosProductos();
    
    // Obtener productos específicos desde el servicio
    this.productosIphone = this.productoPruebaService.obtenerProductosIphone();
    this.productosHp = this.productoPruebaService.obtenerProductosHp();
    
    // Inicializar arrays vacíos para los que no se están usando
    this.productosAsus = [];
    this.productosSamsung = [];

    console.log('Productos cargados desde servicio:', {
      total: this.productos.length,
      iphone: this.productosIphone.length,
      hp: this.productosHp.length
    });
  }

  private inicializarCarruseles(): void {
    // Simular inicialización de carruseles (sin servicios)
    setTimeout(() => {
      console.log('Carruseles inicializados con productos:', {
        iphone: this.productosIphone.length,
        hp: this.productosHp.length
      });
    }, 100);
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

  // Método para ver detalle del producto
  verDetalleProducto(producto: ProductoDTO): void {
    // Almacenar temporalmente el producto en el servicio
    this.productoService.seleccionarProducto(producto);
    
    // Navegar al componente de descripción
    this.router.navigate(['/descripcion-producto']);
  }

  // Método corregido para agregar al carrito
  agregarAlCarrito(producto: ProductoDTO, event?: Event): void {
    // Prevenir que el clic se propague al card padre
    if (event) {
      event.stopPropagation();
    }

    if (producto.stock <= 0) {
      console.warn('Producto sin stock disponible.');
      return;
    }

    // Simular agregar al carrito
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

    // Actualizar stock local
    producto.stock--;
    
    console.log('Producto agregado al carrito:', producto.nombre);
  }

  eliminarProducto(index: number): void {
    const item = this.carrito[index];
    if (item.detalle.producto) {
      // Restaurar stock
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
      // Aumentar cantidad
      if (producto.stock > 0) {
        item.detalle.cantidad++;
        producto.stock--;
      }
    } else {
      // Disminuir cantidad
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

    // Simular aplicación de descuento
    setTimeout(() => {
      console.log(`Descuento del ${porcentaje}% aplicado`);
      this.cargarDetallesCarrito();
      this.mostrarInputDescuento = false;
      this.codigoDescuento = '';
      this.aplicandoDescuento = false;
    }, 1000);
  }

  private cargarDetallesCarrito(): void {
    // Simular recarga del carrito (en este caso solo es simulación)
    console.log('Carrito actualizado con descuento aplicado');
  }

  pagarCarrito() {
    this.router.navigate(['/caja']).then(() => {
      console.log('Navegando a caja para pagar');
    });
  }

  cancelarOrden(): void {
    // Restaurar stock de todos los productos en el carrito
    this.carrito.forEach(item => {
      if (item.detalle.producto) {
        item.detalle.producto.stock += item.detalle.cantidad;
      }
    });
    
    this.carrito = [];
    console.log('Orden cancelada y stock restaurado');
  }

  // Métodos de navegación
  irAInicio(): void { this.router.navigate(['/inicio']); }
  irAPhone(): void { this.router.navigate(['/phone']); }
  irAGaming(): void { this.router.navigate(['/gaming']); }
  irAAccesorios(): void { this.router.navigate(['/accesorios']); }
  irALaptops(): void { this.router.navigate(['/laptops']); }

  salir(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // Método auxiliar para obtener imagen del producto
  obtenerImagenProducto(producto: ProductoDTO): string {
    // Si el producto tiene imagenUrl, usarla, sino usar una imagen por defecto
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
  tieneStockBajo(producto: ProductoDTO): boolean {
    return producto.stock <= 3;
  }

  // Método para obtener el texto de stock
  obtenerTextoStock(producto: ProductoDTO): string {
    if (producto.stock === 0) {
      return 'Sin stock';
    } else if (this.tieneStockBajo(producto)) {
      return `Últimas ${producto.stock} unidades`;
    } else {
      return `Stock: ${producto.stock}`;
    }
  }

  // Método para obtener la clase CSS del stock
  obtenerClaseStock(producto: ProductoDTO): string {
    if (producto.stock === 0) {
      return 'stock-agotado';
    } else if (this.tieneStockBajo(producto)) {
      return 'stock-bajo';
    } else {
      return 'stock-normal';
    }
  }
}