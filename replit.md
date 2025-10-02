# MOSS Converge - OpenCipher CTF Platform

## Overview
This is a Capture The Flag (CTF) platform designed for college treasure-hunt events. The application allows users to participate in cybersecurity challenges, view leaderboards, and track their progress.

## Project Architecture
- **Frontend**: Vite + React 18 + TypeScript
- **UI Framework**: shadcn/ui with Tailwind CSS
- **Routing**: React Router DOM v6
- **State Management**: TanStack Query (React Query v5)
- **Backend/Database**: Supabase (PostgreSQL with authentication)
- **Build Tool**: Vite 5
- **Package Manager**: npm

## Tech Stack
- **React 18.3.1** - UI library
- **TypeScript 5.8.3** - Type safety
- **Vite 5.4.19** - Build tool and dev server
- **Tailwind CSS 3.4.17** - Utility-first CSS
- **shadcn/ui** - Component library (Radix UI primitives)
- **TanStack Query 5.83.0** - Data fetching and caching
- **React Router DOM 6.30.1** - Client-side routing
- **Supabase 2.58.0** - Backend as a service
- **Zod 3.25.76** - Schema validation
- **React Hook Form 7.61.1** - Form management

## Project Structure
```
src/
├── assets/           # Images and static assets
├── components/
│   ├── ui/          # shadcn/ui components
│   └── Navbar.tsx   # Navigation component
├── hooks/           # Custom React hooks
├── integrations/
│   └── supabase/    # Supabase client and types
├── lib/             # Utility functions
├── pages/           # Route components
│   ├── Landing.tsx
│   ├── Auth.tsx
│   ├── Challenges.tsx
│   ├── ChallengeDetail.tsx
│   ├── Leaderboard.tsx
│   ├── Profile.tsx
│   ├── Admin.tsx
│   └── NotFound.tsx
├── App.tsx          # Main app component with routes
└── main.tsx         # Entry point
```

## Key Features
- User authentication via Supabase
- CTF challenge management
- Real-time leaderboard
- User profiles
- Admin panel
- Responsive design with dark mode support

## Environment Variables
The project uses Supabase for backend services. Required environment variables:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Supabase anon/public key
- `VITE_SUPABASE_PROJECT_ID` - Supabase project identifier

## Running the Project
The development server runs on port 5000:
```bash
npm run dev
```

The application is configured to:
- Bind to `0.0.0.0:5000` for Replit compatibility
- Use strict port enforcement
- Support hot module replacement (HMR)

## Build Scripts
- `npm run dev` - Start development server
- `npm run build` - Production build
- `npm run build:dev` - Development build
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Recent Changes
- **2025-10-02**: Initial Replit setup
  - Configured Vite to use port 5000 with host 0.0.0.0
  - Set up workflow for automatic dev server start
  - Verified Supabase integration
  - Application successfully running and accessible

## Database Schema
The application uses Supabase PostgreSQL database with the following migrations:
- Migration `20251002173739_7ab56808` - Initial schema setup

## Notes
- The project was originally created with Lovable.dev
- Uses React Router with future flags warnings (can be resolved by adding v7 flags)
- Development server configured for Replit's proxy/iframe environment
- All shadcn/ui components are pre-installed and ready to use
