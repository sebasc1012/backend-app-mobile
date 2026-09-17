import { z } from "zod";

export const createPaymentSchema = z.object({
  occurrenceId: z.string().uuid("ID ocurrencia requerido"),
  paidAmount: z
    .string()
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
      message: "Monto debe ser número no negativo",
    })
    .optional(),
  paidAt: z.string().datetime().optional(),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
