-- CreateEnum
CREATE TYPE "user_role_enum" AS ENUM ('user', 'admin');

-- CreateEnum
CREATE TYPE "service_enum" AS ENUM ('asmt_10', 'scn', 'commissioner_appeal', 'gstat_appeal');

-- CreateEnum
CREATE TYPE "booking_status_enum" AS ENUM ('document_upload', 'in_review', 'draft_ready', 'filing', 'complete', 'cancelled');

-- CreateEnum
CREATE TYPE "payment_status_enum" AS ENUM ('pending', 'paid', 'failed');

-- CreateEnum
CREATE TYPE "filing_enum" AS ENUM ('self', 'others');

-- CreateEnum
CREATE TYPE "upload_by_enum" AS ENUM ('user', 'admin');

-- CreateEnum
CREATE TYPE "pay_rec_status_enum" AS ENUM ('created', 'authorized', 'captured', 'failed');

-- CreateEnum
CREATE TYPE "payment_source_enum" AS ENUM ('webhook', 'verify', 'admin_override');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "hashed_password" VARCHAR(255) NOT NULL,
    "role" "user_role_enum" NOT NULL DEFAULT 'user',
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "terms_accepted" BOOLEAN NOT NULL DEFAULT false,
    "allow_promotions" BOOLEAN NOT NULL DEFAULT false,
    "interested_services" "service_enum"[] DEFAULT ARRAY[]::"service_enum"[],
    "deleted_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "service_type" "service_enum" NOT NULL,
    "status" "booking_status_enum" NOT NULL DEFAULT 'document_upload',
    "payment_status" "payment_status_enum" NOT NULL DEFAULT 'pending',
    "contact_name" VARCHAR(255) NOT NULL,
    "contact_email" VARCHAR(255) NOT NULL,
    "contact_phone" VARCHAR(20) NOT NULL,
    "organization_name" VARCHAR(255),
    "filing_for" "filing_enum" NOT NULL,
    "gstn" VARCHAR(15) NOT NULL,
    "consent_information_accurate" BOOLEAN NOT NULL,
    "consent_contact_authorized" BOOLEAN NOT NULL,
    "draft_s3_key" TEXT,
    "admin_note" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_documents" (
    "id" UUID NOT NULL,
    "booking_id" UUID NOT NULL,
    "uploaded_by" "upload_by_enum" NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "s3_key" VARCHAR(512) NOT NULL,
    "uploaded_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "booking_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_records" (
    "id" UUID NOT NULL,
    "booking_id" UUID NOT NULL,
    "razorpay_order_id" VARCHAR(255) NOT NULL,
    "razorpay_payment_id" VARCHAR(255),
    "amount_paise" INTEGER NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'INR',
    "status" "pay_rec_status_enum" NOT NULL DEFAULT 'created',
    "source" "payment_source_enum" NOT NULL DEFAULT 'webhook',
    "performed_by_admin_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "payment_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otp_store" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "hashed_otp" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "attempt_count" SMALLINT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_store_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token_hash" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "token_blacklist" (
    "id" UUID NOT NULL,
    "token_jti" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "token_blacklist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_deleted_at_idx" ON "users"("deleted_at");

-- CreateIndex
CREATE INDEX "bookings_user_id_idx" ON "bookings"("user_id");

-- CreateIndex
CREATE INDEX "bookings_status_idx" ON "bookings"("status");

-- CreateIndex
CREATE INDEX "bookings_payment_status_idx" ON "bookings"("payment_status");

-- CreateIndex
CREATE INDEX "bookings_created_at_idx" ON "bookings"("created_at");

-- CreateIndex
CREATE INDEX "bookings_user_id_status_idx" ON "bookings"("user_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "booking_documents_s3_key_key" ON "booking_documents"("s3_key");

-- CreateIndex
CREATE INDEX "booking_documents_booking_id_idx" ON "booking_documents"("booking_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_records_razorpay_order_id_key" ON "payment_records"("razorpay_order_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_records_razorpay_payment_id_key" ON "payment_records"("razorpay_payment_id");

-- CreateIndex
CREATE INDEX "payment_records_booking_id_idx" ON "payment_records"("booking_id");

-- CreateIndex
CREATE INDEX "payment_records_status_idx" ON "payment_records"("status");

-- CreateIndex
CREATE INDEX "payment_records_created_at_idx" ON "payment_records"("created_at");

-- CreateIndex
CREATE INDEX "otp_store_user_id_idx" ON "otp_store"("user_id");

-- CreateIndex
CREATE INDEX "otp_store_expires_at_idx" ON "otp_store"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_hash_key" ON "refresh_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_expires_at_idx" ON "refresh_tokens"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "token_blacklist_token_jti_key" ON "token_blacklist"("token_jti");

-- CreateIndex
CREATE INDEX "token_blacklist_expires_at_idx" ON "token_blacklist"("expires_at");

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_documents" ADD CONSTRAINT "booking_documents_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_records" ADD CONSTRAINT "payment_records_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_records" ADD CONSTRAINT "payment_records_performed_by_admin_id_fkey" FOREIGN KEY ("performed_by_admin_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "otp_store" ADD CONSTRAINT "otp_store_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
