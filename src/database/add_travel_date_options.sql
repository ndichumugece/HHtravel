-- Add travel_date_type and travel_month columns to quotation_vouchers
ALTER TABLE public.quotation_vouchers 
ADD COLUMN IF NOT EXISTS travel_date_type TEXT DEFAULT 'specific',
ADD COLUMN IF NOT EXISTS travel_month TEXT;

-- Update existing records to have 'specific' as default (if not already set)
UPDATE public.quotation_vouchers SET travel_date_type = 'specific' WHERE travel_date_type IS NULL;
