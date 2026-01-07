-- Create a partial unique index to ensure only one active session per school (tenant)
CREATE UNIQUE INDEX "one_active_session_per_tenant"
ON "admission_sessions" ("school_id")
WHERE "is_active" = true;
