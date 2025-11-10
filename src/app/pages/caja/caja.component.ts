import { CommonModule } from '@angular/common';
import { 
  ChangeDetectionStrategy, 
  ChangeDetectorRef, 
  Component, 
  OnInit,
  OnDestroy 
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OrdenVentaService, EstadoOrden } from '../../services/orden-venta.service';
import { StripePaymentService } from '../../services/stripe-payment.service';
import { PaymentStateService } from '../../services/payment-state.service';
import { OrdenConDetallesDto, OrdenDto } from '../../models/orden-venta/ordenventa.dto';
import { NavbarCajaComponent } from './navbar-caja/navbar-caja.component';

// Enums esenciales para el pago
export enum TipoMetodo {
  STRIPE = 'STRIPE',
  PAYPAL = 'PAYPAL',
  MERCADOPAGO = 'MERCADOPAGO'
}

export enum PaymentStatus {
  REQUIRES_PAYMENT_METHOD = 'requires_payment_method',
  REQUIRES_CONFIRMATION = 'requires_confirmation',
  REQUIRES_ACTION = 'requires_action',
  PROCESSING = 'processing',
  REQUIRES_CAPTURE = 'requires_capture',
  CANCELED = 'canceled',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed'
}

// Interfaces esenciales
interface CardDetails {
  cardNumber: string;
  cardName: string;
  expiryDate: string;
  cvv: string;
  saveCard: boolean;
}

interface OrderDetails {
  seller: string;
  client: string;
  date: string;
  status: string;
  taxes: string;
  total: string;
  toPay: string;
}

interface MetodoPagoInfo {
  nombre: string;
  icono: string;
  tipoMetodo: TipoMetodo;
  requiereFormulario: boolean;
}

