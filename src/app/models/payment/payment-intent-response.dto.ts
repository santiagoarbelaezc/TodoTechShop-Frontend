export interface PaymentIntentResponseDto {
  clientSecret?: string;
  paymentIntentId?: string;
  status?: string;
  requiresAction?: boolean;
  nextActionType?: string;
  errorMessage?: string;
  additionalData?: { [key: string]: any };
}