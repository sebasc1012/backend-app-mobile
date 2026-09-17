import { describe, it, expect } from "@jest/globals";
import { calculateNextDueDate } from "./recurrence.service";

describe("recurrence.service", () => {
  describe("calculateNextDueDate", () => {
    it("should return future date for BIWEEKLY", () => {
      const pastStart = new Date("2020-01-01");
      const result = calculateNextDueDate(pastStart, "BIWEEKLY");
      expect(result.getTime()).toBeGreaterThan(new Date().getTime());
    });

    it("should return future date for MONTHLY", () => {
      const pastStart = new Date("2020-01-01");
      const result = calculateNextDueDate(pastStart, "MONTHLY", 15);
      expect(result.getTime()).toBeGreaterThan(new Date().getTime());
    });

    it("should use recurrenceDay for MONTHLY", () => {
      const result = calculateNextDueDate(new Date(), "MONTHLY", 25);
      expect(result.getDate()).toBe(25);
    });

    it("should return future date for QUARTERLY", () => {
      const pastStart = new Date("2020-01-01");
      const result = calculateNextDueDate(pastStart, "QUARTERLY", 15);
      expect(result.getTime()).toBeGreaterThan(new Date().getTime());
    });

    it("should return future date for SEMIANNUALLY", () => {
      const pastStart = new Date("2020-01-01");
      const result = calculateNextDueDate(pastStart, "SEMIANNUALLY", 15);
      expect(result.getTime()).toBeGreaterThan(new Date().getTime());
    });

    it("should return future date for ANNUALLY", () => {
      const pastStart = new Date("2020-01-01");
      const result = calculateNextDueDate(pastStart, "ANNUALLY", 15);
      expect(result.getTime()).toBeGreaterThan(new Date().getTime());
    });

    it("should handle leap year dates", () => {
      const leapStart = new Date("2024-02-29");
      const result = calculateNextDueDate(leapStart, "ANNUALLY", 29);
      expect(result).toBeInstanceOf(Date);
      expect(result.getTime()).toBeGreaterThan(new Date().getTime());
    });

    it("should always return Date instance", () => {
      const start = new Date("2020-01-01");

      const frequencies: Array<"BIWEEKLY" | "MONTHLY" | "QUARTERLY" | "SEMIANNUALLY" | "ANNUALLY"> = [
        "BIWEEKLY", "MONTHLY", "QUARTERLY", "SEMIANNUALLY", "ANNUALLY"
      ];

      frequencies.forEach(freq => {
        const result = calculateNextDueDate(start, freq, 15);
        expect(result).toBeInstanceOf(Date);
      });
    });
  });
});
