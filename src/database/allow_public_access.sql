-- Enable RLS on tables if not already enabled (good practice)
ALTER TABLE booking_vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access (anon role) to booking_vouchers
CREATE POLICY "Public read booking vouchers"
ON booking_vouchers FOR SELECT
TO anon
USING (true);

-- Allow public read access to company_settings
CREATE POLICY "Public read company settings"
ON company_settings FOR SELECT
TO anon
USING (true);

-- Ensure authenticated users can still read (if not covered by other policies)
CREATE POLICY "Authenticated read booking vouchers"
ON booking_vouchers FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated read company settings"
ON company_settings FOR SELECT
TO authenticated
USING (true);
