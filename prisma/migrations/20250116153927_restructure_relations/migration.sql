/*
  Warnings:

  - You are about to drop the column `createdAt` on the `device_groups` table. All the data in the column will be lost.
  - You are about to drop the column `is_default` on the `device_groups` table. All the data in the column will be lost.
  - You are about to drop the column `is_muted` on the `device_groups` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `device_groups` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `devices` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `devices` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `families` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `families` table. All the data in the column will be lost.
  - You are about to drop the column `wake_word` on the `families` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `spotify_connections` table. All the data in the column will be lost.
  - You are about to drop the column `device_group_id` on the `spotify_connections` table. All the data in the column will be lost.
  - You are about to drop the column `owner_id` on the `spotify_connections` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `spotify_connections` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[family_id]` on the table `spotify_connections` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updated_at` to the `device_groups` table without a default value. This is not possible if the table is not empty.
  - Added the required column `family_id` to the `devices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `is_muted` to the `devices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `is_sound_server` to the `devices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `devices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `families` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `spotify_connections` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "device_groups" DROP CONSTRAINT "device_groups_family_id_fkey";

-- DropForeignKey
ALTER TABLE "devices" DROP CONSTRAINT "devices_device_group_id_fkey";

-- DropForeignKey
ALTER TABLE "spotify_connections" DROP CONSTRAINT "spotify_connections_device_group_id_fkey";

-- DropForeignKey
ALTER TABLE "spotify_connections" DROP CONSTRAINT "spotify_connections_family_id_fkey";

-- DropForeignKey
ALTER TABLE "spotify_connections" DROP CONSTRAINT "spotify_connections_owner_id_fkey";

-- DropIndex
DROP INDEX "spotify_connections_device_group_id_key";

-- DropIndex
DROP INDEX "spotify_connections_owner_id_key";

-- AlterTable
ALTER TABLE "device_groups" DROP COLUMN "createdAt",
DROP COLUMN "is_default",
DROP COLUMN "is_muted",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "devices" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "family_id" TEXT NOT NULL,
ADD COLUMN     "is_muted" BOOLEAN NOT NULL,
ADD COLUMN     "is_sound_server" BOOLEAN NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "device_group_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "families" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
DROP COLUMN "wake_word",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "invite_code" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "spotify_connections" DROP COLUMN "createdAt",
DROP COLUMN "device_group_id",
DROP COLUMN "owner_id",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "spotify_connections_family_id_key" ON "spotify_connections"("family_id");

-- AddForeignKey
ALTER TABLE "devices" ADD CONSTRAINT "devices_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "families"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devices" ADD CONSTRAINT "devices_device_group_id_fkey" FOREIGN KEY ("device_group_id") REFERENCES "device_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_groups" ADD CONSTRAINT "device_groups_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "families"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spotify_connections" ADD CONSTRAINT "spotify_connections_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "families"("id") ON DELETE CASCADE ON UPDATE CASCADE;
