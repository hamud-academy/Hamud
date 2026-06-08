# Hamud Academy- E-Learning Platform

Platform e-learning ah oo leh website iyo mobile app (ka dib), loo dhisay React.js, Next.js, Tailwind CSS, iyo PostgreSQL.

## Tech Stack

| Qaybta | Technology |
|--------|------------|
| Frontend | Next.js 16 + React 19 + Tailwind CSS 4 |
| Backend | Next.js API Routes |
| Database | PostgreSQL + Prisma (to be added) |
| Mobile | React Native (later) |

## Folder Structure

```
E-learning/
├── frontend/     # Next.js website + API
├── backend/      # Notes - API lives in frontend
├── design/       # Tailwind theme, design tokens
└── mobile-app/   # React Native (future)
```

## GitHub & Vercel (fudud)

Tilmaamo buuxa: **[GITHUB-SETUP.md](./GITHUB-SETUP.md)** (Somali + English).

1. Push GitHub: `git push origin main`
2. Vercel → Root Directory: **`frontend`**
3. Ku dar env vars (`frontend/.env.example`)
4. Deploy

**Ha gelin** `frontend/.env` Git — sirta way baxdaa.

## Quick Start

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Run development server

```bash
npm run dev
```

Turbopack (degdeg). Haddii dhibaato: `npm run dev:webpack`

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. API Health Check

```
GET http://localhost:3000/api/health
```

## Database Setup (PostgreSQL + Prisma)

### 1. Install dependencies
```bash
cd frontend
npm install
```

### 2. Configure database
Copy `.env.example` to `.env` and set your PostgreSQL connection:
```bash
cp .env.example .env
# Edit .env: DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/barosmart"
```

### 3. Create database and run migrations
```bash
# Create database 'barosmart' in PostgreSQL first, then:
npm run db:push
# Or use migrations:
npm run db:migrate -- --name init
```

### 4. Generate Prisma Client
```bash
npm run db:generate
```

## Next Steps

- [x] Prisma + PostgreSQL schema
- [ ] Seed data (demo courses)
- [ ] Courses API
- [ ] User authentication
