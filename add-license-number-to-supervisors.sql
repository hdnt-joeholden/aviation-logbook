-- Add license_number field to supervisors table

-- Step 1: Add the license_number column
ALTER TABLE supervisors ADD COLUMN IF NOT EXISTS license_number TEXT;

-- Step 2: Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'supervisors'
ORDER BY ordinal_position;
