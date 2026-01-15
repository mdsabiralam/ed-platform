-- 2.I.07 Create Kyc Documents table if not exists
CREATE TABLE IF NOT EXISTS kyc_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institute_id TEXT NOT NULL,
    document_type TEXT NOT NULL,
    document_url TEXT NOT NULL,
    status TEXT DEFAULT 'PENDING',
    uploaded_at TIMESTAMP DEFAULT NOW(),
    verified_at TIMESTAMP,
    rejection_reason TEXT,
    CONSTRAINT fk_kyc_institute FOREIGN KEY (institute_id) REFERENCES institutes(id) ON DELETE CASCADE
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_kyc_documents_institute_id ON kyc_documents(institute_id);
