import cron from "node-cron";
import { getUpcomingReminders } from "./reminders.service";
import { prisma } from "../../config/database";
import { logger } from "../../lib/logger";

// ponytail: runs daily at midnight, sendPushNotifications when integrated
export function initReminderScheduler(): void {
  const ENABLED = process.env.REMINDERS_SCHEDULER_ENABLED === "true";

  if (!ENABLED) {
    logger.info("Reminders scheduler disabled (set REMINDERS_SCHEDULER_ENABLED=true to enable)");
    return;
  }

  // Midnight UTC
  cron.schedule("0 0 * * *", async () => {
    try {
      const users = await prisma.profile.findMany({
        where: { notificationsEnabled: true, deletedAt: null },
        select: { id: true },
      });

      for (const user of users) {
        const reminders = await getUpcomingReminders(user.id);
        if (reminders.length > 0) {
          logger.info(`[Reminders] User ${user.id}: ${reminders.length} reminder(s) due today`);
          // TODO: sendPushNotifications(user.id, reminders)
        }
      }
    } catch (err) {
      logger.error("[Reminders Scheduler] Error", {
        error: err instanceof Error ? err.message : String(err),
      });
    }
  });

  logger.info("Reminders scheduler started (runs daily at 00:00 UTC)");
}