@Component({
  selector: 'app-caja',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarCajaComponent],
  templateUrl: './caja.component.html',
  styleUrls: ['./caja.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CajaComponent implements OnInit, OnDestroy {
  ordenes: OrdenConDetallesDto[] = [];
  ordenSeleccionada: OrdenConDetallesDto | null = null;
  selectedPaymentMethod: string = 'No seleccionado';
  
  seccionActiva: string = 'registrarPago';
  
  totalOrdenes: number = 0;
  ordenesPendientes: number = 0;
  ordenesPagadas: number = 0;
  
  cardDetails: CardDetails = {
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    saveCard: false
  };

  showCardForm: boolean = false;
  cardFormValid: boolean = false;
  
  currentOrderDetails: OrderDetails = {
    seller: 'Cargando...',
    client: 'Cargando...',
    date: new Date().toLocaleDateString('es-ES'),
    status: 'CARGANDO',
    taxes: '$0',
    total: '$0',
    toPay: '$0'
  };

  // Reemplaza el array metodosPago por este:
  metodosPago: MetodoPagoInfo[] = [
    { 
      nombre: 'Stripe (Tarjeta)', 
      icono: 'assets/stripe.png', 
      tipoMetodo: TipoMetodo.STRIPE, 
      requiereFormulario: false 
    },
    { 
      nombre: 'Efectivo', 
      icono: 'assets/efectivo.png', 
      tipoMetodo: TipoMetodo.STRIPE,
      requiereFormulario: false 
    }
  ];

  cashAmount: number = 0;
  changeAmount: number = 0;
  
  successMessage: string = '';
  errorMessage: string = '';
  cargando: boolean = false;

  private paymentStatusInterval: any;
  private stripeWindow: Window | null = null;
  private windowCheckInterval: any;

  constructor(
    private ordenVentaService: OrdenVentaService,
    private stripePaymentService: StripePaymentService,
    private paymentStateService: PaymentStateService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarOrdenesDisponiblesParaPago();
    window.addEventListener('message', this.handleStripeMessage.bind(this));
  }

  ngOnDestroy(): void {
    this.stopPaymentStatusChecking();
    this.stopWindowStatusChecking();
    window.removeEventListener('message', this.handleStripeMessage.bind(this));
  }

  private handleStripeMessage(event: MessageEvent): void {
    console.log('🔍 DEBUG handleStripeMessage recibido:', event.data);
    
    if (event.data?.type === 'STRIPE_PAYMENT_SUCCESS') {
      console.log('✅ Stripe payment success con datos:', {
        paymentIntentId: event.data.paymentIntentId,
        orderId: event.data.orderId
      });
      this.handleSuccessfulStripePayment(event.data.paymentIntentId, event.data.orderId);
    } else if (event.data?.type === 'STRIPE_PAYMENT_FAILED') {
      console.log('❌ Stripe payment failed con datos:', {
        error: event.data.error
      });
      this.handleFailedStripePayment(event.data.error);
    } else if (event.data?.type === 'STRIPE_PAYMENT_ABORTED') {
      console.log('🚪 Stripe payment aborted con datos:', {
        paymentIntentId: event.data.paymentIntentId,
        reason: event.data.reason
      });
      this.handleAbortedStripePayment(event.data.paymentIntentId, event.data.reason);
    }
  }

  // ✅ AGREGADO: Manejar pago abortado
  private handleAbortedStripePayment(paymentIntentId: string, reason: string): void {
    console.log('🚪 Pago con Stripe abortado:', {
      paymentIntentId,
      reason
    });
    
    this.stopPaymentStatusChecking();
    this.stopWindowStatusChecking();
    this.paymentStateService.resetPayment();
    
    let mensaje = 'Pago cancelado por el usuario.';
    if (reason === 'window_closed') {
      mensaje = 'Ventana de pago cerrada. El pago fue cancelado.';
    }
    
    this.mostrarError(mensaje);
    this.cargando = false;
    this.cdRef.detectChanges();
  }

  // ✅ CORREGIDO: Método para cargar todas las órdenes disponibles para pago
  private cargarOrdenesDisponiblesParaPago(): void {
    console.log('🔄 Cargando órdenes disponibles para pago desde el servicio...');
    
    this.cargando = true;
    this.ordenVentaService.obtenerOrdenesDisponiblesPago().subscribe({
      next: (ordenes: OrdenDto[]) => {
        console.log('✅ Órdenes disponibles para pago recibidas:', ordenes);
        
        if (ordenes && ordenes.length > 0) {
          // Convertir OrdenDto[] a OrdenConDetallesDto[]
          this.ordenes = ordenes.map(orden => ({
            ...orden,
            productos: [] // Por ahora productos vacío, podrías cargarlos si es necesario
          } as OrdenConDetallesDto));
          
          this.actualizarEstadisticas();
          
          // Seleccionar automáticamente la primera orden si hay solo una
          if (this.ordenes.length === 1) {
            this.seleccionarOrden(this.ordenes[0]);
          }
          
          console.log(`✅ Se cargaron ${this.ordenes.length} órdenes disponibles para pago`);
        } else {
          console.log('ℹ️ No hay órdenes disponibles para pago');
          this.ordenes = [];
          this.mostrarInfo('No hay órdenes disponibles para pago en este momento.');
        }
        
        this.cargando = false;
        this.cdRef.detectChanges();
      },
      error: (error) => {
        console.error('❌ Error al cargar órdenes disponibles para pago:', error);
        this.mostrarError('Error al cargar las órdenes disponibles para pago: ' + error.message);
        this.cargarOrdenActualComoFallback();
        this.cargando = false;
        this.cdRef.detectChanges();
      }
    });
  }

  // ✅ NUEVO: Método de fallback que carga la orden actual si no hay órdenes disponibles
  private cargarOrdenActualComoFallback(): void {
    console.log('🔄 Intentando cargar orden actual como fallback...');
    
    const ordenActual = this.ordenVentaService.obtenerOrdenActual();
    
    if (ordenActual && ordenActual.estado === EstadoOrden.DISPONIBLEPARAPAGO) {
      console.log('✅ Orden actual disponible para pago encontrada:', ordenActual);
      
      const ordenConDetalles: OrdenConDetallesDto = {
        ...ordenActual,
        productos: []
      };
      
      this.ordenes = [ordenConDetalles];
      this.actualizarEstadisticas();
      this.seleccionarOrden(ordenConDetalles);
      
      this.mostrarInfo('Se cargó la orden actual disponible para pago.');
    } else {
      console.log('ℹ️ No hay orden actual disponible para pago');
      this.ordenes = [];
      this.mostrarInfo('No hay órdenes disponibles para pago. Estado requerido: ' + EstadoOrden.DISPONIBLEPARAPAGO);
    }
  }

  // ✅ NUEVO: Método para recargar las órdenes
  recargarOrdenes(): void {
    console.log('🔄 Recargando órdenes disponibles para pago...');
    this.cargarOrdenesDisponiblesParaPago();
  }

  // Métodos principales de interacción
  onSeccionCambiada(seccion: string): void {
    this.seccionActiva = seccion;
  }

  seleccionarOrden(orden: OrdenConDetallesDto): void {
    this.ordenSeleccionada = orden;
    this.updateOrderDetails();
    this.cdRef.detectChanges();
  }

  selectPaymentMethod(method: string): void {
    this.selectedPaymentMethod = method;
    
    const metodoInfo = this.metodosPago.find(m => m.nombre === method);
    this.showCardForm = metodoInfo?.requiereFormulario || false;
    
    this.cashAmount = 0;
    this.changeAmount = 0;
    this.resetCardForm();
    
    this.cdRef.detectChanges();
  }

  cancelOrder(): void {
    if (confirm('¿Está seguro de que desea cancelar esta orden?')) {
      this.ordenSeleccionada = null;
      this.selectedPaymentMethod = 'No seleccionado';
      this.showCardForm = false;
      this.resetCardForm();
      this.cashAmount = 0;
      this.changeAmount = 0;
      this.stopPaymentStatusChecking();
      this.stopWindowStatusChecking();
      this.paymentStateService.resetPayment();
      this.cdRef.detectChanges();
    }
  }

  async processPayment(): Promise<void> {
    if (!this.puedeProcesarPago()) {
      this.mostrarError('No se puede procesar el pago. Verifique los datos.');
      return;
    }

    // ✅ CORREGIDO: Validación adicional de la orden real
    if (!this.ordenSeleccionada) {
      this.mostrarError('No hay orden seleccionada para procesar pago.');
      return;
    }

    // Validar que la orden esté disponible para pago
    if (this.ordenSeleccionada.estado !== EstadoOrden.DISPONIBLEPARAPAGO) {
      this.mostrarError(`La orden #${this.ordenSeleccionada.numeroOrden} no está disponible para pago. Estado actual: ${this.ordenSeleccionada.estado}`);
      return;
    }

    const metodoInfo = this.metodosPago.find(m => m.nombre === this.selectedPaymentMethod);
    
    if (metodoInfo?.tipoMetodo === TipoMetodo.STRIPE) {
      await this.processStripePayment();
    } else {
      this.processTraditionalPayment();
    }
  }

  // Métodos de validación
  puedeProcesarPago(): boolean {
    if (!this.ordenSeleccionada) return false;
    if (this.selectedPaymentMethod === 'No seleccionado') return false;
    
    // Validar estado de la orden
    if (this.ordenSeleccionada.estado !== EstadoOrden.DISPONIBLEPARAPAGO) {
      return false;
    }
    
    if (this.selectedPaymentMethod === 'Efectivo') {
      return this.cashAmount >= this.ordenSeleccionada.total;
    }
    
    if (this.showCardForm) {
      return this.cardFormValid;
    }
    
    return true;
  }

  validateCardForm(): void {
    this.cardFormValid = !!(
      this.cardDetails.cardNumber && 
      this.cardDetails.cardName && 
      this.cardDetails.expiryDate && 
      this.cardDetails.cvv
    );
  }

  calculateChange(): void {
    if (this.ordenSeleccionada && this.cashAmount > 0) {
      this.changeAmount = this.cashAmount - this.ordenSeleccionada.total;
    } else {
      this.changeAmount = 0;
    }
  }

  esMetodoStripe(): boolean {
    const metodoInfo = this.metodosPago.find(m => m.nombre === this.selectedPaymentMethod);
    return metodoInfo?.tipoMetodo === TipoMetodo.STRIPE;
  }

  // Métodos de procesamiento de pagos
  private async processStripePayment(): Promise<void> {
    if (!this.ordenSeleccionada) return;

    this.cargando = true;
    this.mostrarExito('Procesando pago con Stripe...');

    try {
      this.paymentStateService.resetPayment();
      
      console.log('🚀 Iniciando pago Stripe para orden real:', {
        ordenId: this.ordenSeleccionada.id,
        numeroOrden: this.ordenSeleccionada.numeroOrden,
        total: this.ordenSeleccionada.total,
        cliente: this.ordenSeleccionada.cliente.nombre
      });

      const result = await this.stripePaymentService.redirectToStripeCheckout(
        this.ordenSeleccionada.total,
        this.ordenSeleccionada.id, // ✅ Pasar el ID real de la orden
        this.ordenSeleccionada.numeroOrden,
        this.ordenSeleccionada.cliente.correo,
        this.ordenSeleccionada.cliente.nombre
      );

      if (!result.success) {
        this.mostrarError(result.error || 'Error al iniciar el pago con Stripe');
        this.cargando = false;
        return;
      }

      if (!result.paymentIntentId || !result.clientSecret) {
        this.mostrarError('Error técnico: No se pudo inicializar el pago');
        this.cargando = false;
        return;
      }

      this.paymentStateService.startPayment(
        result.paymentIntentId,
        this.ordenSeleccionada.id,
        result.clientSecret
      );

      // ✅ CORREGIDO: Pasar el orderId a la ventana de Stripe
      this.stripeWindow = this.stripePaymentService.openStripeInNewWindow(
        result.clientSecret,
        result.paymentIntentId,
        this.ordenSeleccionada.id // ✅ Pasar el ID de la orden
      );

      console.log('🔍 DEBUG Ventana de Stripe abierta:', {
        windowOpened: !!this.stripeWindow,
        orderId: this.ordenSeleccionada.id,
        paymentIntentId: result.paymentIntentId
      });
      
      if (this.stripeWindow) {
        // ✅ AGREGADO: Iniciar verificación de estado de ventana
        this.startWindowStatusCheck(this.stripeWindow, result.paymentIntentId);
        
        setTimeout(() => {
          this.startPaymentStatusChecking();
        }, 3000);
      } else {
        this.mostrarError('No se pudo abrir la ventana de pago. Verifique los bloqueadores de ventanas emergentes.');
        this.cargando = false;
        this.paymentStateService.resetPayment();
      }

    } catch (error: any) {
      this.mostrarError('Error al procesar pago con Stripe: ' + error.message);
      this.cargando = false;
      this.paymentStateService.resetPayment();
    }
  }

  private processTraditionalPayment(): void {
    this.cargando = true;
    
    // ✅ CORREGIDO: Validación de la orden seleccionada
    if (!this.ordenSeleccionada) {
      this.mostrarError('No hay orden seleccionada para procesar pago');
      this.cargando = false;
      return;
    }

    const idOrdenAPagar = this.ordenSeleccionada.id;
    
    console.log('🔍 DEBUG Procesando pago tradicional para orden:', {
      id: idOrdenAPagar,
      numeroOrden: this.ordenSeleccionada.numeroOrden,
      metodo: this.selectedPaymentMethod
    });

    setTimeout(() => {
      // ✅ CORREGIDO: Actualizar el estado de la orden real en el backend
      this.ordenVentaService.marcarComoPagada(idOrdenAPagar).subscribe({
        next: (ordenActualizada) => {
          console.log('✅ Orden marcada como pagada en backend:', ordenActualizada);
          this.ordenSeleccionada!.estado = EstadoOrden.PAGADA;
          
          this.mostrarExito(`Pago en ${this.selectedPaymentMethod} procesado exitosamente. Orden #${this.ordenSeleccionada!.numeroOrden} ha sido pagada.`);
          this.actualizarEstadisticas();
          this.removerOrdenDeLista(idOrdenAPagar);
        },
        error: (error) => {
          console.error('❌ Error al marcar orden como pagada:', error);
          this.mostrarError('Error al actualizar el estado de la orden: ' + error.message);
        },
        complete: () => {
          this.cargando = false;
          this.resetAfterPayment();
          this.cdRef.detectChanges();
        }
      });
    }, 2000);
  }

  // ✅ NUEVO: Método para remover orden de la lista después del pago
  private removerOrdenDeLista(ordenId: number): void {
    this.ordenes = this.ordenes.filter(orden => orden.id !== ordenId);
    if (this.ordenSeleccionada?.id === ordenId) {
      this.ordenSeleccionada = null;
    }
    this.actualizarEstadisticas();
    this.cdRef.detectChanges();
  }

  // ✅ AGREGADO: Verificar estado de la ventana
  private startWindowStatusCheck(stripeWindow: Window, paymentIntentId: string): void {
    let checkCount = 0;
    const maxChecks = 60; // 30 segundos máximo
    
    this.windowCheckInterval = setInterval(() => {
      checkCount++;
      
      const windowStatus = this.stripePaymentService.checkWindowStatus(stripeWindow);
      
      console.log('🪟 Estado de ventana de Stripe:', {
        checkCount,
        isOpen: windowStatus.isOpen,
        isAccessible: windowStatus.isAccessible
      });
      
      // Si la ventana está cerrada y no hemos recibido notificación
      if (!windowStatus.isOpen && this.paymentStateService.isPaymentInProgress()) {
        console.log('🚪 Ventana de Stripe cerrada sin notificación - abortando pago');
        this.handleAbortedStripePayment(paymentIntentId, 'window_closed_abruptly');
        this.stopWindowStatusChecking();
        return;
      }
      
      // Si la ventana sigue abierta pero ya pasó el tiempo máximo
      if (checkCount >= maxChecks) {
        console.log('⏰ Tiempo máximo de verificación de ventana alcanzado');
        this.stopWindowStatusChecking();
        
        // Si el pago sigue en progreso, asumir que fue abortado
        if (this.paymentStateService.isPaymentInProgress()) {
          this.handleAbortedStripePayment(paymentIntentId, 'timeout');
        }
        return;
      }
      
      // Si el pago ya fue completado o falló, detener la verificación
      if (!this.paymentStateService.isPaymentInProgress()) {
        console.log('✅ Pago completado - deteniendo verificación de ventana');
        this.stopWindowStatusChecking();
      }
      
    }, 500); // Verificar cada 500ms
  }

  // ✅ AGREGADO: Detener verificación de ventana
  private stopWindowStatusChecking(): void {
    if (this.windowCheckInterval) {
      clearInterval(this.windowCheckInterval);
      this.windowCheckInterval = null;
    }
    this.stripeWindow = null;
  }

  // ✅ NUEVO: Método para cerrar la ventana de Stripe automáticamente
  private cerrarVentanaStripe(): void {
    if (this.stripeWindow && !this.stripeWindow.closed) {
      try {
        console.log('🚪 Intentando cerrar ventana de Stripe automáticamente...');
        
        // Enviar mensaje a la ventana hija para que se cierre automáticamente
        this.stripeWindow.postMessage({
          type: 'CLOSE_WINDOW_AUTOMATICALLY',
          reason: 'payment_success'
        }, '*');
        
        // También intentar cerrar directamente después de un breve delay
        setTimeout(() => {
          if (this.stripeWindow && !this.stripeWindow.closed) {
            try {
              this.stripeWindow.close();
              console.log('✅ Ventana de Stripe cerrada automáticamente');
            } catch (error) {
              console.warn('⚠️ No se pudo cerrar la ventana automáticamente:', error);
            }
          }
        }, 1000);
        
      } catch (error) {
        console.warn('⚠️ Error al intentar cerrar ventana automáticamente:', error);
      }
    }
  }

  // Métodos auxiliares
  private startPaymentStatusChecking(): void {
    if (this.paymentStateService.isPaymentInProgress()) {
      return;
    }

    const currentPaymentIntentId = this.paymentStateService.getCurrentPaymentIntentId();
    
    if (!currentPaymentIntentId) {
      this.stopPaymentStatusChecking();
      this.mostrarError('Error: No se pudo iniciar la verificación del pago');
      return;
    }

    let checkCount = 0;
    const maxChecks = 20;
    
    this.paymentStatusInterval = setInterval(async () => {
      const paymentIntentId = this.paymentStateService.getCurrentPaymentIntentId();
      
      if (!paymentIntentId) {
        this.stopPaymentStatusChecking();
        this.mostrarError('Error: Se perdió la referencia del pago');
        return;
      }

      checkCount++;
      
      if (checkCount > maxChecks) {
        this.stopPaymentStatusChecking();
        this.mostrarError('Tiempo de espera agotado. Verifique el estado del pago manualmente.');
        return;
      }

      try {
        const result = await this.stripePaymentService.checkPaymentStatus(paymentIntentId);
        
        if (result.success) {
          this.handleSuccessfulStripePayment(paymentIntentId, this.ordenSeleccionada?.id || 0);
          this.stopPaymentStatusChecking();
        } else if (result.status === PaymentStatus.CANCELED || 
                  result.status === PaymentStatus.FAILED || 
                  result.error) {
          this.handleFailedStripePayment(result.error || 'El pago fue cancelado');
          this.stopPaymentStatusChecking();
        }
      } catch (error) {
        if (checkCount >= maxChecks) {
          this.stopPaymentStatusChecking();
          this.mostrarError('Error al verificar el estado del pago. Contacte soporte.');
        }
      }
    }, 3000);
  }

  private stopPaymentStatusChecking(): void {
    if (this.paymentStatusInterval) {
      clearInterval(this.paymentStatusInterval);
      this.paymentStatusInterval = null;
    }
  }

  private handleSuccessfulStripePayment(paymentIntentId: string, orderId: number): void {
    this.paymentStateService.markPaymentSuccess();
    
    // ✅ AGREGADO: Cerrar ventana automáticamente antes de procesar
    this.cerrarVentanaStripe();
    
    // ✅ SOLUCIÓN: Usar siempre la orden seleccionada actual
    if (!this.ordenSeleccionada) {
      console.error('❌ No hay orden seleccionada para marcar como pagada');
      this.mostrarError('Error: No se encontró la orden a marcar como pagada');
      this.cargando = false;
      this.resetAfterPayment();
      this.cdRef.detectChanges();
      return;
    }

    const idOrdenAPagar = this.ordenSeleccionada.id;
    
    console.log('🔍 DEBUG Marcando orden como pagada:', {
      paymentIntentId,
      orderIdFromEvent: orderId,
      ordenSeleccionadaId: idOrdenAPagar,
      numeroOrden: this.ordenSeleccionada.numeroOrden
    });

    if (!idOrdenAPagar || idOrdenAPagar <= 0) {
      console.error('❌ ID de orden inválido:', idOrdenAPagar);
      this.mostrarError('Error: ID de orden inválido');
      this.cargando = false;
      this.resetAfterPayment();
      this.cdRef.detectChanges();
      return;
    }

    // ✅ CORREGIDO: Actualizar el estado de la orden real en el backend
    this.ordenVentaService.marcarComoPagada(idOrdenAPagar).subscribe({
      next: (ordenActualizada) => {
        console.log('✅ Orden marcada como pagada exitosamente:', ordenActualizada);
        
        // Actualizar la orden en la lista local
        if (this.ordenSeleccionada) {
          this.ordenSeleccionada.estado = EstadoOrden.PAGADA;
          // Reassign a new object with a definite id to satisfy typing and trigger change detection
          this.ordenSeleccionada = { ...this.ordenSeleccionada, id: this.ordenSeleccionada.id! };
        }
        
        this.mostrarExito(`¡Pago con Stripe procesado exitosamente! Orden #${ordenActualizada.numeroOrden} ha sido pagada.`);
        this.actualizarEstadisticas();
        this.removerOrdenDeLista(idOrdenAPagar);
      },
      error: (error) => {
        console.error('❌ Error al marcar orden como pagada:', error);
        
        // Mostrar más detalles del error
        let mensajeError = 'Error al actualizar el estado de la orden: ';
        if (error.error?.mensaje) {
          mensajeError += error.error.mensaje;
        } else {
          mensajeError += error.message;
        }
        
        // Mostrar la URL que falló para debug
        console.error('URL que falló:', error.url);
        
        this.mostrarError(mensajeError);
      },
      complete: () => {
        this.cargando = false;
        this.resetAfterPayment();
        this.cdRef.detectChanges();
      }
    });
  }

  private handleFailedStripePayment(error: string): void {
    this.paymentStateService.markPaymentFailed();
    this.mostrarError(`Pago con Stripe fallido: ${error}`);
    this.cargando = false;
    this.resetAfterPayment();
    this.cdRef.detectChanges();
  }

  // Métodos de utilidad
  private updateOrderDetails(): void {
    if (this.ordenSeleccionada) {
      this.currentOrderDetails = {
        seller: this.ordenSeleccionada.vendedor.nombre,
        client: this.ordenSeleccionada.cliente.nombre,
        date: this.formatearFecha(this.ordenSeleccionada.fecha),
        status: this.obtenerEstadoTexto(this.ordenSeleccionada.estado),
        taxes: this.formatCurrency(this.ordenSeleccionada.impuestos),
        total: this.formatCurrency(this.ordenSeleccionada.subtotal),
        toPay: this.formatCurrency(this.ordenSeleccionada.total)
      };
    } else {
      this.currentOrderDetails = {
        seller: 'No disponible',
        client: 'No disponible',
        date: new Date().toLocaleDateString('es-ES'),
        status: 'NO SELECCIONADA',
        taxes: '$0',
        total: '$0',
        toPay: '$0'
      };
    }
  }

  private actualizarEstadisticas(): void {
    this.totalOrdenes = this.ordenes.length;
    this.ordenesPendientes = this.ordenes.filter(o => 
      o.estado === EstadoOrden.PENDIENTE || o.estado === EstadoOrden.DISPONIBLEPARAPAGO
    ).length;
    this.ordenesPagadas = this.ordenes.filter(o => o.estado === EstadoOrden.PAGADA).length;
  }

  private resetCardForm(): void {
    this.cardDetails = {
      cardNumber: '',
      cardName: '',
      expiryDate: '',
      cvv: '',
      saveCard: false
    };
    this.cardFormValid = false;
  }

  private resetAfterPayment(): void {
    this.selectedPaymentMethod = 'No seleccionado';
    this.showCardForm = false;
    this.resetCardForm();
    this.cashAmount = 0;
    this.changeAmount = 0;
    
    setTimeout(() => {
      this.paymentStateService.resetPayment();
    }, 2000);
    
    this.updateOrderDetails();
  }

  private mostrarExito(mensaje: string): void {
    this.successMessage = mensaje;
    this.errorMessage = '';
    setTimeout(() => this.successMessage = '', 5000);
    this.cdRef.detectChanges();
  }

  private mostrarError(mensaje: string): void {
    this.errorMessage = mensaje;
    this.successMessage = '';
    setTimeout(() => this.errorMessage = '', 5000);
    this.cdRef.detectChanges();
  }

  // ✅ NUEVO: Método para mostrar mensajes informativos
  private mostrarInfo(mensaje: string): void {
    this.successMessage = mensaje;
    this.errorMessage = '';
    setTimeout(() => this.successMessage = '', 5000);
    this.cdRef.detectChanges();
  }

  private formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  private obtenerEstadoTexto(estado: EstadoOrden): string {
    const estados = {
      [EstadoOrden.PENDIENTE]: 'PENDIENTE',
      [EstadoOrden.AGREGANDOPRODUCTOS]: 'AGREGANDO PRODUCTOS',
      [EstadoOrden.DISPONIBLEPARAPAGO]: 'DISPONIBLE PARA PAGO',
      [EstadoOrden.PAGADA]: 'PAGADA',
      [EstadoOrden.ENTREGADA]: 'ENTREGADA',
      [EstadoOrden.CERRADA]: 'CERRADA'
    };
    return estados[estado] || estado;
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  }

  // ✅ NUEVO: Método para debug
  debugOrdenes(): void {
    console.group('🔍 DEBUG - Órdenes Disponibles para Pago');
    console.log('Órdenes cargadas:', this.ordenes);
    console.log('Orden seleccionada:', this.ordenSeleccionada);
    console.log('Total de órdenes:', this.totalOrdenes);
    console.log('Órdenes pendientes:', this.ordenesPendientes);
    console.log('Órdenes pagadas:', this.ordenesPagadas);
    console.groupEnd();
  }
}