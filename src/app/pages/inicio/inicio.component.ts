import { Component, AfterViewInit, HostListener, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { NavbarInicioComponent } from './navbar-inicio/navbar-inicio.component';
import { ProductoService } from '../../services/producto.service';
import { ProductoDto } from '../../models/producto/producto.dto';


interface DetalleCarrito {
  cantidad: number;
  subtotal: number;
  producto?: ProductoDto;
}

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarInicioComponent],
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements AfterViewInit, OnInit {

  carrito: { detalle: DetalleCarrito, nombreProducto: string }[] = [];

  private productoService = inject(ProductoService);
  private authService = inject(AuthService);
  private router = inject(Router);

  productos: ProductoDto[] = [];
  productosAsus: ProductoDto[] = [];
  productosIphone: ProductoDto[] = [];
  productosSamsung: ProductoDto[] = [];
  productosHp: ProductoDto[] = [];
  productosActivos: ProductoDto[] = [];

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

  loading: boolean = true;
  error: string | null = null;

  ngOnInit(): void {
    this.cargarProductos();
  }

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
    this.inicializarCarruseles();
    this.inicializarCarritoEjemplo();
  }

  private cargarProductos(): void {
    this.loading = true;
    this.error = null;

    // Obtener productos activos desde el servicio real
    this.productoService.obtenerProductosActivos().subscribe({
      next: (productos) => {
        this.productosActivos = productos;
        this.organizarProductosPorCategoria();
        this.loading = false;
        
        console.log('Productos cargados desde servicio:', {
          total: productos.length,
          activos: this.productosActivos.length,
          iphone: this.productosIphone.length,
          hp: this.productosHp.length
        });
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
        this.error = 'Error al cargar los productos. Intente nuevamente.';
        this.loading = false;
      }
    });
  }

  private organizarProductosPorCategoria(): void {
    // Filtrar productos por categoría para los carruseles
    this.productosIphone = this.productosActivos.filter(producto => 
      producto.categoria.nombre.toLowerCase().includes('smartphone') || 
      producto.nombre.toLowerCase().includes('iphone')
    );

    this.productosHp = this.productosActivos.filter(producto => 
      producto.categoria.nombre.toLowerCase().includes('laptop') || 
      producto.marca.toLowerCase().includes('hp') ||
      producto.nombre.toLowerCase().includes('hp')
    );

    this.productosAsus = this.productosActivos.filter(producto => 
      producto.marca.toLowerCase().includes('asus') ||
      producto.nombre.toLowerCase().includes('asus')
    );

    this.productosSamsung = this.productosActivos.filter(producto => 
      producto.marca.toLowerCase().includes('samsung') ||
      producto.nombre.toLowerCase().includes('samsung')
    );

    // Productos generales (todos los activos)
    this.productos = this.productosActivos;
  }

  private inicializarCarruseles(): void {
    // Simular inicialización de carruseles
    setTimeout(() => {
      console.log('Carruseles inicializados con productos:', {
        iphone: this.productosIphone.length,
        hp: this.productosHp.length,
        asus: this.productosAsus.length,
        samsung: this.productosSamsung.length
      });
    }, 100);
  }

  private inicializarCarritoEjemplo(): void {
    // Carrito de ejemplo con algunos productos (opcional)
    // Si quieres un carrito vacío inicial, simplemente inicializa como array vacío
    this.carrito = [];
  }

  // Método para ver detalle del producto
  verDetalleProducto(producto: ProductoDto): void {
    // Almacenar temporalmente el producto en el servicio
    this.productoService.seleccionarProducto(producto);
    
    // Navegar al componente de descripción
    this.router.navigate(['/descripcion-producto']);
  }

  // Método corregido para agregar al carrito
  agregarAlCarrito(producto: ProductoDto, event?: Event): void {
    // Prevenir que el clic se propague al card padre
    if (event) {
      event.stopPropagation();
    }

    if (producto.stock <= 0) {
      console.warn('Producto sin stock disponible.');
      alert('Producto sin stock disponible.');
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

    // Actualizar stock local (esto es simulación - en una app real se haría en el backend)
    producto.stock--;
    
    console.log('Producto agregado al carrito:', producto.nombre);
    alert(`${producto.nombre} agregado al carrito`);
  }

  eliminarProducto(index: number): void {
    const item = this.carrito[index];
    if (item.detalle.producto) {
      // Restaurar stock (simulación)
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
      } else {
        alert('No hay más stock disponible de este producto');
        return;
      }
    } else {
      // Disminuir cantidad
      if (item.detalle.cantidad > 1) {
        item.detalle.cantidad--;
        producto.stock++;
      } else {
        // Si la cantidad es 1, eliminar el producto
        this.eliminarProducto(index);
        return;
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
      alert(`¡Descuento del ${porcentaje}% aplicado exitosamente!`);
    }, 1000);
  }

  private cargarDetallesCarrito(): void {
    // Simular recarga del carrito (en este caso solo es simulación)
    console.log('Carrito actualizado con descuento aplicado');
  }

  pagarCarrito() {
    if (this.carrito.length === 0) {
      alert('El carrito está vacío');
      return;
    }
    
    this.router.navigate(['/caja']).then(() => {
      console.log('Navegando a caja para pagar');
    });
  }

  cancelarOrden(): void {
    if (this.carrito.length === 0) {
      alert('El carrito ya está vacío');
      return;
    }

    const confirmacion = confirm('¿Está seguro de que desea cancelar la orden y vaciar el carrito?');
    if (!confirmacion) return;

    // Restaurar stock de todos los productos en el carrito
    this.carrito.forEach(item => {
      if (item.detalle.producto) {
        item.detalle.producto.stock += item.detalle.cantidad;
      }
    });
    
    this.carrito = [];
    console.log('Orden cancelada y stock restaurado');
    alert('Orden cancelada y carrito vaciado');
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
  obtenerImagenProducto(producto: ProductoDto): string {
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

  // Método para recargar en caso de error
  recargarProductos(): void {
    this.cargarProductos();
  }
}