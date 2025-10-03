# Authentication Setup Guide

This application now uses Supabase Authentication instead of the PHP backend.

## Setup Instructions

### 1. Database Migration

The database schema has been updated in `/supabase/migrations/20251002173739_7ab56808-c204-4075-a9e2-537d32ed2a50.sql`

This migration includes:
- User profiles table
- User roles system (admin/user)
- Challenges, solves, and submissions tables
- Row Level Security (RLS) policies
- Automatic profile creation on user signup
- Helper function to promote users to admin

### 2. Create Admin User

To create an admin user:

1. Sign up a new user through the application UI or Supabase Dashboard
2. In Supabase SQL Editor, run the following command:

```sql
SELECT public.promote_to_admin('admin@ctf.local');
```

Replace `admin@ctf.local` with the email of the user you want to promote to admin.

### 3. Authentication Flow

The application now uses Supabase Auth with email/password authentication:

- Users are created via Supabase Auth
- Profile is automatically created in `profiles` table via trigger
- Default role is 'user'
- Admin users need to be promoted manually using the SQL function

### 4. Testing Login

1. Create a user in Supabase Dashboard (Authentication > Users > Add User)
   - Email: admin@ctf.local
   - Password: admin123
   - Auto Confirm User: Yes

2. Promote to admin:
```sql
SELECT public.promote_to_admin('admin@ctf.local');
```

3. Login through the application

## Architecture Changes

### Before (PHP Backend)
- PHP API with session-based authentication
- MySQL/PostgreSQL direct user table
- Password hashing in PHP

### After (Supabase)
- Supabase Authentication
- JWT-based authentication
- Supabase built-in password hashing
- Row Level Security for data access
- Real-time capabilities ready

## Security Features

- Row Level Security (RLS) enabled on all tables
- Users can only view/update their own data
- Admin role required for challenge management
- Automatic profile creation on signup
- Secure password storage via Supabase Auth
