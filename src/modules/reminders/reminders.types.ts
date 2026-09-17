export interface ReminderResponse {
  occurrenceId: string;
  commitmentId: string;
  commitmentName: string;
  dueDate: string;
  daysUntilDue: number;
  reminderDaysBefore: number;
}
