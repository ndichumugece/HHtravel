-- Create room_types table
CREATE TABLE IF NOT EXISTS room_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE room_types ENABLE ROW LEVEL SECURITY;

-- Drop policies if they exist to avoid 42710 errors
DROP POLICY IF EXISTS "Allow public read access" ON room_types;
DROP POLICY IF EXISTS "Allow authenticated insert" ON room_types;
DROP POLICY IF EXISTS "Allow authenticated update" ON room_types;
DROP POLICY IF EXISTS "Allow authenticated delete" ON room_types;

-- Re-create policies
CREATE POLICY "Allow public read access" ON room_types FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON room_types FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update" ON room_types FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete" ON room_types FOR DELETE USING (auth.role() = 'authenticated');

-- Insert initial data
INSERT INTO room_types (name) VALUES 
('Standard'),
('Deluxe'),
('Suite'),
('Family Room'),
('Executive Suite')
ON CONFLICT (name) DO NOTHING;
