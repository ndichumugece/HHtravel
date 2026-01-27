-- Add quotation_price column to booking_vouchers table
ALTER TABLE booking_vouchers 
ADD COLUMN quotation_price NUMERIC DEFAULT 0;

-- Comment for the user
-- Run this SQL in your Supabase SQL Editor to update the table schema.
