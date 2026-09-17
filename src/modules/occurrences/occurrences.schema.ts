import { z } from "zod";

export const markPaidSchema = z.object({
  paidAt: z.string().datetime().optional(),
});

export type MarkPaidInput = z.infer<typeof markPaidSchema>;
