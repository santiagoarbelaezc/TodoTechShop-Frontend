import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ProductoDto } from '../../../models/producto/producto.dto';
import { ProductoSeleccionadoService } from '../../../services/cliente/producto-seleccionado.service';
import { ProductoService } from '../../../services/producto.service';
import { NavbarClienteComponent } from '../navbar-cliente/navbar-cliente.component';
import { FooterClienteComponent } from '../footer-cliente/footer-cliente.component';

@Component({
  selector: 'app-descripcion-cliente',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './descripcion-cliente.component.html',
  styleUrls: ['./descripcion-cliente.component.css']
})
export class DescripcionClienteComponent implements OnInit, OnDestroy {
  
  // ===========================
  // 🔹 INYECCIONES
  // ===========================
  private productoSeleccionadoService = inject(ProductoSeleccionadoService);
  private productoService = inject(ProductoService);
  private router = inject(Router);
  
  // ===========================
  // 🔹 SEÑALES
  // ===========================
  producto = signal<ProductoDto | null>(null);
  cargando = signal<boolean>(true);
  error = signal<string>('');
  cantidad = signal<number>(1);
  
  // Señal para productos recomendados
  productosRecomendados = signal<ProductoDto[]>([]);
  
  // Propiedades computadas
  tieneStockBajo = computed(() => {
    const prod = this.producto();
    return prod ? prod.stock <= 3 : false;
  });
  
  // ===========================
  // 🔹 CICLO DE VIDA
  // ===========================
  ngOnInit(): void {
    console.log('🔍 DescripcionClienteComponent inicializado');
    this.cargarProductoSeleccionado();
  }
  
  ngOnDestroy(): void {
    // Opcional: limpiar el producto seleccionado al salir
    // this.productoSeleccionadoService.clearProductoSeleccionado();
  }
  
  // ===========================
  // 🔹 MÉTODOS PRINCIPALES
  // ===========================
  private cargarProductoSeleccionado(): void {
    this.cargando.set(true);
    this.error.set('');
    
    // Obtener el producto del servicio
    const producto = this.productoSeleccionadoService.getProductoSeleccionado();
    
    if (producto) {
      console.log('✅ Producto encontrado en servicio:', producto.nombre);
      this.producto.set(producto);
      this.cargarProductosRecomendados(producto);
      this.cargando.set(false);
    } else {
      console.warn('⚠️ No se encontró producto seleccionado en el servicio');
      this.error.set('No se encontró el producto seleccionado. Por favor, vuelve al catálogo y selecciona un producto.');
      this.cargando.set(false);
    }
  }
  
  private cargarProductosRecomendados(productoActual: ProductoDto): void {
    // Aquí podrías cargar productos de la misma categoría
    // Por ahora, simularemos algunos productos recomendados
    setTimeout(() => {
      // En un caso real, harías una llamada al servicio
      // this.productoService.getProductosRecomendados(productoActual.id).subscribe(...)
      this.productosRecomendados.set([]); // Por ahora vacío
    }, 500);
  }
  
  // ===========================
  // 🔹 MÉTODOS DE NAVEGACIÓN
  // ===========================
  volverAlCatalogo(): void {
    console.log('↩️ Volviendo al catálogo');
    this.router.navigate(['/inicio']);
  }
  
  irAInicio(): void {
    this.router.navigate(['/inicio']);
  }
  
  irALoginParaComprar(): void {
    console.log('🔒 Redirigiendo al login para comprar');
    
    // Guardar el producto en el servicio para después del login
    const producto = this.producto();
    if (producto) {
      this.productoSeleccionadoService.setProductoSeleccionado(producto);
    }
    
    this.router.navigate(['/login'], {
      queryParams: {
        returnUrl: '/descripcion-cliente',
        message: 'Inicia sesión para agregar productos al carrito y realizar compras'
      }
    });
  }
  
  verProductoRecomendado(producto: ProductoDto): void {
    console.log('👀 Viendo producto recomendado:', producto.nombre);
    
    // Guardar el nuevo producto seleccionado
    this.productoSeleccionadoService.setProductoSeleccionado(producto);
    
    // Recargar la página
    window.location.reload(); // O podrías usar router.navigate con recarga
  }
  
  // ===========================
  // 🔹 MÉTODOS DE CANTIDAD
  // ===========================
  aumentarCantidad(): void {
    const producto = this.producto();
    if (producto && this.cantidad() < producto.stock) {
      this.cantidad.update(val => val + 1);
    }
  }
  
  disminuirCantidad(): void {
    if (this.cantidad() > 1) {
      this.cantidad.update(val => val - 1);
    }
  }
  
  // ===========================
  // 🔹 MÉTODOS DE UI/HELPERS
  // ===========================
  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(precio);
  }
  
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
  
  obtenerTextoStock(): string {
    const producto = this.producto();
    if (!producto) return '';
    
    if (producto.stock === 0) return 'Sin stock';
    if (this.tieneStockBajo()) return `Últimas ${producto.stock} unidades`;
    return `Stock: ${producto.stock}`;
  }
  
  obtenerEstadoTexto(): string {
    const producto = this.producto();
    if (!producto) return '';
    
    switch (producto.estado) {
      case 'ACTIVO': return 'Disponible';
      case 'INACTIVO': return 'No disponible';
      case 'AGOTADO': return 'Agotado';
      default: return producto.estado;
    }
  }
  
  recargar(): void {
    this.cargando.set(true);
    this.error.set('');
    this.cargarProductoSeleccionado();
  }
}