-- CreateEnum
CREATE TYPE "otp_purpose_enum" AS ENUM ('email_verification', 'password_reset');

-- DropIndex
DROP INDEX "otp_store_user_id_idx";

-- AlterTable
ALTER TABLE "otp_store" ADD COLUMN     "purpose" "otp_purpose_enum" NOT NULL DEFAULT 'email_verification';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "sessions_valid_from" TIMESTAMPTZ(6);

-- CreateIndex
CREATE INDEX "otp_store_user_id_purpose_idx" ON "otp_store"("user_id", "purpose");
