/*
  Warnings:

  - You are about to drop the column `expires_at` on the `spotify_connections` table. All the data in the column will be lost.
  - Added the required column `expires_in` to the `spotify_connections` table without a default value. This is not possible if the table is not empty.
  - Added the required column `issued_at` to the `spotify_connections` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "spotify_connections" DROP COLUMN "expires_at",
ADD COLUMN     "expires_in" INTEGER NOT NULL,
ADD COLUMN     "issued_at" TIMESTAMP(3) NOT NULL;
