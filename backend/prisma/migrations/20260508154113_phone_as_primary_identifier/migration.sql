/*
  Warnings:
  - A unique constraint covering the columns `[phone]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Made the column `phone` on table `users` required. This step will fail if there are existing NULL values in that column.
*/

-- Mettre un numéro temporaire aux utilisateurs sans téléphone
UPDATE "users" SET "phone" = 'INCONNU-' || id WHERE "phone" IS NULL;

-- DropIndex
DROP INDEX "users_email_key";

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "phone" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");
