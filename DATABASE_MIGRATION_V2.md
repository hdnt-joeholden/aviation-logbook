# Database Migration V2 - Aircraft & Engine Management

## Overview
This migration creates a proper relational structure for aircraft types and engines, with admin-managed compatibility relationships.

## Database Structure

### 1. Create `engines` table
Store all available engine types:

```sql
CREATE TABLE engines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  manufacturer VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  variant VARCHAR(100),
  full_designation TEXT, -- e.g., "Rolls-Royce Trent 1000-J"
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(manufacturer, model, variant)
);

-- Create index for faster lookups
CREATE INDEX idx_engines_manufacturer_model ON engines(manufacturer, model);

-- No RLS needed - this is reference data that all users can read
ALTER TABLE engines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view engines"
  ON engines FOR SELECT
  USING (true);
```

### 2. Create `aircraft_type_engines` junction table
Links aircraft types with their compatible engines (many-to-many):

```sql
CREATE TABLE aircraft_type_engines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  aircraft_type_id UUID NOT NULL REFERENCES aircraft_types(id) ON DELETE CASCADE,
  engine_id UUID NOT NULL REFERENCES engines(id) ON DELETE CASCADE,
  is_common BOOLEAN DEFAULT false, -- Mark most common engine option
  notes TEXT, -- e.g., "Standard on -8, optional on -9"
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(aircraft_type_id, engine_id)
);

-- Create indexes
CREATE INDEX idx_aircraft_type_engines_aircraft ON aircraft_type_engines(aircraft_type_id);
CREATE INDEX idx_aircraft_type_engines_engine ON aircraft_type_engines(engine_id);

-- RLS - everyone can read
ALTER TABLE aircraft_type_engines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view aircraft type engines"
  ON aircraft_type_engines FOR SELECT
  USING (true);
```

### 3. Update `user_aircraft` table
Add engine reference instead of storing engine info directly:

```sql
-- Add engine_id column
ALTER TABLE user_aircraft ADD COLUMN engine_id UUID REFERENCES engines(id) ON DELETE RESTRICT;

-- Drop the old view that depends on the engine_type column
DROP VIEW IF EXISTS user_aircraft_details CASCADE;

-- Remove old engine columns from aircraft_types if they exist
ALTER TABLE aircraft_types DROP COLUMN IF EXISTS engine_type;
ALTER TABLE aircraft_types DROP COLUMN IF EXISTS engine_variant;

-- Recreate the view without the engine columns (now engine info comes from engines table)
CREATE OR REPLACE VIEW user_aircraft_details AS
SELECT
  ua.*,
  at.type_code,
  at.manufacturer as aircraft_manufacturer,
  e.manufacturer as engine_manufacturer,
  e.model as engine_model,
  e.variant as engine_variant,
  e.full_designation as engine_full_designation
FROM user_aircraft ua
LEFT JOIN aircraft_types at ON ua.aircraft_type_id = at.id
LEFT JOIN engines e ON ua.engine_id = e.id;
```

### 4. Populate engine data
Insert common aircraft engines:

```sql
-- Boeing 737 engines
INSERT INTO engines (manufacturer, model, variant, full_designation) VALUES
('CFM International', 'CFM56', '7B24', 'CFM56-7B24'),
('CFM International', 'CFM56', '7B26', 'CFM56-7B26'),
('CFM International', 'CFM56', '7B27', 'CFM56-7B27'),
('CFM International', 'LEAP', '1B', 'LEAP-1B');

-- Boeing 777 engines
INSERT INTO engines (manufacturer, model, variant, full_designation) VALUES
('General Electric', 'GE90', '94B', 'GE90-94B'),
('General Electric', 'GE90', '110B1', 'GE90-110B1'),
('General Electric', 'GE90', '115B', 'GE90-115B'),
('Pratt & Whitney', 'PW4000', '94', 'PW4090'),
('Rolls-Royce', 'Trent', '800', 'Trent 800');

-- Boeing 787 engines
INSERT INTO engines (manufacturer, model, variant, full_designation) VALUES
('Rolls-Royce', 'Trent', '1000-A', 'Trent 1000-A'),
('Rolls-Royce', 'Trent', '1000-C', 'Trent 1000-C'),
('Rolls-Royce', 'Trent', '1000-E', 'Trent 1000-E'),
('Rolls-Royce', 'Trent', '1000-J', 'Trent 1000-J'),
('General Electric', 'GEnx', '1B64', 'GEnx-1B64'),
('General Electric', 'GEnx', '1B70', 'GEnx-1B70'),
('General Electric', 'GEnx', '1B75', 'GEnx-1B75');

-- Airbus A320 family engines
INSERT INTO engines (manufacturer, model, variant, full_designation) VALUES
('CFM International', 'CFM56', '5A', 'CFM56-5A'),
('CFM International', 'CFM56', '5B', 'CFM56-5B'),
('International Aero Engines', 'V2500', 'A1', 'V2500-A1'),
('International Aero Engines', 'V2500', 'A5', 'V2500-A5'),
('Pratt & Whitney', 'PW1100G', '1127G-JM', 'PW1127G-JM'),
('Pratt & Whitney', 'PW1100G', '1133G-JM', 'PW1133G-JM'),
('CFM International', 'LEAP', '1A26', 'LEAP-1A26'),
('CFM International', 'LEAP', '1A33', 'LEAP-1A33');

-- Airbus A330 engines
INSERT INTO engines (manufacturer, model, variant, full_designation) VALUES
('Rolls-Royce', 'Trent', '700', 'Trent 700'),
('Pratt & Whitney', 'PW4000', '168A', 'PW4168A'),
('General Electric', 'CF6', '80E1', 'CF6-80E1A4');

-- Airbus A350 engines
INSERT INTO engines (manufacturer, model, variant, full_designation) VALUES
('Rolls-Royce', 'Trent', 'XWB-84', 'Trent XWB-84'),
('Rolls-Royce', 'Trent', 'XWB-97', 'Trent XWB-97');
```

