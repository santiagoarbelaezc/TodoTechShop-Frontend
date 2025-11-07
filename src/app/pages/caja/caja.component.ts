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
import { PagoService } from '../../services/pago.service';
import { StripePaymentService } from '../../services/stripe-payment.service';
import { PaymentStateService } from '../../services/payment-state.service'; // ✅ NUEVO
import { OrdenDto, OrdenConDetallesDto } from '../../models/orden-venta/ordenventa.dto';
import { ClienteDto } from '../../models/cliente.dto';
import { UsuarioDto } from '../../models/usuario/usuario.dto';
import { ProductoDto } from '../../models/producto/producto.dto';
import { CategoriaDto } from '../../models/categoria.dto';
import { EstadoProducto } from '../../models/enums/estado-producto.enum';
import { DetalleOrdenDto } from '../../models/detalle-orden/detalle-orden.dto';
import { NavbarCajaComponent } from './navbar-caja/navbar-caja.component';

// Enums y DTOs para el pago
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

export interface PaymentIntentRequestDto {
  amount: number;
  currency: string;
  paymentMethodType: TipoMetodo;
  orderId: number;
  customerEmail?: string;
  metadata?: { [key: string]: string };
}

export interface PaymentIntentResponseDto {
  clientSecret?: string;
  paymentIntentId?: string;
  status?: PaymentStatus;
  requiresAction?: boolean;
  nextActionType?: string;
  errorMessage?: string;
  additionalData?: { [key: string]: any };
}

export interface PaymentConfirmationDto {
  paymentIntentId: string;
  paymentMethodId?: string;
  confirmationData?: { [key: string]: any };
}

