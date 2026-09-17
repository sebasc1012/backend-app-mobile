import { z } from "zod";

const commitmentFields = {
  type: z.enum(["DEBT", "OBLIGATION"]),
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).optional().nullable(),
  categoryId: z.string().uuid("ID de categoría debe ser un UUID válido"),
  defaultAmount: z
    .string()
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
      message: "Monto debe ser un número válido no negativo",
    })
    .optional()
    .transform((val) => (val ? parseFloat(val) : undefined)),
  frequency: z.enum([
    "BIWEEKLY",
    "MONTHLY",
    "QUARTERLY",
    "SEMIANNUALLY",
    "ANNUALLY",
  ]),
  startDate: z.string().date("Fecha de inicio debe tener formato YYYY-MM-DD"),
  recurrenceDay: z
    .number()
    .int()
    .min(1)
    .max(31)
    .optional()
    .nullable(),
  reminderDaysBefore: z.number().int().min(0).default(0),
  endDate: z
    .string()
    .date("Fecha de fin debe tener formato YYYY-MM-DD")
    .optional()
    .nullable(),
  status: z.enum(["ACTIVE", "COMPLETED", "CANCELLED"]).default("ACTIVE"),
};

export const createCommitmentSchema = z
  .object(commitmentFields)
  .strict()
  .refine(
    (data) => {
      const calendarFreqs = [
        "MONTHLY",
        "QUARTERLY",
        "SEMIANNUALLY",
        "ANNUALLY",
      ];
      if (
        calendarFreqs.includes(data.frequency) &&
        data.recurrenceDay === null
      ) {
        return false;
      }
      return true;
    },
    {
      message: "recurrenceDay es requerido para frecuencias mensuales o anuales",
      path: ["recurrenceDay"],
    },
  );

export const updateCommitmentSchema = z
  .object(commitmentFields)
  .strict()
  .partial()
  .refine(
    (data) => {
      if (Object.keys(data).length === 0) {
        return false;
      }
      const calendarFreqs = [
        "MONTHLY",
        "QUARTERLY",
        "SEMIANNUALLY",
        "ANNUALLY",
      ];
      if (
        data.frequency &&
        calendarFreqs.includes(data.frequency) &&
        data.recurrenceDay === null
      ) {
        return false;
      }
      return true;
    },
    {
      message:
        "Debes enviar al menos un campo válido. recurrenceDay es requerido para frecuencias mensuales o anuales",
    },
  );

export type CreateCommitmentInput = z.infer<typeof createCommitmentSchema>;
export type UpdateCommitmentInput = z.infer<typeof updateCommitmentSchema>;
