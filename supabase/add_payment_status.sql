-- SQL Migration: Add payment_status to booking_vouchers
ALTER TABLE booking_vouchers 
ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending' 
CHECK (payment_status IN ('pending', 'discounted', 'completed'));
