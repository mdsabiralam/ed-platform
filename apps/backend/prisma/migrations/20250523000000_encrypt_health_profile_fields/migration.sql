-- Enable pgcrypto extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
  -- Only perform migration if the table exists and hasn't been renamed yet
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'health_profiles') THEN

    -- 1. Rename existing table to act as the data storage
    ALTER TABLE "health_profiles" RENAME TO "health_profiles_data";

    -- 2. Modify columns to store BYTEA (Encrypted Data)
    -- We use a safe encryption logic: If encryption key is missing, we cannot encrypt existing data safely.
    -- However, usually migrations run in an environment where the key is provided.
    -- We'll assume if there is data, the key MUST be present or we raise an error to prevent data loss.

    IF EXISTS (SELECT 1 FROM "health_profiles_data") AND current_setting('app.encryption_key', true) IS NULL THEN
      RAISE EXCEPTION 'Cannot migrate existing health_profiles data: app.encryption_key is not set.';
    END IF;

    -- Perform conversion
    ALTER TABLE "health_profiles_data"
      ALTER COLUMN "allergies" TYPE BYTEA
      USING pgp_sym_encrypt(allergies, COALESCE(current_setting('app.encryption_key', true), 'default_key_migration_fallback'), 'cipher-algo=aes256');

    ALTER TABLE "health_profiles_data"
      ALTER COLUMN "medical_history" TYPE BYTEA
      USING pgp_sym_encrypt(medical_history, COALESCE(current_setting('app.encryption_key', true), 'default_key_migration_fallback'), 'cipher-algo=aes256');

    ALTER TABLE "health_profiles_data"
      ALTER COLUMN "medications" TYPE BYTEA
      USING pgp_sym_encrypt(medications, COALESCE(current_setting('app.encryption_key', true), 'default_key_migration_fallback'), 'cipher-algo=aes256');

    -- 3. Create the View that decrypts on Read
    EXECUTE 'CREATE OR REPLACE VIEW "health_profiles" AS
    SELECT
      id,
      student_id,
      blood_group,
      pgp_sym_decrypt(allergies, current_setting(''app.encryption_key'', true)::text) AS allergies,
      pgp_sym_decrypt(medical_history, current_setting(''app.encryption_key'', true)::text) AS medical_history,
      pgp_sym_decrypt(medications, current_setting(''app.encryption_key'', true)::text) AS medications,
      created_at,
      updated_at
    FROM "health_profiles_data"';

    -- 4. Create Function to handle Insert/Update on the View (Encrypts data)
    EXECUTE 'CREATE OR REPLACE FUNCTION encrypt_health_profile_trigger()
    RETURNS TRIGGER AS $f$
    BEGIN
      IF (TG_OP = ''INSERT'') THEN
        INSERT INTO "health_profiles_data" (
          id, student_id, blood_group, allergies, medical_history, medications, created_at, updated_at
        ) VALUES (
          NEW.id,
          NEW.student_id,
          NEW.blood_group,
          pgp_sym_encrypt(NEW.allergies, current_setting(''app.encryption_key'', true)::text),
          pgp_sym_encrypt(NEW.medical_history, current_setting(''app.encryption_key'', true)::text),
          pgp_sym_encrypt(NEW.medications, current_setting(''app.encryption_key'', true)::text),
          NEW.created_at,
          NEW.updated_at
        );
        RETURN NEW;
      ELSIF (TG_OP = ''UPDATE'') THEN
        UPDATE "health_profiles_data"
        SET
          student_id = NEW.student_id,
          blood_group = NEW.blood_group,
          allergies = pgp_sym_encrypt(NEW.allergies, current_setting(''app.encryption_key'', true)::text),
          medical_history = pgp_sym_encrypt(NEW.medical_history, current_setting(''app.encryption_key'', true)::text),
          medications = pgp_sym_encrypt(NEW.medications, current_setting(''app.encryption_key'', true)::text),
          updated_at = NEW.updated_at
        WHERE id = OLD.id;
        RETURN NEW;
      ELSIF (TG_OP = ''DELETE'') THEN
        DELETE FROM "health_profiles_data" WHERE id = OLD.id;
        RETURN OLD;
      END IF;
      RETURN NULL;
    END;
    $f$ LANGUAGE plpgsql';

    -- 5. Create Trigger on the View
    EXECUTE 'CREATE TRIGGER trg_health_profiles_encrypt
    INSTEAD OF INSERT OR UPDATE OR DELETE ON "health_profiles"
    FOR EACH ROW EXECUTE FUNCTION encrypt_health_profile_trigger()';

  END IF;
END $$;
