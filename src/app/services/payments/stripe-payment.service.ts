// stripe-payment.service.ts
import { Injectable } from '@angular/core';
import { PaymentGatewayService } from './payment-gateway.service';
import { ExchangeRateService } from '../exchange-rate.service';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';

// Importar Stripe.js correctamente
import { loadStripe, Stripe } from '@stripe/stripe-js';

// ✅ Estados de pago
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

export interface StripePaymentResult {
  success: boolean;
  error?: string;
  paymentIntent?: any;
  requiresAction?: boolean;
  clientSecret?: string;
  paymentIntentId?: string;
  status?: string;
  usdAmount?: number;
}

@Injectable({
  providedIn: 'root'
})
export class StripePaymentService {
  private stripe: Stripe | null = null;
  private stripeInitialized = false;

  constructor(
    private paymentGatewayService: PaymentGatewayService,
    private exchangeRateService: ExchangeRateService
  ) {}

  async initializeStripe(): Promise<boolean> {
    if (this.stripeInitialized && this.stripe) {
      return true;
    }

    try {
      console.log('🔑 Inicializando Stripe con key:', 
        environment.stripePublishableKey.substring(0, 20) + '...');

      // ✅ CORREGIDO: Eliminar apiVersion y parámetros que causan conflicto
      this.stripe = await loadStripe(environment.stripePublishableKey);
      
      if (!this.stripe) {
        throw new Error('No se pudo cargar Stripe.js');
      }

      this.stripeInitialized = true;
      console.log('✅ Stripe inicializado correctamente');
      return true;

    } catch (error: any) {
      console.error('❌ Error inicializando Stripe:', error);
      return false;
    }
  }

  isStripeReady(): boolean {
    return this.stripeInitialized && this.stripe !== null;
  }

  async createStripePaymentIntent(
    copAmount: number,
    orderId: number,
    customerEmail?: string
  ): Promise<StripePaymentResult> {
    try {
      // Inicializar Stripe si no está listo
      if (!this.isStripeReady()) {
        const initialized = await this.initializeStripe();
        if (!initialized) {
          return {
            success: false,
            error: 'Stripe no está inicializado correctamente. Por favor, recarga la página.'
          };
        }
      }

      // Validar límite convirtiendo a USD
      const validation = await this.exchangeRateService.isAmountWithinStripeLimit(copAmount);
      
      if (!validation.valid) {
        return {
          success: false,
          error: validation.message
        };
      }

      const usdAmount = validation.usdAmount;
      
      // Crear request para Stripe en USD
      const request = this.paymentGatewayService.createPaymentRequest(
        usdAmount,
        'usd',
        'STRIPE' as any,
        orderId,
        customerEmail
      );

      console.log('🔄 Creando Payment Intent con:', {
        amount: usdAmount,
        currency: 'usd',
        orderId: orderId
      });

      const response = await firstValueFrom(
        this.paymentGatewayService.createPaymentIntent(request)
      );
      
      console.log('📨 Respuesta del backend createPaymentIntent:', {
        hasError: response?.error,
        hasData: !!response?.data,
        mensaje: response?.mensaje
      });

      if (!response) {
        return {
          success: false,
          error: 'No se recibió respuesta del servidor'
        };
      }

      if (response.error || !response.data) {
        return {
          success: false,
          error: response.mensaje || 'Error al crear el payment intent'
        };
      }

      const paymentIntent = response.data;
      
      console.log('✅ Payment Intent creado:', {
        paymentIntentId: paymentIntent.paymentIntentId,
        clientSecret: paymentIntent.clientSecret ? '***' : 'No disponible',
        status: paymentIntent.status,
        requiresAction: paymentIntent.requiresAction
      });

      if (!paymentIntent.paymentIntentId) {
        console.error('❌ El backend no devolvió paymentIntentId');
        return {
          success: false,
          error: 'Error: No se pudo generar el ID de pago'
        };
      }

      return {
        success: true,
        clientSecret: paymentIntent.clientSecret,
        paymentIntentId: paymentIntent.paymentIntentId,
        requiresAction: paymentIntent.requiresAction,
        paymentIntent: paymentIntent,
        usdAmount: usdAmount
      };

    } catch (error: any) {
      console.error('❌ Error en createStripePaymentIntent:', error);
      return {
        success: false,
        error: error.message || 'Error desconocido al crear payment intent'
      };
    }
  }

