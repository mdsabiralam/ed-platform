-- AlterTable
ALTER TABLE "referral_linkages"
ADD COLUMN "commission_rate" DOUBLE PRECISION NOT NULL DEFAULT 10.0;

-- Rename tenant_id to institute_id
ALTER TABLE "referral_linkages"
RENAME COLUMN "tenant_id" TO "institute_id";

-- Rename linked_at to onboarded_at
ALTER TABLE "referral_linkages"
RENAME COLUMN "linked_at" TO "onboarded_at";

-- Rename Index/Constraint if necessary (Postgres usually handles this, but good to be explicit for unique constraints)
ALTER INDEX "referral_linkages_tenant_id_key" RENAME TO "referral_linkages_institute_id_key";
