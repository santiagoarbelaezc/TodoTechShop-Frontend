import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy, HostListener } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { UsuarioService } from '../../services/usuario.service';
import { UsuarioDto } from '../../models/usuario/usuario.dto';
import { Router } from '@angular/router';
import { MensajeDto } from '../../models/mensaje.dto';
import { AuthService } from '../../services/auth.service';
import { NavbarComponent } from './navbar/navbar.component';

export interface CrearUsuarioDTO {
  nombre: string;
  cedula: string;
  correo: string;
  telefono: string;
  nombreUsuario: string;
  contrasena: string;
  cambiarContrasena: boolean;
  tipoUsuario: 'ADMIN' | 'VENDEDOR' | 'CAJERO' | 'DESPACHADOR';
  estado: boolean;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('formUsuario') formUsuario!: NgForm;

  seccionActiva: string = 'bienvenida';

  usuarios: UsuarioDto[] = [];

  usuarioEditando: boolean = false;
  usuarioEditandoId: number | null = null;

  terminoBusquedaNombre: string = '';
  terminoBusquedaCedula: string = '';
  tipoUsuarioFiltro: string = 'TODOS';
  fechaInicioFiltro: string = '';
  fechaFinFiltro: string = '';
  fechaEspecificaFiltro: string = '';
  tipoFiltroFecha: string = '';

  private contrasenaOriginal: string = '';

  tablaTieneScroll: boolean = false;
  private resizeObserver: ResizeObserver | null = null;

  tiposUsuario = [
    { value: 'TODOS', label: 'Todos los tipos' },
    { value: 'ADMIN', label: 'Administrador' },
    { value: 'VENDEDOR', label: 'Vendedor' },
    { value: 'CAJERO', label: 'Cajero' },
    { value: 'DESPACHADOR', label: 'Despachador' }
  ];

  usuario: CrearUsuarioDTO = {
    nombre: '',
    cedula: '',
    correo: '',
    telefono: '',
    nombreUsuario: '',
    contrasena: '',
    cambiarContrasena: false,
    tipoUsuario: 'VENDEDOR',
    estado: true
  };

