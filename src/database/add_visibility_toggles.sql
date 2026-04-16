-- Add visibility toggles for quotation sections
ALTER TABLE public.quotation_vouchers 
ADD COLUMN IF NOT EXISTS show_hotel_comparison BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS show_inclusions_exclusions BOOLEAN DEFAULT false;
