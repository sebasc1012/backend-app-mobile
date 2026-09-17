export interface OccurrenceResponse {
  id: string;
  financialCommitmentId: string;
  dueDate: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export type OccurrenceStatus = "PENDING" | "PAID";
