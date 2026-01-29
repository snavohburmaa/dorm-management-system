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

## Database (Prisma + SQLite)

The app uses Prisma with SQLite and migrations.

- **Schema:** `prisma/schema.prisma` — models: `User`, `Technician`, `Announcement`, `MaintenanceRequest`, `RequestDecline`, `Notification`
- **Config:** `prisma.config.ts` — datasource URL and migrations path (Prisma 7)
- **Env:** Copy `.env.example` to `.env` and set `DATABASE_URL="file:./dev.db"` (default)

### Commands

- Generate Prisma Client: `npm run db:generate`
- Create/apply migrations: `npm run db:migrate`
- Seed database: `npm run db:seed`
- Open Prisma Studio: `npm run db:studio`

### First-time setup

```bash
cp .env.example .env   # if .env doesn't exist
npm run db:migrate     # creates prisma/migrations and dev.db
npm run db:seed       # inserts demo user (u1/123), technician (t1/123), sample request
```

## Other Commands

- Build for production: `npm run build`
- Start production server: `npm start`
- Run linter: `npm run lint`
