-- Add airline and flight_arrival_date columns to booking_vouchers table

ALTER TABLE public.booking_vouchers
ADD COLUMN IF NOT EXISTS airline text,
ADD COLUMN IF NOT EXISTS flight_arrival_date date;
