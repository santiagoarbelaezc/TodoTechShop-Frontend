import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../../services/producto.service';

import { MensajeDto } from '../../../models/mensaje.dto';
import { NavbarComponent } from '../navbar/navbar.component';
import { CategoriaDto } from '../../../models/categoria.dto';
import { EstadoProducto } from '../../../models/enums/estado-producto.enum';
import { ProductoDto } from '../../../models/producto/producto.dto';

// Pipe personalizado para truncar texto
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate',
  standalone: true
})
export class TruncatePipe implements PipeTransform {
  transform(value: string, limit: number = 50, completeWords: boolean = false, ellipsis: string = '...'): string {
    if (!value) return '';
    if (value.length <= limit) return value;

    if (completeWords) {
      limit = value.substr(0, limit).lastIndexOf(' ');
    }
    return value.substr(0, limit) + ellipsis;
  }
}

@Component({
  selector: 'app-producto',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, TruncatePipe],
  templateUrl: './producto.component.html',
  styleUrls: ['./producto.component.css']
})
export class ProductoComponent implements OnInit {
  private productoService = inject(ProductoService);

  // Variables de estado
  seccionActiva: string = 'productos';
  productoEditando: boolean = false;

  // Modelo de producto
  producto: ProductoDto = this.inicializarProducto();

  // Listas
  productos: ProductoDto[] = [];
  productosFiltrados: ProductoDto[] = [];
  categorias: CategoriaDto[] = [
    { id: 1, nombre: 'Electrónicos' },
    { id: 2, nombre: 'Computación' },
    { id: 3, nombre: 'Smartphones' },
    { id: 4, nombre: 'Audio' },
    { id: 5, nombre: 'Accesorios' }
  ];

  // Estados disponibles
  estadosProducto: EstadoProducto[] = [
    EstadoProducto.ACTIVO,
    EstadoProducto.INACTIVO,
    EstadoProducto.DESCONTINUADO,
    EstadoProducto.AGOTADO
  ];

  // Filtros
  terminoBusquedaNombre: string = '';
  terminoBusquedaCodigo: string = '';
  categoriaFiltro: CategoriaDto | null = null;
  estadoFiltro: EstadoProducto | '' = '';
  stockFiltro: string = '';

  ngOnInit(): void {
    this.cargarProductos();
    this.cargarCategoriasReales(); // Cargar categorías reales del servicio
  }

  // Inicialización
  private inicializarProducto(): ProductoDto {
    return {
      id: 0,
      nombre: '',
      codigo: '',
      descripcion: '',
      categoria: { id: 0, nombre: '' },
      precio: 0,
      stock: 0,
      imagenUrl: '',
      marca: '',
      garantia: 0,
      estado: EstadoProducto.ACTIVO
    };
  }

  // Cargar categorías reales
  private cargarCategoriasReales(): void {
    // Si tienes un servicio para categorías, úsalo aquí
    // this.categoriaService.obtenerTodasLasCategorias().subscribe(...)
    // Por ahora mantenemos las categorías de ejemplo
  }

  // Navegación
  mostrarSeccion(seccion: string): void {
    this.seccionActiva = seccion;
    if (seccion === 'productosRegistrados') {
      this.cargarProductos();
    }
  }

  // Carga de datos
  cargarProductos(): void {
    this.productoService.obtenerTodosLosProductos().subscribe({
      next: (productos) => {
        this.productos = productos;
        this.productosFiltrados = [...productos];
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
        alert('Error al cargar los productos');
      }
    });
  }

  // Métodos para estadísticas
  getProductosActivos(): number {
    return this.productos.filter(p => p.estado === EstadoProducto.ACTIVO).length;
  }

  getProductosStockBajo(): number {
    return this.productos.filter(p => p.stock <= 5 && p.stock > 0).length;
  }

  getProductosAgotados(): number {
    return this.productos.filter(p => p.stock === 0).length;
  }

  // Método para recargar productos
  recargarProductos(): void {
    this.cargarProductos();
  }

  // Método para obtener clase CSS del stock
  getStockClass(stock: number): string {
    if (stock === 0) {
      return 'stock-agotado';
    } else if (stock <= 5) {
      return 'stock-bajo';
    } else {
      return 'stock-normal';
    }
  }

  // Operaciones CRUD
  guardarProducto(): void {
    if (this.productoEditando && this.producto.id) {
      this.actualizarProducto();
    } else {
      this.crearProducto();
    }
  }

