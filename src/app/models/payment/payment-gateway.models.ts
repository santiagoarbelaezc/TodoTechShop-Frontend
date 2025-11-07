export interface PaymentConfirmationDto {
  paymentIntentId: string;
  paymentMethodId?: string;
  confirmationData?: { [key: string]: any };
}

export interface PaymentIntentRequestDto {
  amount: number;
  currency: string;
  paymentMethodType: TipoMetodo;
  orderId: number;
  customerEmail?: string;
  metadata?: { [key: string]: string };
}

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
  FAILED = 'failed',
  REQUIRES_PAYMENT_METHOD_STRIPE = 'requires_payment_method', // Alias para consistencia
  SUCCEEDED_STRIPE = 'succeeded' // Alias para consistencia

}

export interface PaymentIntentResponseDto {
  clientSecret?: string;
  paymentIntentId?: string;
  status?: PaymentStatus; // Usar enum específico
  requiresAction?: boolean;
  nextActionType?: string;
  errorMessage?: string;
  additionalData?: { [key: string]: any };
}