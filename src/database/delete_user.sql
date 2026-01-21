-- Secure Role-Based Function to Delete Users
-- This function allows Admins to delete a user from the auth.users table.
-- It executes with SECURITY DEFINER to bypass standard RLS restrictions on the auth schema,
-- but strictly checks if the calling user is an Admin.

CREATE OR REPLACE FUNCTION public.delete_user_by_id(user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- 1. Authorization Check: Ensure the caller is an Admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access Denied: Only Admins can delete users.';
  END IF;

  -- 2. Perform the deletion (referencing auth.users)
  -- Because profiles has ON DELETE CASCADE, this will also remove the profile.
  DELETE FROM auth.users WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
