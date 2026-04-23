# BaroSmart — Next.js frontend

## Environment (waliba ha illoobin)

Dhammaan keys-ka app-ku u baahan yahay waxaa lagu qoray **`.env.example`** (oo dhammaystiran).

1. Local: `copy .env.example .env` (PowerShell / CMD) ama `cp .env.example .env`
2. Buuxi qiimayaasha (DATABASE_URL, AUTH_SECRET, iwm.)
3. **Ha gelin** `.env` Git — kaliya `.env.example`

## Vercel (monorepo)

Haddii repo-ga root-ku yahay `E-learning` (oo Next.js uu yahay `frontend/`):

- Vercel **Root Directory** = `frontend`
- **Environment Variables:** isla keys-ka `.env.example` ku qoran

Faahfaahin: eeg `../README.md` (root).

## Horumar

```bash
npm install
npm run dev
```

Bogga: [http://localhost:3000](http://localhost:3000)

## Database

```bash
npm run db:generate
npm run db:push
# ama: npm run db:migrate
```

## Build production

```bash
npm run build
npm run start
```

## Tech

Next.js 16, React 19, Prisma, NextAuth, Tailwind CSS 4.
