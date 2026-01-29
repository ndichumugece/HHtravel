-- Add room_details column to booking_vouchers table to store dynamic list of rooms
ALTER TABLE booking_vouchers ADD COLUMN room_details JSONB DEFAULT '[]'::JSONB;
