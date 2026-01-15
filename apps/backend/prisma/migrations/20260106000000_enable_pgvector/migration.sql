-- Enable pgvector extension (Division 2.J.03)

-- 1. Create Extension if not exists
CREATE EXTENSION IF NOT EXISTS "vector";

-- 2. Verify installation (Optional in migration, but good for logging)
-- DO $$
-- BEGIN
--   RAISE NOTICE 'pgvector extension enabled';
-- END $$;
