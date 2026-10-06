# SkillMatch — Complete XAMPP/MySQL System

Student Skills and Project Collaboration Matching System.

## Stack
- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MySQL/MariaDB through XAMPP
- Authentication: JWT + bcryptjs

## Folders
- `client/` React frontend
- `server/` existing SkillMatch XAMPP backend and SQL

## 1. Database
Start MySQL in XAMPP. Open phpMyAdmin and import:
`server/database/skillmatch_xampp_mysql.sql`

## 2. Backend
Open a terminal in `server`:

```bash
npm install
npm run dev
```

Expected: `SkillMatch API running at http://localhost:5000`

Copy `server/.env.example` to `server/.env` and set your MySQL credentials.

## 3. Frontend
Open another terminal in `client`:

```bash
npm install
npm run dev
```

Open http://localhost:5173

Optional `client/.env`:
`VITE_API_URL=http://localhost:5000/api`

## Demo accounts
Student: `juan@skillmatch.test` / `demo123`
Admin: `admin@skillmatch.test` / `demo123`

## Main workflow
Register/Login → Profile → Add Skills → Create Project → Define Required Skills → Generate Skill Matches → Invite Student → Accept/Reject → Team Formation → Activity logging.

The frontend preserves the supplied backend and SQL architecture; no existing backend routes were removed.
