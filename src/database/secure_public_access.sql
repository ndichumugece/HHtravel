-- SECURITY UPDATE: Secure Public Access
-- Run this script to fix the critical data leak vulnerability.

-- 1. Revoke the dangerous "List All" policy for public users
-- This stops anyone from running "SELECT * FROM booking_vouchers"
DROP POLICY IF EXISTS "Public read booking vouchers" ON booking_vouchers;

-- 2. Create a secure function to fetch ONLY a single booking by ID
-- SECURITY DEFINER allows this function to bypass RLS, but the logic restricts it to one record.
CREATE OR REPLACE FUNCTION get_public_booking(booking_id UUID)
RETURNS SETOF booking_vouchers
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY SELECT * FROM booking_vouchers WHERE id = booking_id;
END;
$$;

-- 3. Allow public (anon) and logged-in users to call this function
GRANT EXECUTE ON FUNCTION get_public_booking(UUID) TO anon, authenticated;
