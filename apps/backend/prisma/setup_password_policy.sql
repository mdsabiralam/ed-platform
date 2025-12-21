-- 2.I.08 Define password_policies in global_configs
-- Execute this script in your database management tool (e.g., pgAdmin)

-- 1. Create global_configs table if it doesn't exist
CREATE TABLE IF NOT EXISTS global_configs (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Insert or Update the Password Policy
INSERT INTO global_configs (key, value, description)
VALUES (
    'password_policy',
    '{
        "minLength": 8,
        "requireUppercase": true,
        "requireLowercase": true,
        "requireNumbers": true,
        "requireSpecialChars": true,
        "expiryDays": 90,
        "preventReuse": 3,
        "lockoutThreshold": 5,
        "lockoutDuration": 15
    }'::jsonb,
    'Global password complexity and rotation policies'
)
ON CONFLICT (key) DO UPDATE 
SET value = EXCLUDED.value, updated_at = NOW();
