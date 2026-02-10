-- Create Inclusions Table
CREATE TABLE IF NOT EXISTS inclusions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  icon_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for inclusions
ALTER TABLE inclusions ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON inclusions
  FOR SELECT USING (true);

-- Allow authenticated users to insert/update/delete
CREATE POLICY "Allow authenticated insert" ON inclusions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update" ON inclusions
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated delete" ON inclusions
  FOR DELETE USING (auth.role() = 'authenticated');


-- Create Exclusions Table
CREATE TABLE IF NOT EXISTS exclusions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  icon_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for exclusions
ALTER TABLE exclusions ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON exclusions
  FOR SELECT USING (true);

-- Allow authenticated users to insert/update/delete
CREATE POLICY "Allow authenticated insert" ON exclusions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update" ON exclusions
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated delete" ON exclusions
  FOR DELETE USING (auth.role() = 'authenticated');

-- Initial Data for Inclusions
INSERT INTO inclusions (name) VALUES 
('Return flights from Nairobi to the Coast'),
('Return flights from Nairobi to the Park/Conservancy'),
('Return Airport/Airstrip transfers to the property'),
('Breakfast, Lunch and Dinner'),
('Soft Drinks, Local Beers, House Wines and Selected Spirits'),
('Accommodation'),
('Soft Drinks only'),
('Breakfast and Dinner'),
('Bed and Breakfast'),
('Sundowners'),
('E- Bikes'),
('Shared Morning and Evening Game Drives'),
('Private Land Cruiser'),
('Private English-speaking Guide'),
('Daily Game Drives'),
('Horse Riding'),
('Camel rides'),
('Conservancy Fee'),
('Park Fee included'),
('Bush walks'),
('Picnic Bush Breakfast'),
('Picnic Bush Dinner'),
('Boat Transfer'),
('Laundry Services'),
('Emergency Medical Evacuation'),
('Night Game Drive'),
('Cultural Visit transfers'),
('Complimentary Back and Neck Massage'),
('Mountain Biking'),
('Rhino Tracking'),
('Tours to Waitabit Farm'),
('Farm and Factory visits')
ON CONFLICT (name) DO NOTHING;

-- Initial Data for Exclusions
INSERT INTO exclusions (name) VALUES 
('Spa treatments'),
('Conservancy fee'),
('Travel Insurance'),
('Park Fee')
ON CONFLICT (name) DO NOTHING;
