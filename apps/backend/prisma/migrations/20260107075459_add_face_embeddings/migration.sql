-- Enable Extension
CREATE EXTENSION IF NOT EXISTS vector;

-- CreateTable
CREATE TABLE "face_embeddings" (
    "id" UUID NOT NULL,
    "user_id" TEXT NOT NULL,
    "embedding" vector(128) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "face_embeddings_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "face_embeddings" ADD CONSTRAINT "face_embeddings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateIndex (HNSW for speed optimization) - Step 7
CREATE INDEX "face_embeddings_embedding_idx" ON "face_embeddings" USING hnsw ("embedding" vector_l2_ops);

-- RLS Policy (Step 9)
ALTER TABLE "face_embeddings" ENABLE ROW LEVEL SECURITY;

-- Allow platform admin and service role to access
-- We assume the application connects with a user that has BYPASS RLS or adheres to this policy.
-- For now, we restrict to 'service_role' or 'admin' if such roles existed in Postgres,
-- but since we use a single DB user 'admin', we can simulate role check or just keep it restrictive.
-- "No regular staff should have direct SQL access".
-- By default, RLS blocks all access unless a policy grants it.
-- We will grant access to the 'admin' user explicitly.
CREATE POLICY "allow_admin_access" ON "face_embeddings"
    FOR ALL
    TO "admin"
    USING (true);
