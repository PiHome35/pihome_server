/*
  Warnings:

  - A unique constraint covering the columns `[mac_address]` on the table `devices` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `mac_address` to the `devices` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "devices" ADD COLUMN     "mac_address" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "devices_mac_address_key" ON "devices"("mac_address");
