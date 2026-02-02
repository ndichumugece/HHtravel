-- triggers/update_property_name.sql

-- 1. Create the function that will perform the updates
CREATE OR REPLACE FUNCTION update_book_voucher_property_name()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if the name has actually changed
    IF OLD.name <> NEW.name THEN
        -- Update the specific column in booking_vouchers
        UPDATE booking_vouchers
        SET property_name = NEW.name
        WHERE property_name = OLD.name;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Create the trigger on the properties table
DROP TRIGGER IF EXISTS tr_update_property_name ON properties;

CREATE TRIGGER tr_update_property_name
AFTER UPDATE ON properties
FOR EACH ROW
EXECUTE FUNCTION update_book_voucher_property_name();
