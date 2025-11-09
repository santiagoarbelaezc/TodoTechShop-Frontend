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

// Interface para los filtros de búsqueda avanzada
interface FiltrosBusqueda {
  nombre: string;
  codigo: string;
  marca: string;
  categoriaId: number | null;
  estado: EstadoProducto | '';
  disponibilidad: string;
  precioMin: number | null;
  precioMax: number | null;
  stockMin: number | null;
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
  resultadosBusqueda: ProductoDto[] = [];
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

  // Filtros básicos
  terminoBusquedaNombre: string = '';
  terminoBusquedaCodigo: string = '';
  categoriaFiltro: CategoriaDto | null = null;
  estadoFiltro: EstadoProducto | '' = '';
  stockFiltro: string = '';

  // ✅ NUEVO: Filtros de búsqueda avanzada
  filtrosBusqueda: FiltrosBusqueda = {
    nombre: '',
    codigo: '',
    marca: '',
    categoriaId: null,
    estado: '',
    disponibilidad: '',
    precioMin: null,
    precioMax: null,
    stockMin: null
  };

  // Variables de estado para búsqueda avanzada
  busquedaEjecutada: boolean = false;
  cargandoBusqueda: boolean = false;

  // ✅ Variables de paginación para Gestión de Productos
  paginaActual: number = 1;
  itemsPorPagina: number = 10;
  totalPaginas: number = 1;
  productosPaginados: ProductoDto[] = [];

  // ✅ Variables de paginación para Productos Filtrados
  paginaActualFiltros: number = 1;
  itemsPorPaginaFiltros: number = 10;
  totalPaginasFiltros: number = 1;
  productosFiltradosPaginados: ProductoDto[] = [];

  // ✅ NUEVO: Variables de paginación para Búsqueda Avanzada
  paginaActualBusqueda: number = 1;
  itemsPorPaginaBusqueda: number = 10;
  totalPaginasBusqueda: number = 1;
  resultadosPaginados: ProductoDto[] = [];

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

 // Y modifica mostrarSeccion:
mostrarSeccion(seccion: string): void {
  this.seccionActiva = seccion;
  if (seccion === 'productosRegistrados') {
    this.cargarProductos();
  } else if (seccion === 'busquedaAvanzada') {
    this.inicializarBusquedaAvanzada();
  }
}

  private inicializarBusquedaAvanzada(): void {
  this.limpiarBusquedaAvanzada();
  // Cargar productos si no están cargados
  if (this.productos.length === 0) {
    this.cargarProductos();
  }
}

  // Carga de datos
  cargarProductos(): void {
    this.productoService.obtenerTodosLosProductos().subscribe({
      next: (productos) => {
        this.productos = productos;
        this.productosFiltrados = [...productos];
        this.aplicarPaginacion(); // ✅ Aplicar paginación después de cargar
        this.aplicarPaginacionFiltros(); // ✅ Aplicar paginación para filtros
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
        alert('Error al cargar los productos');
      }
    });
  }

  // ========== MÉTODOS DE PAGINACIÓN ==========

  // ✅ Aplicar paginación para Gestión de Productos
  aplicarPaginacion(): void {
    this.totalPaginas = Math.ceil(this.productos.length / this.itemsPorPagina);
    
    if (this.paginaActual > this.totalPaginas && this.totalPaginas > 0) {
      this.paginaActual = this.totalPaginas;
    } else if (this.totalPaginas === 0) {
      this.paginaActual = 1;
    }
    
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    
    this.productosPaginados = this.productos.slice(inicio, fin);
  }

  // ✅ Aplicar paginación para Productos Filtrados
  aplicarPaginacionFiltros(): void {
    this.totalPaginasFiltros = Math.ceil(this.productosFiltrados.length / this.itemsPorPaginaFiltros);
    
    if (this.paginaActualFiltros > this.totalPaginasFiltros && this.totalPaginasFiltros > 0) {
      this.paginaActualFiltros = this.totalPaginasFiltros;
    } else if (this.totalPaginasFiltros === 0) {
      this.paginaActualFiltros = 1;
    }
    
    const inicio = (this.paginaActualFiltros - 1) * this.itemsPorPaginaFiltros;
    const fin = inicio + this.itemsPorPaginaFiltros;
    
    this.productosFiltradosPaginados = this.productosFiltrados.slice(inicio, fin);
  }

  // ✅ NUEVO: Aplicar paginación para Búsqueda Avanzada
  aplicarPaginacionBusqueda(): void {
    this.totalPaginasBusqueda = Math.ceil(this.resultadosBusqueda.length / this.itemsPorPaginaBusqueda);
    
    if (this.paginaActualBusqueda > this.totalPaginasBusqueda && this.totalPaginasBusqueda > 0) {
      this.paginaActualBusqueda = this.totalPaginasBusqueda;
    } else if (this.totalPaginasBusqueda === 0) {
      this.paginaActualBusqueda = 1;
    }
    
    const inicio = (this.paginaActualBusqueda - 1) * this.itemsPorPaginaBusqueda;
    const fin = inicio + this.itemsPorPaginaBusqueda;
    
    this.resultadosPaginados = this.resultadosBusqueda.slice(inicio, fin);
  }

