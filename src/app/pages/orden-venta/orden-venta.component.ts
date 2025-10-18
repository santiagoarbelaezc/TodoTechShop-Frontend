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
import { catchError, switchMap, delay } from 'rxjs/operators';
import { of, timer } from 'rxjs';
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
  isCreatingOrder: boolean = false;
  showSuccessModal: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  descuentoError: string = ''; // ✅ NUEVO: Error específico para descuento

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
    console.log('🔄 OrdenVentaComponent inicializado');
    this.actualizarFechaHora();
    this.obtenerUsuarioActual();
    this.cargarOrdenes();
    this.verificarOrdenEnProceso();
    
    setInterval(() => {
      this.actualizarFechaHora();
    }, 1000);
  }

  ngAfterViewInit(): void {
    console.log('🎨 Inicializando efectos visuales');
    this.initSmoothSwap();
    this.activateSecondaryEffects();
    this.activateWaves();
    this.activateOrbitalDots();
  }

  salir(): void {
    console.log('🚪 Saliendo de la aplicación');
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // ✅ NUEVO MÉTODO: Validar descuento en tiempo real
  validarDescuento(): void {
    this.descuentoError = '';
    
    if (this.cliente.descuentoAplicable === undefined || this.cliente.descuentoAplicable === null) {
      return; // No hay descuento, no hay error
    }

    if (this.cliente.descuentoAplicable < 0) {
      this.descuentoError = 'El descuento no puede ser negativo';
      return;
    }

    if (this.cliente.descuentoAplicable > 30) {
      this.descuentoError = 'El descuento máximo permitido es 30%';
      return;
    }

    // Validar que solo tenga un decimal
    if (this.cliente.descuentoAplicable % 1 !== 0) {
      const decimalPart = this.cliente.descuentoAplicable.toString().split('.')[1];
      if (decimalPart && decimalPart.length > 1) {
        this.descuentoError = 'Solo se permite un decimal en el descuento';
        return;
      }
    }
  }

  // ✅ MÉTODO MODIFICADO: Crear cliente y orden simultáneamente con retraso
  onSubmit(): void {
    console.log('🔄 === INICIANDO PROCESO DE CREACIÓN DE CLIENTE Y ORDEN ===');
    console.log('📝 Datos del cliente a crear:', this.cliente);
    
    // Resetear mensajes
    this.errorMessage = '';
    this.successMessage = '';
    this.descuentoError = ''; // ✅ Limpiar error de descuento
    this.clienteCreado = null;
    this.ordenCreada = null;
    this.showSuccessModal = false;
    this.isLoading = true;
    this.isCreatingOrder = false;

    // Validar descuento antes de enviar
    this.validarDescuento();
    if (this.descuentoError) {
      this.isLoading = false;
      return;
    }

    // Validaciones según el DTO del backend
    if (!this.cliente.nombre || !this.cliente.cedula || !this.cliente.tipoCliente) {
      console.log('❌ Validación fallida: Campos obligatorios faltantes');
      this.errorMessage = 'Por favor complete los campos obligatorios: Nombre, Cédula y Tipo de Cliente';
      this.isLoading = false;
      return;
    }

    // Validar longitud del nombre
    if (this.cliente.nombre.length < 2 || this.cliente.nombre.length > 150) {
      console.log('❌ Validación fallida: Longitud del nombre inválida');
      this.errorMessage = 'El nombre debe tener entre 2 y 150 caracteres';
      this.isLoading = false;
      return;
    }

    // Validar longitud de la cédula
    if (this.cliente.cedula.length < 5 || this.cliente.cedula.length > 20) {
      console.log('❌ Validación fallida: Longitud de cédula inválida');
      this.errorMessage = 'La cédula debe tener entre 5 y 20 caracteres';
      this.isLoading = false;
      return;
    }

    // Validar formato de teléfono si se proporciona
    if (this.cliente.telefono && !this.validarTelefono(this.cliente.telefono)) {
      console.log('❌ Validación fallida: Formato de teléfono inválido');
      this.errorMessage = 'El teléfono debe tener un formato válido (10-20 dígitos, opcionalmente con + al inicio)';
      this.isLoading = false;
      return;
    }

    // Validar descuento si se proporciona (validación adicional)
    if (this.cliente.descuentoAplicable !== undefined && 
        (this.cliente.descuentoAplicable < 0 || this.cliente.descuentoAplicable > 30)) {
      console.log('❌ Validación fallida: Descuento fuera de rango');
      this.errorMessage = 'El descuento debe estar entre 0% y 30%';
      this.isLoading = false;
      return;
    }

    // Verificar que hay usuario autenticado
    if (!this.usuarioActual) {
      console.log('❌ No hay usuario autenticado');
      this.errorMessage = 'No hay usuario autenticado. No se puede crear la orden.';
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

    console.log('📤 Datos del cliente a enviar al backend:', clienteData);
    console.log('👤 Usuario actual para la orden:', this.usuarioActual);

    // ✅ FLUJO MEJORADO: Crear cliente y luego crear orden automáticamente con retraso
    console.log('🚀 Llamando servicio para crear cliente...');
    this.clienteService.crearCliente(clienteData)
      .pipe(
        switchMap((clienteResponse) => {
          console.log('📨 Respuesta del servicio crearCliente:', clienteResponse);
          
          if (!clienteResponse || clienteResponse.error || !clienteResponse.data) {
            console.error('❌ Error en respuesta del servicio crearCliente:', clienteResponse);
            throw new Error(clienteResponse?.mensaje || 'Error al crear el cliente');
          }

          console.log('✅ CLIENTE CREADO EXITOSAMENTE:', clienteResponse.data);
          console.log('📋 Detalles del cliente creado:');
          console.log('   🆔 ID:', clienteResponse.data.id);
          console.log('   👤 Nombre:', clienteResponse.data.nombre);
          console.log('   📧 Cédula:', clienteResponse.data.cedula);
          console.log('   🏷️ Tipo:', clienteResponse.data.tipoCliente);
          
          this.clienteCreado = clienteResponse.data;
          this.successMessage = `Cliente "${this.clienteCreado.nombre}" creado exitosamente. Preparando orden...`;

          // ✅ CREAR ORDEN AUTOMÁTICAMENTE después de crear el cliente con RETRASO de 3 segundos
          const createOrdenDto: CreateOrdenDto = {
            clienteId: this.clienteCreado.id!,
            vendedorId: this.usuarioActual.userId
          };

          console.log('📦 Preparando creación de orden con datos:', createOrdenDto);
          console.log('⏰ Iniciando retraso de 3 segundos antes de crear orden...');
          
          // Mostrar estado de creación de orden
          this.isCreatingOrder = true;
          this.successMessage = `Cliente creado exitosamente. Creando orden en 3 segundos...`;

          // ✅ RETRASO DE 3 SEGUNDOS antes de crear la orden
          return timer(3000).pipe(
            switchMap(() => {
              console.log('⏰ Retraso completado. Creando orden ahora...');
              console.log('🚀 Llamando servicio ordenVentaService.crearOrden...');
              this.successMessage = `Creando orden de venta...`;
              return this.ordenVentaService.crearOrden(createOrdenDto);
            })
          );
        }),
        catchError((error) => {
          console.error('❌ Error en el proceso de creación:', error);
          console.error('🔍 Detalles del error:', {
            message: error.message,
            stack: error.stack,
            status: error.status
          });
          this.errorMessage = error.message || 'Error al crear el cliente y la orden. Por favor, intente nuevamente.';
          this.isLoading = false;
          this.isCreatingOrder = false;
          return of(null);
        })
      )
      .subscribe({
        next: (ordenCreada) => {
          console.log('📨 Respuesta del servicio crearOrden:', ordenCreada);
          this.isLoading = false;
          this.isCreatingOrder = false;
          
          if (ordenCreada) {
            console.log('✅ ORDEN CREADA EXITOSAMENTE:', ordenCreada);
            console.log('📋 Detalles de la orden creada:');
            console.log('   🆔 ID:', ordenCreada.id);
            console.log('   🔢 Número de Orden:', ordenCreada.numeroOrden);
            console.log('   🏷️ Estado:', ordenCreada.estado);
            console.log('   👤 Cliente:', ordenCreada.cliente);
            console.log('   💰 Total:', ordenCreada.total);
            console.log('   📅 Fecha:', ordenCreada.fecha);
            
            this.ordenCreada = ordenCreada;
            
            // ✅ SIMPLIFICADO: Guardar la orden actual en el servicio
            console.log('💾 Guardando orden actual en el servicio...');
            this.ordenVentaService.guardarOrdenActual(ordenCreada);
            
            // También mantener los métodos existentes por compatibilidad
            this.ordenVentaService.setOrdenIdEnLocalStorage(ordenCreada.id);
            this.ordenVentaService.setOrden(ordenCreada);
            
            // ✅ MODIFICADO: Mostrar modal de éxito en lugar de mensaje temporal
            this.showSuccessModal = true;
            this.successMessage = `✅ Cliente "${this.clienteCreado?.nombre}" y Orden #${ordenCreada.numeroOrden} creados exitosamente`;
            
            // Cargar detalles de la orden
            this.cargarDetallesOrden(ordenCreada.id);
            
            // Recargar lista de órdenes
            this.cargarOrdenes();
            
            console.log('🎉 PROCESO COMPLETADO: Cliente y orden creados exitosamente');
            
            // ✅ VERIFICACIÓN: Comprobar que se guardó correctamente
            console.log('🔍 Verificando guardado en servicio:');
            const ordenGuardada = this.ordenVentaService.obtenerOrdenActual();
            console.log('   ¿Se guardó correctamente?', ordenGuardada !== null);
            console.log('   Orden guardada:', ordenGuardada);
          } else {
            console.log('⚠️ Respuesta de orden creada es null o undefined');
          }
        },
        error: (error) => {
          console.error('❌ Error completo en el subscribe:', error);
          console.error('🔍 Detalles técnicos del error:', {
            name: error.name,
            message: error.message,
            stack: error.stack,
            status: error.status,
            url: error.url
          });
          this.isLoading = false;
          this.isCreatingOrder = false;
          this.errorMessage = 'Error de conexión. Por favor, verifique su conexión a internet.';
          console.error('❌ Error completo:', error);
        }
      });
  }

  // ✅ MÉTODO: Crear orden de venta (separado para uso individual) con retraso
  crearOrdenVenta(): void {
    console.log('=== 🚀 INICIANDO CREACIÓN INDIVIDUAL DE ORDEN DE VENTA ===');
    
    if (!this.clienteCreado) {
      console.log('❌ No hay cliente creado para asociar la orden');
      this.errorMessage = 'Primero debe crear un cliente';
      return;
    }

    if (!this.usuarioActual) {
      console.log('❌ No hay usuario autenticado');
      this.errorMessage = 'No hay usuario autenticado';
      return;
    }

    const createOrdenDto: CreateOrdenDto = {
      clienteId: this.clienteCreado.id!,
      vendedorId: this.usuarioActual.userId
    };

    console.log('📦 Datos para crear orden:', createOrdenDto);

    this.isLoading = true;
    this.isCreatingOrder = true;
    this.showSuccessModal = false;
    this.errorMessage = '';
    this.successMessage = 'Creando orden en 3 segundos...';

    console.log('⏰ Iniciando retraso de 3 segundos...');
    // ✅ RETRASO DE 3 SEGUNDOS antes de crear la orden
    timer(3000).pipe(
      switchMap(() => {
        console.log('⏰ Retraso completado. Creando orden ahora...');
        console.log('🚀 Llamando servicio ordenVentaService.crearOrden...');
        this.successMessage = 'Creando orden de venta...';
        return this.ordenVentaService.crearOrden(createOrdenDto);
      }),
      catchError((error) => {
        console.error('❌ Error al crear orden:', error);
        console.error('🔍 Detalles del error en crearOrden:', error);
        this.errorMessage = error.error?.mensaje || 'Error al crear la orden. Por favor, intente nuevamente.';
        this.isLoading = false;
        this.isCreatingOrder = false;
        return of(null);
      })
    )
    .subscribe({
      next: (ordenCreada) => {
        console.log('📨 Respuesta de creación individual de orden:', ordenCreada);
        this.isLoading = false;
        this.isCreatingOrder = false;
        
        if (ordenCreada) {
          console.log('✅ ORDEN CREADA EXITOSAMENTE (individual):', ordenCreada);
          this.ordenCreada = ordenCreada;
          
          // ✅ MODIFICADO: Mostrar modal de éxito
          this.showSuccessModal = true;
          this.successMessage = `✅ Orden #${ordenCreada.numeroOrden} creada exitosamente`;
          
          // Guardar en localStorage y memoria
          this.ordenVentaService.setOrdenIdEnLocalStorage(ordenCreada.id);
          this.ordenVentaService.setOrden(ordenCreada);
          
          // Cargar detalles de la orden
          this.cargarDetallesOrden(ordenCreada.id);
        }
      }
    });
  }

  // ✅ MÉTODO MODIFICADO: Continuar con orden después del éxito
  continuarConOrden(): void {
    console.log('=== 🚀 CONTINUANDO CON ORDEN DE VENTA ===');
    console.log('📋 Orden actual:', this.ordenCreada);
    console.log('👤 Cliente actual:', this.clienteCreado);
    
    if (!this.ordenCreada) {
      console.error('❌ No hay orden creada para continuar');
      this.errorMessage = 'No se encontró la orden creada.';
      return;
    }

    // Cerrar el modal de éxito
    this.showSuccessModal = false;
    
    // 1. Actualizar el estado de la orden a AGREGANDOPRODUCTOS
    this.ordenVentaService.marcarComoAgregandoProductos(this.ordenCreada.id)
      .subscribe({
        next: (ordenActualizada) => {
          console.log('✅ Estado actualizado a AGREGANDOPRODUCTOS');
          
          // 2. Limpiar el formulario ahora que el usuario quiere continuar
          this.limpiarFormulario();
          
          // 3. ✅ REDIRIGIR A LA PÁGINA DE INICIO
          console.log('🔄 Redirigiendo a /inicio...');
          this.router.navigate(['/inicio']);
          
          // Mostrar mensaje de redirección (opcional)
          this.successMessage = 'Redirigiendo al inicio...';
          
          // Limpiar mensaje después de 2 segundos (ya que se redirige)
          setTimeout(() => {
            this.successMessage = '';
          }, 2000);
        },
        error: (error) => {
          console.error('❌ Error al actualizar estado:', error);
          
          // Si falla, continuar de todas formas
          console.warn('⚠️ Continuando sin actualizar estado...');
          
          this.limpiarFormulario();
          this.router.navigate(['/inicio']);
          this.successMessage = 'Redirigiendo al inicio...';
          
          setTimeout(() => {
            this.successMessage = '';
          }, 2000);
        }
      });
  }

  // ✅ MÉTODO: Cerrar modal de éxito sin continuar
  cerrarModalExito(): void {
    console.log('❌ Cerrando modal de éxito sin continuar');
    console.log('🔄 Limpiando formulario...');
    this.showSuccessModal = false;
    this.limpiarFormulario();
    this.successMessage = '';
  }

  // ✅ MÉTODO: Cargar detalles de una orden
  cargarDetallesOrden(ordenId: number): void {
    console.log('=== 📋 CARGANDO DETALLES DE ORDEN ===');
    console.log(`🔍 Solicitando detalles para orden ID: ${ordenId}`);
    
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
            console.log(`📦 Número de items en la orden: ${ordenConDetalles.productos.length || 0}`);
            this.ordenConDetalles = ordenConDetalles;
          } else {
            console.log('⚠️ No se pudieron cargar los detalles de la orden');
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
          if (ordenes.length > 0) {
            console.log('📋 Lista de órdenes:', ordenes.map(o => ({ id: o.id, numero: o.numeroOrden, estado: o.estado })));
          }
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
    
    if (porcentajeDescuento < 0 || porcentajeDescuento > 30) { // ✅ Cambiado de 100 a 30
      this.errorMessage = 'El descuento debe estar entre 0% y 30%';
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
    console.log('=== 🔍 VERIFICANDO ÓRDEN EN PROCESO ===');
    const ordenId = this.ordenVentaService.getOrdenIdDesdeLocalStorage();
    const ordenMemoria = this.ordenVentaService.getOrden();
    
    if (ordenId) {
      console.log('🔄 Orden en proceso encontrada en localStorage:', ordenId);
      
      if (ordenMemoria) {
        console.log('📦 Orden encontrada en memoria:', ordenMemoria);
        this.ordenCreada = ordenMemoria;
        this.cargarDetallesOrden(ordenId);
      } else {
        console.log('🔍 Cargando orden desde el servidor...');
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
                console.log('✅ Orden cargada desde servidor:', orden);
                this.ordenCreada = orden;
                this.ordenVentaService.setOrden(orden);
                this.cargarDetallesOrden(ordenId);
              }
            }
          });
      }
    } else {
      console.log('ℹ️ No hay orden en proceso');
    }
  }

  // ✅ MÉTODO: Limpiar orden actual
  limpiarOrdenActual(): void {
    console.log('🗑️ Limpiando orden actual');
    this.ordenCreada = null;
    this.ordenConDetalles = null;
    this.ordenVentaService.limpiarOrden();
    this.ordenVentaService.limpiarOrdenId();
    this.successMessage = 'Orden actual limpiada';
  }

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
    this.descuentoError = ''; // ✅ Limpiar error de descuento
    // No limpiar successMessage aquí, se limpia en continuarConOrden
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

  // ✅ NUEVO MÉTODO: Cancelar creación de orden durante el retraso
  cancelarCreacionOrden(): void {
    console.log('❌ Cancelando creación de orden...');
    this.isLoading = false;
    this.isCreatingOrder = false;
    this.successMessage = 'Creación de orden cancelada';
    
    // Aquí podrías implementar lógica para cancelar observables si fuera necesario
    // En este caso, como usamos timer, simplemente detenemos los estados visuales
  }
}