import { prisma } from "../../config/database";
import type { ReminderResponse } from "./reminders.types";

export async function getUpcomingReminders(
  userId: string,
): Promise<ReminderResponse[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const commitments = await prisma.financialCommitment.findMany({
    where: {
      userId,
      status: "ACTIVE",
    },
    select: {
      id: true,
      name: true,
      reminderDaysBefore: true,
      occurrences: {
        where: {
          status: "PENDING",
        },
        select: {
          id: true,
          dueDate: true,
        },
      },
    },
  });

  const reminders: ReminderResponse[] = [];

  for (const commitment of commitments) {
    for (const occurrence of commitment.occurrences) {
      const daysUntilDue = Math.floor(
        (occurrence.dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (daysUntilDue === commitment.reminderDaysBefore) {
        reminders.push({
          occurrenceId: occurrence.id,
          commitmentId: commitment.id,
          commitmentName: commitment.name,
          dueDate: occurrence.dueDate.toISOString().split("T")[0]!,
          daysUntilDue,
          reminderDaysBefore: commitment.reminderDaysBefore,
        });
      }
    }
  }

  return reminders.sort((a, b) => a.daysUntilDue - b.daysUntilDue);
}
