// payment-state.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface PaymentState {
  paymentIntentId: string | null;
  status: 'idle' | 'processing' | 'success' | 'failed';
  orderId: number | null;
  clientSecret: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentStateService {
  private paymentState = new BehaviorSubject<PaymentState>({
    paymentIntentId: null,
    status: 'idle',
    orderId: null,
    clientSecret: null
  });

  getPaymentState(): Observable<PaymentState> {
    return this.paymentState.asObservable();
  }

  getCurrentState(): PaymentState {
    return this.paymentState.value;
  }

  // ✅ Iniciar un nuevo pago
  startPayment(paymentIntentId: string, orderId: number, clientSecret: string): void {
    console.log('🔄 PaymentStateService: Iniciando pago', { paymentIntentId, orderId });
    
    this.paymentState.next({
      paymentIntentId,
      status: 'processing',
      orderId,
      clientSecret
    });
  }

  // ✅ Pago exitoso
  markPaymentSuccess(): void {
    const currentState = this.paymentState.value;
    console.log('✅ PaymentStateService: Marcando pago como exitoso', { 
      paymentIntentId: currentState.paymentIntentId 
    });
    
    this.paymentState.next({
      ...currentState,
      status: 'success'
    });
  }

  // ✅ Pago fallido
  markPaymentFailed(): void {
    const currentState = this.paymentState.value;
    console.log('❌ PaymentStateService: Marcando pago como fallido', { 
      paymentIntentId: currentState.paymentIntentId 
    });
    
    this.paymentState.next({
      ...currentState,
      status: 'failed'
    });
  }

  // ✅ Resetear estado
  resetPayment(): void {
    console.log('🧹 PaymentStateService: Reseteando estado de pago');
    
    this.paymentState.next({
      paymentIntentId: null,
      status: 'idle',
      orderId: null,
      clientSecret: null
    });
  }

  // ✅ Obtener paymentIntentId actual
  getCurrentPaymentIntentId(): string | null {
    return this.paymentState.value.paymentIntentId;
  }

  // ✅ Verificar si hay un pago en proceso
  isPaymentInProgress(): boolean {
    return this.paymentState.value.status === 'processing';
  }

  // ✅ Verificar si el pago fue exitoso
  isPaymentSuccessful(): boolean {
    return this.paymentState.value.status === 'success';
  }

  // ✅ Debug del estado actual
  debugState(): void {
    console.group('🔍 PaymentStateService - Estado Actual');
    console.log('Estado completo:', this.paymentState.value);
    console.log('PaymentIntentId:', this.getCurrentPaymentIntentId());
    console.log('En progreso:', this.isPaymentInProgress());
    console.log('Exitoso:', this.isPaymentSuccessful());
    console.groupEnd();
  }
}