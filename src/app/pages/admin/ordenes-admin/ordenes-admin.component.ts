import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// Importar modelos y servicios
import { OrdenConDetallesDto, EstadoOrden } from '../../../models/orden-venta/ordenventa.dto';
import { OrdenVentaService } from '../../../services/orden-venta.service';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-ordenes-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './ordenes-admin.component.html',
  styleUrl: './ordenes-admin.component.css'
})
export class OrdenesAdminComponent implements OnInit {
  private ordenVentaService = inject(OrdenVentaService);
  private router = inject(Router);

  // Datos
  ordenes: OrdenConDetallesDto[] = [];
  ordenesFiltradas: OrdenConDetallesDto[] = [];
  
  // Filtros
  filtros = {
    estado: '',
    numeroOrden: '',
    fechaDesde: '',
    fechaHasta: ''
  };

  // Estados disponibles
  estados: EstadoOrden[] = [
    EstadoOrden.PENDIENTE, 
    EstadoOrden.PAGADA, 
    EstadoOrden.ENTREGADA, 
    EstadoOrden.CERRADA
  ];

  // Paginación
  paginaActual = 1;
  itemsPorPagina = 10;
  totalPaginas = 1;

  // Ordenamiento
  ordenarPor = 'fecha';
  ordenDireccion: 'asc' | 'desc' = 'desc';

  // Estadísticas
  totalOrdenesPendientes: number = 0;
  isLoading: boolean = false;
  errorMessage: string = '';

  ngOnInit() {
    this.cargarOrdenes();
  }

  cargarOrdenes() {
    this.isLoading = true;
    this.errorMessage = '';

    this.ordenVentaService.obtenerTodasLasOrdenes()
      .pipe(
        catchError((error) => {
          console.error('Error al cargar órdenes:', error);
          this.errorMessage = 'Error al cargar las órdenes. Por favor, intente nuevamente.';
          return of([]);
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (ordenes) => {
          // Cargar detalles completos para cada orden
          this.cargarDetallesOrdenes(ordenes);
        }
      });
  }

  private cargarDetallesOrdenes(ordenes: any[]) {
    const ordenesConDetalles: OrdenConDetallesDto[] = [];
    let ordenesCargadas = 0;

    if (ordenes.length === 0) {
      this.ordenes = [];
      this.ordenesFiltradas = [];
      this.calcularEstadisticas();
      this.aplicarFiltros();
      return;
    }

    ordenes.forEach(orden => {
      this.ordenVentaService.obtenerOrdenConDetalles(orden.id)
        .pipe(
          catchError((error) => {
            console.error(`Error al cargar detalles de orden ${orden.id}:`, error);
            // Si falla, crear una orden básica con detalles vacíos
            const ordenBasica: OrdenConDetallesDto = {
              ...orden,
              productos: []
            };
            ordenesConDetalles.push(ordenBasica);
            ordenesCargadas++;
            
            if (ordenesCargadas === ordenes.length) {
              this.finalizarCargaOrdenes(ordenesConDetalles);
            }
            return of(null);
          })
        )
        .subscribe({
          next: (ordenConDetalles) => {
            if (ordenConDetalles) {
              ordenesConDetalles.push(ordenConDetalles);
            }
            ordenesCargadas++;
            
            if (ordenesCargadas === ordenes.length) {
              this.finalizarCargaOrdenes(ordenesConDetalles);
            }
          }
        });
    });
  }

  private finalizarCargaOrdenes(ordenes: OrdenConDetallesDto[]) {
    this.ordenes = ordenes;
    this.ordenesFiltradas = [...ordenes];
    this.calcularEstadisticas();
    this.aplicarFiltros();
  }

  // Métodos de filtrado
  aplicarFiltros() {
    let resultado = this.ordenes;

    // Aplicar filtros
    if (this.filtros.estado) {
      resultado = resultado.filter(orden => orden.estado === this.filtros.estado);
    }

    if (this.filtros.numeroOrden) {
      resultado = resultado.filter(orden => 
        orden.numeroOrden.toLowerCase().includes(this.filtros.numeroOrden.toLowerCase())
      );
    }

    if (this.filtros.fechaDesde) {
      resultado = resultado.filter(orden => 
        new Date(orden.fecha) >= new Date(this.filtros.fechaDesde)
      );
    }

    if (this.filtros.fechaHasta) {
      const fechaHasta = new Date(this.filtros.fechaHasta);
      fechaHasta.setHours(23, 59, 59, 999);
      resultado = resultado.filter(orden => 
        new Date(orden.fecha) <= fechaHasta
      );
    }

    // Ordenar
    resultado = this.ordenarDatos(resultado);

    this.ordenesFiltradas = resultado;
    this.actualizarPaginacion();
  }

  ordenarDatos(datos: OrdenConDetallesDto[]): OrdenConDetallesDto[] {
    return datos.sort((a, b) => {
      let valorA: any, valorB: any;

      switch (this.ordenarPor) {
        case 'numeroOrden':
          valorA = a.numeroOrden;
          valorB = b.numeroOrden;
          break;
        case 'cliente':
          valorA = a.cliente.nombre;
          valorB = b.cliente.nombre;
          break;
        case 'total':
          valorA = a.total;
          valorB = b.total;
          break;
        case 'fecha':
        default:
          valorA = new Date(a.fecha);
          valorB = new Date(b.fecha);
          break;
      }

      if (this.ordenDireccion === 'asc') {
        return valorA > valorB ? 1 : -1;
      } else {
        return valorA < valorB ? 1 : -1;
      }
    });
  }

  cambiarOrden(campo: string) {
    if (this.ordenarPor === campo) {
      this.ordenDireccion = this.ordenDireccion === 'asc' ? 'desc' : 'asc';
    } else {
      this.ordenarPor = campo;
      this.ordenDireccion = 'desc';
    }
    this.aplicarFiltros();
  }

  limpiarFiltros() {
    this.filtros = {
      estado: '',
      numeroOrden: '',
      fechaDesde: '',
      fechaHasta: ''
    };
    this.aplicarFiltros();
  }

  // Métodos de paginación
  actualizarPaginacion() {
    this.totalPaginas = Math.ceil(this.ordenesFiltradas.length / this.itemsPorPagina);
    this.paginaActual = 1;
  }

  cambiarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  get ordenesPaginadas(): OrdenConDetallesDto[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    return this.ordenesFiltradas.slice(inicio, fin);
  }

  getPaginas(): number[] {
    const paginas = [];
    const inicio = Math.max(1, this.paginaActual - 2);
    const fin = Math.min(this.totalPaginas, this.paginaActual + 2);
    
    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }
    return paginas;
  }