  constructor(
    private usuarioService: UsuarioService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    
    if (!user || user.role !== 'ADMIN') {
      this.router.navigate(['/login']);
      return;
    }

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
    const tablaScrollElements = document.querySelectorAll('.tabla-scroll, .tabla-scroll2');
    
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

  mostrarSeccion(seccion: string) {
    this.seccionActiva = seccion;
    
    if (seccion === 'usuarios' || seccion === 'usuariosRegistrados') {
      this.cargarUsuarios();
    }
    
    setTimeout(() => this.verificarScrollTabla(), 300);
  }

  cargarUsuarios() {
    this.usuarioService.obtenerUsuarios().subscribe({
      next: (usuarios: UsuarioDto[]) => {
        this.usuarios = usuarios;
        setTimeout(() => this.verificarScrollTabla(), 100);
      },
      error: (error) => {
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

  guardarUsuario() {
    if (this.formUsuario.invalid) {
      Object.keys(this.formUsuario.controls).forEach(key => {
        this.formUsuario.controls[key].markAsTouched();
      });
      alert('Por favor, complete todos los campos obligatorios correctamente.');
      return;
    }
    
    const contrasenaAEnviar = this.usuario.contrasena || '';
    
    if (this.usuarioEditando && this.usuarioEditandoId) {
      // Para edición: usar la lógica normal
      const usuarioActualizado: UsuarioDto = {
        id: this.usuarioEditandoId,
        nombre: this.usuario.nombre,
        cedula: this.usuario.cedula,
        correo: this.usuario.correo,
        telefono: this.usuario.telefono,
        nombreUsuario: this.usuario.nombreUsuario,
        contrasena: contrasenaAEnviar,
        cambiarContrasena: this.usuario.cambiarContrasena,
        tipoUsuario: this.usuario.tipoUsuario,
        fechaCreacion: new Date(),
        estado: this.usuario.estado
      };

      this.usuarioService.actualizarUsuarioAdmin(this.usuarioEditandoId, usuarioActualizado).subscribe({
        next: (response: MensajeDto<string>) => {
          if (!response.error) {
            alert(response.mensaje);
            this.limpiarFormulario();
            this.cargarUsuarios();
          } else {
            alert('Error: ' + response.mensaje);
          }
        },
        error: (error) => {
          alert('Error al actualizar usuario: ' + error.message);
        }
      });
    } else {
      // Para CREACIÓN: Forzar cambiarContrasena a true para que el backend acepte la contraseña
      const nuevoUsuario: UsuarioDto = {
        id: 0,
        nombre: this.usuario.nombre,
        cedula: this.usuario.cedula,
        correo: this.usuario.correo,
        telefono: this.usuario.telefono,
        nombreUsuario: this.usuario.nombreUsuario,
        contrasena: contrasenaAEnviar,
        cambiarContrasena: true, // ¡IMPORTANTE! Forzar a true para creación
        tipoUsuario: this.usuario.tipoUsuario,
        fechaCreacion: new Date(),
        estado: this.usuario.estado
      };

      this.usuarioService.crearUsuario(nuevoUsuario).subscribe({
        next: (response: MensajeDto<string>) => {
          if (!response.error) {
            alert(response.mensaje);
            this.limpiarFormulario();
            this.cargarUsuarios();
          } else {
            alert('Error: ' + response.mensaje);
          }
        },
        error: (error) => {
          alert('Error al crear usuario: ' + error.message);
        }
      });
    }
  }

  editarUsuario(usuario: UsuarioDto) {
    this.usuarioEditando = true;
    this.usuarioEditandoId = usuario.id;
    this.contrasenaOriginal = usuario.contrasena;
    
    this.usuario = {
      nombre: usuario.nombre,
      cedula: usuario.cedula,
      correo: usuario.correo,
      telefono: usuario.telefono,
      nombreUsuario: usuario.nombreUsuario,
      contrasena: usuario.contrasena,
      cambiarContrasena: usuario.cambiarContrasena || false,
      tipoUsuario: usuario.tipoUsuario as 'ADMIN' | 'VENDEDOR' | 'CAJERO' | 'DESPACHADOR',
      estado: usuario.estado
    };
    
    setTimeout(() => {
      if (this.formUsuario) {
        Object.keys(this.formUsuario.controls).forEach(key => {
          this.formUsuario.controls[key].markAsTouched();
        });
      }
    });
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
          alert('Error al eliminar usuario: ' + error.message);
        }
      });
    }
  }

  limpiarFormulario() {
    this.usuario = {
      nombre: '',
      cedula: '',
      correo: '',
      telefono: '',
      nombreUsuario: '',
      contrasena: '',
      cambiarContrasena: false,
      tipoUsuario: 'VENDEDOR',
      estado: true
    };
    this.usuarioEditando = false;
    this.usuarioEditandoId = null;
    this.contrasenaOriginal = '';
    
    if (this.formUsuario) {
      this.formUsuario.resetForm();
    }
  }

  buscarPorNombre() {
    if (this.terminoBusquedaNombre.trim()) {
      this.usuarioService.buscarUsuariosPorNombre(this.terminoBusquedaNombre).subscribe({
        next: (usuarios) => {
          this.usuarios = usuarios;
          setTimeout(() => this.verificarScrollTabla(), 100);
        },
        error: (error) => {
          alert('Error al buscar usuarios por nombre');
        }
      });
    } else {
      this.cargarUsuarios();
    }
  }

  buscarPorCedula() {
    if (this.terminoBusquedaCedula.trim()) {
      this.usuarioService.buscarUsuariosPorCedula(this.terminoBusquedaCedula).subscribe({
        next: (usuarios) => {
          this.usuarios = usuarios;
          setTimeout(() => this.verificarScrollTabla(), 100);
        },
        error: (error) => {
          alert('Error al buscar usuarios por cédula');
        }
      });
    } else {
      this.cargarUsuarios();
    }
  }

  filtrarPorTipo() {
    if (this.tipoUsuarioFiltro !== 'TODOS') {
      this.usuarioService.obtenerUsuariosPorTipo(this.tipoUsuarioFiltro).subscribe({
        next: (usuarios) => {
          this.usuarios = usuarios;
          setTimeout(() => this.verificarScrollTabla(), 100);
        },
        error: (error) => {
          alert('Error al filtrar usuarios por tipo');
        }
      });
    } else {
      this.cargarUsuarios();
    }
  }

  filtrarPorFecha() {
    if (this.tipoFiltroFecha === 'rango' && this.fechaInicioFiltro && this.fechaFinFiltro) {
      const fechaInicio = new Date(this.fechaInicioFiltro);
      const fechaFin = new Date(this.fechaFinFiltro);
      
      this.usuarioService.obtenerUsuariosPorFechaCreacion(fechaInicio, fechaFin).subscribe({
        next: (usuarios) => {
          this.usuarios = usuarios;
          setTimeout(() => this.verificarScrollTabla(), 100);
        },
        error: (error) => {
          alert('Error al filtrar usuarios por rango de fechas');
        }
      });
    } else if (this.tipoFiltroFecha === 'despues' && this.fechaEspecificaFiltro) {
      const fecha = new Date(this.fechaEspecificaFiltro);
      
      this.usuarioService.obtenerUsuariosCreadosDespuesDe(fecha).subscribe({
        next: (usuarios) => {
          this.usuarios = usuarios;
          setTimeout(() => this.verificarScrollTabla(), 100);
        },
        error: (error) => {
          alert('Error al filtrar usuarios por fecha posterior');
        }
      });
    } else if (this.tipoFiltroFecha === 'antes' && this.fechaEspecificaFiltro) {
      const fecha = new Date(this.fechaEspecificaFiltro);
      
      this.usuarioService.obtenerUsuariosCreadosAntesDe(fecha).subscribe({
        next: (usuarios) => {
          this.usuarios = usuarios;
          setTimeout(() => this.verificarScrollTabla(), 100);
        },
        error: (error) => {
          alert('Error al filtrar usuarios por fecha anterior');
        }
      });
    } else {
      alert('Por favor, complete los campos de fecha correctamente');
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
    this.cargarUsuarios();
  }

  onCambiarContrasenaChange() {
    if (!this.usuario.cambiarContrasena && this.usuarioEditando) {
      this.usuario.contrasena = this.contrasenaOriginal;
    } else if (!this.usuario.cambiarContrasena) {
      this.usuario.contrasena = '';
    }
    
    if (this.formUsuario && this.formUsuario.controls['contrasena']) {
      this.formUsuario.controls['contrasena'].markAsUntouched();
      this.formUsuario.controls['contrasena'].markAsPristine();
    }
    
    setTimeout(() => {
      if (this.formUsuario) {
        this.formUsuario.form.updateValueAndValidity();
      }
    });
  }

  salir() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}