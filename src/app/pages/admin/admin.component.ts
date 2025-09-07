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

interface AdminState {
  seccionActiva: string;
  usuario: CrearUsuarioDTO;
  usuarioEditando: boolean;
  usuarioEditandoId: number | null;
  terminoBusqueda: string;
  nuevoProducto: CrearProductoDTO;
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
  
  private readonly STORAGE_KEY = 'admin_state';
  
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
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarEstado();
    
    // Guardar estado antes de que la página se cierre/recargue
    window.addEventListener('beforeunload', () => this.guardarEstado());
  }

  // GUARDAR ESTADO EN LOCALSTORAGE
  private guardarEstado(): void {
    const estado: AdminState = {
      seccionActiva: this.seccionActiva,
      usuario: { ...this.usuario },
      usuarioEditando: this.usuarioEditando,
      usuarioEditandoId: this.usuarioEditandoId,
      terminoBusqueda: this.terminoBusqueda,
      nuevoProducto: { ...this.nuevoProducto }
    };

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(estado));
    console.log('Estado guardado:', estado);
  }

  // CARGAR ESTADO DESDE LOCALSTORAGE
  private cargarEstado(): void {
    try {
      const estadoGuardado = localStorage.getItem(this.STORAGE_KEY);
      if (estadoGuardado) {
        const estado: AdminState = JSON.parse(estadoGuardado);
        
        this.seccionActiva = estado.seccionActiva || 'bienvenida';
        this.usuario = estado.usuario || this.getUsuarioDefault();
        this.usuarioEditando = estado.usuarioEditando || false;
        this.usuarioEditandoId = estado.usuarioEditandoId || null;
        this.terminoBusqueda = estado.terminoBusqueda || '';
        this.nuevoProducto = estado.nuevoProducto || this.getProductoDefault();

        console.log('Estado cargado:', estado);
        
        // Si hay una sección activa, cargar los datos correspondientes
        if (this.seccionActiva !== 'bienvenida') {
          setTimeout(() => {
            this.mostrarSeccion(this.seccionActiva);
          }, 100);
        }
      }
    } catch (error) {
      console.error('Error al cargar el estado:', error);
      this.limpiarEstado();
    }
  }

  // OBTENER USUARIO POR DEFECTO
  private getUsuarioDefault(): CrearUsuarioDTO {
    return {
      nombre: '',
      cedula: '',
      correo: '',
      telefono: '',
      nombreUsuario: '',
      contrasena: '',
      tipoUsuario: 'VENDEDOR',
      estado: true
    };
  }

  // OBTENER PRODUCTO POR DEFECTO
  private getProductoDefault(): CrearProductoDTO {
    return {
      id: 0,
      nombre: '',
      codigo: '',
      descripcion: '',
      precio: 0,
      stock: 0,
      categoria: '',
      imagen: ''
    };
  }

  // LIMPIAR ESTADO
  limpiarEstado(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.seccionActiva = 'bienvenida';
    this.usuario = this.getUsuarioDefault();
    this.usuarioEditando = false;
    this.usuarioEditandoId = null;
    this.terminoBusqueda = '';
    this.nuevoProducto = this.getProductoDefault();
  }

  mostrarSeccion(seccion: string) {
    this.seccionActiva = seccion;
    this.guardarEstado();
    
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

  // GUARDAR USUARIO - CORREGIDO
  guardarUsuario() {
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
    
    this.guardarEstado();
  }

  // EDITAR USUARIO - Versión corregida
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
    
    console.log('Estado en formulario:', this.usuario.estado, typeof this.usuario.estado);
    this.guardarEstado();
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

  // LIMPIAR FORMULARIO
  limpiarFormulario() {
    this.usuario = this.getUsuarioDefault();
    this.usuarioEditando = false;
    this.usuarioEditandoId = null;
    
    if (this.formUsuario) {
      this.formUsuario.resetForm();
    }
    
    this.guardarEstado();
  }

  // BOTÓN PARA LIMPIAR TODO EL ESTADO (opcional - puedes agregarlo en el HTML)
  limpiarTodoEstado(): void {
    if (confirm('¿Estás seguro de que deseas limpiar todos los datos y empezar de nuevo?')) {
      this.limpiarEstado();
      this.limpiarFormulario();
      this.seccionActiva = 'bienvenida';
      alert('Estado limpiado correctamente');
    }
  }

  // Resto de métodos existentes...
  cargarProductos() {
    this.guardarEstado();
    // Tu implementación aquí
  }

  cargarProductosReporte() {
    this.guardarEstado();
    // Tu implementación aquí
  }

  cargarOrdenes() {
    this.guardarEstado();
    // Tu implementación aquí
  }

  cargarReportePorVendedor() {
    this.guardarEstado();
    // Tu implementación aquí
  }

  guardarProducto() {
    this.guardarEstado();
    // Tu implementación aquí
  }

  filtrarOrdenes(tipo?: string) {
    this.guardarEstado();
    // Tu implementación aquí
  }

  aplicarFiltroBusqueda() {
    this.guardarEstado();
    // Tu implementación aquí
  }

  editarProducto(producto: ProductoDTO) {
    this.guardarEstado();
    // Tu implementación aquí
  }

  eliminarProducto(producto: ProductoDTO) {
    this.guardarEstado();
    // Tu implementación aquí
  }

  verDetallesProducto(producto: ProductoDTO) {
    this.guardarEstado();
    // Tu implementación aquí
  }

  verDetallesOrden(orden: OrdenVentaDTO) {
    this.guardarEstado();
    // Tu implementación aquí
  }

  actualizarProducto() {
    this.guardarEstado();
    // Tu implementación aquí
  }
}