  async redirectToStripeCheckout(
    copAmount: number,
    orderId: number,
    orderNumber: string,
    customerEmail?: string,
    customerName?: string
  ): Promise<StripePaymentResult> {
    try {
      console.log('🚀 Iniciando redirección a Stripe Checkout...', {
        copAmount,
        orderId,
        orderNumber,
        customerEmail
      });

      const intentResult = await this.createStripePaymentIntent(
        copAmount,
        orderId,
        customerEmail
      );

      console.log('📦 Resultado de createStripePaymentIntent:', {
        success: intentResult.success,
        paymentIntentId: intentResult.paymentIntentId,
        clientSecret: intentResult.clientSecret ? '***' : 'No disponible',
        error: intentResult.error,
        usdAmount: intentResult.usdAmount
      });

      if (!intentResult.success) {
        console.error('❌ Error al crear payment intent:', intentResult.error);
        return {
          success: false,
          error: intentResult.error || 'Error al crear el payment intent'
        };
      }

      if (!intentResult.paymentIntentId) {
        console.error('❌ No se recibió paymentIntentId del servicio');
        return {
          success: false,
          error: 'Error interno: No se pudo generar el ID de pago'
        };
      }

      if (!intentResult.clientSecret) {
        console.error('❌ No se recibió clientSecret del servicio');
        return {
          success: false,
          error: 'Error interno: No se pudo generar el secreto de cliente'
        };
      }

      console.log('✅ Payment Intent creado exitosamente:', {
        paymentIntentId: intentResult.paymentIntentId,
        amount: intentResult.usdAmount,
        hasClientSecret: !!intentResult.clientSecret
      });

      return {
        success: true,
        clientSecret: intentResult.clientSecret,
        paymentIntentId: intentResult.paymentIntentId,
        paymentIntent: intentResult.paymentIntent,
        usdAmount: intentResult.usdAmount
      };

    } catch (error: any) {
      console.error('❌ Error en redirectToStripeCheckout:', error);
      return {
        success: false,
        error: error.message || 'Error al redirigir a Stripe'
      };
    }
  }

  // ✅ CORREGIDO: Método actualizado para aceptar orderId
  openStripeInNewWindow(clientSecret: string, paymentIntentId: string, orderId: number): Window | null {
    console.log('🪟 Abriendo ventana de Stripe...', {
        paymentIntentId: paymentIntentId?.substring(0, 20) + '...',
        clientSecretPrefix: clientSecret?.substring(0, 20) + '...',
        orderId: orderId
    });

    // Validación más estricta
    if (!clientSecret || !clientSecret.includes('_secret_')) {
        console.error('❌ clientSecret inválido. Debe contener "_secret_"');
        return null;
    }

    if (!paymentIntentId || !paymentIntentId.startsWith('pi_')) {
        console.error('❌ paymentIntentId inválido. Debe comenzar con "pi_"');
        return null;
    }

    if (!orderId || orderId <= 0) {
        console.error('❌ orderId inválido:', orderId);
        return null;
    }

    // ✅ CORREGIDO: Pasar orderId a la URL
    const stripeUrl = this.buildStripePaymentUrl(clientSecret, paymentIntentId, orderId);
    console.log('📍 URL de Stripe generada:', stripeUrl);
    
    const windowFeatures = 'width=600,height=700,scrollbars=yes,resizable=yes,top=100,left=100';

    try {
        const newWindow = window.open(stripeUrl, 'StripeCheckout', windowFeatures);
        
        if (!newWindow) {
            console.error('❌ Bloqueador de ventanas detectado');
            this.mostrarAlertaBloqueador(stripeUrl);
            return null;
        }

        console.log('✅ Ventana de Stripe abierta correctamente');

        // Verificación mejorada sin acceder a location.href (evita CORS)
        let checks = 0;
        const maxChecks = 30; // 15 segundos máximo
        
        const checkInterval = setInterval(() => {
            checks++;
            
            if (newWindow.closed) {
                console.log('🔒 Ventana cerrada por el usuario');
                clearInterval(checkInterval);
                return;
            }
            
            if (checks >= maxChecks) {
                console.log('⏰ Tiempo máximo de verificación alcanzado');
                clearInterval(checkInterval);
                return;
            }
            
            // Solo verificar si la ventana sigue abierta
            // No intentar acceder a location.href por CORS
            if (checks === 1) {
                console.log('✅ Ventana activa - los parámetros se enviaron en la URL inicial');
            }
            
        }, 500); // Verificar cada 500ms

        return newWindow;

    } catch (error: any) {
        console.error('❌ Error crítico:', error);
        this.mostrarErrorApertura(error.message);
        return null;
    }
  }

