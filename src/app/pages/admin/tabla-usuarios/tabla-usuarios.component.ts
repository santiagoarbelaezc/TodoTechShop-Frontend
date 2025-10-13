import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, HostListener, inject } from '@angular/core';
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
export class TablaUsuariosComponent implements OnInit, OnDestroy {
  private usuarioService = inject(UsuarioService);

  @Input() usuarios: UsuarioDto[] = [];
  @Output() usuarioEditado = new EventEmitter<UsuarioDto>();
  @Output() usuariosCargados = new EventEmitter<UsuarioDto[]>();

  usuariosFiltrados: UsuarioDto[] = [];
  seccionActiva: string = 'usuariosRegistrados';

  // Variables para filtros
  terminoBusquedaNombre: string = '';
  terminoBusquedaCedula: string = '';
  tipoUsuarioFiltro: string = 'TODOS';
  fechaInicioFiltro: string = '';
  fechaFinFiltro: string = '';
  fechaEspecificaFiltro: string = '';
  tipoFiltroFecha: string = '';

  tablaTieneScroll: boolean = false;
  private resizeObserver: ResizeObserver | null = null;

  tiposUsuario = [
    { value: 'TODOS', label: 'Todos los tipos' },
    { value: 'ADMIN', label: 'Administrador' },
    { value: 'VENDEDOR', label: 'Vendedor' },
    { value: 'CAJERO', label: 'Cajero' },
    { value: 'DESPACHADOR', label: 'Despachador' }
  ];

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

      const tablaContainers = document.querySelectorAll('.tabla-container');
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
      
