-- Create a table to store pending invites with roles
CREATE TABLE IF NOT EXISTS public.user_invites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('admin', 'consultant')) DEFAULT 'consultant',
  invited_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for Invites
ALTER TABLE public.user_invites ENABLE ROW LEVEL SECURITY;

-- Admins can manage all invites
CREATE POLICY "Admins can manage invites" 
ON public.user_invites FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Update the handle_new_user trigger to check for pending invites
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
  invited_role TEXT;
BEGIN
  -- Check if there is a pending invite for this email
  SELECT role INTO invited_role FROM public.user_invites WHERE email = new.email;

  -- If invite exists, use that role, otherwise default to 'consultant'
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', 'New User'), 
    COALESCE(invited_role, 'consultant')
  );

  -- Delete the invite if it existed (claimed)
  IF invited_role IS NOT NULL THEN
    DELETE FROM public.user_invites WHERE email = new.email;
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
