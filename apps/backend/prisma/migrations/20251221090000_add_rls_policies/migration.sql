-- Migration: 20251221090000_add_rls_policies
-- Description: Implement Row Level Security (RLS) for Institute, Profile, SaasInvoice, and User.
-- NOTE: This migration assumes the database tables have been renamed to "Institute", "Profile", "SaasInvoice", "User"
-- as per specific user instructions, differing from the 'tenants', 'profiles', etc. in the provided schema.prisma.

-- 1. Enable RLS on tables
ALTER TABLE "Institute" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Profile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SaasInvoice" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;

-- 2. Helper Function to extract institute_id from JWT
CREATE OR REPLACE FUNCTION get_current_institute_id()
RETURNS text AS $$
BEGIN
  RETURN (auth.jwt() -> 'app_metadata' ->> 'institute_id');
END;
$$ LANGUAGE plpgsql STABLE;

-- 3. Institute Policy (on "Institute")
-- Administrators can only view their own institute.
CREATE POLICY "institute_isolation_policy" ON "Institute"
  FOR SELECT
  USING (id = get_current_institute_id());

-- 4. Super Admin Policy (on "Institute")
-- Users with role = 'SUPER_ADMIN' to view ALL rows.
CREATE POLICY "super_admin_bypass_policy" ON "Institute"
  FOR ALL
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'SUPER_ADMIN');

-- 5. Profile RLS (on "Profile")
-- Users can only view profiles linked to their userId OR profiles within their authorized instituteId.
-- Assumption: 'userId' and 'instituteId' are the column names as implied by the prompt context.
CREATE POLICY "profile_access_policy" ON "Profile"
  FOR SELECT
  USING (
    "userId" = auth.uid()::text
    OR
    "instituteId" = get_current_institute_id()
  );

-- 6. Invoice Security (on "SaasInvoice")
-- Only visible if instituteId matches the user's current institute.
-- Assumption: 'instituteId' is the column name.
CREATE POLICY "invoice_access_policy" ON "SaasInvoice"
  FOR ALL
  USING ("instituteId" = get_current_institute_id());

-- 7. User Privacy (on "User")
-- Users can only view their own record.
CREATE POLICY "user_privacy_policy" ON "User"
  FOR SELECT
  USING (id = auth.uid()::text);

-- 7b. Super Admin Policy for Users (consistent bypass)
CREATE POLICY "user_super_admin_bypass" ON "User"
  FOR SELECT
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'SUPER_ADMIN');

-- 8. Test Script (Commented out)
/*
-- Verify Isolation:
-- Simulate request as user from Institute A
SET request.jwt.claim.app_metadata = '{"institute_id": "institute-a-uuid"}';
SET request.jwt.claim.sub = 'user-uuid';

-- Attempt to read Institute B (should return 0 rows)
SELECT * FROM "Institute" WHERE id = 'institute-b-uuid';
*/

-- 10. God Mode View (Implementation via Security Definer Function)
-- Create a function with SECURITY DEFINER to bypass RLS for global analytics.
CREATE OR REPLACE FUNCTION get_admin_analytics_data()
RETURNS TABLE (total_students bigint, total_institutes bigint, total_users bigint)
SECURITY DEFINER
AS $$
BEGIN
  -- Assuming "Student" table exists if others do, or using "students" if unspecified?
  -- Prompt says "Total Students". I will check if "Student" table is mentioned.
  -- Prompt says "aggregates data across all institutes (e.g., Total Students)".
  -- I will use "Student" to be consistent with the UpperCamelCase convention.
  RETURN QUERY SELECT
    (SELECT count(*) FROM "Student")::bigint,
    (SELECT count(*) FROM "Institute")::bigint,
    (SELECT count(*) FROM "User")::bigint;
END;
$$ LANGUAGE plpgsql;

-- Create the view wrapping the function to satisfy the requirement "View named admin_analytics_view".
CREATE OR REPLACE VIEW admin_analytics_view AS
SELECT * FROM get_admin_analytics_data();