      const container = scrollElement.closest('.tabla-container');
      if (container) {
        if (tieneScroll) {
          container.classList.add('has-scroll');
        } else {
          container.classList.remove('has-scroll');
        }
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
        this.usuariosFiltrados = [...usuarios];
        this.usuariosCargados.emit(usuarios);
        setTimeout(() => this.verificarScrollTabla(), 100);
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
        if (error.status === 0) {
          alert('Error de conexión: No se pudo conectar al servidor. Verifique que el backend esté ejecutándose.');
        } else if (error.status === 404) {
          alert('Error 404: El endpoint de usuarios no fue encontrado. Verifique la URL del API.');
        } else if (error.error && error.error.mensaje) {
          alert(`Error del servidor: ${error.error.mensaje}`);
        } else {
          alert('Error al cargar usuarios: ' + error.message);
        }
      }
    });
  }

  editarUsuario(usuario: UsuarioDto) {
    this.usuarioEditado.emit(usuario);
  }

  cambiarEstadoUsuario(usuario: UsuarioDto) {
    const nuevoEstado = !usuario.estado;
    const confirmacion = confirm(`¿Estás seguro de que deseas ${nuevoEstado ? 'activar' : 'desactivar'} al usuario ${usuario.nombre}?`);
    
    if (confirmacion) {
      this.usuarioService.cambiarEstadoUsuario(usuario.id, nuevoEstado).subscribe({
        next: (response: MensajeDto<string>) => {
          if (!response.error) {
            alert(response.mensaje);
            this.cargarUsuarios();
          } else {
            alert('Error: ' + response.mensaje);
          }
        },
        error: (error) => {
          console.error('Error al cambiar estado del usuario:', error);
          alert('Error al cambiar estado del usuario: ' + error.message);
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
            this.cargarUsuarios();
          } else {
            alert('Error: ' + response.mensaje);
          }
        },
        error: (error) => {
          console.error('Error al eliminar usuario:', error);
          alert('Error al eliminar usuario: ' + error.message);
        }
      });
    }
  }

  buscarPorNombre() {
    if (this.terminoBusquedaNombre.trim()) {
      this.usuarioService.buscarUsuariosPorNombre(this.terminoBusquedaNombre).subscribe({
        next: (usuarios) => {
          this.usuariosFiltrados = usuarios;
          setTimeout(() => this.verificarScrollTabla(), 100);
        },
        error: (error) => {
          console.error('Error en búsqueda por nombre:', error);
          this.usuariosFiltrados = this.usuarios.filter(u => 
            u.nombre.toLowerCase().includes(this.terminoBusquedaNombre.toLowerCase())
          );
        }
      });
    } else {
      this.usuariosFiltrados = [...this.usuarios];
    }
  }

  buscarPorCedula() {
    if (this.terminoBusquedaCedula.trim()) {
      this.usuarioService.buscarUsuariosPorCedula(this.terminoBusquedaCedula).subscribe({
        next: (usuarios) => {
          this.usuariosFiltrados = usuarios;
          setTimeout(() => this.verificarScrollTabla(), 100);
        },
        error: (error) => {
          console.error('Error en búsqueda por cédula:', error);
          this.usuariosFiltrados = this.usuarios.filter(u => 
            u.cedula.includes(this.terminoBusquedaCedula)
          );
        }
      });
    } else {
      this.usuariosFiltrados = [...this.usuarios];
    }
  }

  filtrarPorTipo() {
    if (this.tipoUsuarioFiltro !== 'TODOS') {
      this.usuarioService.obtenerUsuariosPorTipo(this.tipoUsuarioFiltro).subscribe({
        next: (usuarios) => {
          this.usuariosFiltrados = usuarios;
          setTimeout(() => this.verificarScrollTabla(), 100);
        },
        error: (error) => {
          console.error('Error al filtrar por tipo:', error);
          this.usuariosFiltrados = this.usuarios.filter(u => 
            u.tipoUsuario === this.tipoUsuarioFiltro
          );
        }
      });
    } else {
      this.usuariosFiltrados = [...this.usuarios];
    }
  }

  filtrarPorFecha() {
    if (this.tipoFiltroFecha === 'rango' && this.fechaInicioFiltro && this.fechaFinFiltro) {
      const fechaInicio = new Date(this.fechaInicioFiltro);
      const fechaFin = new Date(this.fechaFinFiltro);
      
      this.usuarioService.obtenerUsuariosPorFechaCreacion(fechaInicio, fechaFin).subscribe({
        next: (usuarios) => {
          this.usuariosFiltrados = usuarios;
          setTimeout(() => this.verificarScrollTabla(), 100);
        },
        error: (error) => {
          console.error('Error al filtrar por rango de fechas:', error);
          this.filtrarPorFechaLocal();
        }
      });
    } else if (this.tipoFiltroFecha === 'despues' && this.fechaEspecificaFiltro) {
      const fecha = new Date(this.fechaEspecificaFiltro);
      
      this.usuarioService.obtenerUsuariosCreadosDespuesDe(fecha).subscribe({
        next: (usuarios) => {
          this.usuariosFiltrados = usuarios;
          setTimeout(() => this.verificarScrollTabla(), 100);
        },
        error: (error) => {
          console.error('Error al filtrar por fecha posterior:', error);
          this.filtrarPorFechaLocal();
        }
      });
    } else if (this.tipoFiltroFecha === 'antes' && this.fechaEspecificaFiltro) {
      const fecha = new Date(this.fechaEspecificaFiltro);
      
      this.usuarioService.obtenerUsuariosCreadosAntesDe(fecha).subscribe({
        next: (usuarios) => {
          this.usuariosFiltrados = usuarios;
          setTimeout(() => this.verificarScrollTabla(), 100);
        },
        error: (error) => {
          console.error('Error al filtrar por fecha anterior:', error);
          this.filtrarPorFechaLocal();
        }
      });
    } else {
      alert('Por favor, complete los campos de fecha correctamente');
    }
  }

  private filtrarPorFechaLocal(): void {
    if (this.tipoFiltroFecha === 'rango' && this.fechaInicioFiltro && this.fechaFinFiltro) {
      const fechaInicio = new Date(this.fechaInicioFiltro);
      const fechaFin = new Date(this.fechaFinFiltro);
      
      this.usuariosFiltrados = this.usuarios.filter(u => {
        const fechaCreacion = new Date(u.fechaCreacion);
        return fechaCreacion >= fechaInicio && fechaCreacion <= fechaFin;
      });
    } else if (this.tipoFiltroFecha === 'despues' && this.fechaEspecificaFiltro) {
      const fecha = new Date(this.fechaEspecificaFiltro);
      this.usuariosFiltrados = this.usuarios.filter(u => new Date(u.fechaCreacion) >= fecha);
    } else if (this.tipoFiltroFecha === 'antes' && this.fechaEspecificaFiltro) {
      const fecha = new Date(this.fechaEspecificaFiltro);
      this.usuariosFiltrados = this.usuarios.filter(u => new Date(u.fechaCreacion) <= fecha);
    }
  }

  limpiarFiltros() {
    this.terminoBusquedaNombre = '';
    this.terminoBusquedaCedula = '';
    this.tipoUsuarioFiltro = 'TODOS';
    this.fechaInicioFiltro = '';
    this.fechaFinFiltro = '';
    this.fechaEspecificaFiltro = '';
    this.tipoFiltroFecha = '';
    this.usuariosFiltrados = [...this.usuarios];
  }
}