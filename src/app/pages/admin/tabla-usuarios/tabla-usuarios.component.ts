import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, HostListener, inject, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../navbar/navbar.component';
import { UsuarioDto } from '../../../models/usuario/usuario.dto';
import { UsuarioService } from '../../../services/usuario.service';
import { MensajeDto } from '../../../models/mensaje.dto';

@Component({
  selector: 'app-tabla-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './tabla-usuarios.component.html',
  styleUrls: ['./tabla-usuarios.component.css']
})
export class TablaUsuariosComponent implements OnInit, AfterViewInit, OnDestroy {
  private usuarioService = inject(UsuarioService);

  @Input() usuarios: UsuarioDto[] = [];
  @Output() usuarioEditado = new EventEmitter<UsuarioDto>();
  @Output() usuariosCargados = new EventEmitter<UsuarioDto[]>();

  // Variables para la vista
  seccionActiva: string = 'usuariosRegistrados';
  tablaTieneScroll: boolean = false;
  private resizeObserver: ResizeObserver | null = null;

  // Variables para estadísticas
  totalUsuarios: number = 0;
  usuariosActivos: number = 0;
  totalAdministradores: number = 0;
  usuariosInactivos: number = 0;

  // Variables para filtros
  terminoBusquedaNombre: string = '';
  terminoBusquedaCedula: string = '';
  tipoUsuarioFiltro: string = '';
  fechaInicioFiltro: string = '';
  fechaFinFiltro: string = '';
  fechaEspecificaFiltro: string = '';
  tipoFiltroFecha: string = '';
  filtrosActivos: boolean = false;

  // Variables para paginación
  paginaActual: number = 1;
  usuariosPorPagina: number = 10;
  totalPaginas: number = 1;
  paginas: number[] = [];

  tiposUsuario = [
    { value: '', label: 'Todos los tipos' },
    { value: 'ADMIN', label: 'Administrador' },
    { value: 'VENDEDOR', label: 'Vendedor' },
    { value: 'CAJERO', label: 'Cajero' },
    { value: 'DESPACHADOR', label: 'Despachador' }
  ];

  // Getter para usuarios filtrados y paginados
  get usuariosParaMostrar(): UsuarioDto[] {
    const startIndex = (this.paginaActual - 1) * this.usuariosPorPagina;
    const endIndex = startIndex + this.usuariosPorPagina;
    return this.usuarios.slice(startIndex, endIndex);
  }

  ngOnInit() {
    this.cargarUsuarios();
  }

  ngAfterViewInit() {
    this.inicializarObservadorResize();
    setTimeout(() => this.verificarScrollTabla(), 100);
  }

  ngOnDestroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  @HostListener('window:resize')
  onWindowResize() {
    this.verificarScrollTabla();
  }

