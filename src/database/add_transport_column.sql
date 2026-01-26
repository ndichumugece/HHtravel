-- Add mode_of_transport column to booking_vouchers table

ALTER TABLE public.booking_vouchers 
ADD COLUMN IF NOT EXISTS mode_of_transport TEXT;
