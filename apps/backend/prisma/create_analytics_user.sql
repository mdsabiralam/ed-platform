-- 2.I.03 Create Read-Only Analytics User
-- Usage: Run this script as a superuser (postgres) against the target database.

-- 1. Create the role (if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'analytics_viewer') THEN
    CREATE ROLE analytics_viewer WITH LOGIN PASSWORD 'change_me_secure_password';
  END IF;
END
$$;

-- 2. Grant Connection
GRANT CONNECT ON DATABASE "ed_platform" TO analytics_viewer; -- Note: Replace "ed_platform" with actual DB name if different

-- 3. Grant Usage on Schema
GRANT USAGE ON SCHEMA public TO analytics_viewer;

-- 4. Grant Select on All Existing Tables
GRANT SELECT ON ALL TABLES IN SCHEMA public TO analytics_viewer;

-- 5. Grant Select on Future Tables (Default Privileges)
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO analytics_viewer;

-- 6. Optional: Revoke INSERT/UPDATE/DELETE/TRUNCATE explicitly (though explicit GRANT is usually enough if PUBLIC doesn't have them)
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON ALL TABLES IN SCHEMA public FROM analytics_viewer;
