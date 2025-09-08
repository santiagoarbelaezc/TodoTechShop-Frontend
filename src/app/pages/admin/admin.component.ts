import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { UsuarioService } from '../../services/usuario.service';
import { UsuarioDto } from '../../models/usuario.dto';
import { ProductoService } from '../../services/producto.service';
import { ProductoDTO } from '../../models/producto.dto';
import { CrearProductoDTO } from '../../models/crearProducto.dto';
import { OrdenVentaService } from '../../services/orden-venta.service';
import { OrdenVentaDTO } from '../../models/ordenventa.dto';
import { ReporteService } from '../../services/reporte.service';
import { ReporteRendimientoDTO } from '../../models/reporteRendimiento.dto';
import { VendedorService } from '../../services/vendedor.service';
import { DespachadorService } from '../../services/despachador.service';
import { CajeroService } from '../../services/cajero.service';
import { Router } from '@angular/router';
import { ProductoReporteRequest } from '../../models/productoReporteRequest.dto';
import { MensajeDto } from '../../models/mensaje.dto';
import { AuthService } from '../../services/auth.service';

export interface CrearUsuarioDTO {
  nombre: string;
  cedula: string;
  correo: string;
  telefono: string;
  nombreUsuario: string;
  contrasena: string;
  tipoUsuario: 'ADMIN' | 'VENDEDOR' | 'CAJERO' | 'DESPACHADOR';
  estado: boolean;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  @ViewChild('formUsuario') formUsuario!: NgForm;
  
  nombre: string = '';
  correo: string = '';
  telefono: string = '';
  seccionActiva: string = 'bienvenida';

  usuarios: UsuarioDto[] = [];
  productos: ProductoDTO[] = [];
  ordenes: OrdenVentaDTO[] = [];
  reportesPorVendedor: ReporteRendimientoDTO[] = [];
  productosReporte: ProductoReporteRequest[] = [];
  ordenesFiltradas: OrdenVentaDTO[] = [];
  terminoBusqueda: string = '';
  usuarioEditando: boolean = false;
  usuarioEditandoId: number | null = null;

  terminoBusquedaNombre: string = '';
  terminoBusquedaCedula: string = '';
  tipoUsuarioFiltro: string = 'TODOS';
  fechaInicioFiltro: string = '';
  fechaFinFiltro: string = '';
  fechaEspecificaFiltro: string = '';
  tipoFiltroFecha: string = '';


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
    tipoUsuario: 'VENDEDOR',
    estado: true
  };

  nuevoProducto: CrearProductoDTO = {
    id: 0,
    nombre: '',
    codigo: '',
    descripcion: '',
    precio: 0,
    stock: 0,
    categoria: '',
    imagen: ''
  };

  constructor(
    private usuarioService: UsuarioService,
    private productoService: ProductoService,
    private ordenVentaService: OrdenVentaService,
    private reporteService: ReporteService,
    private vendedorService: VendedorService,
    private despachadorService: DespachadorService,
    private cajeroService: CajeroService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Verificar que el usuario sea admin
    const user = this.authService.getCurrentUser();
    if (!user || user.tipoUsuario !== 'ADMIN') {
      this.authService.logout();
      this.router.navigate(['/login']);
      return;
    }
    
    // Cargar datos iniciales si es necesario
    this.nombre = user.nombre;
    this.correo = user.correo;
  }

  mostrarSeccion(seccion: string) {
    this.seccionActiva = seccion;
    
    switch (seccion) {
      case 'usuarios':
        this.cargarUsuarios();
        break;
      case 'productos':
        this.cargarProductos();
        break;
      case 'ordenes':
        this.cargarOrdenes();
        break;
      case 'reportes':
        this.cargarReportePorVendedor();
        break;
    }
  }

  // CARGAR USUARIOS ACTUALES
  cargarUsuarios() {
    this.usuarioService.obtenerUsuarios().subscribe({
      next: (usuarios: UsuarioDto[]) => {
        this.usuarios = usuarios;
        console.log('Usuarios cargados exitosamente:', usuarios);
      },
      error: (error) => {
        console.error('Error completo al cargar usuarios:', error);
        
        if (error.status === 0) {
          alert('Error de conexión: No se pudo conectar al servidor. Verifique que el backend esté ejecutándose.');
        } else if (error.status === 404) {
          alert('Error 404: El endpoint de usuarios no fue encontrado. Verifique la URL del API.');
        } else if (error.error && error.error.mensaje) {
          alert(`Error del servidor: ${error.error.mensaje}`);
        } else {
          alert('Error al cargar usuarios: ' + error.message);
        }
      },
      complete: () => {
        console.log('Carga de usuarios completada');
      }
    });
  }

  // GUARDAR USUARIO
