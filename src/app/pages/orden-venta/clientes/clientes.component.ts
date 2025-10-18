import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { NavbarOrdenComponent } from '../navbar-orden/navbar-orden.component';
import { ClienteDto } from '../../../models/cliente.dto';
import { ClienteService } from '../../../services/cliente.service';
import { MensajeDto } from '../../../models/mensaje.dto';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { CreateOrdenDto } from '../../../models/orden-venta/ordenventa.dto';
import { OrdenVentaService } from '../../../services/orden-venta.service';
import { UsuarioService } from '../../../services/usuario.service';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarOrdenComponent],
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.css']
})
export class ClientesComponent implements OnInit {
  // Lista completa de clientes
  clientes: ClienteDto[] = [];
  
  // Cliente seleccionado para edición
  clienteSeleccionado: ClienteDto | null = null;

  // Filtros y búsqueda
  filtroTexto: string = '';
  filtroTipo: string = 'TODOS';

  // Estados de UI
  cargando: boolean = false;
  mostrarFormularioEdicion: boolean = false;
  mostrarConfirmacionContinuar: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  // Lista filtrada de clientes
  clientesFiltrados: ClienteDto[] = [];

  // Estadísticas
  totalNaturales: number = 0;
  totalJuridicos: number = 0;
  totalClientes: number = 0;

  constructor(
    private router: Router,
    private clienteService: ClienteService,
    private ordenVentaService: OrdenVentaService,
    private usuarioService: UsuarioService // ✅ Inyectar el servicio de usuario
  ) {}

  ngOnInit(): void {
    this.cargarClientes();
  }

  cargarClientes(): void {
    this.cargando = true;
    this.errorMessage = '';
    
    // Usar el nuevo método para obtener todos los clientes
    this.clienteService.obtenerTodosLosClientes()
      .pipe(
        catchError((error) => {
          console.error('Error al cargar clientes:', error);
          this.errorMessage = 'Error al cargar los clientes. Por favor, intente nuevamente.';
          // Para MensajeDto<ClienteDto[]>, data debe ser un array
          return of({ error: true, mensaje: 'Error al cargar clientes', data: [] } as MensajeDto<ClienteDto[]>);
        }),
        finalize(() => {
          this.cargando = false;
        })
      )
      .subscribe({
        next: (response) => {
          if (!response.error) {
            this.clientes = response.data || [];
            this.clientesFiltrados = [...this.clientes];
            this.calcularEstadisticas();
          } else {
            this.errorMessage = response.mensaje || 'Error al cargar los clientes';
          }
        }
      });
  }

  // Calcular estadísticas
  calcularEstadisticas(): void {
    this.totalNaturales = this.clientes.filter(c => c.tipoCliente === 'NATURAL').length;
    this.totalJuridicos = this.clientes.filter(c => c.tipoCliente === 'JURIDICO').length;
    this.totalClientes = this.clientes.length;
  }

  // Aplicar filtros
  aplicarFiltros(): void {
    let clientesFiltrados = [...this.clientes];

    // Filtrar por texto (nombre, cédula, correo)
    if (this.filtroTexto.trim()) {
      const texto = this.filtroTexto.toLowerCase().trim();
      clientesFiltrados = clientesFiltrados.filter(cliente =>
        cliente.nombre.toLowerCase().includes(texto) ||
        cliente.cedula.toLowerCase().includes(texto) ||
        (cliente.correo && cliente.correo.toLowerCase().includes(texto)) ||
        (cliente.telefono && cliente.telefono.includes(texto))
      );
    }

    // Filtrar por tipo de cliente
    if (this.filtroTipo !== 'TODOS') {
      clientesFiltrados = clientesFiltrados.filter(cliente =>
        cliente.tipoCliente === this.filtroTipo
      );
    }

    this.clientesFiltrados = clientesFiltrados;
  }

  // Limpiar filtros
  limpiarFiltros(): void {
    this.filtroTexto = '';
    this.filtroTipo = 'TODOS';
    this.clientesFiltrados = [...this.clientes];
    this.errorMessage = '';
    this.successMessage = '';
  }