  // ✅ CORREGIDO: Método actualizado para incluir orderId
  private buildStripePaymentUrl(clientSecret: string, paymentIntentId: string, orderId: number): string {
    // Usar ruta absoluta para evitar problemas de routing
    const baseUrl = window.location.origin;
    const checkoutPath = '/checkout'; 
    
    const params = new URLSearchParams({
        clientSecret: clientSecret,
        paymentIntentId: paymentIntentId,
        orderId: orderId.toString(), // ✅ NUEVO: Incluir orderId
        timestamp: Date.now().toString(), // Evitar cache
        source: 'stripe-checkout-window'
    });

    return `${baseUrl}${checkoutPath}?${params.toString()}`;
  }

  private mostrarAlertaBloqueador(stripeUrl: string): void {
    const userChoice = confirm(`
      ⚠️ Se detectó un bloqueador de ventanas emergentes.
      
      Para completar el pago seguro con Stripe, necesitamos abrir una ventana.
      
      ¿Desea permitir ventanas emergentes para este sitio y reintentar?
      
      O puede hacer clic en "Cancelar" para pagar en esta misma ventana.
    `);
    
    if (userChoice) {
      console.log('🔄 Usuario eligió reintentar');
    } else {
      console.log('🔄 Redirigiendo en la misma ventana');
      window.location.href = stripeUrl;
    }
  }

  private mostrarErrorApertura(detalleError: string): void {
    console.error('❌ Error al abrir ventana:', detalleError);
    alert(`Error al iniciar el proceso de pago: ${detalleError}`);
  }

