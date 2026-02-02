-- Add dietary_requirements column to booking_vouchers table

ALTER TABLE public.booking_vouchers
ADD COLUMN IF NOT EXISTS dietary_requirements text;
