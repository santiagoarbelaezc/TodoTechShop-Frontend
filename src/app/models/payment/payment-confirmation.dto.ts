export interface PaymentConfirmationDto {
  paymentIntentId: string;
  paymentMethodId?: string;
  confirmationData?: { [key: string]: any };
}