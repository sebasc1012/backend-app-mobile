export interface FinancialCommitmentResponse {
  id: string;
  userId: string;
  type: string;
  name: string;
  description: string | null;
  categoryId: string;
  defaultAmount: string | null;
  frequency: string;
  startDate: string;
  recurrenceDay: number | null;
  nextDueDate: string;
  reminderDaysBefore: number;
  endDate: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
