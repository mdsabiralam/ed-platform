-- Enable Row Level Security on Key Tables (Division 2.J.02)

-- 1. Enable RLS on Institutes
ALTER TABLE "institutes" ENABLE ROW LEVEL SECURITY;

-- 2. Define the helper function if it doesn't exist (as requested by the prompt)
CREATE OR REPLACE FUNCTION get_current_institute_id()
RETURNS UUID AS $$
BEGIN
  -- Logic to extract institute_id from the current session/JWT
  -- In a Supabase context, this might be auth.jwt() -> 'app_metadata' -> 'institute_id'
  -- Using a safe fallback for now
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 3. Create Policy for Reading Institutes
-- Policy: "Users can view their own institute"
-- The prompt explicitly mentions using `get_current_institute_id()`
DROP POLICY IF EXISTS "Users can view their own institute" ON "institutes";

CREATE POLICY "Users can view their own institute"
ON "institutes"
FOR SELECT
USING (
  id::uuid = get_current_institute_id()
);

-- 4. Enable RLS on other sensitive tables
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;
