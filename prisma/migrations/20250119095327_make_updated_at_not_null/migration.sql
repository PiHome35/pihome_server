/*
  Warnings:

  - Made the column `updated_at` on table `device_groups` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_at` on table `devices` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_at` on table `families` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_at` on table `spotify_connections` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_at` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "device_groups" ALTER COLUMN "updated_at" SET NOT NULL;

-- AlterTable
ALTER TABLE "devices" ALTER COLUMN "updated_at" SET NOT NULL;

-- AlterTable
ALTER TABLE "families" ALTER COLUMN "updated_at" SET NOT NULL;

-- AlterTable
ALTER TABLE "spotify_connections" ALTER COLUMN "updated_at" SET NOT NULL;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "updated_at" SET NOT NULL;
