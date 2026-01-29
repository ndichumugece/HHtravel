-- Rename room_types table back to package_types (if desired, or we just leave it for now?)
-- Actually, user just said "replace room type to package type" in the form. But for consistency, let's rename the column in booking_vouchers.

ALTER TABLE booking_vouchers RENAME COLUMN room_type TO package_type;
