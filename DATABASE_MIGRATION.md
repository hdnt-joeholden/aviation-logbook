# Database Migration Guide

## Overview
This migration adds support for user-specific aircraft management. Instead of selecting generic aircraft types in logbook entries, users will now maintain their own fleet of aircraft with specific registrations.

## Changes Required

### 1. Update `aircraft_types` table
Add engine type information to the master aircraft types table:

```sql
-- Add engine_type column if it doesn't exist
ALTER TABLE aircraft_types ADD COLUMN IF NOT EXISTS engine_type TEXT;
ALTER TABLE aircraft_types ADD COLUMN IF NOT EXISTS engine_variant TEXT;

-- Example: Update existing aircraft types with engine information
UPDATE aircraft_types SET engine_type = 'CFM56', engine_variant = 'CFM56-5B' WHERE type_code = 'A320';
UPDATE aircraft_types SET engine_type = 'CFM56', engine_variant = 'CFM56-7B' WHERE type_code = 'B737';
UPDATE aircraft_types SET engine_type = 'Trent', engine_variant = 'Trent 700' WHERE type_code = 'A330';
```

### 2. Create `user_aircraft` table
This table stores each user's personal aircraft fleet:

```sql
CREATE TABLE user_aircraft (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  registration VARCHAR(20) NOT NULL,
  aircraft_type_id UUID NOT NULL REFERENCES aircraft_types(id) ON DELETE RESTRICT,
  manufacturer VARCHAR(100),
  serial_number VARCHAR(50),
  year_of_manufacture INTEGER,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, registration)
);

-- Create index for faster lookups
CREATE INDEX idx_user_aircraft_user_id ON user_aircraft(user_id);
CREATE INDEX idx_user_aircraft_registration ON user_aircraft(registration);

-- Enable RLS
ALTER TABLE user_aircraft ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own aircraft"
  ON user_aircraft FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own aircraft"
  ON user_aircraft FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own aircraft"
  ON user_aircraft FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own aircraft"
  ON user_aircraft FOR DELETE
  USING (auth.uid() = user_id);
```

### 3. Update `logbook_entries` table
Modify the logbook_entries table to reference user_aircraft instead of just aircraft type:

```sql
-- Add new column for user_aircraft reference
ALTER TABLE logbook_entries ADD COLUMN IF NOT EXISTS aircraft_id UUID REFERENCES user_aircraft(id) ON DELETE RESTRICT;

-- Optional: Migrate existing data (if you want to preserve old entries)
-- You'll need to create user_aircraft records first for existing aircraft_type values

-- Once migration is complete, you can optionally drop the old aircraft_type column
-- ALTER TABLE logbook_entries DROP COLUMN aircraft_type;
```

### 4. Create a view for easy querying (Optional)
This view joins all the aircraft information together for easier querying:

```sql
CREATE OR REPLACE VIEW user_aircraft_details AS
SELECT
  ua.id,
  ua.user_id,
  ua.registration,
  ua.manufacturer,
  ua.serial_number,
  ua.year_of_manufacture,
  ua.notes,
  ua.is_active,
  at.type_code,
  at.engine_type,
  at.engine_variant,
  ua.created_at,
  ua.updated_at
FROM user_aircraft ua
INNER JOIN aircraft_types at ON ua.aircraft_type_id = at.id;
```

**Note:** If your `aircraft_types` table has different columns, adjust the SELECT statement accordingly. The application doesn't use this view, so it's optional.

## Migration Steps

1. Run the SQL commands above in your Supabase SQL editor
2. Verify the tables and policies are created correctly
3. Update your application code to use the new structure
4. Test thoroughly before deploying to production

## Rollback Plan

If you need to rollback:

```sql
-- Drop the view
DROP VIEW IF EXISTS user_aircraft_details;

-- Remove the new column from logbook_entries
ALTER TABLE logbook_entries DROP COLUMN IF EXISTS aircraft_id;

-- Drop the user_aircraft table
DROP TABLE IF EXISTS user_aircraft;

-- Remove engine columns from aircraft_types (if desired)
ALTER TABLE aircraft_types DROP COLUMN IF EXISTS engine_type;
ALTER TABLE aircraft_types DROP COLUMN IF EXISTS engine_variant;
```
