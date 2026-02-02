-- Add room_details column to booking_vouchers table

ALTER TABLE public.booking_vouchers
ADD COLUMN IF NOT EXISTS room_details jsonb DEFAULT '[]'::jsonb;
