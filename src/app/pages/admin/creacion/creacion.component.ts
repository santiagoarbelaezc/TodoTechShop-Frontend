import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { UsuarioService } from '../../../services/usuario.service';
import { UsuarioDto } from '../../../models/usuario/usuario.dto';
import { MensajeDto } from '../../../models/mensaje.dto';
import { NavbarComponent } from '../navbar/navbar.component';
import { CrearUsuarioDTO } from '../admin.component';

@Component({
  selector: 'app-creacion',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './creacion.component.html',
  styleUrls: ['./creacion.component.css']
})
export class CreacionComponent implements OnInit {
  private usuarioService = inject(UsuarioService);

  // Variables de estado
  seccionActiva: string = 'usuarios';
  usuarioEditando: boolean = false;
  usuarioEditandoId: number | null = null;

  // Modelo de usuario
  usuario: CrearUsuarioDTO = this.inicializarUsuario();

  // Listas
  usuarios: UsuarioDto[] = [];
  usuariosFiltrados: UsuarioDto[] = [];
  
  // Tipos de usuario disponibles
  tiposUsuario = [
    { value: 'ADMIN', label: 'ADMINISTRADOR' },
    { value: 'VENDEDOR', label: 'VENDEDOR' },
    { value: 'CAJERO', label: 'CAJERO' },
    { value: 'DESPACHADOR', label: 'DESPACHADOR' }
  ];

  // Filtros
  terminoBusquedaNombre: string = '';
  terminoBusquedaCedula: string = '';
  tipoUsuarioFiltro: string = 'TODOS';
  estadoFiltro: string = 'TODOS'; // Nuevo filtro por estado
  fechaInicioFiltro: string = '';
  fechaFinFiltro: string = '';
  fechaEspecificaFiltro: string = '';
  tipoFiltroFecha: string = '';

