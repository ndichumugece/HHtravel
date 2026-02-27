-- Fix for Property Insertion RLS Error
-- Run this in your Supabase SQL Editor to allow both Consultants and Admins to add properties.

-- 1. Ensure RLS is enabled
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- 2. Ensure view access for all authenticated users
DROP POLICY IF EXISTS "Properties are viewable by authenticated users" ON public.properties;
CREATE POLICY "Properties are viewable by authenticated users" 
ON public.properties FOR SELECT TO authenticated USING (true);

-- 3. Allow all authenticated users to insert new properties
DROP POLICY IF EXISTS "Authenticated users can insert properties" ON public.properties;
CREATE POLICY "Authenticated users can insert properties" 
ON public.properties FOR INSERT TO authenticated WITH CHECK (true);

-- 4. Admins still have full management rights (Update/Delete)
DROP POLICY IF EXISTS "Admins can manage properties" ON public.properties;
CREATE POLICY "Admins can manage properties" 
ON public.properties FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);
