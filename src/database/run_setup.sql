CREATE TABLE IF NOT EXISTS inclusions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    icon_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exclusions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    icon_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE inclusions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exclusions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access" ON inclusions;
CREATE POLICY "Allow public read access" ON inclusions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert" ON inclusions;
CREATE POLICY "Allow authenticated insert" ON inclusions FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated update" ON inclusions;
CREATE POLICY "Allow authenticated update" ON inclusions FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated delete" ON inclusions;
CREATE POLICY "Allow authenticated delete" ON inclusions FOR DELETE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow public read access" ON exclusions;
CREATE POLICY "Allow public read access" ON exclusions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert" ON exclusions;
CREATE POLICY "Allow authenticated insert" ON exclusions FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated update" ON exclusions;
CREATE POLICY "Allow authenticated update" ON exclusions FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated delete" ON exclusions;
CREATE POLICY "Allow authenticated delete" ON exclusions FOR DELETE USING (auth.role() = 'authenticated');

INSERT INTO storage.buckets (id, name, public) 
VALUES ('company_assets', 'company_assets', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'company_assets');

DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'company_assets' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated Delete" ON storage.objects;
CREATE POLICY "Authenticated Delete" ON storage.objects FOR DELETE USING (bucket_id = 'company_assets' AND auth.role() = 'authenticated');
