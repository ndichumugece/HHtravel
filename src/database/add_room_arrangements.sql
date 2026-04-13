-- Add room_arrangements column to quotation_vouchers
ALTER TABLE public.quotation_vouchers 
ADD COLUMN IF NOT EXISTS room_arrangements TEXT;
