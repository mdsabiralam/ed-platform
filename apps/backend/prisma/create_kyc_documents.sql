-- 2.I.07 Create kyc_documents table with secure URL storage
-- Execute this script in your database management tool (e.g., pgAdmin)

CREATE TABLE IF NOT EXISTS kyc_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    document_type TEXT NOT NULL, -- e.g., 'NID', 'Passport', 'BirthCertificate'
    document_url TEXT NOT NULL, -- This will be stored as Encrypted Text
    status TEXT DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'REJECTED'
    rejection_reason TEXT,
    uploaded_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for faster lookup
CREATE INDEX IF NOT EXISTS idx_kyc_documents_tenant_id ON kyc_documents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_kyc_documents_user_id ON kyc_documents(user_id);