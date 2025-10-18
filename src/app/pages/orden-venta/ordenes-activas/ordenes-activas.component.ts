// src/app/components/ordenes-activas/ordenes-activas.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  EstadoOrden, 
  OrdenConDetallesDto, 
  OrdenDto 
} from '../../../models/orden-venta/ordenventa.dto';
import { CategoriaDto } from '../../../models/categoria.dto';
import { EstadoProducto } from '../../../models/enums/estado-producto.enum';
import { ClienteDto } from '../../../models/cliente.dto';
import { UsuarioDto } from '../../../models/usuario/usuario.dto';
import { NavbarOrdenComponent } from '../navbar-orden/navbar-orden.component';
import { DetalleOrdenDto } from '../../../models/detalle-orden/detalle-orden.dto';
import { ProductoDto } from '../../../models/producto/producto.dto';
import { OrdenVentaService } from '../../../services/orden-venta.service';
import { ClienteService } from '../../../services/cliente.service';
import { CategoriaService } from '../../../services/categoria.service';
import { AuthService } from '../../../services/auth.service'; // Importar AuthService
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-ordenes-activas',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarOrdenComponent],
  templateUrl: './ordenes-activas.component.html',
  styleUrl: './ordenes-activas.component.css'
})
export class OrdenesActivasComponent implements OnInit {
  // Usar OrdenConDetallesDto para mostrar órdenes con detalles completos
  ordenes: OrdenConDetallesDto[] = [];
  ordenesFiltradas: OrdenConDetallesDto[] = [];
  
  filtros = {
    estado: '',
    cliente: '',
    vendedor: '',
    fechaDesde: '',
    fechaHasta: '',
    numeroOrden: ''
  };

  estados: EstadoOrden[] = [
    EstadoOrden.PENDIENTE, 
    EstadoOrden.AGREGANDOPRODUCTOS,
    EstadoOrden.DISPONIBLEPARAPAGO,
    EstadoOrden.PAGADA, 
    EstadoOrden.ENTREGADA, 
    EstadoOrden.CERRADA
  ];
  clientes: string[] = [];
  vendedores: string[] = [];

  paginaActual = 1;
  itemsPorPagina = 10;
  totalPaginas = 1;

  ordenarPor = 'fecha';
  ordenDireccion: 'asc' | 'desc' = 'desc';

  // Propiedades para estadísticas
  totalOrdenesPendientes: number = 0;
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  cargando: boolean = false;

  // Propiedades para la funcionalidad de continuar con orden
  mostrarConfirmacionContinuar: boolean = false;
  ordenSeleccionada: OrdenConDetallesDto | null = null;

  // Propiedades para el vendedor actual
  vendedorActualId: number | null = null;
  vendedorActualNombre: string = '';

  constructor(
    private ordenVentaService: OrdenVentaService,
    private clienteService: ClienteService,
    private categoriaService: CategoriaService,
    private authService: AuthService, // Inyectar AuthService
    private router: Router
  ) {}

  ngOnInit() {
    this.obtenerVendedorActual();
  }

  /**
   * Obtiene el vendedor actual del servicio de autenticación
   */
  obtenerVendedorActual() {
    // Obtener el usuario actual del servicio de autenticación
    const usuarioActual = this.authService.getCurrentUser();
    
    if (usuarioActual && usuarioActual.userId) {
      this.vendedorActualId = usuarioActual.userId;
      this.vendedorActualNombre = usuarioActual.nombre || 'Vendedor';
      console.log('👤 Vendedor actual:', this.vendedorActualId, this.vendedorActualNombre);
      this.cargarDatosReales();
    } else {
      this.errorMessage = 'No se pudo obtener la información del vendedor actual.';
      console.error('No se pudo obtener el usuario actual');
    }
  }

