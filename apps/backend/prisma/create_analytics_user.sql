-- 2.I.03 Create a database user for "Read-Only" analytics
-- Execute this script in your database management tool (e.g., pgAdmin, psql)

-- 1. Create the user (Role) if it doesn't exist
-- Change 'secure_analytics_password' to a strong password
DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = 'analytics_reader') THEN

      CREATE ROLE analytics_reader WITH LOGIN PASSWORD 'secure_analytics_password';
   END IF;
END
$do$;

-- 2. Grant usage on the public schema
GRANT USAGE ON SCHEMA public TO analytics_reader;

-- 3. Grant SELECT permission on all existing tables
GRANT SELECT ON ALL TABLES IN SCHEMA public TO analytics_reader;

-- 4. Ensure the user gets SELECT permission on any future tables created
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO analytics_reader;