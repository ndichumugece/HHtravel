
-- Drop existing table if exists (for development/clean state) or alter
-- For safety, we'll try to create if not exists and add columns if missing.

CREATE TABLE IF NOT EXISTS public.user_invites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('admin', 'consultant')) DEFAULT 'consultant',
  token UUID DEFAULT uuid_generate_v4(),
  invited_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days') 
);

-- Ensure token column exists if table already existed
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_invites' AND column_name = 'token') THEN
        ALTER TABLE public.user_invites ADD COLUMN token UUID DEFAULT uuid_generate_v4();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_invites' AND column_name = 'expires_at') THEN
        ALTER TABLE public.user_invites ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days');
    END IF;
END $$;

-- RLS
ALTER TABLE public.user_invites ENABLE ROW LEVEL SECURITY;

-- Admins can manage all invites
DROP POLICY IF EXISTS "Admins can manage invites" ON public.user_invites;
CREATE POLICY "Admins can manage invites" 
ON public.user_invites FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Public can read invites by token (needed for signup page to validate token and get email)
DROP POLICY IF EXISTS "Public can read invites by token" ON public.user_invites;
CREATE POLICY "Public can read invites by token" 
ON public.user_invites FOR SELECT USING (
  token IS NOT NULL
);