  /**
   * Carga las órdenes del vendedor actual
   */
  cargarDatosReales() {
    if (!this.vendedorActualId) {
      this.errorMessage = 'No se pudo identificar al vendedor actual.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    console.log('📋 Cargando órdenes del vendedor:', this.vendedorActualId);

    this.ordenVentaService.obtenerOrdenesPorVendedor(this.vendedorActualId)
      .pipe(
        catchError((error) => {
          console.error('Error al cargar órdenes del vendedor:', error);
          this.errorMessage = 'Error al cargar las órdenes. Por favor, intente nuevamente.';
          return of([]);
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (ordenes) => {
          // Convertir OrdenDto[] a OrdenConDetallesDto[]
          this.ordenes = [];
          this.ordenesFiltradas = [];
          
          // Para cada orden, cargar los detalles completos
          if (ordenes.length > 0) {
            this.cargarDetallesOrdenes(ordenes);
          } else {
            this.actualizarDatosFiltros();
            this.successMessage = 'No se encontraron órdenes para este vendedor.';
            this.limpiarMensajes();
          }
        }
      });
  }

  private cargarDetallesOrdenes(ordenes: OrdenDto[]) {
    let ordenesCargadas = 0;
    
    ordenes.forEach(orden => {
      this.ordenVentaService.obtenerOrdenConDetalles(orden.id)
        .pipe(
          catchError((error) => {
            console.error(`Error al cargar detalles de orden ${orden.id}:`, error);
            // Si falla, usar la orden básica sin detalles
            const ordenBasica: OrdenConDetallesDto = {
              ...orden,
              productos: []
            };
            this.ordenes.push(ordenBasica);
            ordenesCargadas++;
            
            if (ordenesCargadas === ordenes.length) {
              this.actualizarDatosFiltros();
            }
            return of(null);
          })
        )
        .subscribe({
          next: (ordenConDetalles) => {
            if (ordenConDetalles) {
              this.ordenes.push(ordenConDetalles);
            }
            ordenesCargadas++;
            
            if (ordenesCargadas === ordenes.length) {
              this.actualizarDatosFiltros();
            }
          }
        });
    });
  }

  private actualizarDatosFiltros() {
    // Extraer listas únicas para filtros
    this.clientes = [...new Set(this.ordenes.map(o => o.cliente.nombre))];
    this.vendedores = [...new Set(this.ordenes.map(o => o.vendedor.nombre))];
    
    this.calcularEstadisticas();
    this.aplicarFiltros();
  }

  // ========== MÉTODOS PARA CONTINUAR CON ORDEN ==========

  /**
 * Método para continuar con una orden seleccionada
 */
/**
 * ✅ MÉTODO ACTUALIZADO: Continuar con una orden seleccionada
 */
continuarConOrden(orden: OrdenConDetallesDto): void {
  console.log('=== 🚀 CONTINUANDO CON ORDEN EXISTENTE ===');
  console.log('📋 Orden seleccionada:', orden);
  
  // ✅ VALIDACIÓN PRINCIPAL: No permitir continuar con órdenes en estado DISPONIBLEPARAPAGO
  if (orden.estado === EstadoOrden.DISPONIBLEPARAPAGO) {
    this.errorMessage = 'No se puede continuar con una orden que ya está disponible para pago.';
    this.limpiarMensajes();
    return;
  }

  // Validar que la orden pertenece al vendedor actual
  if (orden.vendedor.id !== this.vendedorActualId) {
    this.errorMessage = 'No puedes continuar con una orden que no te pertenece.';
    this.limpiarMensajes();
    return;
  }

  this.cargando = true;
  this.errorMessage = '';
  
  // 1. Actualizar el estado de la orden a AGREGANDOPRODUCTOS (si no lo está ya)
  if (orden.estado !== EstadoOrden.AGREGANDOPRODUCTOS) {
    this.ordenVentaService.marcarComoAgregandoProductos(orden.id)
      .pipe(
        catchError((error) => {
          console.error('❌ Error al actualizar estado de la orden:', error);
          this.errorMessage = 'Error al preparar la orden. Intente nuevamente.';
          this.cargando = false;
          return of(null);
        })
      )
      .subscribe({
        next: (ordenActualizada) => {
          if (ordenActualizada) {
            console.log('✅ Estado actualizado a AGREGANDOPRODUCTOS');
            this.procesarOrdenParaContinuar(ordenActualizada);
          } else {
            this.cargando = false;
          }
        }
      });
  } else {
    // Si ya está en AGREGANDOPRODUCTOS, continuar directamente
    this.procesarOrdenParaContinuar(orden);
  }
}

/**
 * ✅ MÉTODO AUXILIAR: Procesar la orden para continuar
 */
private procesarOrdenParaContinuar(orden: OrdenConDetallesDto | any): void {
  // 2. Guardar la orden actualizada en localStorage
  localStorage.setItem('ordenActual', JSON.stringify(orden));
  
  // 3. También guardar en el servicio para consistencia
  this.ordenVentaService.guardarOrdenActual(orden);
  
  console.log('💾 Orden guardada en localStorage y servicio');
  console.log('🔄 Redirigiendo al inicio...');
  
  // 4. Mostrar mensaje de éxito breve
  this.successMessage = `Orden ${orden.numeroOrden || 'sin número'} seleccionada correctamente`;
  
  // 5. Redirigir inmediatamente al inicio
  setTimeout(() => {
    this.router.navigate(['/inicio']);
  }, 500);
  
  this.cargando = false;
}

  /**
   * Método para procesar la orden seleccionada
   */
  procesarOrden(): void {
    if (!this.ordenSeleccionada) {
      this.errorMessage = 'No hay orden seleccionada para procesar.';
      return;
    }

    // Validar que la orden pertenece al vendedor actual
    if (this.ordenSeleccionada.vendedor.id !== this.vendedorActualId) {
      this.errorMessage = 'No puedes procesar una orden que no te pertenece.';
      this.limpiarMensajes();
      return;
    }

    this.cargando = true;
    this.errorMessage = '';

    console.log('🚀 Procesando orden:', this.ordenSeleccionada);

    // Obtener la orden completa del backend
    this.ordenVentaService.obtenerOrdenPorId(this.ordenSeleccionada.id)
      .pipe(
        catchError((error) => {
          console.error('Error al obtener orden completa:', error);
          this.errorMessage = 'Error al cargar la orden seleccionada.';
          this.cargando = false;
          return of(null);
        })
      )
      .subscribe({
        next: (ordenCompleta) => {
          if (ordenCompleta) {
            // Guardar la orden actual en el servicio
            this.ordenVentaService.guardarOrdenActual(ordenCompleta);
            
            // Mostrar mensaje de éxito
            this.successMessage = `Orden ${this.ordenSeleccionada?.numeroOrden} seleccionada correctamente. Redirigiendo...`;
            
            // Cerrar modal después de un breve delay
            setTimeout(() => {
              this.mostrarConfirmacionContinuar = false;
              this.ordenSeleccionada = null;
              
              // Redirigir al inicio después de otro breve delay
              setTimeout(() => {
                this.router.navigate(['/']);
              }, 1000);
              
            }, 1500);
          } else {
            this.errorMessage = 'No se pudo cargar la orden seleccionada.';
          }
          this.cargando = false;
        }
      });
  }

  /**
   * Método para cancelar la acción de continuar
   */
  cancelarContinuar(): void {
    console.log('❌ Cancelando continuar con orden');
    this.mostrarConfirmacionContinuar = false;
    this.ordenSeleccionada = null;
    this.cargando = false;
  }

  /**
   * Método para limpiar mensajes después de un tiempo
   */
  limpiarMensajes(): void {
    setTimeout(() => {
      this.successMessage = '';
      this.errorMessage = '';
    }, 5000);
  }

  // ========== MÉTODOS EXISTENTES (se mantienen igual) ==========

  cargarOrdenesPorEstado(estado: EstadoOrden) {
    if (!this.vendedorActualId) return;

    this.isLoading = true;
    this.errorMessage = '';

    // Primero obtener todas las órdenes del vendedor y luego filtrar por estado
    this.ordenVentaService.obtenerOrdenesPorVendedor(this.vendedorActualId)
      .pipe(
        catchError((error) => {
          console.error(`Error al cargar órdenes del vendedor:`, error);
          this.errorMessage = `Error al cargar órdenes.`;
          return of([]);
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (ordenes) => {
          // Filtrar por estado
          const ordenesFiltradas = ordenes.filter(orden => orden.estado === estado);
          
          this.ordenes = [];
          this.ordenesFiltradas = [];
          
          if (ordenesFiltradas.length > 0) {
            this.cargarDetallesOrdenes(ordenesFiltradas);
          } else {
            this.actualizarDatosFiltros();
            this.successMessage = `No se encontraron órdenes en estado ${estado.toLowerCase()}.`;
            this.limpiarMensajes();
          }
        }
      });
  }

  cargarOrdenesPendientes() {
    this.cargarOrdenesPorEstado(EstadoOrden.PENDIENTE);
  }

  cargarOrdenesAgregandoProductos() {
    this.cargarOrdenesPorEstado(EstadoOrden.AGREGANDOPRODUCTOS);
  }

  cargarOrdenesDisponiblesParaPago() {
    this.cargarOrdenesPorEstado(EstadoOrden.DISPONIBLEPARAPAGO);
  }

  cargarOrdenesPagadas() {
    this.cargarOrdenesPorEstado(EstadoOrden.PAGADA);
  }

  cargarOrdenesEntregadas() {
    this.cargarOrdenesPorEstado(EstadoOrden.ENTREGADA);
  }

  cargarOrdenesCerradas() {
    this.cargarOrdenesPorEstado(EstadoOrden.CERRADA);
  }

  actualizarEstadoOrden(ordenId: number, nuevoEstado: EstadoOrden) {
    this.ordenVentaService.actualizarEstadoOrden(ordenId, nuevoEstado)
      .pipe(
        catchError((error) => {
          console.error('Error al actualizar estado:', error);
          this.errorMessage = 'Error al actualizar el estado de la orden.';
          return of(null);
        })
      )
      .subscribe({
        next: (ordenActualizada) => {
          if (ordenActualizada) {
            // Actualizar la orden en la lista local
            const index = this.ordenes.findIndex(o => o.id === ordenId);
            if (index !== -1) {
              this.ordenes[index].estado = nuevoEstado;
              this.actualizarDatosFiltros();
              this.successMessage = `Orden actualizada a estado: ${nuevoEstado}`;
              this.limpiarMensajes();
            }
          }
        }
      });
  }

  marcarComoPagada(ordenId: number) {
    this.actualizarEstadoOrden(ordenId, EstadoOrden.PAGADA);
  }

  marcarComoEntregada(ordenId: number) {
    this.actualizarEstadoOrden(ordenId, EstadoOrden.ENTREGADA);
  }

  marcarComoCerrada(ordenId: number) {
    this.actualizarEstadoOrden(ordenId, EstadoOrden.CERRADA);
  }

  aplicarDescuento(ordenId: number, porcentajeDescuento: number) {
    if (porcentajeDescuento < 0 || porcentajeDescuento > 100) {
      this.errorMessage = 'El descuento debe estar entre 0% y 100%';
      this.limpiarMensajes();
      return;
    }

    this.ordenVentaService.aplicarDescuento(ordenId, porcentajeDescuento)
      .pipe(
        catchError((error) => {
          console.error('Error al aplicar descuento:', error);
          this.errorMessage = 'Error al aplicar el descuento.';
          this.limpiarMensajes();
          return of(null);
        })
      )
      .subscribe({
        next: (ordenActualizada) => {
          if (ordenActualizada) {
            // Actualizar la orden en la lista local
            const index = this.ordenes.findIndex(o => o.id === ordenId);
            if (index !== -1) {
              this.ordenes[index] = {
                ...this.ordenes[index],
                descuento: ordenActualizada.descuento,
                total: ordenActualizada.total
              };
              this.actualizarDatosFiltros();
              this.successMessage = `Descuento del ${porcentajeDescuento}% aplicado correctamente`;
              this.limpiarMensajes();
            }
          }
        }
      });
  }

  // Los métodos de filtrado, ordenamiento y utilidades se mantienen igual
  calcularEstadisticas() {
    this.totalOrdenesPendientes = this.ordenes.filter(o => 
      o.estado === EstadoOrden.PENDIENTE || 
      o.estado === EstadoOrden.AGREGANDOPRODUCTOS ||
      o.estado === EstadoOrden.DISPONIBLEPARAPAGO
    ).length;
  }

  aplicarFiltros() {
    let resultado = this.ordenes;

    // Aplicar filtros
    if (this.filtros.estado) {
      resultado = resultado.filter(orden => orden.estado === this.filtros.estado);
    }

    if (this.filtros.cliente) {
      resultado = resultado.filter(orden => 
        orden.cliente.nombre.toLowerCase().includes(this.filtros.cliente.toLowerCase())
      );
    }

    if (this.filtros.vendedor) {
      resultado = resultado.filter(orden => 
        orden.vendedor.nombre.toLowerCase().includes(this.filtros.vendedor.toLowerCase())
      );
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
        case 'vendedor':
          valorA = a.vendedor.nombre;
          valorB = b.vendedor.nombre;
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
      cliente: '',
      vendedor: '',
      fechaDesde: '',
      fechaHasta: '',
      numeroOrden: ''
    };
    this.aplicarFiltros();
  }

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

  getTotalOrdenes(): number {
    return this.ordenesFiltradas.length;
  }

  getTotalVentas(): number {
    return this.ordenesFiltradas.reduce((total, orden) => total + orden.total, 0);
  }

  // Método para formatear moneda
  formatearMoneda(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(valor);
  }

  // Método para formatear fecha
  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Método para obtener badge class según estado
  getBadgeClass(estado: EstadoOrden): string {
    switch (estado) {
      case EstadoOrden.PENDIENTE: return 'badge-warning';
      case EstadoOrden.AGREGANDOPRODUCTOS: return 'badge-primary';
      case EstadoOrden.DISPONIBLEPARAPAGO: return 'badge-info';
      case EstadoOrden.PAGADA: return 'badge-success';
      case EstadoOrden.ENTREGADA: return 'badge-success';
      case EstadoOrden.CERRADA: return 'badge-secondary';
      default: return 'badge-light';
    }
  }

  // Método para obtener el nombre de la categoría del primer producto
  getCategoriaPrincipal(orden: OrdenConDetallesDto): string {
    if (orden.productos.length > 0 && orden.productos[0].producto) {
      return orden.productos[0].producto.categoria.nombre;
    }
    return 'Sin categoría';
  }

  // Método para obtener el estado del producto como badge
  getEstadoProductoBadge(estado: EstadoProducto): string {
    switch (estado) {
      case EstadoProducto.ACTIVO: return 'badge-producto-activo';
      case EstadoProducto.INACTIVO: return 'badge-producto-inactivo';
      case EstadoProducto.DESCONTINUADO: return 'badge-producto-descontinuado';
      case EstadoProducto.AGOTADO: return 'badge-producto-agotado';
      default: return 'badge-producto-default';
    }
  }

  // Método para obtener array de páginas para la paginación
  getPaginas(): number[] {
    const paginas = [];
    const inicio = Math.max(1, this.paginaActual - 2);
    const fin = Math.min(this.totalPaginas, this.paginaActual + 2);
    
    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }
    return paginas;
  }

  // Método para obtener la cantidad total de productos en una orden
  getCantidadTotalProductos(orden: OrdenConDetallesDto): number {
    return orden.productos.reduce((total, detalle) => total + detalle.cantidad, 0);
  }

  // Método para obtener los nombres de los productos como string
  getNombresProductos(orden: OrdenConDetallesDto): string {
    return orden.productos
      .map(detalle => detalle.producto.nombre)
      .join(', ');
  }

  // Método para verificar si una orden tiene observaciones
  tieneObservaciones(orden: OrdenConDetallesDto): boolean {
    return !!orden.observaciones && orden.observaciones.trim().length > 0;
  }

  // Método para obtener el porcentaje de descuento aplicado
  getPorcentajeDescuento(orden: OrdenConDetallesDto): number {
    if (orden.subtotal === 0) return 0;
    return (orden.descuento / orden.subtotal) * 100;
  }

  // Método para recargar datos
  recargarDatos() {
    this.cargarDatosReales();
  }

  // Método para obtener el título de la página
  getTituloPagina(): string {
    return `Mis Órdenes ${this.vendedorActualNombre ? `- ${this.vendedorActualNombre}` : ''}`;
  }
}