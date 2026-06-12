-- Secure Role-Based Function to Delete Users
-- This function allows Admins to delete a user from the auth.users table.
-- It executes with SECURITY DEFINER to bypass standard RLS restrictions on the auth schema,
-- but strictly checks if the calling user is an Admin.

CREATE OR REPLACE FUNCTION public.delete_user_by_id(user_id UUID)
RETURNS VOID AS $$
DECLARE
  user_email TEXT;
BEGIN
  -- 1. Authorization Check: Ensure the caller is an Admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access Denied: Only Admins can delete users.';
  END IF;

  -- Get the email of the user to delete any associated invite
  SELECT email INTO user_email FROM auth.users WHERE id = user_id;

  -- 2. Perform the deletion (referencing auth.users)
  -- Because profiles has ON DELETE CASCADE, this will also remove the profile.
  DELETE FROM auth.users WHERE id = user_id;

  -- Delete the associated invite if any
  IF user_email IS NOT NULL THEN
    DELETE FROM public.user_invites WHERE email = user_email;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
