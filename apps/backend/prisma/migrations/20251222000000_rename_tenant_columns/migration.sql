-- Rename tenant_id to institute_id in kyc_documents if column exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'kyc_documents' AND column_name = 'tenant_id') THEN
        ALTER TABLE "kyc_documents" RENAME COLUMN "tenant_id" TO "institute_id";
    END IF;
END $$;
