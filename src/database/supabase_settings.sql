-- Create a table for company settings (Single row intended)
CREATE TABLE IF NOT EXISTS company_settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  company_name text NOT NULL DEFAULT 'H&H Travel',
  company_email text,
  company_address text,
  company_website text,
  logo_url text, -- URL to the image in storage or external
  pdf_footer_text text DEFAULT 'Thank you for tracking with us.'
);

-- RLS Policies
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

-- Allow read access to everyone (authenticated)
CREATE POLICY "Allow authenticated read access" ON company_settings
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow update access only to admins
-- Note: You might need a more robust check for 'admin' role depending on your setup.
-- Assuming 'admin' in profiles table or auth.jwt() -> app_metadata -> role
CREATE POLICY "Allow admin update access" ON company_settings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Allow insert only if table is empty (Singleton pattern enforcement attempt)
CREATE POLICY "Allow admin insert if empty" ON company_settings
  FOR INSERT WITH CHECK (
    NOT EXISTS (SELECT 1 FROM company_settings) AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Insert default row if not exists
INSERT INTO company_settings (company_name)
SELECT 'H&H Travel'
WHERE NOT EXISTS (SELECT 1 FROM company_settings);
