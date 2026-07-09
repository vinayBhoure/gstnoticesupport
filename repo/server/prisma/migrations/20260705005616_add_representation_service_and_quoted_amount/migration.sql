-- AlterEnum
ALTER TYPE "service_enum" ADD VALUE 'representation';

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "quoted_amount_paise" INTEGER;