// Interfaces del componente
interface MenuItem {
  icon: string;
  text: string;
  active: boolean;
  action?: string;
}

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
    seller: 'Juan Pérez',
    client: 'Cliente Ejemplo',
    date: new Date().toLocaleDateString('es-ES'),
    status: 'PENDIENTE',
    taxes: '$0',
    total: '$0',
    toPay: '$0'
  };

  // Métodos de pago actualizados según el backend
  metodosPago: MetodoPagoInfo[] = [
    { 
      nombre: 'Stripe (Tarjeta)', 
      icono: 'assets/stripe.png', 
      tipoMetodo: TipoMetodo.STRIPE, 
      requiereFormulario: false 
    },
    { 
      nombre: 'PayPal', 
      icono: 'assets/paypal.png', 
      tipoMetodo: TipoMetodo.PAYPAL, 
      requiereFormulario: true 
    },
    { 
      nombre: 'MercadoPago', 
      icono: 'assets/mercadopago.png', 
      tipoMetodo: TipoMetodo.MERCADOPAGO, 
      requiereFormulario: true 
    },
    { 
      nombre: 'Efectivo', 
      icono: 'assets/efectivo.png', 
      tipoMetodo: TipoMetodo.STRIPE, // Temporal hasta agregar EFECTIVO al enum
      requiereFormulario: false 
    }
  ];

  menuItems: MenuItem[] = [
    { icon: 'fa-receipt', text: 'Órdenes de Venta', active: true, action: 'ordenes' },
    { icon: 'fa-cash-register', text: 'Registrar Pago', active: false, action: 'registrarPago' },
    { icon: 'fa-history', text: 'Historial de Transacciones', active: false, action: 'listaPagos' },
    { icon: 'fa-exchange-alt', text: 'Reembolsos', active: false },
    { icon: 'fa-coins', text: 'Caja Diaria', active: false },
    { icon: 'fa-cog', text: 'Configuración', active: false }
  ];

  cashAmount: number = 0;
  changeAmount: number = 0;
  
  successMessage: string = '';
  errorMessage: string = '';
  cargando: boolean = false;

  // ✅ ELIMINADO: private stripePaymentIntentId: string | null = null;
  private paymentStatusInterval: any;

  constructor(
    private ordenVentaService: OrdenVentaService, 
    private pagoService: PagoService,
    private stripePaymentService: StripePaymentService,
    private paymentStateService: PaymentStateService, // ✅ NUEVO
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarOrdenQuemada();
    window.addEventListener('message', this.handleStripeMessage.bind(this));
  }

  ngOnDestroy(): void {
    this.stopPaymentStatusChecking();
    window.removeEventListener('message', this.handleStripeMessage.bind(this));
  }

  private handleStripeMessage(event: MessageEvent): void {
    if (event.data?.type === 'STRIPE_PAYMENT_SUCCESS') {
      this.handleSuccessfulStripePayment(event.data.paymentIntentId);
    } else if (event.data?.type === 'STRIPE_PAYMENT_FAILED') {
      this.handleFailedStripePayment(event.data.error);
    }
  }

  private cargarOrdenQuemada(): void {
    const categoriaComputacion: CategoriaDto = {
      id: 1,
      nombre: 'Computación'
    };

    const productos: ProductoDto[] = [
      {
        id: 1,
        nombre: 'Laptop HP Pavilion 15',
        codigo: 'LP-HP-PAV-001',
        descripcion: 'Laptop HP Pavilion 15.6" Intel Core i5, 8GB RAM, 512GB SSD',
        categoria: categoriaComputacion,
        precio: 2500000,
        stock: 10,
        imagenUrl: 'assets/laptop-hp.jpg',
        marca: 'HP',
        garantia: 12,
        estado: EstadoProducto.ACTIVO
      },
      {
        id: 2,
        nombre: 'Mouse Inalámbrico Logitech',
        codigo: 'MS-LOG-WLS-002',
        descripcion: 'Mouse inalámbrico Logitech M170, 2.4GHz, 12 meses de batería',
        categoria: categoriaComputacion,
        precio: 45000,
        stock: 25,
        imagenUrl: 'assets/mouse-logitech.jpg',
        marca: 'Logitech',
        garantia: 12,
        estado: EstadoProducto.ACTIVO
      }
    ];

    const cliente: ClienteDto = {
      id: 1,
      nombre: 'María González Rodríguez',
      cedula: '123456789',
      correo: 'maria.gonzalez@email.com',
      telefono: '+57 300 123 4567',
      direccion: 'Calle 123 #45-67, Bogotá, Colombia',
      tipoCliente: 'NATURAL',
      descuentoAplicable: 5,
      fechaRegistro: '2024-01-15'
    };

    const vendedor: UsuarioDto = {
      id: 1,
      nombre: 'Carlos Andrés López',
      cedula: '987654321',
      correo: 'carlos.lopez@todotech.com',
      telefono: '+57 301 987 6543',
      nombreUsuario: 'clopez',
      contrasena: '********',
      cambiarContrasena: false,
      tipoUsuario: 'VENDEDOR',
      fechaCreacion: new Date('2023-05-10'),
      estado: true
    };

    const detalles: DetalleOrdenDto[] = [
      {
        id: 1,
        producto: productos[0],
        cantidad: 1,
        precioUnitario: 2500000,
        subtotal: 2500000
      },
      {
        id: 2,
        producto: productos[1],
        cantidad: 2,
        precioUnitario: 45000,
        subtotal: 90000
      }
    ];

    const subtotal = detalles.reduce((sum, detalle) => sum + detalle.subtotal, 0);
    const descuento = subtotal * 0.05;
    const impuestos = (subtotal - descuento) * 0.19;
    const total = subtotal - descuento + impuestos;

    const ordenQuemada: OrdenConDetallesDto = {
      id: 1001,
      numeroOrden: 'ORD-2024-1001',
      fecha: new Date().toISOString().split('T')[0],
      cliente: cliente,
      vendedor: vendedor,
      productos: detalles,
      estado: EstadoOrden.DISPONIBLEPARAPAGO,
      subtotal: subtotal,
      descuento: descuento,
      impuestos: impuestos,
      total: total,
      observaciones: 'Cliente solicita factura electrónica'
    };

    this.ordenes = [ordenQuemada];
    this.totalOrdenes = this.ordenes.length;
    this.ordenesPendientes = this.ordenes.filter(o => 
      o.estado === EstadoOrden.PENDIENTE || o.estado === EstadoOrden.DISPONIBLEPARAPAGO
    ).length;
    this.ordenesPagadas = this.ordenes.filter(o => o.estado === EstadoOrden.PAGADA).length;

    this.seleccionarOrden(ordenQuemada);
  }

  onSeccionCambiada(seccion: string): void {
    this.seccionActiva = seccion;
  }

  seleccionarOrden(orden: OrdenConDetallesDto): void {
    this.ordenSeleccionada = orden;
    this.updateOrderDetails();
    this.cdRef.detectChanges();
  }

  private updateOrderDetails(): void {
    if (this.ordenSeleccionada) {
      const totalConIva = this.ordenSeleccionada.total;

      this.currentOrderDetails = {
        seller: this.ordenSeleccionada.vendedor.nombre,
        client: this.ordenSeleccionada.cliente.nombre,
        date: this.formatearFecha(this.ordenSeleccionada.fecha),
        status: this.obtenerEstadoTexto(this.ordenSeleccionada.estado),
        taxes: this.formatCurrency(this.ordenSeleccionada.impuestos),
        total: this.formatCurrency(this.ordenSeleccionada.subtotal),
        toPay: this.formatCurrency(totalConIva)
      };
    }
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

  selectItem(selectedItem: MenuItem): void {
    this.menuItems.forEach(item => item.active = false);
    selectedItem.active = true;
    
    if (selectedItem.action) {
      this.seccionActiva = selectedItem.action;
    }
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

  cancelOrder(): void {
    if (confirm('¿Está seguro de que desea cancelar esta orden?')) {
      this.ordenSeleccionada = null;
      this.selectedPaymentMethod = 'No seleccionado';
      this.showCardForm = false;
      this.resetCardForm();
      this.cashAmount = 0;
      this.changeAmount = 0;
      this.stopPaymentStatusChecking();
      this.paymentStateService.resetPayment(); // ✅ NUEVO
      this.cdRef.detectChanges();
    }
  }

  async processPayment(): Promise<void> {
    if (!this.puedeProcesarPago()) {
      this.mostrarError('No se puede procesar el pago. Verifique los datos.');
      return;
    }

    const metodoInfo = this.metodosPago.find(m => m.nombre === this.selectedPaymentMethod);
    
    if (metodoInfo?.tipoMetodo === TipoMetodo.STRIPE) {
      await this.processStripePayment();
    } else {
      this.processTraditionalPayment();
    }
  }

  private async processStripePayment(): Promise<void> {
    if (!this.ordenSeleccionada) return;

    this.cargando = true;
    this.mostrarExito('Procesando pago con Stripe...');
    console.log('💳 Iniciando pago con Stripe para orden:', this.ordenSeleccionada.numeroOrden);

    try {
      // ✅ CORREGIDO: Resetear estado anterior usando el servicio
      this.paymentStateService.resetPayment();
      
      const result = await this.stripePaymentService.redirectToStripeCheckout(
        this.ordenSeleccionada.total,
        this.ordenSeleccionada.id,
        this.ordenSeleccionada.numeroOrden,
        this.ordenSeleccionada.cliente.correo,
        this.ordenSeleccionada.cliente.nombre
      );

      console.log('📋 Resultado de redirectToStripeCheckout:', {
        success: result.success,
        paymentIntentId: result.paymentIntentId,
        clientSecret: result.clientSecret ? '***' : 'No disponible',
        error: result.error
      });

      if (!result.success) {
        console.error('❌ Error al crear payment intent:', result.error);
        this.mostrarError(result.error || 'Error al iniciar el pago con Stripe');
        this.cargando = false;
        return;
      }

      // ✅ CORREGIDO: Verificación más robusta
      if (!result.paymentIntentId || result.paymentIntentId.trim() === '') {
        console.error('❌ No se recibió paymentIntentId válido del servicio');
        this.mostrarError('Error: No se pudo generar el ID de pago');
        this.cargando = false;
        return;
      }

      if (!result.clientSecret) {
        console.error('❌ No se recibió clientSecret del servicio');
        this.mostrarError('Error técnico: No se pudo inicializar el pago');
        this.cargando = false;
        return;
      }

      // ✅ CORREGIDO: Guardar en el servicio de estado
      this.paymentStateService.startPayment(
        result.paymentIntentId,
        this.ordenSeleccionada.id,
        result.clientSecret
      );

      console.log('✅ Payment Intent guardado en servicio:', result.paymentIntentId);

      console.log('🪟 Abriendo ventana de Stripe con clientSecret');
      
      const windowOpened = this.stripePaymentService.openStripeInNewWindow(
        result.clientSecret,
        result.paymentIntentId
      );
      
      if (windowOpened) {
        // ✅ CORREGIDO: Iniciar verificación después de un breve delay
        setTimeout(() => {
          this.startPaymentStatusChecking();
        }, 3000);
      } else {
        console.error('❌ No se pudo abrir la ventana de Stripe');
        this.mostrarError('No se pudo abrir la ventana de pago. Verifique los bloqueadores de ventanas emergentes.');
        this.cargando = false;
        this.paymentStateService.resetPayment();
      }

    } catch (error: any) {
      console.error('❌ Error en processStripePayment:', error);
      this.mostrarError('Error al procesar pago con Stripe: ' + error.message);
      this.cargando = false;
      this.paymentStateService.resetPayment();
    }
  }

  private startPaymentStatusChecking(): void {
    // ✅ CORREGIDO: Verificar usando el servicio
    if (this.paymentStateService.isPaymentInProgress()) {
      console.log('⏸️ Ya hay una verificación en curso, omitiendo...');
      return;
    }

    const currentPaymentIntentId = this.paymentStateService.getCurrentPaymentIntentId();
    
    if (!currentPaymentIntentId || currentPaymentIntentId.trim() === '') {
      console.error('❌ No hay paymentIntentId válido para verificar. Deteniendo verificación.');
      this.stopPaymentStatusChecking();
      this.mostrarError('Error: No se pudo iniciar la verificación del pago');
      return;
    }

    console.log('🔄 Iniciando verificación de estado para:', currentPaymentIntentId);
    
    let checkCount = 0;
    const maxChecks = 20;
    
    this.paymentStatusInterval = setInterval(async () => {
      // ✅ CORREGIDO: Obtener del servicio en cada iteración
      const paymentIntentId = this.paymentStateService.getCurrentPaymentIntentId();
      
      if (!paymentIntentId) {
        console.error('❌ paymentIntentId no disponible en el servicio');
        this.stopPaymentStatusChecking();
        this.mostrarError('Error: Se perdió la referencia del pago');
        return;
      }

      checkCount++;
      
      if (checkCount > maxChecks) {
        console.warn('⏰ Límite de verificaciones alcanzado. Deteniendo...');
        this.stopPaymentStatusChecking();
        this.mostrarError('Tiempo de espera agotado. Verifique el estado del pago manualmente.');
        return;
      }

      try {
        console.log(`📡 Verificando estado del pago (intento ${checkCount}/${maxChecks})...`);
        
        const result = await this.stripePaymentService.checkPaymentStatus(paymentIntentId);
        
        console.log('📊 Resultado del estado:', {
          success: result.success,
          status: result.status,
          paymentIntentId: result.paymentIntentId,
          error: result.error
        });
        
        if (result.success) {
          console.log('✅ Pago exitoso detectado');
          this.handleSuccessfulStripePayment(paymentIntentId);
          this.stopPaymentStatusChecking();
        } else if (result.status === PaymentStatus.CANCELED || 
                  result.status === PaymentStatus.FAILED || 
                  result.error) {
          console.error('❌ Pago fallido o cancelado:', result.error);
          this.handleFailedStripePayment(result.error || 'El pago fue cancelado');
          this.stopPaymentStatusChecking();
        } else {
          console.log('⏳ Pago aún en proceso, estado:', result.status || 'desconocido');
        }
      } catch (error) {
        console.error('❌ Error al verificar estado:', error);
        
        if (checkCount >= maxChecks) {
          this.stopPaymentStatusChecking();
          this.mostrarError('Error al verificar el estado del pago. Contacte soporte.');
        }
      }
    }, 3000);
  }

  private stopPaymentStatusChecking(): void {
    if (this.paymentStatusInterval) {
      console.log('🛑 Deteniendo verificación de estado');
      clearInterval(this.paymentStatusInterval);
      this.paymentStatusInterval = null;
    }
  }

  private handleSuccessfulStripePayment(paymentIntentId: string): void {
    console.log('🎉 Pago exitoso procesado:', paymentIntentId);
    
    // ✅ CORREGIDO: Marcar como exitoso en el servicio PRIMERO
    this.paymentStateService.markPaymentSuccess();
    
    if (this.ordenSeleccionada) {
      this.ordenSeleccionada.estado = EstadoOrden.PAGADA;
      this.mostrarExito(`¡Pago con Stripe procesado exitosamente! Orden #${this.ordenSeleccionada.numeroOrden} ha sido pagada.`);
      this.actualizarEstadisticas();
    }
    
    this.cargando = false;
    this.resetAfterPayment();
    this.cdRef.detectChanges();
  }

  private handleFailedStripePayment(error: string): void {
    console.error('💥 Pago fallido:', error);
    
    // ✅ CORREGIDO: Marcar como fallido en el servicio
    this.paymentStateService.markPaymentFailed();
    
    this.mostrarError(`Pago con Stripe fallido: ${error}`);
    this.cargando = false;
    this.resetAfterPayment();
    this.cdRef.detectChanges();
  }

  private processTraditionalPayment(): void {
    this.cargando = true;
    
    setTimeout(() => {
      if (this.ordenSeleccionada) {
        this.ordenSeleccionada.estado = EstadoOrden.PAGADA;
        this.mostrarExito(`Pago en ${this.selectedPaymentMethod} procesado exitosamente. Orden #${this.ordenSeleccionada.numeroOrden} ha sido pagada.`);
        this.actualizarEstadisticas();
      }
      
      this.cargando = false;
      this.resetAfterPayment();
      this.cdRef.detectChanges();
    }, 2000);
  }

  private actualizarEstadisticas(): void {
    this.ordenesPendientes = this.ordenes.filter(o => 
      o.estado === EstadoOrden.PENDIENTE || o.estado === EstadoOrden.DISPONIBLEPARAPAGO
    ).length;
    this.ordenesPagadas = this.ordenes.filter(o => o.estado === EstadoOrden.PAGADA).length;
  }

  puedeProcesarPago(): boolean {
    if (!this.ordenSeleccionada) return false;
    if (this.selectedPaymentMethod === 'No seleccionado') return false;
    
    const metodoInfo = this.metodosPago.find(m => m.nombre === this.selectedPaymentMethod);
    
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

  private resetAfterPayment(): void {
    this.selectedPaymentMethod = 'No seleccionado';
    this.showCardForm = false;
    this.resetCardForm();
    this.cashAmount = 0;
    this.changeAmount = 0;
    
    // ✅ CORREGIDO: Resetear el servicio después de un delay seguro
    setTimeout(() => {
      this.paymentStateService.resetPayment();
      console.log('🧹 Estado de pago reseteado completamente');
    }, 2000);
    
    this.updateOrderDetails();
  }

  private mostrarExito(mensaje: string): void {
    this.successMessage = mensaje;
    this.errorMessage = '';
    setTimeout(() => this.successMessage = '', 5000);
  }

  private mostrarError(mensaje: string): void {
    this.errorMessage = mensaje;
    this.successMessage = '';
    setTimeout(() => this.errorMessage = '', 5000);
  }

  esMetodoStripe(): boolean {
    const metodoInfo = this.metodosPago.find(m => m.nombre === this.selectedPaymentMethod);
    return metodoInfo?.tipoMetodo === TipoMetodo.STRIPE;
  }

  getTotalConIva(): number {
    return this.ordenSeleccionada?.total || 0;
  }

  // ✅ NUEVO: Método para debug del estado
  debugPaymentState(): void {
    this.paymentStateService.debugState();
  }
}