  crearProducto(): void {
    // Validar que la categoría esté seleccionada
    if (!this.producto.categoria || !this.producto.categoria.id) {
      alert('Por favor seleccione una categoría');
      return;
    }

    this.productoService.crearProducto(this.producto).subscribe({
      next: (response: MensajeDto<string>) => {
        if (response.error) {
          alert(response.mensaje || 'Error al crear el producto');
        } else {
          alert(response.mensaje || 'Producto creado exitosamente');
          this.limpiarFormulario();
          this.cargarProductos();
        }
      },
      error: (error) => {
        console.error('Error al crear producto:', error);
        alert(error.error?.mensaje || 'Error al crear el producto');
      }
    });
  }

  actualizarProducto(): void {
    if (!this.producto.id) return;

    // Validar que la categoría esté seleccionada
    if (!this.producto.categoria || !this.producto.categoria.id) {
      alert('Por favor seleccione una categoría');
      return;
    }

    this.productoService.actualizarProducto(this.producto.id, this.producto).subscribe({
      next: (response: MensajeDto<string>) => {
        if (response.error) {
          alert(response.mensaje || 'Error al actualizar el producto');
        } else {
          alert(response.mensaje || 'Producto actualizado exitosamente');
          this.limpiarFormulario();
          this.cargarProductos();
        }
      },
      error: (error) => {
        console.error('Error al actualizar producto:', error);
        alert(error.error?.mensaje || 'Error al actualizar el producto');
      }
    });
  }

  editarProducto(producto: ProductoDto): void {
    this.producto = { ...producto };
    this.productoEditando = true;
    // Scroll al formulario
    document.querySelector('.form-container')?.scrollIntoView({ behavior: 'smooth' });
  }

  cambiarEstadoProducto(producto: ProductoDto): void {
    if (!producto.id) return;

    const nuevoEstado = producto.estado === EstadoProducto.ACTIVO ? EstadoProducto.INACTIVO : EstadoProducto.ACTIVO;
    const confirmacion = confirm(
      `¿Está seguro de que desea ${producto.estado === EstadoProducto.ACTIVO ? 'desactivar' : 'activar'} el producto "${producto.nombre}"?`
    );

    if (!confirmacion) return;

    this.productoService.cambiarEstadoProducto(producto.id).subscribe({
      next: (response: MensajeDto<string>) => {
        if (response.error) {
          alert(response.mensaje || 'Error al cambiar el estado del producto');
        } else {
          alert(response.mensaje || 'Estado del producto cambiado exitosamente');
          this.cargarProductos();
        }
      },
      error: (error) => {
        console.error('Error al cambiar estado:', error);
        alert(error.error?.mensaje || 'Error al cambiar el estado del producto');
      }
    });
  }

  eliminarProducto(producto: ProductoDto): void {
    if (!producto.id) return;

    const confirmacion = confirm(
      `¿Está seguro de que desea eliminar permanentemente el producto "${producto.nombre}"? Esta acción no se puede deshacer.`
    );

    if (!confirmacion) return;

    this.productoService.eliminarProducto(producto.id).subscribe({
      next: (response: MensajeDto<string>) => {
        if (response.error) {
          alert(response.mensaje || 'Error al eliminar el producto');
        } else {
          alert(response.mensaje || 'Producto eliminado exitosamente');
          this.cargarProductos();
        }
      },
      error: (error) => {
        console.error('Error al eliminar producto:', error);
        alert(error.error?.mensaje || 'Error al eliminar el producto');
      }
    });
  }

  limpiarFormulario(): void {
    this.producto = this.inicializarProducto();
    this.productoEditando = false;
  }

  // Búsquedas y filtros
  buscarPorNombre(): void {
    if (!this.terminoBusquedaNombre.trim()) {
      this.productosFiltrados = [...this.productos];
      return;
    }

    this.productoService.buscarProductosPorNombre(this.terminoBusquedaNombre).subscribe({
      next: (productos) => {
        this.productosFiltrados = productos;
      },
      error: (error) => {
        console.error('Error en búsqueda por nombre:', error);
        // Fallback: filtrar localmente
        this.productosFiltrados = this.productos.filter(p => 
          p.nombre.toLowerCase().includes(this.terminoBusquedaNombre.toLowerCase())
        );
      }
    });
  }