  // Para manejo de contraseña
  private contrasenaOriginal: string = '';

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  // Inicialización
  private inicializarUsuario(): CrearUsuarioDTO {
    return {
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
  }

  // Navegación
  mostrarSeccion(seccion: string): void {
    this.seccionActiva = seccion;
    if (seccion === 'usuarios') {
      this.cargarUsuarios();
    }
  }

  // Carga de datos
  cargarUsuarios(): void {
    this.usuarioService.obtenerUsuarios().subscribe({
      next: (usuarios: UsuarioDto[]) => {
        this.usuarios = usuarios;
        this.usuariosFiltrados = [...usuarios];
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

  // Métodos para estadísticas
  getUsuariosActivos(): number {
    return this.usuarios.filter(u => u.estado).length;
  }

  getUsuariosAdministradores(): number {
    return this.usuarios.filter(u => u.tipoUsuario === 'ADMIN').length;
  }

  getUsuariosVendedores(): number {
    return this.usuarios.filter(u => u.tipoUsuario === 'VENDEDOR').length;
  }

  // Método para recargar usuarios
  recargarUsuarios(): void {
    this.cargarUsuarios();
  }

  // Método para obtener texto del tipo de usuario
  getTipoUsuarioTexto(tipoUsuario: string): string {
    const tipo = this.tiposUsuario.find(t => t.value === tipoUsuario);
    return tipo ? tipo.label : tipoUsuario;
  }

  // Operaciones CRUD
  guardarUsuario(): void {
    if (this.usuarioEditando && this.usuarioEditandoId) {
      this.actualizarUsuario();
    } else {
      this.crearUsuario();
    }
  }

  crearUsuario(): void {
    const nuevoUsuario: UsuarioDto = {
      id: 0,
      nombre: this.usuario.nombre,
      cedula: this.usuario.cedula,
      correo: this.usuario.correo,
      telefono: this.usuario.telefono,
      nombreUsuario: this.usuario.nombreUsuario,
      contrasena: this.usuario.contrasena,
      cambiarContrasena: true, // Forzar a true para creación
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
        console.error('Error al crear usuario:', error);
        alert('Error al crear usuario: ' + error.message);
      }
    });
  }

  actualizarUsuario(): void {
    if (!this.usuarioEditandoId) return;

    const usuarioActualizado: UsuarioDto = {
      id: this.usuarioEditandoId,
      nombre: this.usuario.nombre,
      cedula: this.usuario.cedula,
      correo: this.usuario.correo,
      telefono: this.usuario.telefono,
      nombreUsuario: this.usuario.nombreUsuario,
      contrasena: this.usuario.contrasena,
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
        console.error('Error al actualizar usuario:', error);
        alert('Error al actualizar usuario: ' + error.message);
      }
    });
  }

  editarUsuario(usuario: UsuarioDto): void {
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
    
    // Scroll al formulario
    document.querySelector('.form-container')?.scrollIntoView({ behavior: 'smooth' });
  }

  cambiarEstadoUsuario(usuario: UsuarioDto): void {
    const nuevoEstado = !usuario.estado;
    const confirmacion = confirm(
      `¿Estás seguro de que deseas ${nuevoEstado ? 'activar' : 'desactivar'} al usuario ${usuario.nombre}?`
    );

    if (!confirmacion) return;

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

  eliminarUsuario(usuario: UsuarioDto): void {
    const confirmacion = confirm(
      `¿Estás seguro de que deseas eliminar permanentemente al usuario ${usuario.nombre}? Esta acción no se puede deshacer.`
    );

    if (!confirmacion) return;

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

  limpiarFormulario(): void {
    this.usuario = this.inicializarUsuario();
    this.usuarioEditando = false;
    this.usuarioEditandoId = null;
    this.contrasenaOriginal = '';
  }

  // Manejo de contraseña
  onCambiarContrasenaChange(): void {
    if (!this.usuario.cambiarContrasena && this.usuarioEditando) {
      this.usuario.contrasena = this.contrasenaOriginal;
    } else if (!this.usuario.cambiarContrasena) {
      this.usuario.contrasena = '';
    }
  }

  // Manejo de cambio de tipo de fecha
  onTipoFechaChange(): void {
    // Limpiar fechas anteriores cuando cambia el tipo
    this.fechaInicioFiltro = '';
    this.fechaFinFiltro = '';
    this.fechaEspecificaFiltro = '';
  }

  // Búsquedas y filtros
  buscarPorNombre(): void {
    if (!this.terminoBusquedaNombre.trim()) {
      this.usuariosFiltrados = [...this.usuarios];
      return;
    }

    this.usuarioService.buscarUsuariosPorNombre(this.terminoBusquedaNombre).subscribe({
      next: (usuarios) => {
        this.usuariosFiltrados = usuarios;
      },
      error: (error) => {
        console.error('Error en búsqueda por nombre:', error);
        this.usuariosFiltrados = this.usuarios.filter(u => 
          u.nombre.toLowerCase().includes(this.terminoBusquedaNombre.toLowerCase())
        );
      }
    });
  }

  buscarPorCedula(): void {
    if (!this.terminoBusquedaCedula.trim()) {
      this.usuariosFiltrados = [...this.usuarios];
      return;
    }

    this.usuarioService.buscarUsuariosPorCedula(this.terminoBusquedaCedula).subscribe({
      next: (usuarios) => {
        this.usuariosFiltrados = usuarios;
      },
      error: (error) => {
        console.error('Error en búsqueda por cédula:', error);
        this.usuariosFiltrados = this.usuarios.filter(u => 
          u.cedula.includes(this.terminoBusquedaCedula)
        );
      }
    });
  }

  filtrarPorTipo(): void {
    if (this.tipoUsuarioFiltro === 'TODOS') {
      this.usuariosFiltrados = [...this.usuarios];
      return;
    }

    this.usuarioService.obtenerUsuariosPorTipo(this.tipoUsuarioFiltro).subscribe({
      next: (usuarios) => {
        this.usuariosFiltrados = usuarios;
      },
      error: (error) => {
        console.error('Error al filtrar por tipo:', error);
        this.usuariosFiltrados = this.usuarios.filter(u => 
          u.tipoUsuario === this.tipoUsuarioFiltro
        );
      }
    });
  }

  filtrarPorEstado(): void {
  if (this.estadoFiltro === 'TODOS') {
    this.usuariosFiltrados = [...this.usuarios];
    return;
  }

  const estado = this.estadoFiltro === 'true';
  
  if (estado) {
    // Usar obtenerUsuariosActivos para estado true
    this.usuarioService.obtenerUsuariosActivos().subscribe({
      next: (usuarios: UsuarioDto[]) => {
        this.usuariosFiltrados = usuarios;
      },
      error: (error: any) => {
        console.error('Error al filtrar por estado activo:', error);
        this.usuariosFiltrados = this.usuarios.filter(u => u.estado === estado);
      }
    });
  } else {
    // Usar obtenerUsuariosInactivos para estado false
    this.usuarioService.obtenerUsuariosInactivos().subscribe({
      next: (usuarios: UsuarioDto[]) => {
        this.usuariosFiltrados = usuarios;
      },
      error: (error: any) => {
        console.error('Error al filtrar por estado inactivo:', error);
        this.usuariosFiltrados = this.usuarios.filter(u => u.estado === estado);
      }
    });
  }
}

  filtrarPorFecha(): void {
    if (this.tipoFiltroFecha === 'rango' && this.fechaInicioFiltro && this.fechaFinFiltro) {
      const fechaInicio = new Date(this.fechaInicioFiltro);
      const fechaFin = new Date(this.fechaFinFiltro);
      
      this.usuarioService.obtenerUsuariosPorFechaCreacion(fechaInicio, fechaFin).subscribe({
        next: (usuarios) => {
          this.usuariosFiltrados = usuarios;
        },
        error: (error) => {
          console.error('Error al filtrar por rango de fechas:', error);
          this.filtrarPorFechaLocal();
        }
      });
    } else if ((this.tipoFiltroFecha === 'despues' || this.tipoFiltroFecha === 'antes') && this.fechaEspecificaFiltro) {
      const fecha = new Date(this.fechaEspecificaFiltro);
      
      if (this.tipoFiltroFecha === 'despues') {
        this.usuarioService.obtenerUsuariosCreadosDespuesDe(fecha).subscribe({
          next: (usuarios) => {
            this.usuariosFiltrados = usuarios;
          },
          error: (error) => {
            console.error('Error al filtrar por fecha posterior:', error);
            this.filtrarPorFechaLocal();
          }
        });
      } else {
        this.usuarioService.obtenerUsuariosCreadosAntesDe(fecha).subscribe({
          next: (usuarios) => {
            this.usuariosFiltrados = usuarios;
          },
          error: (error) => {
            console.error('Error al filtrar por fecha anterior:', error);
            this.filtrarPorFechaLocal();
          }
        });
      }
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

  // Método para aplicar múltiples filtros simultáneamente
  aplicarFiltrosCombinados(): void {
    let usuariosFiltrados = [...this.usuarios];

    // Filtrar por nombre
    if (this.terminoBusquedaNombre.trim()) {
      usuariosFiltrados = usuariosFiltrados.filter(u => 
        u.nombre.toLowerCase().includes(this.terminoBusquedaNombre.toLowerCase())
      );
    }

    // Filtrar por cédula
    if (this.terminoBusquedaCedula.trim()) {
      usuariosFiltrados = usuariosFiltrados.filter(u => 
        u.cedula.includes(this.terminoBusquedaCedula)
      );
    }

    // Filtrar por tipo de usuario
    if (this.tipoUsuarioFiltro !== 'TODOS') {
      usuariosFiltrados = usuariosFiltrados.filter(u => 
        u.tipoUsuario === this.tipoUsuarioFiltro
      );
    }

    // Filtrar por estado
    if (this.estadoFiltro !== 'TODOS') {
      const estado = this.estadoFiltro === 'true';
      usuariosFiltrados = usuariosFiltrados.filter(u => u.estado === estado);
    }

    // Filtrar por fecha
    if (this.tipoFiltroFecha) {
      if (this.tipoFiltroFecha === 'rango' && this.fechaInicioFiltro && this.fechaFinFiltro) {
        const fechaInicio = new Date(this.fechaInicioFiltro);
        const fechaFin = new Date(this.fechaFinFiltro);
        usuariosFiltrados = usuariosFiltrados.filter(u => {
          const fechaCreacion = new Date(u.fechaCreacion);
          return fechaCreacion >= fechaInicio && fechaCreacion <= fechaFin;
        });
      } else if (this.tipoFiltroFecha === 'despues' && this.fechaEspecificaFiltro) {
        const fecha = new Date(this.fechaEspecificaFiltro);
        usuariosFiltrados = usuariosFiltrados.filter(u => new Date(u.fechaCreacion) >= fecha);
      } else if (this.tipoFiltroFecha === 'antes' && this.fechaEspecificaFiltro) {
        const fecha = new Date(this.fechaEspecificaFiltro);
        usuariosFiltrados = usuariosFiltrados.filter(u => new Date(u.fechaCreacion) <= fecha);
      }
    }

    this.usuariosFiltrados = usuariosFiltrados;
  }

  limpiarFiltros(): void {
    this.terminoBusquedaNombre = '';
    this.terminoBusquedaCedula = '';
    this.tipoUsuarioFiltro = 'TODOS';
    this.estadoFiltro = 'TODOS';
    this.fechaInicioFiltro = '';
    this.fechaFinFiltro = '';
    this.fechaEspecificaFiltro = '';
    this.tipoFiltroFecha = '';
    this.usuariosFiltrados = [...this.usuarios];
  }

  // Método para formatear fecha (opcional)
  formatearFecha(fecha: Date): string {
    return new Date(fecha).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}