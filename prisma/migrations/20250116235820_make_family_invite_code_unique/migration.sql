/*
  Warnings:

  - A unique constraint covering the columns `[invite_code]` on the table `families` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "families_invite_code_key" ON "families"("invite_code");