guardarUsuario() {
  // Validar que el formulario es válido antes de proceder
  if (this.formUsuario.invalid) {
    // Marcar todos los campos como touched para mostrar mensajes de error
    Object.keys(this.formUsuario.controls).forEach(key => {
      this.formUsuario.controls[key].markAsTouched();
    });
    alert('Por favor, complete todos los campos obligatorios correctamente.');
    return;
  }

  console.log('Estado del formulario:', this.usuario.estado, typeof this.usuario.estado);
  
  if (this.usuarioEditando && this.usuarioEditandoId) {
    // Actualizar usuario existente
    const usuarioActualizado: UsuarioDto = {
      id: this.usuarioEditandoId,
      nombre: this.usuario.nombre,
      cedula: this.usuario.cedula,
      correo: this.usuario.correo,
      telefono: this.usuario.telefono,
      nombreUsuario: this.usuario.nombreUsuario,
      contrasena: this.usuario.contrasena,
      tipoUsuario: this.usuario.tipoUsuario,
      fechaCreacion: new Date(),
      estado: this.usuario.estado
    };

    console.log('Usuario a actualizar:', usuarioActualizado);

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
  } else {
    // Crear nuevo usuario
    const nuevoUsuario: UsuarioDto = {
      id: 0,
      nombre: this.usuario.nombre,
      cedula: this.usuario.cedula,
      correo: this.usuario.correo,
      telefono: this.usuario.telefono,
      nombreUsuario: this.usuario.nombreUsuario,
      contrasena: this.usuario.contrasena,
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
}

// EDITAR USUARIO
editarUsuario(usuario: UsuarioDto) {
  console.log('Usuario a editar:', usuario);
  console.log('Estado original:', usuario.estado, typeof usuario.estado);
  
  this.usuarioEditando = true;
  this.usuarioEditandoId = usuario.id;
  
  this.usuario = {
    nombre: usuario.nombre,
    cedula: usuario.cedula,
    correo: usuario.correo,
    telefono: usuario.telefono,
    nombreUsuario: usuario.nombreUsuario,
    contrasena: usuario.contrasena,
    tipoUsuario: usuario.tipoUsuario as 'ADMIN' | 'VENDEDOR' | 'CAJERO' | 'DESPACHADOR',
    estado: usuario.estado
  };
  
  // Forzar la validación del formulario después de establecer los valores
  setTimeout(() => {
    if (this.formUsuario) {
      Object.keys(this.formUsuario.controls).forEach(key => {
        this.formUsuario.controls[key].markAsTouched();
      });
    }
  });
}

  // CAMBIAR ESTADO USUARIO
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


  // Método para eliminar usuario
eliminarUsuario(usuario: UsuarioDto) {
  const confirmacion = confirm(`¿Estás seguro de que deseas eliminar permanentemente al usuario ${usuario.nombre}? Esta acción no se puede deshacer.`);
  
  if (confirmacion) {
    this.usuarioService.eliminarUsuario(usuario.id).subscribe({
      next: (response: MensajeDto<string>) => {
        if (!response.error) {
          alert(response.mensaje);
          this.cargarUsuarios(); // Recargar la lista de usuarios
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

  // LIMPIAR FORMULARIO
  limpiarFormulario() {
    this.usuario = {
      nombre: '',
      cedula: '',
      correo: '',
      telefono: '',
      nombreUsuario: '',
      contrasena: '',
      tipoUsuario: 'VENDEDOR',
      estado: true
    };
    this.usuarioEditando = false;
    this.usuarioEditandoId = null;
    
    if (this.formUsuario) {
      this.formUsuario.resetForm();
    }
  }


  // Métodos de búsqueda
buscarPorNombre() {
  if (this.terminoBusquedaNombre.trim()) {
    this.usuarioService.buscarUsuariosPorNombre(this.terminoBusquedaNombre).subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
      },
      error: (error) => {
        console.error('Error al buscar por nombre:', error);
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
      },
      error: (error) => {
        console.error('Error al buscar por cédula:', error);
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
      },
      error: (error) => {
        console.error('Error al filtrar por tipo:', error);
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
      },
      error: (error) => {
        console.error('Error al filtrar por rango de fechas:', error);
        alert('Error al filtrar usuarios por rango de fechas');
      }
    });
  } else if (this.tipoFiltroFecha === 'despues' && this.fechaEspecificaFiltro) {
    const fecha = new Date(this.fechaEspecificaFiltro);
    
    this.usuarioService.obtenerUsuariosCreadosDespuesDe(fecha).subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
      },
      error: (error) => {
        console.error('Error al filtrar por fecha posterior:', error);
        alert('Error al filtrar usuarios por fecha posterior');
      }
    });
  } else if (this.tipoFiltroFecha === 'antes' && this.fechaEspecificaFiltro) {
    const fecha = new Date(this.fechaEspecificaFiltro);
    
    this.usuarioService.obtenerUsuariosCreadosAntesDe(fecha).subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
      },
      error: (error) => {
        console.error('Error al filtrar por fecha anterior:', error);
        alert('Error al filtrar usuarios por fecha anterior');
      }
    });
  } else {
    alert('Por favor, complete los campos de fecha correctamente');
  }
}

// Limpiar todos los filtros
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

  // Resto de métodos existentes...
  cargarProductos() {
    // Tu implementación aquí
  }

  cargarProductosReporte() {
    // Tu implementación aquí
  }

  cargarOrdenes() {
    // Tu implementación aquí
  }

  cargarReportePorVendedor() {
    // Tu implementación aquí
  }

  guardarProducto() {
    // Tu implementación aquí
  }

  filtrarOrdenes(tipo?: string) {
    // Tu implementación aquí
  }

  aplicarFiltroBusqueda() {
    // Tu implementación aquí
  }

  editarProducto(producto: ProductoDTO) {
    // Tu implementación aquí
  }

  eliminarProducto(producto: ProductoDTO) {
    // Tu implementación aquí
  }

  verDetallesProducto(producto: ProductoDTO) {
    // Tu implementación aquí
  }

  verDetallesOrden(orden: OrdenVentaDTO) {
    // Tu implementación aquí
  }

  actualizarProducto() {
    // Tu implementación aquí
  }

  salir() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}