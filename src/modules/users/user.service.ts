import { prisma } from "../../config/database";
import type { Prisma } from "../../generated/prisma/client";
import { env } from "../../config/env";
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "../../lib/errors";
import type { UpdateProfileInput, UpsertProfileInput } from "./users.schema";

export async function getUserProfile(userId: string) {
  return prisma.profile.findUnique({
    where: { id: userId, deletedAt: null },
    select: profileSelect,
  });
}

export async function upsertUserProfile(
  userId: string,
  input: UpsertProfileInput,
) {
  const existingProfile = await prisma.profile.findUnique({
    where: { id: userId },
    select: { deletedAt: true },
  });

  if (existingProfile?.deletedAt) {
    throw new ForbiddenError("La cuenta ha sido eliminada");
  }

  const profileData = toProfileData(userId, input);

  return prisma.profile.upsert({
    where: { id: userId },
    create: { id: userId, ...profileData, onboardingCompleted: true },
    update: { ...profileData, onboardingCompleted: true },
    select: profileSelect,
  });
}

export async function updateUserProfile(
  userId: string,
  input: UpdateProfileInput,
) {
  const result = await prisma.profile.updateMany({
    where: { id: userId, deletedAt: null },
    data: toProfileData(userId, input),
  });

  if (result.count === 0) {
    throw new NotFoundError("Perfil no encontrado");
  }

  return prisma.profile.findUniqueOrThrow({
    where: { id: userId, deletedAt: null },
    select: profileSelect,
  });
}

/**
 * Marca el perfil como eliminado sin borrar sus datos de PostgreSQL.
 * El controlador debe pasar únicamente el ID obtenido del JWT autenticado.
 */
export async function softDeleteUserProfile(userId: string) {
  const result = await prisma.profile.updateMany({
    where: { id: userId, deletedAt: null },
    data: { deletedAt: new Date() },
  });

  if (result.count === 1) {
    return;
  }

  const profile = await prisma.profile.findUnique({
    where: { id: userId },
    select: { deletedAt: true },
  });

  if (!profile) {
    throw new NotFoundError("Perfil no encontrado");
  }

  throw new ConflictError("El perfil ya fue eliminado");
}

const profileSelect = {
  id: true,
  fullName: true,
  gender: true,
  country: true,
  phone: true,
  avatarUrl: true,
  onboardingCompleted: true,
  notificationsEnabled: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ProfileSelect;

// Nombre de archivo de un solo segmento: sin "/", "..", "%", "?" ni "#".
const AVATAR_FILE_NAME = /^[A-Za-z0-9_-]+\.jpg$/;

/**
 * La foto de perfil solo puede ser un archivo de la carpeta del propio usuario
 * en Supabase Storage: `finchoApp/avatars/{userId}/{archivo}.jpg`.
 */
export function isOwnAvatarUrl(url: string, userId: string) {
  const prefix = `${env.SUPABASE_URL.replace(/\/+$/, "")}/storage/v1/object/public/finchoApp/avatars/${userId}/`;
  return url.startsWith(prefix) && AVATAR_FILE_NAME.test(url.slice(prefix.length));
}

function toProfileData(
  userId: string,
  input: UpsertProfileInput | UpdateProfileInput,
) {
  if (input.avatarUrl && !isOwnAvatarUrl(input.avatarUrl, userId)) {
    throw new BadRequestError("La foto de perfil debe estar en tu carpeta de Fincho");
  }

  return {
    ...(input.fullName !== undefined && { fullName: input.fullName }),
    ...(input.gender !== undefined && { gender: input.gender }),
    ...(input.country !== undefined && { country: input.country }),
    ...(input.phone !== undefined && { phone: input.phone }),
    ...(input.avatarUrl !== undefined && { avatarUrl: input.avatarUrl }),
    ...(input.notificationsEnabled !== undefined && {
      notificationsEnabled: input.notificationsEnabled,
    }),
  } satisfies Prisma.ProfileUncheckedUpdateInput;
}
