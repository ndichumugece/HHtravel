-- OPTION 1: Promote a SPECIFIC user (Recommended)
-- Replace 'your_email@example.com' with your actual email address
UPDATE profiles
SET role = 'admin'
WHERE email = 'your_email@example.com';

-- OPTION 2: Promote EVERYONE (Dev Only - Use with caution)
-- UPDATE profiles
-- SET role = 'admin';