  // Buscar cliente por cédula
  buscarPorCedula(): void {
    if (!this.filtroTexto.trim()) {
      this.aplicarFiltros();
      return;
    }

    this.cargando = true;
    this.clienteService.obtenerClientePorCedula(this.filtroTexto.trim())
      .pipe(
        catchError((error) => {
          console.error('Error al buscar cliente por cédula:', error);
          this.errorMessage = 'No se encontró ningún cliente con esa cédula';
          // Para MensajeDto<ClienteDto>, necesitamos proporcionar un ClienteDto por defecto o undefined
          const errorResponse: MensajeDto<ClienteDto> = {
            error: true,
            mensaje: 'No se encontró ningún cliente con esa cédula',
            data: this.crearClienteVacio()
          };
          return of(errorResponse);
        }),
        finalize(() => {
          this.cargando = false;
        })
      )
      .subscribe({
        next: (response) => {
          if (response.data && response.data.id) {
            this.clientesFiltrados = [response.data];
          } else {
            this.clientesFiltrados = [];
            this.errorMessage = 'No se encontró ningún cliente con esa cédula';
          }
        }
      });
  }

  // Buscar cliente por nombre
  buscarPorNombre(): void {
    if (!this.filtroTexto.trim()) {
      this.aplicarFiltros();
      return;
    }

    this.cargando = true;
    this.clienteService.obtenerClientesPorNombre(this.filtroTexto.trim())
      .pipe(
        catchError((error) => {
          console.error('Error al buscar cliente por nombre:', error);
          this.errorMessage = 'Error al buscar clientes por nombre';
          return of({ error: true, mensaje: 'Error al buscar clientes por nombre', data: [] } as MensajeDto<ClienteDto[]>);
        }),
        finalize(() => {
          this.cargando = false;
        })
      )
      .subscribe({
        next: (response) => {
          this.clientesFiltrados = response.data || [];
          if (this.clientesFiltrados.length === 0) {
            this.errorMessage = 'No se encontraron clientes con ese nombre';
          }
        }
      });
  }

