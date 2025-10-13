import { Component, OnInit, ElementRef, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UsuarioService } from '../../services/usuario.service';
import { OrdenVentaService, EstadoOrden } from '../../services/orden-venta.service';
import { Router } from '@angular/router';
import { ClienteDto } from '../../models/cliente.dto';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UsuarioDto } from '../../models/usuario/usuario.dto';
import { AuthService } from '../../services/auth.service';
import { NavbarOrdenComponent } from './navbar-orden/navbar-orden.component';
import { ClienteService } from '../../services/cliente.service';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { 
  OrdenDto, 
  OrdenConDetallesDto, 
  CreateOrdenDto 
} from '../../models/orden-venta/ordenventa.dto';

@Component({
  selector: 'app-orden-venta',
  templateUrl: './orden-venta.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarOrdenComponent],
  styleUrls: ['./orden-venta.component.css']
})
export class OrdenVentaComponent implements OnInit, AfterViewInit {
  fechaHora: string = '';
  currentTheme: string = 'light';
  private hasSwapped: boolean = false;

  cliente: ClienteDto = {
    nombre: '',
    cedula: '',
    correo: '',
    telefono: '',
    direccion: '',
    tipoCliente: 'NATURAL',
    descuentoAplicable: undefined
  };

  // Estados para manejar la UI
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  // Variable para almacenar el cliente creado
  clienteCreado: ClienteDto | null = null;

  // Variable para almacenar el usuario actual
  usuarioActual: any = null;

  // Variables para la orden
  ordenCreada: OrdenDto | null = null;
  ordenConDetalles: OrdenConDetallesDto | null = null;

  // Variables para productos/detalles (simplificadas para el ejemplo)
  productoId: number = 0;
  cantidad: number = 1;
  precioUnitario: number = 0;

  // Lista de órdenes
  ordenes: OrdenDto[] = [];

  constructor(
    private http: HttpClient,
    private usuarioService: UsuarioService,
    private ordenVentaService: OrdenVentaService,
    private clienteService: ClienteService,
    private router: Router,
    private elementRef: ElementRef,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.actualizarFechaHora();
    this.obtenerUsuarioActual();
    this.cargarOrdenes();
    
    setInterval(() => {
      this.actualizarFechaHora();
    }, 1000);
  }

  ngAfterViewInit(): void {
    this.initSmoothSwap();
    this.activateSecondaryEffects();
    this.activateWaves();
    this.activateOrbitalDots();
  }