  async checkPaymentStatus(paymentIntentId: string): Promise<StripePaymentResult> {
    try {
      console.log('🔄 Verificando estado del pago para:', paymentIntentId);
      
      if (!paymentIntentId || paymentIntentId.trim() === '') {
        console.error('❌ paymentIntentId está vacío o no definido');
        return {
          success: false,
          error: 'paymentIntentId es requerido y no puede estar vacío'
        };
      }

      if (paymentIntentId.length < 3) {
        console.error('❌ paymentIntentId parece inválido:', paymentIntentId);
        return {
          success: false,
          error: 'paymentIntentId inválido'
        };
      }

      console.log('📤 Solicitando estado al backend...');
      const response = await firstValueFrom(
        this.paymentGatewayService.getPaymentStatus(paymentIntentId)
      );
      
      console.log('📨 Respuesta del backend getPaymentStatus:', {
        hasResponse: !!response,
        hasError: response?.error,
        hasData: !!response?.data,
        mensaje: response?.mensaje
      });
      
      if (!response) {
        console.error('❌ No se recibió respuesta del servidor');
        return {
          success: false,
          error: 'No se pudo conectar con el servidor'
        };
      }

      if (response.error || !response.data) {
        const errorMsg = response.mensaje || 'Error al verificar estado del pago';
        console.error('❌ Error en la respuesta del backend:', errorMsg);
        return {
          success: false,
          error: errorMsg
        };
      }

      const paymentData = response.data;
      
      console.log('📊 Estado del pago recibido:', {
        paymentIntentId: paymentData.paymentIntentId,
        status: paymentData.status,
        success: paymentData.status === 'succeeded',
        requiresAction: paymentData.requiresAction,
        errorMessage: paymentData.errorMessage
      });
      
      const isSuccess = paymentData.status === PaymentStatus.SUCCEEDED;
      
      const isFailed = paymentData.status === PaymentStatus.CANCELED || 
                      paymentData.status === PaymentStatus.FAILED || 
                      paymentData.errorMessage;
      
      return {
        success: isSuccess,
        paymentIntent: paymentData,
        status: paymentData.status,
        paymentIntentId: paymentData.paymentIntentId,
        requiresAction: paymentData.requiresAction,
        error: isFailed ? (paymentData.errorMessage || `Estado del pago: ${paymentData.status}`) : undefined
      };

    } catch (error: any) {
      console.error('❌ Error en checkPaymentStatus:', {
        message: error.message,
        paymentIntentId: paymentIntentId
      });
      
      let errorMessage = 'Error al verificar estado del pago';
      
      if (error.status === 404) {
        errorMessage = 'Pago no encontrado. Puede que haya expirado.';
      } else if (error.status === 500) {
        errorMessage = 'Error interno del servidor. Intente nuevamente.';
      } else if (error.message.includes('Network Error')) {
        errorMessage = 'Error de conexión. Verifique su internet.';
      } else {
        errorMessage = error.message || errorMessage;
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  getStripeInstance(): Stripe | null {
    if (!this.isStripeReady()) {
      console.warn('⚠️ Stripe instance requested but not ready');
      return null;
    }
    return this.stripe;
  }

  // Método para verificar la configuración
  checkConfiguration(): { valid: boolean; issues: string[] } {
    const issues: string[] = [];
    
    if (!this.isStripeReady()) {
      issues.push('Stripe no está inicializado');
    }
    
    if (!environment.stripePublishableKey) {
      issues.push('Stripe publishable key no configurada');
    }
    
    if (!environment.apiUrl) {
      issues.push('API URL no configurada');
    }
    
    return {
      valid: issues.length === 0,
      issues
    };
  }

  // Método para debug
  debugServiceState(): void {
    console.group('🔍 DEBUG - Stripe Payment Service State');
    console.log('Stripe initialized:', this.stripeInitialized);
    console.log('Stripe instance:', this.stripe ? '✅ Disponible' : '❌ No disponible');
    console.log('Publishable key:', environment.stripePublishableKey ? '✅ Configurada' : '❌ No configurada');
    console.log('API URL:', environment.apiUrl || '❌ No configurada');
    console.groupEnd();
  }

  // Métodos auxiliares para gestión de ventanas
  checkWindowStatus(windowRef: Window | null): { isOpen: boolean; isAccessible: boolean } {
    if (!windowRef) {
      return { isOpen: false, isAccessible: false };
    }

    try {
      const isOpen = !windowRef.closed;
      const isAccessible = !!windowRef.location;
      return { isOpen, isAccessible };
    } catch (error) {
      return { isOpen: true, isAccessible: false };
    }
  }

  closeStripeWindow(windowRef: Window | null): void {
    if (windowRef && !windowRef.closed) {
      try {
        windowRef.close();
        console.log('✅ Ventana de Stripe cerrada manualmente');
      } catch (error) {
        console.warn('⚠️ No se pudo cerrar la ventana de Stripe:', error);
      }
    }
  }
}