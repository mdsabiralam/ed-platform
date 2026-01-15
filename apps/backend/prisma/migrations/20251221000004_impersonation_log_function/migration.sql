CREATE OR REPLACE FUNCTION log_impersonation_start(admin_id UUID, target_institute_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO "platform_audit_logs" (
    "id",
    "admin_id",
    "action",
    "target_institute_id",
    "details",
    "ip_address",
    "timestamp"
  )
  VALUES (
    gen_random_uuid()::TEXT,
    admin_id::TEXT,
    'IMPERSONATION_START',
    target_institute_id::TEXT,
    jsonb_build_object('status', 'STARTED'),
    current_setting('request.header.x-forwarded-for', true),
    NOW()
  );
END;
$$;
