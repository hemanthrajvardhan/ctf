# CONVERGE PRESENTS OpenCipher - CTF Platform

## Project Overview
A two-round open-source Capture The Flag (CTF) event platform called "CONVERGE PRESENTS OPENCIPHER" with PHP backend (Slim framework) and React frontend. The platform is specifically designed for two unique competition rounds: "The Cryptic Trail" (Round 1) and "The Patch Arena" (Round 2).

## Tech Stack
- **Backend**: PHP 8.1+ with Slim Framework
- **Frontend**: React + TypeScript with Vite
- **Database**: PostgreSQL (Replit-managed)
- **Styling**: Tailwind CSS + shadcn/ui components
- **Routing**: React Router / Wouter

## Key Features Implemented

### Authentication & User Management
- **Admin-only user creation** - No public signup allowed
- Login credentials: `admin@ctf.local` / `admin123`
- Role-based access control (admin, player)
- User ban/unban functionality
- Session management with PHP sessions

### Challenge System
- Full CRUD operations for challenges
- **Visibility controls** - Show/hide challenges from players
- **Round assignment** - Round 1 (The Cryptic Trail) or Round 2 (The Patch Arena)
- **Image URLs** - Display challenge images
- **External links** - Link to GitHub repos or external resources
- Categories: Cryptography, Cyber Security, Programming, Git, Forensics, Web, Reverse Engineering, Miscellaneous
- Points system
- Flag validation

### Hints System
- Multiple hints per challenge
- **Cost-based hints** - Deduct points when purchased
- **Time-based hints** - Auto-unlock after specified minutes
- Position ordering for hint display
- Full CRUD operations for hints

### Admin Dashboard
- **Users Tab**:
  - Create new users with email, name, password, and role
  - View all users with status
  - Ban/Unban users
  
- **Challenges Tab**:
  - Create and edit challenges with all fields
  - Round selection dropdown
  - Visibility toggle switch
  - Image URL and external link inputs
  - Manage hints for each challenge (add/delete)
  - Delete challenges

### Leaderboard & Submissions
- Track user submissions
- Points calculation
- Leaderboard ranking

## Database Schema

### Users Table
- id, email, name, password (hashed), role, is_banned, created_at

### Challenges Table
- id, title, slug, description, category, points, flag, round, image_url, external_link, is_visible, created_at

### Hints Table
- id, challenge_id, content, cost, unlock_time, position, created_at

### Submissions Table
- id, user_id, challenge_id, flag, is_correct, submitted_at

## API Endpoints

### Authentication
- POST `/api/auth/login` - User login
- POST `/api/auth/logout` - User logout
- GET `/api/session` - Get current session

### Users
- GET `/api/users` - List all users (admin only)
- POST `/api/users` - Create user (admin only)
- POST `/api/users/:id/ban` - Ban user (admin only)
- POST `/api/users/:id/unban` - Unban user (admin only)

### Challenges
- GET `/api/challenges` - List all challenges (visible only for non-admin)
- GET `/api/challenges/:slug` - Get challenge details
- POST `/api/challenges` - Create challenge (admin only)
- PATCH `/api/challenges/:id` - Update challenge (admin only)
- DELETE `/api/challenges/:id` - Delete challenge (admin only)

### Hints
- GET `/api/challenges/:id/hints` - Get hints for a challenge
- POST `/api/challenges/:id/hints` - Add hint (admin only)
- DELETE `/api/hints/:id` - Delete hint (admin only)

### Submissions
- POST `/api/challenges/:id/submit` - Submit flag
- GET `/api/leaderboard` - Get leaderboard

## Setup & Configuration

### Environment Variables
- `DATABASE_URL` - PostgreSQL connection string (auto-configured by Replit)
- Session configuration in `api/public/index.php`

### Running the Application

**Development:**
```bash
./start.sh
```

This starts both:
- PHP built-in server on port 3000 (backend)
- Vite dev server on port 5000 (frontend with proxy)

**Production Deployment:**
The app uses Replit's VM deployment type which supports running multiple background processes simultaneously. The deployment automatically:
- Initializes the production database with schema and admin user
- Starts PHP backend on port 3000
- Starts Vite preview server on port 5000 with proxy to backend

### Vite Proxy Configuration
Vite is configured to proxy all `/api` requests to the PHP backend on port 3000 in both development and production, allowing seamless API communication without CORS issues.

## Event Structure

### Round 1: The Cryptic Trail
Git-based puzzle solving challenges where participants navigate through cryptic Git commands and version control scenarios.

### Round 2: The Patch Arena
Real open-source contribution challenges where participants make actual contributions to open-source repositories.

## Recent Updates (October 3, 2025)
- **CRITICAL FIX**: Added automatic production database initialization on deployment
- **CRITICAL FIX**: Added proxy configuration to Vite preview server for production deployment
- **FIXED**: Flag submission endpoint now at `/api/challenges/{id}/submit` with proper authentication
- **FIXED**: Leaderboard tie-breaker - users with equal scores ranked by earliest solve time
- **FIXED**: Separate production and development databases properly initialized
- Enhanced Admin dashboard with comprehensive challenge management
- Added hints management UI with cost and time controls
- Implemented visibility toggle for challenges
- Added round selection and external resource linking
- Database connected and fully operational
- All API endpoints using relative URLs for Replit compatibility

## Admin Access
- Email: `admin@ctf.local`
- Password: `admin123`
- Access the admin panel at `/admin` after logging in

## Project Structure
```
├── api/
│   ├── public/index.php (Main backend entry point)
│   ├── src/
│   │   ├── Services/ (Business logic)
│   │   └── Database.php
│   └── schema.sql (Database schema)
├── src/
│   ├── pages/ (React pages)
│   ├── components/ (Reusable components)
│   └── lib/ (API utilities)
├── vite.config.ts (Frontend build config with proxy)
└── start.sh (Startup script)
```

## Next Steps / Future Enhancements
- Update user-facing pages (Challenges, ChallengeDetail, Leaderboard, Profile)
- Add hint purchase logic on frontend
- Implement time-based hint unlocking
- Add team management (2-4 members per team)
- Event timer/countdown functionality
- Challenge solve statistics
