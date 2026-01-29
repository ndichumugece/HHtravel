-- Create tables for dynamic options

-- Meal Plans
CREATE TABLE IF NOT EXISTS meal_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for meal_plans
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON meal_plans
  FOR SELECT USING (true);

-- Allow authenticated users (or admin only depending on preference, here sticking to auth) to insert/update/delete
CREATE POLICY "Allow authenticated insert" ON meal_plans
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update" ON meal_plans
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated delete" ON meal_plans
  FOR DELETE USING (auth.role() = 'authenticated');


-- Package Types
CREATE TABLE IF NOT EXISTS package_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for package_types
ALTER TABLE package_types ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON package_types
  FOR SELECT USING (true);

-- Allow authenticated users to insert/update/delete
CREATE POLICY "Allow authenticated insert" ON package_types
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update" ON package_types
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated delete" ON package_types
  FOR DELETE USING (auth.role() = 'authenticated');


-- Bed Types
CREATE TABLE IF NOT EXISTS bed_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for bed_types
ALTER TABLE bed_types ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON bed_types
  FOR SELECT USING (true);

-- Allow authenticated users to insert/update/delete
CREATE POLICY "Allow authenticated insert" ON bed_types
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update" ON bed_types
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated delete" ON bed_types
  FOR DELETE USING (auth.role() = 'authenticated');

-- Modify booking_vouchers to add bed_type
ALTER TABLE booking_vouchers ADD COLUMN IF NOT EXISTS bed_type TEXT;

-- Prepare initial data
INSERT INTO meal_plans (name) VALUES 
('Room Only'),
('Bed & Breakfast'),
('Half Board'),
('Full Board'),
('All Inclusive')
ON CONFLICT (name) DO NOTHING;

INSERT INTO package_types (name) VALUES 
('Full Board'),
('Ground Package')
ON CONFLICT (name) DO NOTHING;

INSERT INTO bed_types (name) VALUES 
('Single'),
('Double'),
('Twin'),
('Triple')
ON CONFLICT (name) DO NOTHING;
