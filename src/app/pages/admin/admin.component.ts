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
  // Validar que ningún campo esté vacío
  if (this.validarCamposVacios()) {
    return; // Detener la ejecución si hay campos vacíos
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

// Método para validar campos vacíos
validarCamposVacios(): boolean {
  const camposRequeridos = [
    { nombre: 'nombre', valor: this.usuario.nombre, etiqueta: 'Nombre' },
    { nombre: 'cedula', valor: this.usuario.cedula, etiqueta: 'Cédula' },
    { nombre: 'correo', valor: this.usuario.correo, etiqueta: 'Correo electrónico' },
    { nombre: 'telefono', valor: this.usuario.telefono, etiqueta: 'Teléfono' },
    { nombre: 'nombreUsuario', valor: this.usuario.nombreUsuario, etiqueta: 'Nombre de usuario' },
    { nombre: 'contrasena', valor: this.usuario.contrasena, etiqueta: 'Contraseña' }
  ];

  for (const campo of camposRequeridos) {
    if (!campo.valor || campo.valor.trim() === '') {
      alert(`El campo ${campo.etiqueta} es obligatorio.`);
      
      // Enfocar el campo vacío en el formulario
      setTimeout(() => {
        const elemento = document.querySelector(`[name="${campo.nombre}"]`) as HTMLElement;
        if (elemento) {
          elemento.focus();
        }
      }, 100);
      
      return true; // Hay campos vacíos
    }
  }
  
  return false; // Todos los campos están llenos
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