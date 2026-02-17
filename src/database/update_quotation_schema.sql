-- Add booking_id to quotation_vouchers
ALTER TABLE public.quotation_vouchers 
ADD COLUMN IF NOT EXISTS booking_id TEXT;

-- Create sequence for quotation reference number if it doesn't exist
CREATE SEQUENCE IF NOT EXISTS public.quotation_ref_seq START 1001;

-- Function to get next quotation reference number
CREATE OR REPLACE FUNCTION public.get_next_quotation_ref()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  next_val INTEGER;
BEGIN
  next_val := nextval('public.quotation_ref_seq');
  RETURN 'QV-' || next_val;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_next_quotation_ref TO authenticated;
