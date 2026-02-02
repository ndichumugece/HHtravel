-- Add special_transport_note column to booking_vouchers table

ALTER TABLE public.booking_vouchers
ADD COLUMN IF NOT EXISTS special_transport_note text;
