-- Add mode_of_transport and arrival_time columns to booking_vouchers table

ALTER TABLE public.booking_vouchers
ADD COLUMN IF NOT EXISTS mode_of_transport text,
ADD COLUMN IF NOT EXISTS arrival_time text;