  // Editar cliente
  editarCliente(cliente: ClienteDto): void {
    this.clienteSeleccionado = { ...cliente };
    this.mostrarFormularioEdicion = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  // Guardar cambios del cliente editado
  guardarCliente(): void {
    if (this.clienteSeleccionado && this.clienteSeleccionado.id) {
      this.cargando = true;
      
      this.clienteService.actualizarCliente(this.clienteSeleccionado.id, this.clienteSeleccionado)
        .pipe(
          catchError((error) => {
            console.error('Error al actualizar cliente:', error);
            this.errorMessage = 'Error al actualizar el cliente. Por favor, intente nuevamente.';
            // Para MensajeDto<ClienteDto>, necesitamos proporcionar un ClienteDto por defecto
            const errorResponse: MensajeDto<ClienteDto> = {
              error: true,
              mensaje: 'Error al actualizar el cliente',
              data: this.crearClienteVacio()
            };
            return of(errorResponse);
          }),
          finalize(() => {
            this.cargando = false;
          })
        )
        .subscribe({
          next: (response) => {
            if (!response.error && response.data && response.data.id) {
              // Actualizar el cliente en la lista local
              const index = this.clientes.findIndex(c => c.id === this.clienteSeleccionado!.id);
              if (index !== -1) {
                this.clientes[index] = response.data;
                this.calcularEstadisticas();
                this.aplicarFiltros();
              }
              this.successMessage = 'Cliente actualizado exitosamente';
              this.cancelarEdicion();
            } else {
              this.errorMessage = response.mensaje || 'Error al actualizar el cliente';
            }
          }
        });
    }
  }

  // Cancelar edición
  cancelarEdicion(): void {
    this.clienteSeleccionado = null;
    this.mostrarFormularioEdicion = false;
    this.errorMessage = '';
    this.successMessage = '';
  }

  // Eliminar cliente
  eliminarCliente(cliente: ClienteDto): void {
    if (!cliente.id) {
      this.errorMessage = 'No se puede eliminar el cliente: ID no válido';
      return;
    }

    if (confirm(`¿Estás seguro de que deseas eliminar al cliente "${cliente.nombre}"?`)) {
      this.cargando = true;
      
      this.clienteService.eliminarCliente(cliente.id)
        .pipe(
          catchError((error) => {
            console.error('Error al eliminar cliente:', error);
            this.errorMessage = 'Error al eliminar el cliente. Por favor, intente nuevamente.';
            return of({ error: true, mensaje: 'Error al eliminar el cliente', data: '' } as MensajeDto<string>);
          }),
          finalize(() => {
            this.cargando = false;
          })
        )
        .subscribe({
          next: (response) => {
            if (!response.error) {
              // Eliminar el cliente de la lista local
              this.clientes = this.clientes.filter(c => c.id !== cliente.id);
              this.calcularEstadisticas();
              this.aplicarFiltros();
              this.successMessage = 'Cliente eliminado exitosamente';
            } else {
              this.errorMessage = response.mensaje || 'Error al eliminar el cliente';
            }
          }
        });
    }
  }

  // Crear nuevo cliente
  crearNuevoCliente(): void {
    this.clienteSeleccionado = this.crearClienteVacio();
    this.mostrarFormularioEdicion = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  // Guardar nuevo cliente
  guardarNuevoCliente(): void {
    if (this.clienteSeleccionado) {
      this.cargando = true;
      
      this.clienteService.crearCliente(this.clienteSeleccionado)
        .pipe(
          catchError((error) => {
            console.error('Error al crear cliente:', error);
            this.errorMessage = 'Error al crear el cliente. Por favor, intente nuevamente.';
            // Para MensajeDto<ClienteDto>, necesitamos proporcionar un ClienteDto por defecto
            const errorResponse: MensajeDto<ClienteDto> = {
              error: true,
              mensaje: 'Error al crear el cliente',
              data: this.crearClienteVacio()
            };
            return of(errorResponse);
          }),
          finalize(() => {
            this.cargando = false;
          })
        )
        .subscribe({
          next: (response) => {
            if (!response.error && response.data && response.data.id) {
              // Agregar el nuevo cliente a la lista local
              this.clientes.push(response.data);
              this.calcularEstadisticas();
              this.aplicarFiltros();
              this.successMessage = 'Cliente creado exitosamente';
              this.cancelarEdicion();
            } else {
              this.errorMessage = response.mensaje || 'Error al crear el cliente';
            }
          }
        });
    }
  }

  // Método auxiliar para crear un cliente vacío
  private crearClienteVacio(): ClienteDto {
    return {
      nombre: '',
      cedula: '',
      correo: '',
      telefono: '',
      direccion: '',
      tipoCliente: 'NATURAL',
      descuentoAplicable: 0
    };
  }

  // Formatear fecha para mostrar
  formatearFecha(fecha: string | undefined): string {
    if (!fecha) return 'No registrada';
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Obtener texto del tipo de cliente
  obtenerTipoClienteTexto(tipo: string): string {
    return tipo === 'NATURAL' ? 'Persona Natural' : 'Persona Jurídica';
  }

  // Verificar si hay resultados
  get hayResultados(): boolean {
    return this.clientesFiltrados.length > 0;
  }

  // Obtener total de clientes filtrados
  get totalFiltrados(): number {
    return this.clientesFiltrados.length;
  }

  // Recargar datos
  recargarDatos(): void {
    this.limpiarFiltros();
    this.cargarClientes();
  }

  // ✅ MÉTODO: Continuar con un cliente existente - MODIFICADO
  continuarConCliente(cliente: ClienteDto): void {
    console.log('=== 🚀 CONTINUANDO CON CLIENTE EXISTENTE ===');
    console.log('👤 Cliente seleccionado:', cliente);
    
    this.clienteSeleccionado = cliente;
    this.mostrarConfirmacionContinuar = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  // ✅ NUEVO MÉTODO: Cancelar la acción de continuar
  cancelarContinuar(): void {
    this.mostrarConfirmacionContinuar = false;
    this.clienteSeleccionado = null;
    this.errorMessage = '';
    this.successMessage = '';
  }

  // ✅ NUEVO MÉTODO: Crear orden de venta
  // ✅ MÉTODO MODIFICADO: Crear orden de venta usando el servicio con UsuarioService
crearOrdenVenta(): void {
  if (!this.clienteSeleccionado || !this.clienteSeleccionado.id) {
    this.errorMessage = 'No se ha seleccionado ningún cliente válido';
    return;
  }

  console.log('=== 📋 CREANDO ORDEN DE VENTA ===');
  console.log('👤 Cliente seleccionado:', this.clienteSeleccionado);

  // Resetear estados
  this.cargando = true;
  this.errorMessage = '';
  this.successMessage = '';

  // Obtener usuario actual usando UsuarioService
  const usuarioActual = this.usuarioService.getUsuario();

  if (!usuarioActual) {
    this.errorMessage = 'No hay usuario autenticado. No se puede crear la orden.';
    this.cargando = false;
    return;
  }

  console.log('👤 Usuario autenticado:', usuarioActual);

  // Preparar datos para crear la orden
  const createOrdenDto: CreateOrdenDto = {
    clienteId: this.clienteSeleccionado.id,
    vendedorId: usuarioActual.userId // Usamos el userId del LoginResponse
  };

  console.log('📦 Datos para crear orden:', createOrdenDto);
  console.log('🚀 Llamando servicio ordenVentaService.crearOrden...');

  // Crear la orden usando el servicio
  this.ordenVentaService.crearOrden(createOrdenDto)
    .pipe(
      catchError((error) => {
        console.error('❌ Error al crear orden:', error);
        console.error('🔍 Detalles del error:', {
          message: error.message,
          status: error.status,
          url: error.url
        });
        
        this.errorMessage = 'Error al crear la orden de venta. Por favor, intente nuevamente.';
        this.cargando = false;
        return of(null);
      })
    )
    .subscribe({
      next: (ordenCreada) => {
        console.log('📨 Respuesta del servicio crearOrden:', ordenCreada);
        this.cargando = false;
        
        if (ordenCreada) {
          console.log('✅ ORDEN CREADA EXITOSAMENTE:', ordenCreada);
          console.log('📋 Detalles de la orden creada:');
          console.log('   🆔 ID:', ordenCreada.id);
          console.log('   🔢 Número de Orden:', ordenCreada.numeroOrden);
          console.log('   🏷️ Estado:', ordenCreada.estado);
          console.log('   👤 Cliente:', ordenCreada.cliente);
          console.log('   💰 Total:', ordenCreada.total);
          console.log('   📅 Fecha:', ordenCreada.fecha);
          
          // ✅ GUARDAR LA ORDEN ACTUAL EN EL SERVICIO
          console.log('💾 Guardando orden actual en el servicio...');
          this.ordenVentaService.guardarOrdenActual(ordenCreada);
          
          // También mantener los métodos existentes por compatibilidad
          this.ordenVentaService.setOrdenIdEnLocalStorage(ordenCreada.id);
          this.ordenVentaService.setOrden(ordenCreada);
          
          // ✅ VERIFICACIÓN: Comprobar que se guardó correctamente
          console.log('🔍 Verificando guardado en servicio:');
          const ordenGuardada = this.ordenVentaService.obtenerOrdenActual();
          console.log('   ¿Se guardó correctamente?', ordenGuardada !== null);
          console.log('   Orden guardada:', ordenGuardada);
          
          // Mostrar mensaje de éxito
          this.successMessage = `✅ Orden de venta #${ordenCreada.numeroOrden} creada exitosamente para: ${this.clienteSeleccionado!.nombre}`;
          
          // Cerrar el modal de confirmación
          this.mostrarConfirmacionContinuar = false;
          const clienteNombre = this.clienteSeleccionado!.nombre;
          this.clienteSeleccionado = null;
          
          // ✅ REDIRIGIR A LA PÁGINA DE INICIO después de un breve delay
          console.log('🔄 Redirigiendo a /inicio...');
          
          setTimeout(() => {
            this.router.navigate(['/inicio']);
            this.successMessage = '';
          }, 2000); // 2 segundos para que el usuario vea el mensaje de éxito
          
        } else {
          console.log('⚠️ Respuesta de orden creada es null o undefined');
          this.errorMessage = 'No se pudo crear la orden. Por favor, intente nuevamente.';
        }
      },
      error: (error) => {
        console.error('❌ Error completo en el subscribe:', error);
        this.cargando = false;
        this.errorMessage = 'Error de conexión. Por favor, verifique su conexión a internet.';
      }
    });
}

  // ✅ MÉTODO AUXILIAR: Obtener información de contacto formateada
  obtenerInfoContacto(cliente: ClienteDto): string {
    const contactos = [];
    if (cliente.correo) contactos.push(cliente.correo);
    if (cliente.telefono) contactos.push(cliente.telefono);
    return contactos.join(' • ') || 'Sin información de contacto';
  }
}