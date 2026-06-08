# GitHub + Vercel — Hab fudud (Hamud Academy)

Tilmaamahan waxay kaa caawinayaan in website-ka si fudud ugu xidho **GitHub** oo aad ku deploy gareyso **Vercel** (loading wanaagsan, ammaan sax ah).

---

## 1. GitHub (hal mar)

```bash
cd c:\wamp64\www\E-learning
git add .
git commit -m "Update platform"
git push origin main
```

**MUHIIM:** Ha gelin `frontend/.env` GitHub. Kaliya `.env.example` ayaa la wadaagaa.

---

## 2. Vercel (hal mar setup)

1. Tag [vercel.com](https://vercel.com) → **Add New Project**
2. Dooro repo: `hamud-academy/Hamud` (ama magacaaga)
3. **Root Directory** → `frontend` → **Save**
4. **Environment Variables** → ku dar dhammaan keys-ka `frontend/.env.example`
5. **Deploy**

### Keys waajib ah (Production)

| Key | Tusaale |
|-----|---------|
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `AUTH_URL` | `https://hamudacademy.com` |
| `NEXTAUTH_URL` | isla URL-ka kor |
| `NEXT_PUBLIC_APP_URL` | isla URL-ka kor |
| `DATABASE_URL` | Neon pooler URL |
| `DIRECT_URL` | Neon direct URL (migrations) |

Kadib **Redeploy** markasta oo aad push gareyso GitHub.

---

## 3. Loading — waxa la hagaajiyay

| Wax | Fa'iido |
|-----|---------|
| Bogagga public (Home, Diploma, Live lessons) | Cache 60 ilbiriqsi — degdeg badan |
| API config (site, landing, partners) | CDN cache |
| Fonts | `display: swap` — qoraal degdeg u muuqda |
| Dev local | `npm run dev` Turbopack (ka dhaqso badan webpack) |
| Images | WebP / AVIF otomaatig |

---

## 4. Ammaan — waxa la hagaajiyay

| Wax | Sharaxaad |
|-----|-----------|
| `useSecureCookies` | Production cookies HTTPS kaliya |
| Security headers | HSTS, nosniff, frame deny, iwm. |
| `/api/test-email` | Xiran production |
| `AUTH_SECRET` | Waa inuu ≥ 32 chars yahay production |
| `.env` | Git-ka lama geliyo |

---

## 5. Development (local)

```bash
cd frontend
copy .env.example .env
npm install
npm run dev
```

Haddii Turbopack dhibaato keeno: `npm run dev:webpack`

---

## 6. Dhibaato caadi ah

| Dhibaato | Xal |
|---------|-----|
| Vercel 404 | Hubi **Root Directory = `frontend`** |
| Login ma shaqeyn | `AUTH_URL` waa inuu yahay domain-ka dhabta ah (https) |
| Build gaabis | Neon `DIRECT_URL` u isticmaal migrations |
| Loading gaabis | Hubi `DATABASE_URL` Neon pooler (-pooler) |

---

Repo: https://github.com/hamud-academy/Hamud
