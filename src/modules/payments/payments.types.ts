export interface PaymentResponse {
  id: string;
  occurrenceId: string;
  paidAmount: string | null;
  paidAt: string;
  createdAt: Date;
}
