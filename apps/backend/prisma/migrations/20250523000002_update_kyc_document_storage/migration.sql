-- 2.I.07 KYC Document Storage (Verification)
-- The schema already contains KycDocument.
-- This migration ensures the structure is correct and adds constraints if missing.
-- Specifically, ensuring document_url is treated securely (though this is app logic, we can verify DB structure).

-- Check if table exists (it should, based on schema.prisma)
-- If not, create it (idempotent check)
CREATE TABLE IF NOT EXISTS "kyc_documents" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "document_type" TEXT NOT NULL,
    "document_url" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verified_at" TIMESTAMP(3),
    "rejection_reason" TEXT,

    CONSTRAINT "kyc_documents_pkey" PRIMARY KEY ("id")
);

-- Ensure Foreign Key to Tenant (Institute)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'kyc_documents_tenant_id_fkey'
    ) THEN
        ALTER TABLE "kyc_documents" ADD CONSTRAINT "kyc_documents_tenant_id_fkey"
        FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- Verify columns exist (if table existed but schema drifted)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'kyc_documents' AND column_name = 'document_url') THEN
        ALTER TABLE "kyc_documents" ADD COLUMN "document_url" TEXT NOT NULL DEFAULT '';
    END IF;
END $$;