### 5. Link aircraft types with compatible engines
Define which engines work with which aircraft:

```sql
-- Get IDs for aircraft types (adjust these based on your aircraft_types table)
-- You'll need to replace these with your actual aircraft type IDs

-- Example for Boeing 737-800 with CFM56-7B engines
INSERT INTO aircraft_type_engines (aircraft_type_id, engine_id, is_common, notes)
SELECT
  (SELECT id FROM aircraft_types WHERE type_code = 'B738') as aircraft_type_id,
  id as engine_id,
  CASE
    WHEN model = 'CFM56' AND variant = '7B27' THEN true
    ELSE false
  END as is_common,
  NULL as notes
FROM engines
WHERE manufacturer = 'CFM International'
  AND model = 'CFM56'
  AND variant IN ('7B24', '7B26', '7B27');

-- Example for Boeing 787-9 with both Trent 1000 and GEnx engines
INSERT INTO aircraft_type_engines (aircraft_type_id, engine_id, is_common)
SELECT
  (SELECT id FROM aircraft_types WHERE type_code = 'B789') as aircraft_type_id,
  id as engine_id,
  CASE
    WHEN model = 'Trent' THEN true
    ELSE false
  END as is_common
FROM engines
WHERE (manufacturer = 'Rolls-Royce' AND model = 'Trent' AND variant LIKE '1000%')
   OR (manufacturer = 'General Electric' AND model = 'GEnx' AND variant LIKE '1B%');

-- Airbus A320neo with LEAP-1A and PW1100G
INSERT INTO aircraft_type_engines (aircraft_type_id, engine_id, is_common)
SELECT
  (SELECT id FROM aircraft_types WHERE type_code = 'A20N') as aircraft_type_id,
  id as engine_id,
  CASE
    WHEN model = 'LEAP' THEN true
    ELSE false
  END as is_common
FROM engines
WHERE (manufacturer = 'CFM International' AND model = 'LEAP' AND variant = '1A')
   OR (manufacturer = 'Pratt & Whitney' AND model = 'PW1100G');

-- Continue for other aircraft types...
```

### 6. Create helper view for easy querying
```sql
CREATE OR REPLACE VIEW aircraft_engines_view AS
SELECT
  at.id as aircraft_type_id,
  at.type_code,
  e.id as engine_id,
  e.manufacturer as engine_manufacturer,
  e.model as engine_model,
  e.variant as engine_variant,
  e.full_designation as engine_full_designation,
  ate.is_common,
  ate.notes
FROM aircraft_types at
INNER JOIN aircraft_type_engines ate ON at.id = ate.aircraft_type_id
INNER JOIN engines e ON ate.engine_id = e.id
ORDER BY at.type_code, ate.is_common DESC, e.manufacturer, e.model, e.variant;
```

## Admin Functions

### Query to see all aircraft and their compatible engines:
```sql
SELECT
  type_code,
  engine_manufacturer,
  engine_model,
  engine_variant,
  engine_full_designation,
  CASE WHEN is_common THEN 'Yes' ELSE 'No' END as is_common_option
FROM aircraft_engines_view
ORDER BY type_code, is_common DESC;
```

### Query to add a new aircraft-engine compatibility:
```sql
-- Example: Add GE90-115B to Boeing 777-300ER
INSERT INTO aircraft_type_engines (aircraft_type_id, engine_id, is_common)
VALUES (
  (SELECT id FROM aircraft_types WHERE type_code = 'B77W'),
  (SELECT id FROM engines WHERE manufacturer = 'General Electric' AND model = 'GE90' AND variant = '115B'),
  true
);
```

## Migration Steps

1. Run the SQL commands above in your Supabase SQL editor in order
2. Verify the tables and relationships are created correctly
3. Populate engine data
4. Link aircraft types with compatible engines (adjust aircraft type codes to match your data)
5. Update your application code to use the new structure
6. Test thoroughly

## Rollback Plan

```sql
-- Drop the new tables (cascades will handle the junction table)
DROP VIEW IF EXISTS aircraft_engines_view;
DROP TABLE IF EXISTS aircraft_type_engines;
DROP TABLE IF EXISTS engines;

-- Remove engine_id from user_aircraft
ALTER TABLE user_aircraft DROP COLUMN IF EXISTS engine_id;
```
