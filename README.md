# Dorm Management System

A Next.js application for managing dormitory operations.

## Prerequisites

- **Node.js** (version 18 or higher)
  - Download from: https://nodejs.org/
  - Verify installation: `node --version`
- **npm** (comes with Node.js)
  - Verify installation: `npm --version`

## Installation

1. Clone or download this project
2. Navigate to the project directory:
   ```bash
   cd dorm_management
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

## Running the Project

Start the development server:
```bash
npm run dev
```

## Database (Prisma + PostgreSQL / Supabase)

The app uses Prisma with **PostgreSQL** (e.g. [Supabase](https://supabase.com)).

- **Schema:** `prisma/schema.prisma` — models: `User`, `Technician`, `Announcement`, `MaintenanceRequest`, `RequestDecline`, `Notification`
- **Config:** `prisma.config.ts` — datasource URL (Prisma 7)
- **Env:** Copy `.env.example` to `.env` and set `DATABASE_URL` to your Postgres URL (SSL required for Supabase/Render).

### Supabase setup

1. **Create a project** at [supabase.com](https://supabase.com) → New project (name, password, region).
2. **Get the connection string:** Project **Settings** → **Database** → **Connection string** → **URI**.
3. **Use the Session pooler (port 6543)** for serverless/Vercel, or **Direct (5432)** for local.
4. **Add SSL:** Append `?sslmode=require` to the URL.
5. **Put in `.env`:**
   ```bash
   DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[YOUR_PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?sslmode=require"
   ```
   Replace `[YOUR_PASSWORD]` with your database password, and keep the rest from the Supabase dashboard.

### Commands

- Generate Prisma Client: `npm run db:generate`
- Push schema (create/update tables): `npm run db:push`
- Migrations: `npm run db:migrate`
- Seed database: `npm run db:seed`
- Open Prisma Studio: `npm run db:studio`

### First-time setup

```bash
cp .env.example .env
# Edit .env and set DATABASE_URL to your Supabase (or Postgres) URL
npm run db:generate
npm run db:push      # creates tables in Supabase
npm run db:seed      # optional: demo user (u1/123), technician (t1/123), sample data
```

## Other Commands

- Build for production: `npm run build`
- Start production server: `npm start`
- Run linter: `npm run lint`
