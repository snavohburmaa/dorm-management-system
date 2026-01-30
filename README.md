# Dorm Management System

A Next.js application for managing dormitory operations.

## Tech stack

- **Database:** PostgreSQL (hosted on [Supabase](https://supabase.com))
- **Deployment:** [Vercel](https://vercel.com)

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
3. **Use Direct (port 5432)** for local dev, or **Transaction pooler (6543)** for serverless.
4. SSL is **enabled automatically** for `supabase.co` URLs; you can add `?sslmode=require` for pooler if needed.
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

## Deploying on Vercel

1. Push your code to GitHub (or GitLab/Bitbucket).
2. Go to [vercel.com](https://vercel.com) and sign in.
3. **New Project** → Import your repository.
4. Add the **`DATABASE_URL`** environment variable (your PostgreSQL/Supabase connection string).
5. Deploy. Vercel will detect Next.js and run `npm run build` automatically.

For serverless/edge, use the **Transaction pooler** connection string (port 6543) from Supabase for `DATABASE_URL` on Vercel.

## Other Commands

- Build for production: `npm run build`
- Start production server: `npm start`
- Run linter: `npm run lint`
