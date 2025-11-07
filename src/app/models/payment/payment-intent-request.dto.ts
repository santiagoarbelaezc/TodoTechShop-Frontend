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