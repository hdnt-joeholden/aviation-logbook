# Admin Setup Migration

## Add Admin Flag to Profiles

This migration adds an `is_admin` flag to the profiles table to control access to the admin backend.

### 1. Add is_admin column to profiles table

```sql
-- Add is_admin column (defaults to false for security)
ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN DEFAULT false NOT NULL;

-- Create index for faster admin checks
CREATE INDEX idx_profiles_is_admin ON profiles(is_admin) WHERE is_admin = true;
```

### 2. Make yourself an admin

Replace `your-email@example.com` with your actual email:

```sql
-- Set your user as admin
UPDATE profiles
SET is_admin = true
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'your-email@example.com'
);
```

### 3. Verify admin status

```sql
-- Check who is an admin
SELECT
  au.email,
  p.first_name,
  p.last_name,
  p.is_admin
FROM profiles p
JOIN auth.users au ON p.id = au.id
WHERE p.is_admin = true;
```

## RLS Policies for Admin Tables

Add admin-only policies for managing engines and aircraft-engine relationships:

```sql
-- Only admins can insert/update/delete engines
CREATE POLICY "Admins can manage engines"
  ON engines FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Only admins can insert/update/delete aircraft-engine relationships
CREATE POLICY "Admins can manage aircraft engine links"
  ON aircraft_type_engines FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Admins can update other users' admin status (but existing policies allow users to see/update their own)
CREATE POLICY "Admins can update user profiles"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
    )
  );
```

## Notes

- By default, all new users will have `is_admin = false`
- Only manually promote users to admin via SQL
- The admin UI will only be visible to users with `is_admin = true`
- Regular users can still read engine and aircraft type data (SELECT policies already exist)
