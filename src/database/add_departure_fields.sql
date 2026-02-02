-- Add departure transfer columns to booking_vouchers table

ALTER TABLE public.booking_vouchers
ADD COLUMN IF NOT EXISTS departure_mode_of_transport text,
ADD COLUMN IF NOT EXISTS departure_airline text,
ADD COLUMN IF NOT EXISTS flight_departure_date date,
ADD COLUMN IF NOT EXISTS departure_time text;
