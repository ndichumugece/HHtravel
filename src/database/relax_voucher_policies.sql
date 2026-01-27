-- Relax RLS Policies for Booking Vouchers
-- Purpose: Allow ALL authenticated users (Consultants & Admins) to View, Create, Update, and Delete ANY voucher.

-- 1. DROP all existing policies on booking_vouchers to start fresh
DROP POLICY IF EXISTS "Consultants can view own booking vouchers" ON public.booking_vouchers;
DROP POLICY IF EXISTS "Admins can view all booking vouchers" ON public.booking_vouchers;
DROP POLICY IF EXISTS "Consultants can create vouchers" ON public.booking_vouchers;
DROP POLICY IF EXISTS "Consultants can update own vouchers" ON public.booking_vouchers;
DROP POLICY IF EXISTS "Admins can update all vouchers" ON public.booking_vouchers;
-- Drop any potentially other named policies just in case
DROP POLICY IF EXISTS "Enable read access for all users" ON public.booking_vouchers;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.booking_vouchers;
DROP POLICY IF EXISTS "Enable update for all users" ON public.booking_vouchers;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.booking_vouchers;

-- 2. Create PERMISSIVE policies for all authenticated users

-- VIEW: Everyone can view everything
CREATE POLICY "Allow all authenticated to view vouchers"
ON public.booking_vouchers FOR SELECT
TO authenticated
USING (true);

-- INSERT: Everyone can create vouchers
CREATE POLICY "Allow all authenticated to insert vouchers"
ON public.booking_vouchers FOR INSERT
TO authenticated
WITH CHECK (true);

-- UPDATE: Everyone can update everything
CREATE POLICY "Allow all authenticated to update vouchers"
ON public.booking_vouchers FOR UPDATE
TO authenticated
USING (true);

-- DELETE: Everyone can delete everything
CREATE POLICY "Allow all authenticated to delete vouchers"
ON public.booking_vouchers FOR DELETE
TO authenticated
USING (true);
