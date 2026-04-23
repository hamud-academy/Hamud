# BaroSmart - E-Learning Platform

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

## Vercel (monorepo)

Mashruuca wuxuu leeyahay Next.js gudaha `frontend/`. Marka aad Git ku xidho Vercel:

1. **Settings → Build & Deployment → Root Directory** → ku qor `frontend` → **Save**.
2. Hubi in **Build Command** uu yahay `npm run build` (ama ha dhigto otomaatig) iyo **Install Command** `npm install`.
3. Ku dar **Environment Variables** (Production + Preview) — **dhammaan** tusaalaha `frontend/.env.example` (liiska hoose).
4. **Redeploy** deployment-ka ugu dambeeyay (ama push cusub).

### Liiska environment variables (aan la illoobin)

| Key | Qasab? | Sharaxaad |
|-----|--------|-----------|
| `AUTH_SECRET` | Haa | `openssl rand -base64 32` |
| `AUTH_URL` ama `NEXTAUTH_URL` | Haa | Production: `https://magacaaga.vercel.app` (URL-ka dhabta ah) |
| `DATABASE_URL` | Haa | Connection string PostgreSQL (Neon, iwm.) |
| `RESEND_API_KEY` | Ikhtiyaari | Email haddii la isticmaalo |
| `RESEND_FROM` | Ikhtiyaari | Cinwaanka from (Resend) |
| `ADMIN_EMAIL` | Ikhtiyaari | Ogeysiinta dalabyada |

**Xusuusin:** `.env` faylka leh sirta **ha gelin Git** — kaliya buuxi qiimayaasha Vercel dashboard; `.env` hay guriga ama dashboard kaliya.

Haddii Root Directory uu ahaado `.` (root repo), build-ku ma helo Next.js saxda ah → waxaad arki kartaa **404 NOT_FOUND** on `*.vercel.app`.

## GitHub & ammaanka `.env`

- **Ha gelin** `frontend/.env` ama `.env.local` Git — sirta way baxdaa.
- **Wax walba oo deployment u baahan** (magacyada keys-ka) waxaa ku qoran **`frontend/.env.example`** — taasi waa nuqul la wadaago; adigu waxaad ku buuxisaa qiimaha dhabta ah `.env` (local) ama Vercel.
- Root `.gitignore` iyo `frontend/.gitignore` waxay iska ilaaliyaan `.env` dhabta ah; **`.env.example`** waa la geli karaa.
- Clone kadib: `cd frontend` → `copy .env.example .env` → buuxi.

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
