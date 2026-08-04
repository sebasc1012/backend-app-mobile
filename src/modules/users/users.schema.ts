import { z } from "zod";

const profileFields = {
  fullName: z.string().trim().min(1).max(120).optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"]).optional(),
  country: z.string().trim().length(2).toUpperCase().optional(),
  phone: z.string().trim().min(5).max(30).optional(),
  avatarUrl: z.url().optional(),
  notificationsEnabled: z.boolean().optional(),
};

export const upsertProfileSchema = z.object(profileFields).strict();

export const updateProfileSchema = z
  .object(profileFields)
  .strict()
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: "Debes enviar al menos un campo para actualizar",
  });

export type UpsertProfileInput = z.infer<typeof upsertProfileSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
