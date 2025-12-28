import { Component, OnInit, OnDestroy, inject, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule, ViewportScroller } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { NavbarInicioComponent } from '../navbar-inicio/navbar-inicio.component';
import { CarritoComponent } from '../carrito/carrito.component';

import { ProductoService } from '../../../services/producto.service';
import { CarritoService, ResultadoOperacion } from '../../../services/carrito/carrito.service';
import { ProductoDto } from '../../../models/producto/producto.dto';

// Interfaz extendida para incluir la propiedad imagen
interface ProductoConImagen extends ProductoDto {
  imagen: string;
}

@Component({
  selector: 'app-descripcionproducto',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarInicioComponent, CarritoComponent],
  templateUrl: './descripcionproducto.component.html',
  styleUrls: ['./descripcionproducto.component.css']
})
export class DescripcionproductoComponent implements OnInit, OnDestroy, AfterViewInit {
  private productoService = inject(ProductoService);
  private carritoService = inject(CarritoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private viewportScroller = inject(ViewportScroller);

  producto: ProductoConImagen | null = null;
  productosRecomendados: ProductoConImagen[] = [];
  quantity: number = 1;
  loading: boolean = false;
  error: string | null = null;

  // ✅ PROPIEDADES PARA EL CARRITO
  mostrarCarrito = false;
  carritoVisible = false;

  // 🔥 NUEVO: Estados para manejo de carga al agregar productos
  agregandoProducto: boolean = false;

  private subscriptions: Subscription = new Subscription();

  ngOnInit(): void {
    this.scrollToTop();
    this.loadProduct();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.scrollToTop(), 100);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private scrollToTop(): void {
    this.viewportScroller.scrollToPosition([0, 0]);
  }

  // ✅ MOSTRAR CARRITO AL HACER SCROLL (MISMA LÓGICA QUE INICIO COMPONENT)
  @HostListener('window:scroll')
  onScroll(): void {
    this.mostrarCarrito = window.scrollY > 300;
  }

  // ✅ COMUNICACIÓN CON COMPONENTE CARRITO
  onCarritoVisibleChange(visible: boolean): void {
    this.carritoVisible = visible;
  }

  private loadProduct(): void {
    this.loading = true;
    this.error = null;

    // PRIMERO: Intentar obtener el producto del servicio
    const productoSeleccionado = this.productoService.obtenerProductoSeleccionado();
    
    if (productoSeleccionado) {
      console.log('Producto obtenido del servicio:', productoSeleccionado.nombre);
      this.producto = this.convertirProductoConImagen(productoSeleccionado);
      this.loadRecommendedProducts();
      this.loading = false;
      setTimeout(() => this.scrollToTop(), 50);
    } else {
      // SEGUNDO: Si no hay producto en el servicio, intentar obtenerlo por ID de la ruta
      const productId = this.route.snapshot.paramMap.get('id');
      
      if (productId) {
        const id = parseInt(productId, 10);
        this.loadProductById(id);
      } else {
        // TERCERO: Si no hay ID en la ruta, redirigir al inicio
        console.warn('No se proporcionó ID de producto, redirigiendo...');
        this.router.navigate(['/inicio']);
        this.loading = false;
      }
    }
  }

  private loadProductById(id: number): void {
    const productSubscription = this.productoService.obtenerProductoPorId(id)
      .subscribe({
        next: (producto) => {
          this.producto = this.convertirProductoConImagen(producto);
          console.log('Producto obtenido por ID:', this.producto.nombre);
          this.loadRecommendedProducts();
          this.loading = false;
          setTimeout(() => this.scrollToTop(), 50);
        },
        error: (error) => {
          console.error('Error cargando producto:', error);
          this.error = 'No se pudo cargar el producto. Intente nuevamente.';
          this.loading = false;
          this.router.navigate(['/inicio']);
        }
      });

    this.subscriptions.add(productSubscription);
  }

  private loadRecommendedProducts(): void {
    if (!this.producto) return;

    this.loading = true;

    // Obtener productos de la misma categoría
    const categoriaSubscription = this.productoService
      .obtenerProductoPorCategoria(this.producto.categoria.id)
      .subscribe({
        next: (productos) => {
          // Convertir y filtrar productos (excluir el actual)
          this.productosRecomendados = productos
            .filter(p => p.id !== this.producto!.id)
            .map(p => this.convertirProductoConImagen(p))
            .slice(0, 4);
          
          // Si no hay suficientes productos de la misma categoría, cargar productos activos
          if (this.productosRecomendados.length < 4) {
            this.loadAdditionalRecommendedProducts();
          } else {
            this.loading = false;
          }
        },
        error: (error) => {
          console.error('Error cargando productos recomendados:', error);
          // En caso de error, cargar productos activos como respaldo
          this.loadAdditionalRecommendedProducts();
        }
      });

    this.subscriptions.add(categoriaSubscription);
  }

  private loadAdditionalRecommendedProducts(): void {
    const activosSubscription = this.productoService.obtenerProductosActivos()
      .subscribe({
        next: (productos) => {
          const productosAdicionales = productos
            .filter(p => p.id !== this.producto!.id)
            .map(p => this.convertirProductoConImagen(p))
            .slice(0, 4 - this.productosRecomendados.length);

          // Combinar con los productos ya cargados
          this.productosRecomendados = [...this.productosRecomendados, ...productosAdicionales];
          this.loading = false;
        },
        error: (error) => {
          console.error('Error cargando productos adicionales:', error);
          this.loading = false;
        }
      });

    this.subscriptions.add(activosSubscription);
  }

  // MÉTODO PARA OBTENER LA IMAGEN CORRECTAMENTE
  private obtenerImagenProducto(producto: ProductoDto): string {
    // Si no hay imagenUrl, usar por defecto
    if (!producto.imagenUrl) {
      return 'assets/images/default-product.png';
    }

    // Si ya es una URL completa (http/https) o data URL, usarla directamente
    if (producto.imagenUrl.startsWith('http') || producto.imagenUrl.startsWith('data:')) {
      return producto.imagenUrl;
    }

    // Si ya empieza con assets/, usarla directamente
    if (producto.imagenUrl.startsWith('assets/')) {
      return producto.imagenUrl;
    }

    // Para cualquier otro caso, prefijar con assets/
    return 'assets/' + producto.imagenUrl;
  }

  // MÉTODO PARA MANEJAR ERRORES DE IMAGEN
  manejarErrorImagen(event: Event, producto: ProductoConImagen): void {
    console.error(`❌ Error cargando imagen para: ${producto.nombre}`);
    console.error(`📁 URL intentada: ${producto.imagen}`);
    
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'assets/images/default-product.png';
    
    // Actualizar la imagen del producto para futuras referencias
    producto.imagen = 'assets/images/default-product.png';
  }

  private convertirProductoConImagen(producto: ProductoDto): ProductoConImagen {
    return {
      ...producto,
      imagen: this.obtenerImagenProducto(producto) // Usar el método para obtener la imagen correcta
    };
  }

  increaseQuantity(): void {
    if (this.producto && this.quantity < this.producto.stock) {
      this.quantity++;
    }
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  // 🔥 CORREGIDO: Agregar producto al carrito con manejo asíncrono y validación (MISMA LÓGICA QUE INICIO COMPONENT)
  async addToCart(): Promise<void> {
    if (!this.producto) return;

    console.log('🛒 === AGREGANDO PRODUCTO AL CARRITO DESDE DESCRIPCIÓN PRODUCTO ===');
    console.log('📦 Producto:', this.producto.nombre, 'Stock actual:', this.producto.stock, 'Cantidad:', this.quantity);

    // Validación básica inicial
    if (this.producto.stock <= 0) {
      this.mostrarError('Producto sin stock disponible.');
      return;
    }

    if (this.quantity > this.producto.stock) {
      this.mostrarError(`No hay suficiente stock. Stock disponible: ${this.producto.stock}`);
      return;
    }

    // 🔥 NUEVO: Estado de carga para evitar múltiples clics
    this.agregandoProducto = true;

    try {
      let todosExitosos = true;
      let mensajeError = '';

      // 🔥 CORREGIDO: Agregar cada unidad individualmente con validación
      for (let i = 0; i < this.quantity; i++) {
        const resultado: ResultadoOperacion = await this.carritoService.agregarProducto(this.producto);

        if (!resultado.exito) {
          todosExitosos = false;
          mensajeError = resultado.mensaje || 'Error al agregar uno o más productos al carrito';
          console.error(`❌ Error agregando unidad ${i + 1}:`, mensajeError);
          break; // Detener si hay un error
        }
      }

      if (todosExitosos) {
        console.log(`✅ ${this.quantity} producto(s) agregado(s) exitosamente al carrito`);
        
        // 🔥 CORREGIDO: Actualizar stock local solo si todas las operaciones fueron exitosas
        this.producto.stock -= this.quantity;
        
        this.mostrarExito(`${this.quantity} ${this.producto.nombre} agregado(s) al carrito`);
        
        // ✅ RESETEAR CANTIDAD A 1 DESPUÉS DE AGREGAR
        this.quantity = 1;
      } else {
        console.error('❌ Error al agregar productos:', mensajeError);
        this.mostrarErrorStock(mensajeError);
        
        // 🔥 NUEVO: Recargar información actualizada del producto
        await this.actualizarInfoProducto();
      }

    } catch (error: any) {
      console.error('❌ Error inesperado al agregar producto:', error);
      this.mostrarError('Error inesperado. Intente nuevamente.');
      
      // 🔥 NUEVO: Recargar información actualizada del producto en caso de error
      await this.actualizarInfoProducto();
    } finally {
      // 🔥 NUEVO: Limpiar estado de carga
      this.agregandoProducto = false;
    }
  }

  // 🔥 NUEVO: Actualizar información del producto desde el backend
  private async actualizarInfoProducto(): Promise<void> {
    if (!this.producto) return;

    try {
      const productoActualizado = await this.productoService.obtenerProductoPorId(this.producto.id).toPromise();
      if (productoActualizado) {
        this.producto = this.convertirProductoConImagen(productoActualizado);
        console.log('🔄 Información del producto actualizada desde backend');
        
        // Ajustar la cantidad si es necesario
        if (this.quantity > this.producto.stock) {
          this.quantity = Math.max(1, this.producto.stock);
        }
      }
    } catch (error) {
      console.error('❌ Error actualizando información del producto:', error);
    }
  }

  // 🔥 NUEVO: Verificar si se está agregando un producto
  estaAgregandoProducto(): boolean {
    return this.agregandoProducto;
  }

  viewProduct(producto: ProductoConImagen): void {
    // Almacenar el nuevo producto seleccionado en el servicio
    this.productoService.seleccionarProducto(producto);
    
    // Recargar el componente con el nuevo producto
    this.producto = producto;
    this.quantity = 1;
    this.loadRecommendedProducts();
    
    // Scroll to top para mejor experiencia de usuario
    this.scrollToTop();
  }

  goBack(): void {
    this.router.navigate(['/inicio']);
  }

  goHome(): void {
    this.router.navigate(['/inicio']);
  }

  // Método para recargar en caso de error
  reload(): void {
    this.loadProduct();
  }

  // 🔥 NUEVO: Métodos para mostrar mensajes al usuario (MISMA LÓGICA QUE INICIO COMPONENT)
  private mostrarError(mensaje: string): void {
    console.error('❌ Error:', mensaje);
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
}