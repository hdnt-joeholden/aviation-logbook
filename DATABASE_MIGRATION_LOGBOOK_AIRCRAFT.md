# Logbook Entries - Aircraft Reference Migration

## Overview
Update logbook_entries table to reference user_aircraft instead of aircraft_types directly.

## Migration Steps

### 1. Add aircraft_id column to logbook_entries

```sql
-- Add new column referencing user_aircraft
ALTER TABLE logbook_entries
ADD COLUMN aircraft_id UUID REFERENCES user_aircraft(id) ON DELETE RESTRICT;

-- Create index for faster lookups
CREATE INDEX idx_logbook_entries_aircraft_id ON logbook_entries(aircraft_id);
```

### 2. Migrate existing data (if any)

If you have existing logbook entries, you need to map them to user_aircraft records first. Skip this step if you have no existing entries.

```sql
-- This is a manual step - you'll need to create user_aircraft records
-- for any existing entries and then update the aircraft_id references
-- Example:
-- UPDATE logbook_entries SET aircraft_id = 'uuid-of-user-aircraft' WHERE id = 'entry-id';
```

### 3. Remove old aircraft_type column

```sql
-- Make the old column nullable first (if it has data you want to keep temporarily)
ALTER TABLE logbook_entries ALTER COLUMN aircraft_type DROP NOT NULL;

-- OR drop it completely if you've migrated all data
-- ALTER TABLE logbook_entries DROP COLUMN aircraft_type;
```

### 4. Make aircraft_id required

```sql
-- Once all entries have been migrated, make aircraft_id required
ALTER TABLE logbook_entries ALTER COLUMN aircraft_id SET NOT NULL;
```

## Quick Migration (Fresh Database)

If you have no existing logbook entries, run this:

```sql
-- Add aircraft_id column
ALTER TABLE logbook_entries
ADD COLUMN aircraft_id UUID REFERENCES user_aircraft(id) ON DELETE RESTRICT;

-- Create index
CREATE INDEX idx_logbook_entries_aircraft_id ON logbook_entries(aircraft_id);

-- Drop old column
ALTER TABLE logbook_entries DROP COLUMN aircraft_type;

-- Make new column required
ALTER TABLE logbook_entries ALTER COLUMN aircraft_id SET NOT NULL;
```

## Verification

```sql
-- Check the updated schema
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'logbook_entries'
  AND column_name IN ('aircraft_id', 'aircraft_type');
```

## Rollback Plan

```sql
-- Add back aircraft_type column
ALTER TABLE logbook_entries
ADD COLUMN aircraft_type UUID REFERENCES aircraft_types(id);

-- Remove aircraft_id
ALTER TABLE logbook_entries DROP COLUMN aircraft_id;

-- Make aircraft_type required again
ALTER TABLE logbook_entries ALTER COLUMN aircraft_type SET NOT NULL;
```
