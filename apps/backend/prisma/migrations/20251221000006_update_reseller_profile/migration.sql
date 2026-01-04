-- CreateEnum
CREATE TYPE "ResellerTier" AS ENUM ('SILVER', 'GOLD');

-- CreateEnum
CREATE TYPE "KycStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- AlterTable
ALTER TABLE "reseller_profiles" ADD COLUMN     "agency_name" TEXT,
ADD COLUMN     "kyc_status" "KycStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "referral_code" TEXT,
ADD COLUMN     "tier" "ResellerTier" NOT NULL DEFAULT 'SILVER';

-- Data Migration for referral_code (require it to be unique and not null)
-- Assuming existing records might not have one, we generate a placeholder or fail if strict.
-- Since this is a new feature likely, we can generate one.
UPDATE "reseller_profiles"
SET "referral_code" = SUBSTRING(MD5(RANDOM()::TEXT), 1, 8)
WHERE "referral_code" IS NULL;

-- Add Constraints
ALTER TABLE "reseller_profiles" ALTER COLUMN "referral_code" SET NOT NULL;
CREATE UNIQUE INDEX "reseller_profiles_referral_code_key" ON "reseller_profiles"("referral_code");
