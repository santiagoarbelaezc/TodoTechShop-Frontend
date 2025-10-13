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
    private clienteService: ClienteService
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
}