-- Add color column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS color TEXT;

-- Update existing profiles with random colors if they don't have one
-- Using a simple hash-based approach or just random hex for now
UPDATE public.profiles
SET color = '#' || substr(md5(random()::text), 1, 6)
WHERE color IS NULL;

-- Update the handle_new_user function to assign a random color
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, color)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name', 
    'consultant',
    '#' || substr(md5(random()::text), 1, 6)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure RLS allows admins to update colors for others (already covered by "Users can update own profile" for self, 
-- but admins need to update others. 
-- The existing policy "Users can update own profile" checks auth.uid() = id. We need an admin policy.

DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile" 
ON public.profiles FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);
