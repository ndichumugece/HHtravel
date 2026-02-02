-- Add package_type and meal_plan columns to booking_vouchers table

ALTER TABLE public.booking_vouchers
ADD COLUMN IF NOT EXISTS package_type text,
ADD COLUMN IF NOT EXISTS meal_plan text;
