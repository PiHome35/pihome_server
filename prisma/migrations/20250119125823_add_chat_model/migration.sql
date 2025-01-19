/*
  Warnings:

  - You are about to drop the column `chat_model` on the `families` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "families" DROP COLUMN "chat_model",
ADD COLUMN     "chat_model_id" TEXT;

-- CreateTable
CREATE TABLE "chat_models" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chat_models_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "chat_models_key_key" ON "chat_models"("key");

-- AddForeignKey
ALTER TABLE "families" ADD CONSTRAINT "families_chat_model_id_fkey" FOREIGN KEY ("chat_model_id") REFERENCES "chat_models"("id") ON DELETE SET NULL ON UPDATE CASCADE;