  // Métodos de utilidad
  getTotalOrdenes(): number {
    return this.ordenesFiltradas.length;
  }

  getTotalVentas(): number {
    return this.ordenesFiltradas.reduce((total, orden) => total + orden.total, 0);
  }

  calcularEstadisticas() {
    this.totalOrdenesPendientes = this.ordenes.filter(o => o.estado === EstadoOrden.PENDIENTE).length;
  }

  formatearMoneda(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(valor);
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getBadgeClass(estado: EstadoOrden): string {
    switch (estado) {
      case EstadoOrden.PENDIENTE: return 'badge-pendiente';
      case EstadoOrden.PAGADA: return 'badge-pagada';
      case EstadoOrden.ENTREGADA: return 'badge-entregada';
      case EstadoOrden.CERRADA: return 'badge-cerrada';
      default: return 'badge-default';
    }
  }

  // Métodos para mostrar información de productos
  getCantidadTotalProductos(orden: OrdenConDetallesDto): number {
    return orden.productos.reduce((total, detalle) => total + detalle.cantidad, 0);
  }

  getNombresProductos(orden: OrdenConDetallesDto): string {
    return orden.productos
      .map(detalle => detalle.producto.nombre)
      .join(', ');
  }

  tieneObservaciones(orden: OrdenConDetallesDto): boolean {
    return !!orden.observaciones && orden.observaciones.trim().length > 0;
  }

  // Métodos de acciones
  verDetallesOrden(ordenId: number) {
    this.router.navigate(['/admin/ordenes', ordenId]);
  }

  editarOrden(ordenId: number) {
    this.router.navigate(['/admin/ordenes/editar', ordenId]);
  }

  imprimirOrden(orden: OrdenConDetallesDto) {
    console.log('Imprimiendo orden:', orden.numeroOrden);
    // Lógica para imprimir la orden
  }

  // Método para recargar datos
  recargarDatos() {
    this.cargarOrdenes();
  }
}