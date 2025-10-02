import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../../services/producto.service';
import { ProductoDTO, CategoriaDTO } from '../../../models/producto.dto';
import { EstadoProducto } from '../../../models/estado-producto.enum';
import { MensajeDto } from '../../../models/mensaje.dto';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-producto',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './producto.component.html',
  styleUrls: ['./producto.component.css']
})
export class ProductoComponent implements OnInit {
  private productoService = inject(ProductoService);

  // Variables de estado
  seccionActiva: string = 'productos';
  productoEditando: boolean = false;

  // Modelo de producto
  producto: ProductoDTO = this.inicializarProducto();

  // Listas
  productos: ProductoDTO[] = [];
  productosFiltrados: ProductoDTO[] = [];
  categorias: CategoriaDTO[] = [
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
  categoriaFiltro: CategoriaDTO | null = null;
  estadoFiltro: EstadoProducto | '' = '';
  stockFiltro: string = '';

  ngOnInit(): void {
    this.cargarProductos();
  }

  // Inicialización
  private inicializarProducto(): ProductoDTO {
    return {
      nombre: '',
      codigo: '',
      descripcion: '',
      categoria: { id: 0, nombre: '' },
      precio: 0,
      stock: 0,
      imagenUrl: '',
      marca: '',
      garantia: undefined,
      estado: EstadoProducto.ACTIVO
    };
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

  // Operaciones CRUD
  guardarProducto(): void {
    if (this.productoEditando && this.producto.id) {
      this.actualizarProducto();
    } else {
      this.crearProducto();
    }
  }

  crearProducto(): void {
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

  editarProducto(producto: ProductoDTO): void {
    this.producto = { ...producto };
    this.productoEditando = true;
    // Scroll al formulario
    document.querySelector('.form-container')?.scrollIntoView({ behavior: 'smooth' });
  }

  cambiarEstadoProducto(producto: ProductoDTO): void {
    if (!producto.id) return;

    const confirmacion = confirm(
      `¿Está seguro de que desea ${producto.estado === 'ACTIVO' ? 'desactivar' : 'activar'} el producto "${producto.nombre}"?`
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

  eliminarProducto(producto: ProductoDTO): void {
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

  // Utilidades
  manejarErrorImagen(event: any): void {
    event.target.style.display = 'none';
  }
}