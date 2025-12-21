-- 2.I.06 Implement "Audit Trigger" for critical tables (Fees/Marks)
-- Execute this script in your database management tool (e.g., pgAdmin)

-- 1. Create the Audit Logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    operation TEXT NOT NULL, -- INSERT, UPDATE, DELETE
    old_data JSONB,
    new_data JSONB,
    changed_at TIMESTAMP DEFAULT NOW(),
    changed_by TEXT DEFAULT current_user -- Logs the DB user, or application user if set in session
);

-- 2. Create the Trigger Function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO audit_logs (table_name, record_id, operation, new_data)
        VALUES (TG_TABLE_NAME, NEW.id::TEXT, TG_OP, row_to_json(NEW));
        RETURN NEW;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO audit_logs (table_name, record_id, operation, old_data, new_data)
        VALUES (TG_TABLE_NAME, OLD.id::TEXT, TG_OP, row_to_json(OLD), row_to_json(NEW));
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        INSERT INTO audit_logs (table_name, record_id, operation, old_data)
        VALUES (TG_TABLE_NAME, OLD.id::TEXT, TG_OP, row_to_json(OLD));
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 3. Apply Triggers to Critical Tables (Fees, Marks)
-- Note: Ensure tables 'fees' and 'marks' exist. If your table names are different (e.g. 'student_fees'), update below.

-- Example for Fees table:
-- CREATE TRIGGER audit_fees_trigger AFTER INSERT OR UPDATE OR DELETE ON fees FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Example for Marks table:
-- CREATE TRIGGER audit_marks_trigger AFTER INSERT OR UPDATE OR DELETE ON marks FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();