export type Frequency = "BIWEEKLY" | "MONTHLY" | "QUARTERLY" | "SEMIANNUALLY" | "ANNUALLY";

/**
 * Calculate the next due date based on frequency and start date.
 *
 * For BIWEEKLY: advances by 14 days from start date.
 * For calendar frequencies: uses recurrenceDay, falls back to start day if not specified.
 * If target day doesn't exist in month (e.g., Feb 31), uses last day of that month.
 */
export function calculateNextDueDate(
  startDate: Date,
  frequency: Frequency,
  recurrenceDay?: number | null,
): Date {
  const today = normalizeDate(new Date());
  const normalized = normalizeDate(new Date(startDate));

  if (frequency === "BIWEEKLY") {
    return nextBiweekly(normalized, today);
  }

  const day = recurrenceDay ?? normalized.getDate();

  switch (frequency) {
    case "MONTHLY":
      return nextMonthly(today, day);
    case "QUARTERLY":
      return nextQuarterly(today, day);
    case "SEMIANNUALLY":
      return nextSemiannually(normalized, today, day);
    case "ANNUALLY":
      return nextAnnually(normalized, today, day);
  }
}

/**
 * Ensure date is midnight UTC (for consistent date comparisons).
 */
function normalizeDate(date: Date): Date {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

/**
 * Next biweekly occurrence: add 14 days until future.
 */
function nextBiweekly(startDate: Date, today: Date): Date {
  const next = new Date(startDate);
  while (next <= today) {
    next.setDate(next.getDate() + 14);
  }
  return next;
}

/**
 * Next monthly occurrence on recurrenceDay.
 * If day doesn't exist (e.g., Feb 31), uses last day of month.
 */
function nextMonthly(today: Date, day: number): Date {
  let next = new Date(today.getFullYear(), today.getMonth(), day);

  if (next <= today) {
    next = new Date(today.getFullYear(), today.getMonth() + 1, day);
  }

  // Adjust if day doesn't exist in target month (e.g., Feb 31 → Feb 28/29)
  if (next.getDate() !== day) {
    next = new Date(next.getFullYear(), next.getMonth() + 1, 0);
  }

  return next;
}

/**
 * Next quarterly occurrence on recurrenceDay.
 * Quarters: 0-2 (Jan-Mar), 3-5 (Apr-Jun), 6-8 (Jul-Sep), 9-11 (Oct-Dec).
 */
function nextQuarterly(today: Date, day: number): Date {
  const currentQuarter = Math.floor(today.getMonth() / 3);
  let next = new Date(today.getFullYear(), currentQuarter * 3, day);

  if (next <= today) {
    const nextQuarter = currentQuarter + 1;
    if (nextQuarter === 4) {
      next = new Date(today.getFullYear() + 1, 0, day);
    } else {
      next = new Date(today.getFullYear(), nextQuarter * 3, day);
    }
  }

  // Adjust if day doesn't exist
  if (next.getDate() !== day) {
    next = new Date(next.getFullYear(), next.getMonth() + 1, 0);
  }

  return next;
}

/**
 * Next semiannual occurrence on recurrenceDay.
 * Two months per period: same month each half-year (e.g., Jan & Jul, Feb & Aug).
 */
function nextSemiannually(startDate: Date, today: Date, day: number): Date {
  const startMonth = startDate.getMonth();
  const halfYearMonth = (startMonth + 6) % 12;

  // Try first period this year
  let next = new Date(today.getFullYear(), startMonth, day);
  if (next > today) {
    return adjustDateIfNeeded(next, day);
  }

  // Try second period this year
  next = new Date(today.getFullYear(), halfYearMonth, day);
  if (next > today) {
    return adjustDateIfNeeded(next, day);
  }

  // Move to next year
  next = new Date(today.getFullYear() + 1, startMonth, day);
  return adjustDateIfNeeded(next, day);
}

/**
 * Next annual occurrence on recurrenceDay.
 * Same month and day every year.
 */
function nextAnnually(startDate: Date, today: Date, day: number): Date {
  const month = startDate.getMonth();
  let next = new Date(today.getFullYear(), month, day);

  if (next <= today) {
    next = new Date(today.getFullYear() + 1, month, day);
  }

  return adjustDateIfNeeded(next, day);
}

/**
 * If target day doesn't exist in target month, use last day of month.
 */
function adjustDateIfNeeded(date: Date, targetDay: number): Date {
  if (date.getDate() !== targetDay) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  }
  return date;
}
