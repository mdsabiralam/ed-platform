CREATE OR REPLACE FUNCTION audit_global_config_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_admin_id TEXT;
  v_user_id TEXT;
  v_action TEXT;
  v_details JSONB;
BEGIN
  -- 1. Determine Action
  IF (TG_OP = 'INSERT') THEN
    v_action := 'CONFIG_CREATE';
    v_details := jsonb_build_object('new_value', NEW.value, 'key', NEW.key);
  ELSIF (TG_OP = 'UPDATE') THEN
    v_action := 'CONFIG_UPDATE';
    v_details := jsonb_build_object('old_value', OLD.value, 'new_value', NEW.value, 'key', NEW.key);
  ELSIF (TG_OP = 'DELETE') THEN
    v_action := 'CONFIG_DELETE';
    v_details := jsonb_build_object('old_value', OLD.value, 'key', OLD.key);
  END IF;

  -- 2. Resolve User/Admin
  BEGIN
    v_user_id := current_setting('app.current_user_id', true);
    IF v_user_id IS NULL THEN
        v_user_id := current_setting('request.jwt.claim.sub', true);
    END IF;
  EXCEPTION WHEN OTHERS THEN
    v_user_id := NULL;
  END;

  IF v_user_id IS NOT NULL THEN
    SELECT id INTO v_admin_id FROM "platform_admins" WHERE "user_id" = v_user_id;
  END IF;

  -- 3. Insert Audit Log if Admin Resolved
  IF v_admin_id IS NOT NULL THEN
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
      v_admin_id,
      v_action,
      NULL,
      v_details,
      current_setting('request.header.x-forwarded-for', true),
      NOW()
    );
  END IF;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trigger_audit_global_config ON "global_configs";

CREATE TRIGGER trigger_audit_global_config
AFTER INSERT OR UPDATE OR DELETE ON "global_configs"
FOR EACH ROW EXECUTE FUNCTION audit_global_config_changes();