  salir(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // ✅ MÉTODO: Crear orden de venta
  crearOrdenVenta(): void {
    console.log('=== 🚀 CREANDO ORDEN DE VENTA ===');
    
    if (!this.clienteCreado) {
      this.errorMessage = 'Primero debe crear un cliente';
      return;
    }

    if (!this.usuarioActual) {
      this.errorMessage = 'No hay usuario autenticado';
      return;
    }

    const createOrdenDto: CreateOrdenDto = {
      clienteId: this.clienteCreado.id!,
      vendedorId: this.usuarioActual.userId
    };

    console.log('📦 Datos para crear orden:', createOrdenDto);

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.ordenVentaService.crearOrden(createOrdenDto)
      .pipe(
        catchError((error) => {
          console.error('❌ Error al crear orden:', error);
          this.errorMessage = error.error?.mensaje || 'Error al crear la orden. Por favor, intente nuevamente.';
          this.isLoading = false;
          return of(null);
        })
      )
      .subscribe({
        next: (ordenCreada) => {
          this.isLoading = false;
          
          if (ordenCreada) {
            console.log('✅ Orden creada exitosamente:', ordenCreada);
            this.ordenCreada = ordenCreada;
            this.successMessage = `Orden #${ordenCreada.numeroOrden} creada exitosamente`;
            
            // Guardar en localStorage y memoria
            this.ordenVentaService.setOrdenIdEnLocalStorage(ordenCreada.id);
            this.ordenVentaService.setOrden(ordenCreada);
            
            // Cargar detalles de la orden
            this.cargarDetallesOrden(ordenCreada.id);
          }
        }
      });
  }

  // ✅ MÉTODO: Cargar detalles de una orden
  cargarDetallesOrden(ordenId: number): void {
    console.log('=== 📋 CARGANDO DETALLES DE ORDEN ===');
    
    this.ordenVentaService.obtenerOrdenConDetalles(ordenId)
      .pipe(
        catchError((error) => {
          console.error('❌ Error al cargar detalles:', error);
          return of(null);
        })
      )
      .subscribe({
        next: (ordenConDetalles) => {
          if (ordenConDetalles) {
            console.log('✅ Detalles de orden cargados:', ordenConDetalles);
            this.ordenConDetalles = ordenConDetalles;
          }
        }
      });
  }

  // ✅ MÉTODO: Cargar todas las órdenes
  cargarOrdenes(): void {
    console.log('=== 📦 CARGANDO TODAS LAS ÓRDENES ===');
    
    this.ordenVentaService.obtenerTodasLasOrdenes()
      .pipe(
        catchError((error) => {
          console.error('❌ Error al cargar órdenes:', error);
          return of([]);
        })
      )
      .subscribe({
        next: (ordenes) => {
          this.ordenes = ordenes;
          console.log(`✅ ${ordenes.length} órdenes cargadas`);
        }
      });
  }

  // ✅ MÉTODO: Cargar órdenes por estado
  cargarOrdenesPorEstado(estado: EstadoOrden): void {
    console.log(`=== 🏷️ CARGANDO ÓRDENES ${estado} ===`);
    
    this.ordenVentaService.obtenerOrdenesPorEstado(estado)
      .pipe(
        catchError((error) => {
          console.error('❌ Error al cargar órdenes por estado:', error);
          return of([]);
        })
      )
      .subscribe({
        next: (ordenes) => {
          this.ordenes = ordenes;
          console.log(`✅ ${ordenes.length} órdenes ${estado.toLowerCase()} cargadas`);
        }
      });
  }

  // ✅ MÉTODO: Actualizar estado de una orden
  actualizarEstadoOrden(ordenId: number, nuevoEstado: EstadoOrden): void {
    console.log(`=== 🔄 ACTUALIZANDO ESTADO DE ORDEN ${ordenId} A ${nuevoEstado} ===`);
    
    this.ordenVentaService.actualizarEstadoOrden(ordenId, nuevoEstado)
      .pipe(
        catchError((error) => {
          console.error('❌ Error al actualizar estado:', error);
          this.errorMessage = 'Error al actualizar el estado de la orden';
          return of(null);
        })
      )
      .subscribe({
        next: (ordenActualizada) => {
          if (ordenActualizada) {
            console.log('✅ Estado actualizado:', ordenActualizada);
            this.successMessage = `Orden actualizada a ${nuevoEstado}`;
            
            // Actualizar la orden actual si es la misma
            if (this.ordenCreada && this.ordenCreada.id === ordenId) {
              this.ordenCreada = ordenActualizada;
            }
            
            // Recargar órdenes
            this.cargarOrdenes();
          }
        }
      });
  }

  // ✅ MÉTODO: Aplicar descuento a una orden
  aplicarDescuento(ordenId: number, porcentajeDescuento: number): void {
    console.log(`=== 💰 APLICANDO DESCUENTO DEL ${porcentajeDescuento}% A ORDEN ${ordenId} ===`);
    
    if (porcentajeDescuento < 0 || porcentajeDescuento > 100) {
      this.errorMessage = 'El descuento debe estar entre 0% y 100%';
      return;
    }

    this.ordenVentaService.aplicarDescuento(ordenId, porcentajeDescuento)
      .pipe(
        catchError((error) => {
          console.error('❌ Error al aplicar descuento:', error);
          this.errorMessage = 'Error al aplicar descuento';
          return of(null);
        })
      )
      .subscribe({
        next: (ordenActualizada) => {
          if (ordenActualizada) {
            console.log('✅ Descuento aplicado:', ordenActualizada);
            this.successMessage = `Descuento del ${porcentajeDescuento}% aplicado correctamente`;
            
            // Actualizar la orden actual si es la misma
            if (this.ordenCreada && this.ordenCreada.id === ordenId) {
              this.ordenCreada = ordenActualizada;
              this.cargarDetallesOrden(ordenId);
            }
          }
        }
      });
  }

  // ✅ MÉTODO: Obtener el usuario actual del AuthService
  private obtenerUsuarioActual(): void {
    console.log('=== 🔍 OBTENIENDO USUARIO ACTUAL ===');
    
    const usuario = this.authService.getCurrentUser();
    
    if (usuario) {
      this.usuarioActual = usuario;
      console.log('✅ Usuario actual obtenido correctamente:');
      console.log('🆔 ID del usuario (userId):', usuario.userId);
      console.log('👤 Nombre de usuario (username):', usuario.username);
      console.log('👤 Nombre completo:', usuario.nombre);
      console.log('🏷️ Rol:', usuario.role);
    } else {
      console.log('❌ No hay usuario autenticado');
      this.errorMessage = 'No hay usuario autenticado. Por favor, inicie sesión.';
    }
  }

  // ✅ MÉTODO: Verificar si hay una orden en proceso
  verificarOrdenEnProceso(): void {
    const ordenId = this.ordenVentaService.getOrdenIdDesdeLocalStorage();
    const ordenMemoria = this.ordenVentaService.getOrden();
    
    if (ordenId) {
      console.log('🔄 Orden en proceso encontrada en localStorage:', ordenId);
      
      if (ordenMemoria) {
        this.ordenCreada = ordenMemoria;
        this.cargarDetallesOrden(ordenId);
      } else {
        // Cargar la orden desde el servidor
        this.ordenVentaService.obtenerOrdenPorId(ordenId)
          .pipe(
            catchError((error) => {
              console.error('❌ Error al cargar orden en proceso:', error);
              this.ordenVentaService.limpiarOrdenId();
              return of(null);
            })
          )
          .subscribe({
            next: (orden) => {
              if (orden) {
                this.ordenCreada = orden;
                this.ordenVentaService.setOrden(orden);
                this.cargarDetallesOrden(ordenId);
              }
            }
          });
      }
    }
  }

  // ✅ MÉTODO: Limpiar orden actual
  limpiarOrdenActual(): void {
    this.ordenCreada = null;
    this.ordenConDetalles = null;
    this.ordenVentaService.limpiarOrden();
    this.ordenVentaService.limpiarOrdenId();
    this.successMessage = 'Orden actual limpiada';
  }

  // ... (los métodos de UI y efectos visuales se mantienen igual)

  private initSmoothSwap(): void {
    const swapContainers = this.elementRef.nativeElement.querySelectorAll('.swap-container');
    swapContainers.forEach((container: HTMLElement) => {
      const swapBtn = container.querySelector('.swap-btn') as HTMLElement;
      const swapContent = container.querySelector('.swap-content') as HTMLElement;
      
      if (swapBtn && swapContent) {
        swapBtn.addEventListener('click', () => {
          swapContent.classList.toggle('active');
          swapBtn.classList.toggle('active');
        });
      }
    });
  }

  private activateSecondaryEffects(): void {
    const secondaryBtns = this.elementRef.nativeElement.querySelectorAll('.btn-secondary-effect');
    secondaryBtns.forEach((btn: HTMLElement) => {
      btn.addEventListener('mouseenter', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        btn.style.setProperty('--x', `${x}px`);
        btn.style.setProperty('--y', `${y}px`);
      });
    });
  }

