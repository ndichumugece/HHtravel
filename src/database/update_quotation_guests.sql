-- Add columns for structured guest and room information to quotation_vouchers
ALTER TABLE public.quotation_vouchers 
ADD COLUMN IF NOT EXISTS number_of_adults INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS number_of_children INTEGER DEFAULT 0;

-- Ensure number_of_rooms has a default if not already set (it exists in schema.sql but might need a default)
ALTER TABLE public.quotation_vouchers 
ALTER COLUMN number_of_rooms SET DEFAULT 1;

-- Sync existing data: If number_of_rooms is null, set to 1
UPDATE public.quotation_vouchers 
SET number_of_rooms = 1 
WHERE number_of_rooms IS NULL;
