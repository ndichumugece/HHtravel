-- MASTER SETUP SCRIPT
-- Run this entire script to fix all missing tables and existing policy errors.

-- 1. MEAL PLANS
CREATE TABLE IF NOT EXISTS meal_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access" ON meal_plans;
DROP POLICY IF EXISTS "Allow authenticated insert" ON meal_plans;
DROP POLICY IF EXISTS "Allow authenticated update" ON meal_plans;
DROP POLICY IF EXISTS "Allow authenticated delete" ON meal_plans;
CREATE POLICY "Allow public read access" ON meal_plans FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON meal_plans FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update" ON meal_plans FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete" ON meal_plans FOR DELETE USING (auth.role() = 'authenticated');

-- 2. PACKAGE TYPES
CREATE TABLE IF NOT EXISTS package_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE package_types ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access" ON package_types;
DROP POLICY IF EXISTS "Allow authenticated insert" ON package_types;
DROP POLICY IF EXISTS "Allow authenticated update" ON package_types;
DROP POLICY IF EXISTS "Allow authenticated delete" ON package_types;
CREATE POLICY "Allow public read access" ON package_types FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON package_types FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update" ON package_types FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete" ON package_types FOR DELETE USING (auth.role() = 'authenticated');

-- 3. BED TYPES
CREATE TABLE IF NOT EXISTS bed_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE bed_types ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access" ON bed_types;
DROP POLICY IF EXISTS "Allow authenticated insert" ON bed_types;
DROP POLICY IF EXISTS "Allow authenticated update" ON bed_types;
DROP POLICY IF EXISTS "Allow authenticated delete" ON bed_types;
CREATE POLICY "Allow public read access" ON bed_types FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON bed_types FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update" ON bed_types FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete" ON bed_types FOR DELETE USING (auth.role() = 'authenticated');

-- 4. ROOM TYPES (This is the one that was missing!)
CREATE TABLE IF NOT EXISTS room_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE room_types ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access" ON room_types;
DROP POLICY IF EXISTS "Allow authenticated insert" ON room_types;
DROP POLICY IF EXISTS "Allow authenticated update" ON room_types;
DROP POLICY IF EXISTS "Allow authenticated delete" ON room_types;
CREATE POLICY "Allow public read access" ON room_types FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON room_types FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update" ON room_types FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete" ON room_types FOR DELETE USING (auth.role() = 'authenticated');


-- 5. INSERT INITIAL DATA (Safe to run)
INSERT INTO meal_plans (name) VALUES 
('Room Only'), ('Bed & Breakfast'), ('Half Board'), ('Full Board'), ('All Inclusive')
ON CONFLICT (name) DO NOTHING;

INSERT INTO package_types (name) VALUES 
('Full Board'), ('Ground Package')
ON CONFLICT (name) DO NOTHING;

INSERT INTO bed_types (name) VALUES 
('Single'), ('Double'), ('Twin'), ('Triple')
ON CONFLICT (name) DO NOTHING;

INSERT INTO room_types (name) VALUES 
('Standard'), ('Deluxe'), ('Suite'), ('Family Room'), ('Executive Suite')
ON CONFLICT (name) DO NOTHING;
