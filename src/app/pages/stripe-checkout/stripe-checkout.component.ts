import { Component, OnInit, OnDestroy, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { StripePaymentService } from '../../services/payments/stripe-payment.service';
import { PaymentGatewayService } from '../../services/payments/payment-gateway.service';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

// Importar Stripe.js
import { loadStripe, Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js';

@Component({
  selector: 'app-stripe-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stripe-checkout.component.html',
  styleUrls: ['./stripe-checkout.component.css']
})
export class StripeCheckoutComponent implements OnInit, OnDestroy, AfterViewInit {
  cargando = true;
  procesando = false;
  error: string | null = null;
  clientSecret: string = '';
  paymentIntentId: string = '';
  cardholderName: string = '';

  // Stripe
  stripe: Stripe | null = null;
  elements: StripeElements | null = null;
  card: StripeCardElement | null = null;
  cardErrors: string = '';
  cardElementMounted: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private stripePaymentService: StripePaymentService,
    private paymentGatewayService: PaymentGatewayService,
    private cdRef: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    console.log('🔄 StripeCheckoutComponent - Inicializando componente...');
    
    // ✅ AGREGADO: Escuchar mensajes de cierre automático
    window.addEventListener('message', this.handleCloseWindowMessage.bind(this));
    
    // ✅ MODIFICADO: Remover beforeunload para evitar diálogos de confirmación
    // window.addEventListener('beforeunload', this.handleWindowClose.bind(this));
    
    // Obtener parámetros de la URL
    this.clientSecret = this.route.snapshot.queryParamMap.get('clientSecret') || '';
    this.paymentIntentId = this.route.snapshot.queryParamMap.get('paymentIntentId') || '';

    console.log('📋 Parámetros recibidos:', {
      hasClientSecret: !!this.clientSecret,
      hasPaymentIntentId: !!this.paymentIntentId,
      paymentIntentId: this.paymentIntentId?.substring(0, 20) + '...',
      clientSecretPrefix: this.clientSecret?.substring(0, 20) + '...'
    });

    // Validar parámetros críticos
    if (!this.clientSecret || !this.clientSecret.includes('_secret_')) {
      this.error = 'ClientSecret inválido o faltante. No se puede procesar el pago.';
      this.cargando = false;
      this.cdRef.detectChanges();
      return;
    }

    if (!this.paymentIntentId || !this.paymentIntentId.startsWith('pi_')) {
      this.error = 'PaymentIntentId inválido o faltante. No se puede procesar el pago.';
      this.cargando = false;
      this.cdRef.detectChanges();
      return;
    }

    console.log('✅ Parámetros válidos, procediendo con inicialización...');
    await this.initializeStripe();
  }

  async ngAfterViewInit() {
    console.log('🎯 ngAfterViewInit - Vista lista para inicializar elementos');
    // Esperar un ciclo para asegurar que el DOM esté completamente renderizado
    setTimeout(() => {
      this.initializeCardElement();
    }, 100);
  }

  async initializeStripe() {
    try {
      console.log('💳 Inicializando Stripe...');
      
      // Cargar Stripe
      this.stripe = await loadStripe(environment.stripePublishableKey);
      
      if (!this.stripe) {
        throw new Error('No se pudo cargar Stripe.js');
      }

      console.log('✅ Stripe.js cargado correctamente');

      // Crear elementos de Stripe
      this.elements = this.stripe.elements({
        clientSecret: this.clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#635bff',
            colorBackground: '#ffffff',
            colorText: '#32325d',
            colorDanger: '#df1b41',
            fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
            spacingUnit: '4px',
            borderRadius: '8px'
          },
          rules: {
            '.Input': {
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '12px 16px',
              fontSize: '16px',
              lineHeight: '1.5'
            },
            '.Input:focus': {
              borderColor: '#635bff',
              boxShadow: '0 0 0 1px #635bff'
            },
            '.Label': {
              fontWeight: '600',
              marginBottom: '8px'
            }
          }
        }
      });

      console.log('✅ Stripe Elements creados correctamente');
      this.cargando = false;
      this.cdRef.detectChanges();

    } catch (error: any) {
      console.error('❌ Error inicializando Stripe:', error);
      this.error = 'Error al inicializar el sistema de pago: ' + error.message;
      this.cargando = false;
      this.cdRef.detectChanges();
    }
  }

  async initializeCardElement() {
    if (!this.stripe || !this.elements) {
      console.error('❌ Stripe o Elements no están inicializados');
      // Reintentar después de un breve delay
      setTimeout(() => {
        if (this.stripe && this.elements) {
          this.initializeCardElement();
        }
      }, 500);
      return;
    }

    // Verificar que el contenedor exista en el DOM
    const cardElement = document.getElementById('card-element');
    if (!cardElement) {
      console.error('❌ No se encontró el elemento #card-element en el DOM');
      setTimeout(() => this.initializeCardElement(), 100);
      return;
    }

    try {
      console.log('🎯 Inicializando elemento de tarjeta...');

      // Destruir elemento anterior si existe
      if (this.card) {
        try {
          this.card.unmount();
          this.card.destroy();
        } catch (error) {
          console.warn('⚠️ Error al limpiar elemento anterior:', error);
        }
      }

      // Crear elemento de tarjeta con configuración mejorada
      this.card = this.elements.create('card', {
        style: {
          base: {
            fontSize: '16px',
            color: '#32325d',
            fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontSmoothing: 'antialiased',
            '::placeholder': {
              color: '#aab7c4',
            },
            '::selection': {
              backgroundColor: '#e6f3ff'
            }
          },
          invalid: {
            color: '#fa755a',
            iconColor: '#fa755a'
          },
          complete: {
            color: '#38a169',
            iconColor: '#38a169'
          }
        },
        hidePostalCode: true,
        classes: {
          base: 'stripe-card-input',
          complete: 'stripe-card-complete',
          empty: 'stripe-card-empty',
          focus: 'stripe-card-focus',
          invalid: 'stripe-card-invalid',
          webkitAutofill: 'stripe-card-autofill'
        }
      });

      // Montar el elemento en el DOM
      this.card.mount('#card-element');
      this.cardElementMounted = true;

      console.log('✅ Elemento de tarjeta montado correctamente');

      // Manejar cambios en la validación
      this.card.on('change', (event) => {
        console.log('🔄 Cambio en elemento de tarjeta:', {
          complete: event.complete,
          brand: event.brand,
          empty: event.empty,
          error: event.error
        });

        if (event.error) {
          this.cardErrors = event.error.message;
          console.log('❌ Error en tarjeta:', event.error.message);
        } else {
          this.cardErrors = '';
          if (event.complete) {
            console.log('✅ Tarjeta válida y completa');
          }
        }
        this.cdRef.detectChanges();
      });

      // Manejar eventos adicionales para mejor UX
      this.card.on('focus', () => {
        console.log('🔍 Elemento de tarjeta enfocado');
        const cardElement = document.getElementById('card-element');
        if (cardElement) {
          cardElement.classList.add('focused');
        }
      });

      this.card.on('blur', () => {
        console.log('👁️ Elemento de tarjeta perdió foco');
        const cardElement = document.getElementById('card-element');
        if (cardElement) {
          cardElement.classList.remove('focused');
        }
      });

      this.card.on('ready', () => {
        console.log('🎉 Elemento de tarjeta listo para usar');
      });

    } catch (error: any) {
      console.error('❌ Error creando elemento de tarjeta:', error);
      this.error = 'Error al crear el formulario de pago: ' + error.message;
      this.cdRef.detectChanges();
    }
  }

  async procesarPago() {
    if (this.procesando || !this.stripe || !this.elements || !this.card || !this.cardholderName) {
      console.warn('⚠️ No se puede procesar pago - datos incompletos', {
        procesando: this.procesando,
        stripe: !!this.stripe,
        elements: !!this.elements,
        card: !!this.card,
        cardElementMounted: this.cardElementMounted,
        cardholderName: !!this.cardholderName
      });
      return;
    }

    if (this.cardErrors) {
      this.error = 'Por favor, corrige los errores en la tarjeta antes de continuar.';
      return;
    }

    if (!this.cardholderName.trim()) {
      this.error = 'Por favor, ingresa el nombre del titular de la tarjeta.';
      return;
    }

    console.log('🚀 Iniciando procesamiento de pago real con Stripe...');
    this.procesando = true;
    this.error = null;
    this.cdRef.detectChanges();

    try {
      console.log('💳 Confirmando pago con Stripe...', {
        paymentIntentId: this.paymentIntentId,
        cardholderName: this.cardholderName
      });

      // Confirmar pago con Stripe
      const { error, paymentIntent } = await this.stripe.confirmCardPayment(this.clientSecret, {
        payment_method: {
          card: this.card,
          billing_details: {
            name: this.cardholderName.trim().toUpperCase(),
          },
        }
      });

      if (error) {
        console.error('❌ Error confirmando pago con Stripe:', {
          type: error.type,
          code: error.code,
          message: error.message
        });

        let errorMessage = this.getStripeErrorMessage(error);
        throw new Error(errorMessage);
      }

      if (paymentIntent) {
        console.log('✅ Pago exitoso procesado por Stripe:', {
          id: paymentIntent.id,
          status: paymentIntent.status,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency
        });

        // Notificar a la ventana padre del éxito
        this.notificarExito(paymentIntent.id, paymentIntent.status);
        
        this.mostrarMensajeExito('¡Pago exitoso! Esta ventana se cerrará automáticamente...');
        
        // ✅ MODIFICADO: Cerrar ventana más rápido sin diálogos de confirmación
        setTimeout(() => {
          this.cerrarVentanaSilenciosamente();
        }, 1500);
      }

    } catch (err: any) {
      console.error('❌ Error procesando pago:', err);
      this.error = err.message || 'Error inesperado al procesar el pago. Por favor, intenta nuevamente.';
      this.notificarError(err.message);
    } finally {
      this.procesando = false;
      this.cdRef.detectChanges();
    }
  }

  private getStripeErrorMessage(error: any): string {
    const errorCode = error.code;
    
    switch (errorCode) {
      case 'card_declined':
        return 'Tu tarjeta fue rechazada. Por favor, intenta con otra tarjeta o contacta a tu banco.';
      
      case 'expired_card':
        return 'Tu tarjeta ha expirado. Por favor, usa otra tarjeta.';
      
      case 'incorrect_cvc':
        return 'El código de seguridad (CVC) es incorrecto. Por favor, verifica e intenta nuevamente.';
      
      case 'incorrect_number':
        return 'El número de tarjeta es incorrecto. Por favor, verifica e intenta nuevamente.';
      
      case 'invalid_cvc':
        return 'El código de seguridad (CVC) no es válido.';
      
      case 'invalid_expiry_month':
        return 'El mes de expiración no es válido.';
      
      case 'invalid_expiry_year':
        return 'El año de expiración no es válido.';
      
      case 'invalid_number':
        return 'El número de tarjeta no es válido.';
      
      case 'processing_error':
        return 'Ocurrió un error al procesar tu tarjeta. Por favor, intenta nuevamente.';
      
      default:
        return error.message || 'Error al procesar el pago. Por favor, verifica tus datos e intenta nuevamente.';
    }
  }

  private mostrarMensajeExito(mensaje: string) {
    this.error = null;
    const successElement = document.createElement('div');
    successElement.className = 'success-message';
    successElement.innerHTML = `
      <div style="color: #38a169; background: #f0fff4; padding: 1rem; border-radius: 8px; border: 1px solid #9ae6b4; text-align: center;">
        <i class="fas fa-check-circle"></i> ${mensaje}
      </div>
    `;
    
    const form = document.querySelector('.card-form');
    if (form) {
      form.insertAdjacentElement('afterend', successElement);
    }
  }

  private notificarExito(paymentIntentId: string, status: string) {
    if (window.opener && !window.opener.closed) {
      try {
        window.opener.postMessage({
          type: 'STRIPE_PAYMENT_SUCCESS',
          paymentIntentId: paymentIntentId,
          status: status,
          timestamp: new Date().toISOString()
        }, '*');
        console.log('📨 Notificación de éxito enviada a ventana padre');
      } catch (error) {
        console.error('❌ Error enviando notificación a ventana padre:', error);
      }
    } else {
      console.warn('⚠️ Ventana padre no disponible para notificar éxito');
      this.router.navigate(['/payment-success'], { 
        queryParams: { paymentIntentId, status }
      });
    }
  }

  private notificarError(mensajeError: string) {
    if (window.opener && !window.opener.closed) {
      try {
        window.opener.postMessage({
          type: 'STRIPE_PAYMENT_FAILED',
          error: mensajeError,
          timestamp: new Date().toISOString()
        }, '*');
        console.log('📨 Notificación de error enviada a ventana padre');
      } catch (error) {
        console.error('❌ Error enviando notificación de error a ventana padre:', error);
      }
    }
  }

  // ✅ AGREGADO: Manejar mensajes de cierre automático desde la ventana padre
  private handleCloseWindowMessage = (event: MessageEvent) => {
    if (event.data?.type === 'CLOSE_WINDOW_AUTOMATICALLY') {
      console.log('🔄 Recibida solicitud de cierre automático:', event.data.reason);
      
      // Cerrar ventana automáticamente sin preguntar
      setTimeout(() => {
        this.cerrarVentanaSilenciosamente();
      }, 500);
    }
  }

  // ✅ AGREGADO: Método para cerrar ventana silenciosamente sin diálogos
  private cerrarVentanaSilenciosamente(): void {
    try {
      // Limpiar cualquier event listener que pueda interferir
      window.removeEventListener('beforeunload', this.handleWindowClose.bind(this));
      
      // Intentar cerrar la ventana
      window.close();
      console.log('✅ Ventana cerrada automáticamente sin diálogos');
    } catch (error) {
      console.warn('⚠️ No se pudo cerrar automáticamente:', error);
      
      // Fallback: redirigir a una página de éxito si no se puede cerrar
      this.router.navigate(['/payment-success'], {
        queryParams: { 
          paymentIntentId: this.paymentIntentId,
          autoClose: 'true'
        }
      });
    }
  }

  // ✅ MODIFICADO: Manejar cierre de ventana sin diálogos de confirmación
  private handleWindowClose(event?: BeforeUnloadEvent) {
    console.log('🚪 Ventana de pago cerrándose...');
    
    // Solo notificar aborto si no estamos procesando un pago exitoso
    if (!this.procesando) {
      this.notificarPagoAbortado();
    }
    
    // ❌ REMOVIDO: No mostrar mensaje de confirmación para evitar diálogos
    // if (event) {
    //   event.returnValue = '¿Estás seguro de que quieres salir? El pago se cancelará.';
    // }
  }

  // ✅ AGREGADO: Notificar que el pago fue abortado
  private notificarPagoAbortado() {
    if (window.opener && !window.opener.closed) {
      try {
        window.opener.postMessage({
          type: 'STRIPE_PAYMENT_ABORTED',
          paymentIntentId: this.paymentIntentId,
          reason: 'window_closed',
          timestamp: new Date().toISOString()
        }, '*');
        console.log('📨 Notificación de pago abortado enviada a ventana padre');
      } catch (error) {
        console.error('❌ Error enviando notificación de aborto:', error);
      }
    } else {
      console.warn('⚠️ Ventana padre no disponible para notificar aborto');
    }
  }

  // ✅ MODIFICADO: Método cerrar mejorado sin diálogos
  cerrar() {
    console.log('❌ Cerrando ventana de pago manualmente...');
    
    // Notificar aborto antes de cerrar
    this.notificarPagoAbortado();
    
    // Cerrar silenciosamente
    this.cerrarVentanaSilenciosamente();
  }

  reintentar() {
    console.log('🔄 Reintentando pago...');
    this.error = null;
    this.cardholderName = '';
    this.cardErrors = '';
    
    if (this.card) {
      this.card.clear();
    }
    
    this.cdRef.detectChanges();
  }

  puedeProcesarPago(): boolean {
    return !this.procesando && 
           !!this.stripe && 
           !!this.elements && 
           !!this.card && 
           this.cardElementMounted &&
           !!this.cardholderName?.trim() &&
           !this.cardErrors;
  }

  debugStripeState() {
    console.group('🔍 DEBUG - Stripe State');
    console.log('Stripe:', this.stripe ? '✅ Inicializado' : '❌ No inicializado');
    console.log('Elements:', this.elements ? '✅ Creado' : '❌ No creado');
    console.log('Card Element:', this.card ? '✅ Creado' : '❌ No creado');
    console.log('Card Element Mounted:', this.cardElementMounted ? '✅ Montado' : '❌ No montado');
    console.log('Client Secret:', this.clientSecret ? '✅ Disponible' : '❌ No disponible');
    console.log('Payment Intent ID:', this.paymentIntentId || '❌ No disponible');
    console.log('Cardholder Name:', this.cardholderName || '❌ No ingresado');
    console.log('Card Errors:', this.cardErrors || '✅ Sin errores');
    
    // Verificar elemento en DOM
    const cardElement = document.getElementById('card-element');
    console.log('DOM Element #card-element:', cardElement ? '✅ Encontrado' : '❌ No encontrado');
    if (cardElement) {
      console.log('Element children:', cardElement.children.length);
    }
    
    console.groupEnd();
  }

  ngOnDestroy() {
    console.log('🧹 StripeCheckoutComponent - Destruyendo componente');
    
    // ✅ AGREGADO: Remover event listeners
    window.removeEventListener('message', this.handleCloseWindowMessage.bind(this));
    // window.removeEventListener('beforeunload', this.handleWindowClose.bind(this));
    
    // ✅ AGREGADO: Notificar aborto si el componente se destruye sin éxito
    if (!this.procesando && this.paymentIntentId) {
      this.notificarPagoAbortado();
    }
    
    if (this.card) {
      try {
        this.card.unmount();
        this.card.destroy();
      } catch (error) {
        console.warn('⚠️ Error al destruir elemento de tarjeta:', error);
      }
    }
  }
}