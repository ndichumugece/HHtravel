-- Add template columns to company_settings table
ALTER TABLE company_settings
ADD COLUMN IF NOT EXISTS booking_template text DEFAULT 'template1',
ADD COLUMN IF NOT EXISTS quotation_template text DEFAULT 'template1';

-- Update existing row if any to default
UPDATE company_settings
SET booking_template = 'template1',
    quotation_template = 'template1'
WHERE booking_template IS NULL;