  // ✅ Cambiar página para Gestión de Productos
  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas && pagina !== this.paginaActual) {
      this.paginaActual = pagina;
      this.aplicarPaginacion();
      this.scrollToTable();
    }
  }

  // ✅ Cambiar página para Productos Filtrados
  cambiarPaginaFiltros(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginasFiltros && pagina !== this.paginaActualFiltros) {
      this.paginaActualFiltros = pagina;
      this.aplicarPaginacionFiltros();
      this.scrollToTable();
    }
  }

  // ✅ NUEVO: Cambiar página para Búsqueda Avanzada
  cambiarPaginaBusqueda(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginasBusqueda && pagina !== this.paginaActualBusqueda) {
      this.paginaActualBusqueda = pagina;
      this.aplicarPaginacionBusqueda();
      this.scrollToTable();
    }
  }

  // ✅ Cambiar cantidad de items por página
  cambiarItemsPorPagina(): void {
    this.paginaActual = 1;
    this.aplicarPaginacion();
  }

  cambiarItemsPorPaginaFiltros(): void {
    this.paginaActualFiltros = 1;
    this.aplicarPaginacionFiltros();
  }

  // ✅ NUEVO: Cambiar cantidad de items por página para Búsqueda Avanzada
  cambiarItemsPorPaginaBusqueda(): void {
    this.paginaActualBusqueda = 1;
    this.aplicarPaginacionBusqueda();
  }

  // ✅ Obtener rango de páginas
  obtenerRangoPaginas(): number[] {
    return this.calcularRangoPaginas(this.paginaActual, this.totalPaginas);
  }

  obtenerRangoPaginasFiltros(): number[] {
    return this.calcularRangoPaginas(this.paginaActualFiltros, this.totalPaginasFiltros);
  }

  // ✅ NUEVO: Obtener rango de páginas para Búsqueda Avanzada
  obtenerRangoPaginasBusqueda(): number[] {
    return this.calcularRangoPaginas(this.paginaActualBusqueda, this.totalPaginasBusqueda);
  }

  private calcularRangoPaginas(paginaActual: number, totalPaginas: number): number[] {
    const paginas: number[] = [];
    const paginasAMostrar = 5;
    
    let inicio = Math.max(1, paginaActual - Math.floor(paginasAMostrar / 2));
    let fin = Math.min(totalPaginas, inicio + paginasAMostrar - 1);
    
    if (fin - inicio + 1 < paginasAMostrar) {
      inicio = Math.max(1, fin - paginasAMostrar + 1);
    }
    
    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }
    
    return paginas;
  }

  private scrollToTable(): void {
    const tablaSection = document.querySelector('.tabla-section');
    if (tablaSection) {
      tablaSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // ========== MÉTODOS PARA BÚSQUEDA AVANZADA ==========

  // ✅ NUEVO: Ejecutar búsqueda avanzada
  ejecutarBusquedaAvanzada(): void {
    this.cargandoBusqueda = true;
    this.busquedaEjecutada = true;

    // Primero cargamos todos los productos y luego aplicamos filtros
    this.productoService.obtenerTodosLosProductos().subscribe({
      next: (productos) => {
        let resultados = [...productos];
        
        // Aplicar filtros uno por uno
        if (this.filtrosBusqueda.nombre) {
          resultados = resultados.filter(p => 
            p.nombre.toLowerCase().includes(this.filtrosBusqueda.nombre.toLowerCase())
          );
        }
        
        if (this.filtrosBusqueda.codigo) {
          resultados = resultados.filter(p => 
            p.codigo.toLowerCase().includes(this.filtrosBusqueda.codigo.toLowerCase())
          );
        }
        
        if (this.filtrosBusqueda.marca) {
          resultados = resultados.filter(p => 
            p.marca?.toLowerCase().includes(this.filtrosBusqueda.marca.toLowerCase())
          );
        }
        
        if (this.filtrosBusqueda.categoriaId) {
          resultados = resultados.filter(p => 
            p.categoria.id === this.filtrosBusqueda.categoriaId
          );
        }
        
        if (this.filtrosBusqueda.estado) {
          resultados = resultados.filter(p => p.estado === this.filtrosBusqueda.estado);
        }
        
        if (this.filtrosBusqueda.precioMin !== null) {
          resultados = resultados.filter(p => p.precio >= this.filtrosBusqueda.precioMin!);
        }
        
        if (this.filtrosBusqueda.precioMax !== null) {
          resultados = resultados.filter(p => p.precio <= this.filtrosBusqueda.precioMax!);
        }
        
        if (this.filtrosBusqueda.stockMin !== null) {
          resultados = resultados.filter(p => p.stock >= this.filtrosBusqueda.stockMin!);
        }
        
        // Filtros de disponibilidad
        if (this.filtrosBusqueda.disponibilidad) {
          switch (this.filtrosBusqueda.disponibilidad) {
            case 'activos':
              resultados = resultados.filter(p => p.estado === EstadoProducto.ACTIVO);
              break;
            case 'disponibles':
              resultados = resultados.filter(p => p.estado === EstadoProducto.ACTIVO && p.stock > 0);
              break;
            case 'stock-bajo':
              resultados = resultados.filter(p => p.stock <= 5 && p.stock > 0);
              break;
            case 'sin-stock':
              resultados = resultados.filter(p => p.stock === 0);
              break;
          }
        }
        
        this.resultadosBusqueda = resultados;
        this.paginaActualBusqueda = 1;
        this.aplicarPaginacionBusqueda();
        this.cargandoBusqueda = false;
      },
      error: (error) => {
        console.error('Error en búsqueda avanzada:', error);
        alert('Error al realizar la búsqueda');
        this.cargandoBusqueda = false;
      }
    });
  }

  // ✅ NUEVO: Búsquedas rápidas predefinidas
  buscarProductosActivos(): void {
    this.limpiarBusquedaAvanzada();
    this.filtrosBusqueda.disponibilidad = 'activos';
    this.ejecutarBusquedaAvanzada();
  }

  buscarProductosDisponibles(): void {
    this.limpiarBusquedaAvanzada();
    this.filtrosBusqueda.disponibilidad = 'disponibles';
    this.ejecutarBusquedaAvanzada();
  }

  buscarStockBajo(): void {
    this.limpiarBusquedaAvanzada();
    this.filtrosBusqueda.disponibilidad = 'stock-bajo';
    this.ejecutarBusquedaAvanzada();
  }

  buscarSinStock(): void {
    this.limpiarBusquedaAvanzada();
    this.filtrosBusqueda.disponibilidad = 'sin-stock';
    this.ejecutarBusquedaAvanzada();
  }

  // ✅ NUEVO: Limpiar búsqueda avanzada
  limpiarBusquedaAvanzada(): void {
    this.filtrosBusqueda = {
      nombre: '',
      codigo: '',
      marca: '',
      categoriaId: null,
      estado: '',
      disponibilidad: '',
      precioMin: null,
      precioMax: null,
      stockMin: null
    };
    this.resultadosBusqueda = [];
    this.busquedaEjecutada = false;
    this.paginaActualBusqueda = 1;
  }

  // ✅ NUEVO: Verificar si hay filtros activos
  hayFiltrosActivos(): boolean {
    return Object.values(this.filtrosBusqueda).some(value => 
      value !== '' && value !== null && value !== undefined
    );
  }

  // ✅ NUEVO: Métodos para estadísticas de búsqueda
  getResultadosActivos(): number {
    return this.resultadosBusqueda.filter(p => p.estado === EstadoProducto.ACTIVO).length;
  }

  getResultadosStockBajo(): number {
    return this.resultadosBusqueda.filter(p => p.stock <= 5 && p.stock > 0).length;
  }

  // ✅ NUEVO: Exportar resultados
  exportarResultados(): void {
    if (this.resultadosBusqueda.length === 0) {
      alert('No hay resultados para exportar');
      return;
    }

    const csvContent = this.convertirACSV(this.resultadosBusqueda);
    this.descargarCSV(csvContent, 'resultados_busqueda_productos.csv');
  }

  private convertirACSV(productos: ProductoDto[]): string {
    const headers = ['ID', 'Código', 'Nombre', 'Categoría', 'Precio', 'Stock', 'Marca', 'Garantía', 'Estado'];
    const rows = productos.map(p => [
      p.id,
      p.codigo,
      p.nombre,
      p.categoria.nombre,
      p.precio,
      p.stock,
      p.marca || 'N/A',
      p.garantia || 'N/A',
      p.estado
    ]);

    return [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
  }

  private descargarCSV(csvContent: string, filename: string): void {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // ✅ NUEVO: Ver detalles del producto
  verDetalles(producto: ProductoDto): void {
    // Almacenar temporalmente el producto seleccionado
    this.productoService.seleccionarProducto(producto);
    
    // Aquí podrías navegar a una página de detalles o mostrar un modal
    alert(`Detalles de ${producto.nombre}\nCódigo: ${producto.codigo}\nPrecio: ${this.formatearMoneda(producto.precio)}\nStock: ${producto.stock}\nEstado: ${this.getEstadoTexto(producto.estado)}`);
  }

  // ========== MÉTODOS EXISTENTES (se mantienen igual) ==========

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
    document.querySelector('.form-container')?.scrollIntoView({ behavior: 'smooth' });
  }

  cambiarEstadoProducto(producto: ProductoDto): void {
    if (!producto.id) return;

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

  // Búsquedas y filtros básicos (se mantienen igual)
  buscarPorNombre(): void {
    if (!this.terminoBusquedaNombre.trim()) {
      this.productosFiltrados = [...this.productos];
      this.paginaActualFiltros = 1;
      this.aplicarPaginacionFiltros();
      return;
    }

    this.productoService.buscarProductosPorNombre(this.terminoBusquedaNombre).subscribe({
      next: (productos) => {
        this.productosFiltrados = productos;
        this.paginaActualFiltros = 1;
        this.aplicarPaginacionFiltros();
      },
      error: (error) => {
        console.error('Error en búsqueda por nombre:', error);
        this.productosFiltrados = this.productos.filter(p => 
          p.nombre.toLowerCase().includes(this.terminoBusquedaNombre.toLowerCase())
        );
        this.paginaActualFiltros = 1;
        this.aplicarPaginacionFiltros();
      }
    });
  }

  buscarPorCodigo(): void {
    if (!this.terminoBusquedaCodigo.trim()) {
      this.productosFiltrados = [...this.productos];
      this.paginaActualFiltros = 1;
      this.aplicarPaginacionFiltros();
      return;
    }

    this.productoService.obtenerProductoPorCodigo(this.terminoBusquedaCodigo).subscribe({
      next: (producto) => {
        this.productosFiltrados = [producto];
        this.paginaActualFiltros = 1;
        this.aplicarPaginacionFiltros();
      },
      error: (error) => {
        console.error('Error en búsqueda por código:', error);
        this.productosFiltrados = this.productos.filter(p => 
          p.codigo.toLowerCase().includes(this.terminoBusquedaCodigo.toLowerCase())
        );
        this.paginaActualFiltros = 1;
        this.aplicarPaginacionFiltros();
      }
    });
  }

  filtrarPorCategoria(): void {
    if (!this.categoriaFiltro) {
      this.productosFiltrados = [...this.productos];
      this.paginaActualFiltros = 1;
      this.aplicarPaginacionFiltros();
      return;
    }

    this.productoService.obtenerProductoPorCategoria(this.categoriaFiltro.id).subscribe({
      next: (productos) => {
        this.productosFiltrados = productos;
        this.paginaActualFiltros = 1;
        this.aplicarPaginacionFiltros();
      },
      error: (error) => {
        console.error('Error al filtrar por categoría:', error);
        this.productosFiltrados = this.productos.filter(p => 
          p.categoria.id === this.categoriaFiltro?.id
        );
        this.paginaActualFiltros = 1;
        this.aplicarPaginacionFiltros();
      }
    });
  }

  filtrarPorEstado(): void {
    if (!this.estadoFiltro) {
      this.productosFiltrados = [...this.productos];
      this.paginaActualFiltros = 1;
      this.aplicarPaginacionFiltros();
      return;
    }

    this.productoService.obtenerProductoPorEstado(this.estadoFiltro).subscribe({
      next: (productos) => {
        this.productosFiltrados = productos;
        this.paginaActualFiltros = 1;
        this.aplicarPaginacionFiltros();
      },
      error: (error) => {
        console.error('Error al filtrar por estado:', error);
        this.productosFiltrados = this.productos.filter(p => 
          p.estado === this.estadoFiltro
        );
        this.paginaActualFiltros = 1;
        this.aplicarPaginacionFiltros();
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
    this.paginaActualFiltros = 1;
    this.aplicarPaginacionFiltros();
  }

  limpiarFiltros(): void {
    this.terminoBusquedaNombre = '';
    this.terminoBusquedaCodigo = '';
    this.categoriaFiltro = null;
    this.estadoFiltro = '';
    this.stockFiltro = '';
    this.productosFiltrados = [...this.productos];
    this.paginaActualFiltros = 1;
    this.aplicarPaginacionFiltros();
  }

  // Utilidades
  manejarErrorImagen(event: any): void {
    event.target.style.display = 'none';
  }

  formatearMoneda(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(valor);
  }

  getEstadoTexto(estado: EstadoProducto): string {
    switch (estado) {
      case EstadoProducto.ACTIVO: return 'Activo';
      case EstadoProducto.INACTIVO: return 'Inactivo';
      case EstadoProducto.DESCONTINUADO: return 'Descontinuado';
      case EstadoProducto.AGOTADO: return 'Agotado';
      default: return estado;
    }
  }

  // ✅ Método auxiliar para Math.min en template
  get Math(): Math {
    return Math;
  }
}