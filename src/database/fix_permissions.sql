-- Comprehensive Fix for H&H Travel Permissions [Final Version]
-- Runs safely to re-establish RLS for Profiles, Vouchers, Quotations, and Properties.

-- 0. Helper Function to prevent Infinite Recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- 1. PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.is_admin());

-- 2. BOOKING VOUCHERS
ALTER TABLE public.booking_vouchers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Consultants can view own booking vouchers" ON public.booking_vouchers;
DROP POLICY IF EXISTS "Admins can view all booking vouchers" ON public.booking_vouchers;
DROP POLICY IF EXISTS "Consultants can create vouchers" ON public.booking_vouchers;
DROP POLICY IF EXISTS "Users can create own vouchers" ON public.booking_vouchers;
DROP POLICY IF EXISTS "Consultants can update own vouchers" ON public.booking_vouchers;
DROP POLICY IF EXISTS "Admins can update all vouchers" ON public.booking_vouchers;
DROP POLICY IF EXISTS "Admins can delete all vouchers" ON public.booking_vouchers;

CREATE POLICY "Consultants can view own booking vouchers" ON public.booking_vouchers FOR SELECT USING (auth.uid() = consultant_id);
CREATE POLICY "Admins can view all booking vouchers" ON public.booking_vouchers FOR SELECT USING (public.is_admin());
CREATE POLICY "Users can create own vouchers" ON public.booking_vouchers FOR INSERT WITH CHECK (auth.uid() = consultant_id);
CREATE POLICY "Consultants can update own vouchers" ON public.booking_vouchers FOR UPDATE USING (auth.uid() = consultant_id);
CREATE POLICY "Admins can update all vouchers" ON public.booking_vouchers FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete all vouchers" ON public.booking_vouchers FOR DELETE USING (public.is_admin());

-- 3. QUOTATION VOUCHERS
ALTER TABLE public.quotation_vouchers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Consultants can view own quotations" ON public.quotation_vouchers;
DROP POLICY IF EXISTS "Admins can view all quotations" ON public.quotation_vouchers;
DROP POLICY IF EXISTS "Consultants can create quotations" ON public.quotation_vouchers;
DROP POLICY IF EXISTS "Consultants can update own quotations" ON public.quotation_vouchers;
DROP POLICY IF EXISTS "Users can create own quotations" ON public.quotation_vouchers;
DROP POLICY IF EXISTS "Admins can update all quotations" ON public.quotation_vouchers;
DROP POLICY IF EXISTS "Admins can delete all quotations" ON public.quotation_vouchers;

CREATE POLICY "Consultants can view own quotations" ON public.quotation_vouchers FOR SELECT USING (auth.uid() = consultant_id);
CREATE POLICY "Admins can view all quotations" ON public.quotation_vouchers FOR SELECT USING (public.is_admin());
CREATE POLICY "Users can create own quotations" ON public.quotation_vouchers FOR INSERT WITH CHECK (auth.uid() = consultant_id);
CREATE POLICY "Consultants can update own quotations" ON public.quotation_vouchers FOR UPDATE USING (auth.uid() = consultant_id);
CREATE POLICY "Admins can update all quotations" ON public.quotation_vouchers FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete all quotations" ON public.quotation_vouchers FOR DELETE USING (public.is_admin());

-- 4. PROPERTIES
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Properties are viewable by authenticated users" ON public.properties;
DROP POLICY IF EXISTS "Admins can manage properties" ON public.properties;

CREATE POLICY "Properties are viewable by authenticated users" ON public.properties FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage properties" ON public.properties FOR ALL USING (public.is_admin());

-- 5. FINAL GRANTS
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
