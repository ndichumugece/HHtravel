-- Add inclusions and exclusions columns to quotation_vouchers
ALTER TABLE public.quotation_vouchers
ADD COLUMN IF NOT EXISTS inclusions TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS exclusions TEXT[] DEFAULT '{}';
