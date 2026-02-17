
-- Add avatar_url and last_active columns to profiles table

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'avatar_url') THEN
        ALTER TABLE profiles ADD COLUMN avatar_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'last_active') THEN
        ALTER TABLE profiles ADD COLUMN last_active TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;
