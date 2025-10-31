# Aircraft & Engine Management System

## Overview
Your aviation logbook now has a professional aircraft-engine management system with admin-controlled master data and dynamic engine selection based on aircraft type compatibility.

## How It Works

### For Admin (Backend)
1. **Manage Master Data:**
   - Add aircraft types (Boeing 787-9, Airbus A320neo, etc.)
   - Add engine types (Trent 1000, LEAP-1A, GEnx, etc.)
   - Link compatible engines to aircraft types

2. **Define Compatibility:**
   - Boeing 787-9 can have: Trent 1000 OR GEnx engines
   - Airbus A320neo can have: LEAP-1A OR PW1100G engines
   - Mark common/recommended engine options

### For Users (Frontend)
1. **Add Aircraft to Fleet:**
   - Select aircraft type (e.g., Boeing 787-9)
   - Engine dropdown automatically shows ONLY compatible engines
   - Select specific engine variant
   - Enter registration (tail number)

2. **Create Logbook Entries:**
   - Select from your personal aircraft fleet
   - Entry automatically includes aircraft + engine details

## Database Structure

```
engines
├── id
├── manufacturer (e.g., "Rolls-Royce")
├── model (e.g., "Trent")
├── variant (e.g., "1000-J")
└── full_designation (e.g., "Trent 1000-J")

aircraft_type_engines (Junction Table)
├── aircraft_type_id → links to aircraft_types
├── engine_id → links to engines
├── is_common → marks recommended/common option
└── notes → additional info

user_aircraft
├── registration (e.g., "G-ZBKA")
├── aircraft_type_id → links to aircraft_types
├── engine_id → links to engines
├── manufacturer, serial_number, etc.
└── is_active
```

## Migration Steps

1. **Run Database Migration:**
   - Open `DATABASE_MIGRATION_V2.md`
   - Run SQL commands in your Supabase SQL editor
   - This creates: `engines` table, `aircraft_type_engines` table
   - Populates sample engine data

2. **Link Aircraft Types with Engines:**
   - Use the SQL examples in the migration guide
   - Customize based on your aircraft types

3. **Test the System:**
   - Navigate to Aircraft tab
   - Add an aircraft
   - Select aircraft type → See filtered engines!

## Example Relationships

**Boeing 787-9:**
- Rolls-Royce Trent 1000-A (Common)
- Rolls-Royce Trent 1000-C
- Rolls-Royce Trent 1000-E
- Rolls-Royce Trent 1000-J
- GE GEnx-1B64
- GE GEnx-1B70
- GE GEnx-1B75

**Airbus A320neo:**
- CFM LEAP-1A26 (Common)
- CFM LEAP-1A33
- Pratt & Whitney PW1127G-JM
- Pratt & Whitney PW1133G-JM

## Admin SQL Examples

### Add a new engine:
```sql
INSERT INTO engines (manufacturer, model, variant, full_designation)
VALUES ('Rolls-Royce', 'Trent', 'XWB-97', 'Trent XWB-97');
```

### Link engine to aircraft:
```sql
INSERT INTO aircraft_type_engines (aircraft_type_id, engine_id, is_common)
VALUES (
  (SELECT id FROM aircraft_types WHERE type_code = 'A350'),
  (SELECT id FROM engines WHERE full_designation = 'Trent XWB-97'),
  true
);
```

### View all aircraft-engine relationships:
```sql
SELECT
  type_code,
  engine_manufacturer,
  engine_model,
  engine_variant,
  CASE WHEN is_common THEN 'Yes' ELSE 'No' END as common
FROM aircraft_engines_view
ORDER BY type_code, is_common DESC;
```

## Benefits

✅ **Data Integrity:** Users can't enter incompatible engines
✅ **Easy to Use:** Dropdown automatically filters compatible engines
✅ **Maintainable:** Admin controls master data centrally
✅ **Professional:** Matches real aircraft-engine relationships
✅ **Scalable:** Easy to add new aircraft/engines

## Files Changed

- `DATABASE_MIGRATION_V2.md` - Complete SQL migration
- `src/hooks/useLogbookData.js` - Fetches engines and relationships
- `src/components/modals/AircraftModal.jsx` - Dynamic engine dropdown
- `src/components/views/AircraftView.jsx` - Displays engine info
- `src/App.jsx` - Passes engine data to components

## Next Steps

1. Run the database migration
2. Populate your aircraft types
3. Add engines and link them to aircraft types
4. Test adding aircraft with dynamic engine selection!
