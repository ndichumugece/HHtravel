-- Allow Admins to update user roles
-- This policy ensures that users with the 'admin' role can update any profile in the database.

-- Check if policy exists before creating (optional, but good for idempotency if running manually)
DROP POLICY IF EXISTS "Admins can update user profiles" ON public.profiles;

CREATE POLICY "Admins can update user profiles" 
ON public.profiles FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);
