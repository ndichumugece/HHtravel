-- Rename package_types table to room_types
ALTER TABLE package_types RENAME TO room_types;

-- Rename policies for room_types (optional but good practice)
-- (Supabase might handle table rename in policies depending on version, but safe to leave or recreate if issues arise. 
-- For script simplicity, we assume policies might need manual intervention if not auto-updated, but table rename is key)

-- Rename column in booking_vouchers
ALTER TABLE booking_vouchers RENAME COLUMN package_type TO room_type;

-- Insert default Room Types if table was empty or just to ensure defaults
INSERT INTO room_types (name) VALUES 
('Single Room'),
('Double Room'),
('Twin Room'),
('Triple Room'),
('Quad Room'),
('Family Room'),
('Suite')
ON CONFLICT (name) DO NOTHING;
