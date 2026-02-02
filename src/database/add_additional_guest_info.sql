-- Add additional_guest_info column to booking_vouchers table

ALTER TABLE public.booking_vouchers
ADD COLUMN IF NOT EXISTS additional_guest_info text;