  private inicializarObservadorResize() {
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        this.verificarScrollTabla();
      });

      const tablaContainers = document.querySelectorAll('.tabla-scroll');
      tablaContainers.forEach(container => {
        this.resizeObserver?.observe(container);
      });
    }
  }

  private verificarScrollTabla() {
    const tablaScrollElements = document.querySelectorAll('.tabla-scroll');
    
    tablaScrollElements.forEach(element => {
      const scrollElement = element as HTMLElement;
      const tieneScroll = scrollElement.scrollWidth > scrollElement.clientWidth;
      
      if (tieneScroll) {
        scrollElement.classList.add('has-scroll');
      } else {
        scrollElement.classList.remove('has-scroll');
      }
    });
  }

  mostrarSeccion(seccion: string): void {
    this.seccionActiva = seccion;
    if (seccion === 'usuariosRegistrados') {
      this.cargarUsuarios();
    }
  }

  cargarUsuarios() {
    this.usuarioService.obtenerUsuarios().subscribe({
      next: (usuarios: UsuarioDto[]) => {
        this.usuarios = usuarios;
        this.calcularEstadisticas();
        this.calcularPaginacion();
        this.usuariosCargados.emit(usuarios);
        setTimeout(() => this.verificarScrollTabla(), 100);
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
        this.mostrarError('cargar los usuarios', error);
      }
    });
  }

  private calcularEstadisticas(): void {
    this.totalUsuarios = this.usuarios.length;
    this.usuariosActivos = this.usuarios.filter(u => u.estado).length;
    this.usuariosInactivos = this.totalUsuarios - this.usuariosActivos;
    this.totalAdministradores = this.usuarios.filter(u => u.tipoUsuario === 'ADMIN').length;
  }

  private calcularPaginacion(): void {
    this.totalPaginas = Math.ceil(this.usuarios.length / this.usuariosPorPagina);
    this.paginas = Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
    
    // Asegurar que la página actual sea válida
    if (this.paginaActual > this.totalPaginas) {
      this.paginaActual = 1;
    }
  }

  private mostrarError(accion: string, error: any): void {
    let mensaje = `Error al ${accion}: `;
    
    if (error.status === 0) {
      mensaje += 'No se pudo conectar al servidor. Verifique que el backend esté ejecutándose.';
    } else if (error.status === 404) {
      mensaje += 'El endpoint no fue encontrado. Verifique la URL del API.';
    } else if (error.error?.mensaje) {
      mensaje += error.error.mensaje;
    } else {
      mensaje += error.message || 'Error desconocido';
    }
    
    alert(mensaje);
  }

  editarUsuario(usuario: UsuarioDto) {
    this.usuarioEditado.emit(usuario);
  }

  cambiarEstadoUsuario(usuario: UsuarioDto) {
    const nuevoEstado = !usuario.estado;
    const accion = nuevoEstado ? 'activar' : 'desactivar';
    const confirmacion = confirm(`¿Estás seguro de que deseas ${accion} al usuario ${usuario.nombre}?`);
    
    if (confirmacion) {
      this.usuarioService.cambiarEstadoUsuario(usuario.id, nuevoEstado).subscribe({
        next: (response: MensajeDto<string>) => {
          if (!response.error) {
            alert(response.mensaje);
            // Actualizar el estado localmente sin recargar toda la lista
            usuario.estado = nuevoEstado;
            this.calcularEstadisticas();
          } else {
            alert('Error: ' + response.mensaje);
          }
        },
        error: (error) => {
          console.error('Error al cambiar estado del usuario:', error);
          this.mostrarError('cambiar el estado del usuario', error);
        }
      });
    }
  }

  eliminarUsuario(usuario: UsuarioDto) {
    const confirmacion = confirm(`¿Estás seguro de que deseas eliminar permanentemente al usuario ${usuario.nombre}? Esta acción no se puede deshacer.`);
    
    if (confirmacion) {
      this.usuarioService.eliminarUsuario(usuario.id).subscribe({
        next: (response: MensajeDto<string>) => {
          if (!response.error) {
            alert(response.mensaje);
            // Remover el usuario localmente sin recargar toda la lista
            this.usuarios = this.usuarios.filter(u => u.id !== usuario.id);
            this.calcularEstadisticas();
            this.calcularPaginacion();
          } else {
            alert('Error: ' + response.mensaje);
          }
        },
        error: (error) => {
          console.error('Error al eliminar usuario:', error);
          this.mostrarError('eliminar el usuario', error);
        }
      });
    }
  }

  buscarPorNombre() {
    if (this.terminoBusquedaNombre.trim()) {
      this.usuarioService.buscarUsuariosPorNombre(this.terminoBusquedaNombre).subscribe({
        next: (usuarios) => {
          this.aplicarFiltros(usuarios);
        },
        error: (error) => {
          console.error('Error en búsqueda por nombre:', error);
          // Fallback a filtro local
          const usuariosFiltrados = this.usuarios.filter(u => 
            u.nombre.toLowerCase().includes(this.terminoBusquedaNombre.toLowerCase())
          );
          this.aplicarFiltros(usuariosFiltrados);
        }
      });
    } else {
      this.limpiarFiltros();
    }
  }

  buscarPorCedula() {
    if (this.terminoBusquedaCedula.trim()) {
      this.usuarioService.buscarUsuariosPorCedula(this.terminoBusquedaCedula).subscribe({
        next: (usuarios) => {
          this.aplicarFiltros(usuarios);
        },
        error: (error) => {
          console.error('Error en búsqueda por cédula:', error);
          // Fallback a filtro local
          const usuariosFiltrados = this.usuarios.filter(u => 
            u.cedula.includes(this.terminoBusquedaCedula)
          );
          this.aplicarFiltros(usuariosFiltrados);
        }
      });
    } else {
      this.limpiarFiltros();
    }
  }

  filtrarPorTipo() {
    if (this.tipoUsuarioFiltro) {
      this.usuarioService.obtenerUsuariosPorTipo(this.tipoUsuarioFiltro).subscribe({
        next: (usuarios) => {
          this.aplicarFiltros(usuarios);
        },
        error: (error) => {
          console.error('Error al filtrar por tipo:', error);
          // Fallback a filtro local
          const usuariosFiltrados = this.usuarios.filter(u => 
            u.tipoUsuario === this.tipoUsuarioFiltro
          );
          this.aplicarFiltros(usuariosFiltrados);
        }
      });
    } else {
      this.limpiarFiltros();
    }
  }

  filtrarPorFecha() {
    if (this.tipoFiltroFecha === 'rango' && this.fechaInicioFiltro && this.fechaFinFiltro) {
      const fechaInicio = new Date(this.fechaInicioFiltro);
      const fechaFin = new Date(this.fechaFinFiltro);
      
      this.usuarioService.obtenerUsuariosPorFechaCreacion(fechaInicio, fechaFin).subscribe({
        next: (usuarios) => {
          this.aplicarFiltros(usuarios);
        },
        error: (error) => {
          console.error('Error al filtrar por rango de fechas:', error);
          this.filtrarPorFechaLocal();
        }
      });
    } else if ((this.tipoFiltroFecha === 'despues' || this.tipoFiltroFecha === 'antes') && this.fechaEspecificaFiltro) {
      const fecha = new Date(this.fechaEspecificaFiltro);
      
      const servicio = this.tipoFiltroFecha === 'despues' 
        ? this.usuarioService.obtenerUsuariosCreadosDespuesDe(fecha)
        : this.usuarioService.obtenerUsuariosCreadosAntesDe(fecha);
      
      servicio.subscribe({
        next: (usuarios) => {
          this.aplicarFiltros(usuarios);
        },
        error: (error) => {
          console.error(`Error al filtrar por fecha ${this.tipoFiltroFecha}:`, error);
          this.filtrarPorFechaLocal();
        }
      });
    } else {
      alert('Por favor, complete los campos de fecha correctamente');
    }
  }

  private filtrarPorFechaLocal(): void {
    let usuariosFiltrados: UsuarioDto[] = [];

    if (this.tipoFiltroFecha === 'rango' && this.fechaInicioFiltro && this.fechaFinFiltro) {
      const fechaInicio = new Date(this.fechaInicioFiltro);
      const fechaFin = new Date(this.fechaFinFiltro);
      
      usuariosFiltrados = this.usuarios.filter(u => {
        const fechaCreacion = new Date(u.fechaCreacion);
        return fechaCreacion >= fechaInicio && fechaCreacion <= fechaFin;
      });
    } else if (this.tipoFiltroFecha === 'despues' && this.fechaEspecificaFiltro) {
      const fecha = new Date(this.fechaEspecificaFiltro);
      usuariosFiltrados = this.usuarios.filter(u => new Date(u.fechaCreacion) >= fecha);
    } else if (this.tipoFiltroFecha === 'antes' && this.fechaEspecificaFiltro) {
      const fecha = new Date(this.fechaEspecificaFiltro);
      usuariosFiltrados = this.usuarios.filter(u => new Date(u.fechaCreacion) <= fecha);
    }

    this.aplicarFiltros(usuariosFiltrados);
  }

  private aplicarFiltros(usuariosFiltrados: UsuarioDto[]): void {
    this.usuarios = usuariosFiltrados;
    this.filtrosActivos = true;
    this.calcularEstadisticas();
    this.calcularPaginacion();
    this.paginaActual = 1; // Reset a primera página al aplicar filtros
    setTimeout(() => this.verificarScrollTabla(), 100);
  }

  limpiarFiltros() {
    this.terminoBusquedaNombre = '';
    this.terminoBusquedaCedula = '';
    this.tipoUsuarioFiltro = '';
    this.fechaInicioFiltro = '';
    this.fechaFinFiltro = '';
    this.fechaEspecificaFiltro = '';
    this.tipoFiltroFecha = '';
    this.filtrosActivos = false;
    this.paginaActual = 1;
    
    // Recargar todos los usuarios
    this.cargarUsuarios();
  }

  // Métodos de paginación
  paginaAnterior(): void {
    if (this.paginaActual > 1) {
      this.paginaActual--;
    }
  }

  paginaSiguiente(): void {
    if (this.paginaActual < this.totalPaginas) {
      this.paginaActual++;
    }
  }

  irAPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  exportarUsuarios(): void {
    // Implementación básica de exportación
    const datos = this.usuarios.map(usuario => ({
      ID: usuario.id,
      Cédula: usuario.cedula,
      Nombre: usuario.nombre,
      Usuario: usuario.nombreUsuario,
      Correo: usuario.correo,
      Tipo: usuario.tipoUsuario,
      Estado: usuario.estado ? 'Activo' : 'Inactivo',
      'Fecha Creación': new Date(usuario.fechaCreacion).toLocaleDateString()
    }));

    const csvContent = this.convertirACSV(datos);
    this.descargarCSV(csvContent, 'usuarios.csv');
  }

  private convertirACSV(data: any[]): string {
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => 
          `"${String(row[header] || '').replace(/"/g, '""')}"`
        ).join(',')
      )
    ];
    return csvRows.join('\n');
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
}