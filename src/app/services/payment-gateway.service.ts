// payment-gateway.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, catchError } from 'rxjs';
import { environment } from '../../environments/environment';

import { MensajeDto } from '../models/mensaje.dto';
import { PaymentConfirmationDto, PaymentIntentRequestDto, PaymentIntentResponseDto, TipoMetodo } from '../models/payment/payment-gateway.models';

@Injectable({
  providedIn: 'root'
})
export class PaymentGatewayService {
  private apiUrl = `${environment.apiUrl}/api/payment-gateway`;

  constructor(private http: HttpClient) { }

  private handleError(error: HttpErrorResponse) {
    console.error('🔴 PaymentGatewayService error:', {
      status: error.status,
      statusText: error.statusText,
      url: error.url,
      error: error.error
    });
    
    let errorMessage = 'Ocurrió un error inesperado';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = error.error?.mensaje || error.message || `Error ${error.status}: ${error.statusText}`;
    }
    
    return throwError(() => new Error(errorMessage));
  }

  createPaymentIntent(request: PaymentIntentRequestDto): Observable<MensajeDto<PaymentIntentResponseDto>> {
    console.log('📤 Enviando createPaymentIntent:', request);
    return this.http.post<MensajeDto<PaymentIntentResponseDto>>(
      `${this.apiUrl}/create-payment-intent`,
      request
    ).pipe(
      catchError(this.handleError)
    );
  }

  confirmPayment(confirmation: PaymentConfirmationDto): Observable<MensajeDto<PaymentIntentResponseDto>> {
    console.log('📤 Enviando confirmPayment:', confirmation);
    return this.http.post<MensajeDto<PaymentIntentResponseDto>>(
      `${this.apiUrl}/confirm-payment`,
      confirmation
    ).pipe(
      catchError(this.handleError)
    );
  }

  // ✅ CORREGIDO: Ahora recibe paymentIntentId como parámetro
  getPaymentStatus(paymentIntentId: string): Observable<MensajeDto<PaymentIntentResponseDto>> {
    console.log('📤 Solicitando estado del pago para:', paymentIntentId);
    
    if (!paymentIntentId) {
      return throwError(() => new Error('paymentIntentId es requerido'));
    }

    return this.http.get<MensajeDto<PaymentIntentResponseDto>>(
      `${this.apiUrl}/payment-status/${paymentIntentId}`
    ).pipe(
      catchError(this.handleError)
    );
  }

  createPaymentRequest(
    amount: number,
    currency: string,
    paymentMethodType: TipoMetodo,
    orderId: number,
    customerEmail?: string,
    metadata?: { [key: string]: string }
  ): PaymentIntentRequestDto {
    return {
      amount,
      currency,
      paymentMethodType,
      orderId,
      customerEmail,
      metadata: metadata || {
        orderId: orderId.toString(),
        timestamp: new Date().toISOString()
      }
    };
  }

  createConfirmationRequest(
    paymentIntentId: string,
    paymentMethodId?: string,
    confirmationData?: { [key: string]: any }
  ): PaymentConfirmationDto {
    return {
      paymentIntentId,
      paymentMethodId,
      confirmationData
    };
  }
}