  buscarPorCodigo(): void {
    if (!this.terminoBusquedaCodigo.trim()) {
      this.productosFiltrados = [...this.productos];
      return;
    }

    this.productoService.obtenerProductoPorCodigo(this.terminoBusquedaCodigo).subscribe({
      next: (producto) => {
        this.productosFiltrados = [producto];
      },
      error: (error) => {
        console.error('Error en búsqueda por código:', error);
        // Fallback: filtrar localmente
        this.productosFiltrados = this.productos.filter(p => 
          p.codigo.toLowerCase().includes(this.terminoBusquedaCodigo.toLowerCase())
        );
      }
    });
  }

  filtrarPorCategoria(): void {
    if (!this.categoriaFiltro) {
      this.productosFiltrados = [...this.productos];
      return;
    }

    this.productoService.obtenerProductoPorCategoria(this.categoriaFiltro.id).subscribe({
      next: (productos) => {
        this.productosFiltrados = productos;
      },
      error: (error) => {
        console.error('Error al filtrar por categoría:', error);
        // Fallback: filtrar localmente
        this.productosFiltrados = this.productos.filter(p => 
          p.categoria.id === this.categoriaFiltro?.id
        );
      }
    });
  }

  filtrarPorEstado(): void {
    if (!this.estadoFiltro) {
      this.productosFiltrados = [...this.productos];
      return;
    }

    this.productoService.obtenerProductoPorEstado(this.estadoFiltro).subscribe({
      next: (productos) => {
        this.productosFiltrados = productos;
      },
      error: (error) => {
        console.error('Error al filtrar por estado:', error);
        // Fallback: filtrar localmente
        this.productosFiltrados = this.productos.filter(p => 
          p.estado === this.estadoFiltro
        );
      }
    });
  }

  filtrarPorStock(): void {
    switch (this.stockFiltro) {
      case 'bajo':
        this.productosFiltrados = this.productos.filter(p => p.stock <= 5 && p.stock > 0);
        break;
      case 'normal':
        this.productosFiltrados = this.productos.filter(p => p.stock > 5);
        break;
      case 'agotado':
        this.productosFiltrados = this.productos.filter(p => p.stock === 0);
        break;
      default:
        this.productosFiltrados = [...this.productos];
    }
  }

  limpiarFiltros(): void {
    this.terminoBusquedaNombre = '';
    this.terminoBusquedaCodigo = '';
    this.categoriaFiltro = null;
    this.estadoFiltro = '';
    this.stockFiltro = '';
    this.productosFiltrados = [...this.productos];
  }

  // Método para aplicar múltiples filtros simultáneamente
  aplicarFiltrosCombinados(): void {
    let productosFiltrados = [...this.productos];

    // Filtrar por nombre
    if (this.terminoBusquedaNombre.trim()) {
      productosFiltrados = productosFiltrados.filter(p => 
        p.nombre.toLowerCase().includes(this.terminoBusquedaNombre.toLowerCase())
      );
    }

    // Filtrar por código
    if (this.terminoBusquedaCodigo.trim()) {
      productosFiltrados = productosFiltrados.filter(p => 
        p.codigo.toLowerCase().includes(this.terminoBusquedaCodigo.toLowerCase())
      );
    }

    // Filtrar por categoría
    if (this.categoriaFiltro) {
      productosFiltrados = productosFiltrados.filter(p => 
        p.categoria.id === this.categoriaFiltro?.id
      );
    }

    // Filtrar por estado
    if (this.estadoFiltro) {
      productosFiltrados = productosFiltrados.filter(p => 
        p.estado === this.estadoFiltro
      );
    }

    // Filtrar por stock
    if (this.stockFiltro) {
      switch (this.stockFiltro) {
        case 'bajo':
          productosFiltrados = productosFiltrados.filter(p => p.stock <= 5 && p.stock > 0);
          break;
        case 'normal':
          productosFiltrados = productosFiltrados.filter(p => p.stock > 5);
          break;
        case 'agotado':
          productosFiltrados = productosFiltrados.filter(p => p.stock === 0);
          break;
      }
    }

    this.productosFiltrados = productosFiltrados;
  }

  // Utilidades
  manejarErrorImagen(event: any): void {
    event.target.style.display = 'none';
  }

  // Método para formatear moneda (opcional)
  formatearMoneda(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(valor);
  }

  // Método para obtener el texto del estado del producto
  getEstadoTexto(estado: EstadoProducto): string {
    switch (estado) {
      case EstadoProducto.ACTIVO: return 'Activo';
      case EstadoProducto.INACTIVO: return 'Inactivo';
      case EstadoProducto.DESCONTINUADO: return 'Descontinuado';
      case EstadoProducto.AGOTADO: return 'Agotado';
      default: return estado;
    }
  }
}