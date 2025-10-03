-- Seed file for creating initial admin user
-- This file should be run manually after setting up Supabase

-- First, create a user in Supabase Auth Dashboard with:
-- Email: admin@ctf.local
-- Password: admin123

-- Then get the user's UUID from auth.users table and run:
-- UPDATE: This is just documentation. The actual admin user must be created via Supabase Dashboard
-- or the auth.signUp() API, then you can run the following to make them admin:

-- Replace 'USER_UUID_HERE' with the actual UUID from auth.users
-- Example:
-- INSERT INTO public.user_roles (user_id, role)
-- VALUES ('USER_UUID_HERE', 'admin')
-- ON CONFLICT (user_id, role) DO NOTHING;

-- For testing purposes, if you have created a user via Supabase auth,
-- you can promote them to admin by running:
--
-- INSERT INTO public.user_roles (user_id, role)
-- SELECT id, 'admin'::app_role
-- FROM auth.users
-- WHERE email = 'admin@ctf.local'
-- ON CONFLICT (user_id, role) DO NOTHING;
