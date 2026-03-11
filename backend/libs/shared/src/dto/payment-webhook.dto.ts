import { IsNotEmpty, IsString } from 'class-validator';

/** DTO for the RazorPay webhook payload (payment.captured event) */
export class RazorpayWebhookPayloadDto {
  @IsString()
  @IsNotEmpty()
  razorpay_order_id!: string;

  @IsString()
  @IsNotEmpty()
  razorpay_payment_id!: string;

  @IsString()
  @IsNotEmpty()
  razorpay_signature!: string;
}

/** Shape of the RazorPay webhook event body */
export interface RazorpayWebhookEvent {
  event: string;
  payload: {
    payment: {
      entity: {
        id: string;
        order_id: string;
        amount: number;
        currency: string;
        status: string;
        method: string;
        notes: Record<string, string>;
      };
    };
  };
}
