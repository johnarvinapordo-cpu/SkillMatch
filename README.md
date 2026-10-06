# SkillMatch MySQL Backend — XAMPP Version

This version of SkillMatch uses **MySQL/MariaDB from XAMPP** instead of PostgreSQL.

## 1. Requirements

Install:
- XAMPP
- Node.js
- VS Code

In XAMPP Control Panel, start:
- MySQL

Apache is not required by the Node.js backend, but you can leave it running if you use phpMyAdmin through Apache.

## 2. Create the database

1. Open XAMPP.
2. Start MySQL.
3. Open phpMyAdmin:
   http://localhost/phpmyadmin
4. Click **New** and create:
   `skillmatch_db`
5. Open the **Import** tab.
6. Select:
   `database/skillmatch_xampp_mysql.sql`
7. Click **Import/Go**.

The SQL file also contains CREATE DATABASE IF NOT EXISTS, so importing it is safe when `skillmatch_db` already exists.

## 3. Configure the backend

Copy:

`.env.example`

to:

`.env`

Default XAMPP configuration:

PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=skillmatch_db
DB_USER=root
DB_PASSWORD=

If your XAMPP MySQL root account has a password, put it in DB_PASSWORD.

## 4. Install packages

Open this folder in VS Code terminal:

```bash
npm install
```

## 5. Start the backend

```bash
npm run dev
```

Expected:

```text
MySQL/XAMPP Connected Successfully
SkillMatch API running at http://localhost:5000
```

## 6. Test the API

Open:

http://localhost:5000/api/health

Expected:

```json
{
  "api": "ok",
  "database": "connected",
  "database_type": "MySQL/MariaDB"
}
```

## 7. Demo accounts

All demo passwords are:

`demo123`

Admin:
`admin@skillmatch.test`

Students:
`juan@skillmatch.test`
`maria@skillmatch.test`
`pedro@skillmatch.test`
`ana@skillmatch.test`
`carlo@skillmatch.test`

## 8. Main API routes

### Authentication
POST `/api/auth/register`
POST `/api/auth/login`
GET `/api/auth/me`

### Skills
GET `/api/skills`
GET `/api/skills/me`
POST `/api/skills/me`
POST `/api/skills` — admin only

### Projects
GET `/api/projects`
POST `/api/projects`
GET `/api/projects/:id`
PUT `/api/projects/:id`
POST `/api/projects/:id/skills`

### Matching
GET `/api/matching/projects/:projectId`
GET `/api/matching/students`

### Collaboration
GET `/api/collaboration/my`
POST `/api/collaboration/projects/:projectId/requests`
PATCH `/api/collaboration/requests/:requestId`
PATCH `/api/collaboration/requests/:requestId/cancel`
GET `/api/collaboration/projects/:projectId/members`

## 9. System workflow

Student registers/logs in
→ creates profile
→ adds skills and proficiency
→ creates project
→ defines required skills
→ system calculates skill matches
→ leader sends collaboration request
→ student accepts/rejects
→ accepted student becomes project member
→ activity is recorded.

## 10. Important

This backend is designed to connect to a React/Vite frontend on:

http://localhost:5173

The frontend should send:

Authorization: Bearer YOUR_JWT_TOKEN

for protected endpoints.
