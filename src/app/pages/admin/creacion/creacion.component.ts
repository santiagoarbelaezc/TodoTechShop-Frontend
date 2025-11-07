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
  showPasswordRequirements: boolean = false;

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
  estadoFiltro: string = 'TODOS';
  fechaInicioFiltro: string = '';
  fechaFinFiltro: string = '';
  fechaEspecificaFiltro: string = '';
  tipoFiltroFecha: string = '';

  // Para manejo de contraseña
  private contrasenaOriginal: string = '';

  // Validación de contraseña
  passwordRequirements = {
    minLength: false,
    hasUpperCase: false,
    hasSpecialChar: false
  };

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
      cambiarContrasena: true,
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

  // ===== MÉTODOS CORREGIDOS PARA VALIDACIÓN DE CONTRASEÑA =====

  // Validación de contraseña
  validatePassword(): boolean {
    const password = this.usuario.contrasena || '';
    
    // Actualizar los requisitos para mostrar en la UI
    this.updatePasswordRequirements(password);
    
    // Verificar que cumpla todos los requisitos
    return this.passwordRequirements.minLength && 
           this.passwordRequirements.hasUpperCase && 
           this.passwordRequirements.hasSpecialChar;
  }

  // Método para actualizar los requisitos de la contraseña - CORREGIDO
  private updatePasswordRequirements(password: string | undefined): void {
    // Asegurarse de que password siempre sea un string
    const safePassword = password || '';
    
    this.passwordRequirements = {
      minLength: safePassword.length >= 8,
      hasUpperCase: /[A-Z]/.test(safePassword),
      hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(safePassword)
    };
  }

  // Método para obtener el mensaje de validación de contraseña
  getPasswordValidationMessage(): string {
    const req = this.passwordRequirements;
    const messages = [];
    
    if (!req.minLength) messages.push('mínimo 8 caracteres');
    if (!req.hasUpperCase) messages.push('una mayúscula');
    if (!req.hasSpecialChar) messages.push('un carácter especial');
    
    return messages.join(', ');
  }

  // Método para determinar la fortaleza de la contraseña - CORREGIDO
  getPasswordStrength(): string {
    const password = this.usuario.contrasena || '';
    if (!password || password.length === 0) return '';
    
    const requirements = this.passwordRequirements;
    const metRequirements = Object.values(requirements).filter(Boolean).length;
    
    if (password.length < 4) return 'weak';
    if (metRequirements === 3) return 'strong';
    if (metRequirements >= 2 || password.length >= 10) return 'medium';
    return 'weak';
  }

  // Validación del formulario completo - CORREGIDO
  isFormValid(): boolean {
    // Validaciones básicas del formulario
    const basicValid = !!this.usuario.nombre?.trim() && 
                      !!this.usuario.cedula?.trim() && 
                      !!this.usuario.correo?.trim() && 
                      !!this.usuario.telefono?.trim() && 
                      !!this.usuario.nombreUsuario?.trim() && 
                      !!this.usuario.tipoUsuario;

    // Validación de contraseña
    let passwordValid = true;
    if (!this.usuarioEditando || this.usuario.cambiarContrasena) {
      passwordValid = this.validatePassword() && !!this.usuario.contrasena?.trim();
    }

    return basicValid && passwordValid;
  }

  // Operaciones CRUD
  guardarUsuario(): void {
    if (!this.isFormValid()) {
      alert('Por favor, complete todos los campos requeridos correctamente.');
      return;
    }

    if (this.usuarioEditando && this.usuarioEditandoId) {
      this.actualizarUsuario();
    } else {
      this.crearUsuario();
    }
  }

  crearUsuario(): void {
    // Validar contraseña antes de crear
    if (!this.validatePassword()) {
      alert('La contraseña no cumple con los requisitos de seguridad. Debe tener al menos 8 caracteres, una mayúscula y un carácter especial.');
      return;
    }

    const nuevoUsuario: UsuarioDto = {
      id: 0,
      nombre: this.usuario.nombre.trim(),
      cedula: this.usuario.cedula.trim(),
      correo: this.usuario.correo.trim(),
      telefono: this.usuario.telefono.trim(),
      nombreUsuario: this.usuario.nombreUsuario.trim(),
      contrasena: this.usuario.contrasena || '',
      cambiarContrasena: this.usuario.cambiarContrasena,
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
        alert('Error al crear usuario: ' + (error.error?.mensaje || error.message));
      }
    });
  }

  actualizarUsuario(): void {
    if (!this.usuarioEditandoId) return;

    // Validar contraseña si se está cambiando
    if (this.usuario.cambiarContrasena && !this.validatePassword()) {
      alert('La nueva contraseña no cumple con los requisitos de seguridad. Debe tener al menos 8 caracteres, una mayúscula y un carácter especial.');
      return;
    }

    const usuarioActualizado: UsuarioDto = {
      id: this.usuarioEditandoId,
      nombre: this.usuario.nombre.trim(),
      cedula: this.usuario.cedula.trim(),
      correo: this.usuario.correo.trim(),
      telefono: this.usuario.telefono.trim(),
      nombreUsuario: this.usuario.nombreUsuario.trim(),
      contrasena: this.usuario.cambiarContrasena ? (this.usuario.contrasena || '') : this.contrasenaOriginal,
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
        alert('Error al actualizar usuario: ' + (error.error?.mensaje || error.message));
      }
    });
  }

  // Método editarUsuario CORREGIDO
  editarUsuario(usuario: UsuarioDto): void {
    this.usuarioEditando = true;
    this.usuarioEditandoId = usuario.id;
    this.contrasenaOriginal = usuario.contrasena || '';
    
    this.usuario = {
      nombre: usuario.nombre,
      cedula: usuario.cedula,
      correo: usuario.correo,
      telefono: usuario.telefono,
      nombreUsuario: usuario.nombreUsuario,
      contrasena: usuario.contrasena || '', // Asegurar que nunca sea undefined
      cambiarContrasena: usuario.cambiarContrasena || false,
      tipoUsuario: usuario.tipoUsuario as 'ADMIN' | 'VENDEDOR' | 'CAJERO' | 'DESPACHADOR',
      estado: usuario.estado
    };

    // Actualizar requisitos de contraseña con valor seguro
    this.updatePasswordRequirements(this.usuario.contrasena);
    
    // Scroll al formulario
    setTimeout(() => {
      document.querySelector('.form-container')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
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
        alert('Error al cambiar estado del usuario: ' + (error.error?.mensaje || error.message));
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
        alert('Error al eliminar usuario: ' + (error.error?.mensaje || error.message));
      }
    });
  }

  limpiarFormulario(): void {
    this.usuario = this.inicializarUsuario();
    this.usuarioEditando = false;
    this.usuarioEditandoId = null;
    this.contrasenaOriginal = '';
    this.showPasswordRequirements = false;
    this.updatePasswordRequirements('');
  }

  // ===== MANEJO MEJORADO DE CONTRASEÑA =====

  // Manejo de cambio del interruptor de contraseña - CORREGIDO
  onCambiarContrasenaChange(): void {
    if (!this.usuario.cambiarContrasena && this.usuarioEditando) {
      // Si se desactiva el cambio de contraseña, restaurar la contraseña original
      this.usuario.contrasena = this.contrasenaOriginal;
    } else if (!this.usuario.cambiarContrasena) {
      // Si es nuevo usuario y se desactiva (no debería pasar), limpiar contraseña
      this.usuario.contrasena = '';
    }
    
    // Actualizar requisitos visuales con valor seguro
    this.updatePasswordRequirements(this.usuario.contrasena);
    
    // Ocultar requisitos si se desactiva el cambio
    if (!this.usuario.cambiarContrasena) {
      this.showPasswordRequirements = false;
    }
  }

  // Eventos de contraseña mejorados - CORREGIDOS
  onPasswordInputChange(): void {
    this.updatePasswordRequirements(this.usuario.contrasena);
  }

  onPasswordFocus(): void {
    if (this.usuario.cambiarContrasena && this.usuario.contrasena) {
      this.showPasswordRequirements = true;
    }
  }

  onPasswordBlur(): void {
    // Pequeño delay para permitir hacer clic en los requisitos si es necesario
    setTimeout(() => {
      this.showPasswordRequirements = false;
    }, 300);
  }

  // Método auxiliar para ver si se debe mostrar la validación de contraseña
  shouldShowPasswordValidation(): boolean {
    return this.usuario.cambiarContrasena && 
           (!!this.usuario.contrasena || this.showPasswordRequirements);
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