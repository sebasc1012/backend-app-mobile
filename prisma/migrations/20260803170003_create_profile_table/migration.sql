/*
  Warnings:

  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY');

-- DropTable
DROP TABLE "users";

-- CreateTable
CREATE TABLE "profile" (
    "id" UUID NOT NULL,
    "full_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "gender" "Gender",
    "country" CHAR(2),
    "phone" TEXT,
    "avatar_url" TEXT,
    "deleted_at" TIMESTAMP(3),
    "last_seen_at" TIMESTAMP(3),
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "notificationsEnabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "profile_pkey" PRIMARY KEY ("id")
);