  private activateWaves(): void {
    const waveBtns = this.elementRef.nativeElement.querySelectorAll('.btn-wave');
    waveBtns.forEach((btn: HTMLElement) => {
      btn.addEventListener('click', (e) => {
        const wave = document.createElement('span');
        wave.classList.add('wave');
        
        const rect = btn.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        wave.style.width = wave.style.height = `${size}px`;
        wave.style.left = `${x}px`;
        wave.style.top = `${y}px`;
        
        btn.appendChild(wave);
        
        setTimeout(() => {
          wave.remove();
        }, 600);
      });
    });
  }

  private activateOrbitalDots(): void {
    const orbitalBtns = this.elementRef.nativeElement.querySelectorAll('.btn-orbital');
    orbitalBtns.forEach((btn: HTMLElement) => {
      btn.addEventListener('mouseenter', () => {
        btn.classList.add('orbital-active');
      });
      
      btn.addEventListener('mouseleave', () => {
        btn.classList.remove('orbital-active');
      });
    });
  }

  setTheme(theme: string): void {
    this.currentTheme = theme;
    document.body.setAttribute('data-theme', theme);
  }

  actualizarFechaHora(): void {
    const now = new Date();
    this.fechaHora = now.toLocaleString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  limpiarFormulario(): void {
    this.cliente = {
      nombre: '',
      cedula: '',
      correo: '',
      telefono: '',
      direccion: '',
      tipoCliente: 'NATURAL',
      descuentoAplicable: undefined
    };
    this.clienteCreado = null;
    this.errorMessage = '';
    this.successMessage = '';
  }

  onSubmit(): void {
    console.log('🔄 Creando cliente...', this.cliente);
    
    // Resetear mensajes
    this.errorMessage = '';
    this.successMessage = '';
    this.clienteCreado = null;
    this.isLoading = true;

    // Validaciones según el DTO del backend
    if (!this.cliente.nombre || !this.cliente.cedula || !this.cliente.tipoCliente) {
      this.errorMessage = 'Por favor complete los campos obligatorios: Nombre, Cédula y Tipo de Cliente';
      this.isLoading = false;
      return;
    }

    // Validar longitud del nombre
    if (this.cliente.nombre.length < 2 || this.cliente.nombre.length > 150) {
      this.errorMessage = 'El nombre debe tener entre 2 y 150 caracteres';
      this.isLoading = false;
      return;
    }

    // Validar longitud de la cédula
    if (this.cliente.cedula.length < 5 || this.cliente.cedula.length > 20) {
      this.errorMessage = 'La cédula debe tener entre 5 y 20 caracteres';
      this.isLoading = false;
      return;
    }

    // Validar formato de teléfono si se proporciona
    if (this.cliente.telefono && !this.validarTelefono(this.cliente.telefono)) {
      this.errorMessage = 'El teléfono debe tener un formato válido (10-20 dígitos, opcionalmente con + al inicio)';
      this.isLoading = false;
      return;
    }

    // Validar descuento si se proporciona
    if (this.cliente.descuentoAplicable !== undefined && 
        (this.cliente.descuentoAplicable < 0 || this.cliente.descuentoAplicable > 100)) {
      this.errorMessage = 'El descuento debe estar entre 0% y 100%';
      this.isLoading = false;
      return;
    }

    // Preparar datos para enviar al backend
    const clienteData: ClienteDto = {
      nombre: this.cliente.nombre.trim(),
      cedula: this.cliente.cedula.trim(),
      correo: this.cliente.correo?.trim() || '',
      telefono: this.cliente.telefono?.trim() || '',
      direccion: this.cliente.direccion?.trim() || '',
      tipoCliente: this.cliente.tipoCliente,
      descuentoAplicable: this.cliente.descuentoAplicable || this.getDescuentoPorDefecto()
    };

    console.log('📤 Datos del cliente a enviar:', clienteData);

    // Llamar al servicio para crear el cliente
    this.clienteService.crearCliente(clienteData)
      .pipe(
        catchError((error) => {
          console.error('❌ Error al crear cliente:', error);
          this.errorMessage = error.error?.mensaje || 'Error al crear el cliente. Por favor, intente nuevamente.';
          this.isLoading = false;
          return of(null);
        })
      )
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          
          if (response && !response.error) {
            this.successMessage = 'Cliente creado exitosamente';
            
            console.log('=== 📋 LOG DETALLADO DEL CLIENTE CREADO ===');
            console.log('✅ Respuesta completa del servidor:', response);
            
            // ✅ CORRECCIÓN: Usar response.data
            this.clienteCreado = response.data;
            
            console.log('📝 Cliente asignado a this.clienteCreado:', this.clienteCreado);
            
            if (this.clienteCreado && this.clienteCreado.id) {
              console.log('✅ Cliente creado correctamente');
              console.log('🆔 ID del cliente:', this.clienteCreado.id);
              
              // Verificar si hay orden en proceso
              this.verificarOrdenEnProceso();
              
            } else {
              console.log('❌ this.clienteCreado es null o no tiene ID');
              this.errorMessage = 'Error: No se pudo obtener el cliente creado con ID válido';
            }
            
          } else if (response) {
            this.errorMessage = response.mensaje || 'Error al crear el cliente';
          } else {
            this.errorMessage = 'Error: No se recibió respuesta del servidor';
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = 'Error de conexión. Por favor, verifique su conexión a internet.';
          console.error('❌ Error completo:', error);
        }
      });
  }

  // Métodos de conveniencia para estados de orden
  obtenerOrdenesPendientes(): void {
    this.cargarOrdenesPorEstado(EstadoOrden.PENDIENTE);
  }

  obtenerOrdenesPagadas(): void {
    this.cargarOrdenesPorEstado(EstadoOrden.PAGADA);
  }

  obtenerOrdenesEntregadas(): void {
    this.cargarOrdenesPorEstado(EstadoOrden.ENTREGADA);
  }

  obtenerOrdenesCerradas(): void {
    this.cargarOrdenesPorEstado(EstadoOrden.CERRADA);
  }

  // Métodos para cambiar estado (conveniencia)
  marcarComoPagada(ordenId: number): void {
    this.actualizarEstadoOrden(ordenId, EstadoOrden.PAGADA);
  }

  marcarComoEntregada(ordenId: number): void {
    this.actualizarEstadoOrden(ordenId, EstadoOrden.ENTREGADA);
  }

  marcarComoCerrada(ordenId: number): void {
    this.actualizarEstadoOrden(ordenId, EstadoOrden.CERRADA);
  }

  private validarTelefono(telefono: string): boolean {
    const regex = /^[+]?[0-9]{10,20}$/;
    return regex.test(telefono);
  }

  // Método para obtener el descuento por defecto según el tipo de cliente
  getDescuentoPorDefecto(): number {
    return this.cliente.tipoCliente === 'JURIDICO' ? 10.0 : 5.0;
  }

  // Método para formatear moneda
  formatearMoneda(valor: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(valor);
  }
}