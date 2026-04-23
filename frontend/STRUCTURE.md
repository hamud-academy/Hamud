# Qorsaha Folders-ka (Frontend Structure)

Dokument-kan wuxuu kuu tusaaleeyaa **halka uu kasta ka jiro** project-ka Next.js. Waxaa loogu talagalay inaad si fudud ugu wareerto adoo aan website-ka beddelin.

---

## Sidaad ugu talagalay (waxaad rabtaa)

| Waxaad rabtaa | Hadda waa halkaan |
|---------------|-------------------|
| **Pages** (boggyada website-ka) | `src/app/` |
| **Database** (Prisma, queries) | `src/lib/prisma.ts` + `prisma/schema.prisma` |
| **Design** (CSS, styles, assets) | `src/app/globals.css` + Tailwind, `public/` |
| **Sources** (code dhan) | `src/` |
| **Wixii kale** (config, env, docs) | Root: `.env`, `next.config.ts`, etc. |

---

## Faahfaahin

### 1. Pages (boggyada)

**Meel:** `src/app/`

- Next.js wuxuu **routing** ka qeexaa folder-kaan. Folder + `page.tsx` = bog.
- **Tusaale:**
  - `src/app/page.tsx` → **/** (home)
  - `src/app/courses/page.tsx` → **/courses**
  - `src/app/dashboard/page.tsx` → **/dashboard**
  - `src/app/dashboard/profile/page.tsx` → **/dashboard/profile**
- **Haddii aad bedesho** (e.g. pages ku guuriso folder kale), routing waa jaban.

---

### 2. Database

**Meel:**  
- `prisma/schema.prisma` — qaabka database-ka (tables, relations)  
- `src/lib/prisma.ts` — Prisma client (loo isticmaalo API iyo server components)

- API-yada ee database-ka la tacaala: `src/app/api/`
- Tusaale: `src/app/api/user/profile/route.ts`, `src/lib/prisma.ts`

---

### 3. Design (qurka iyo assets)

**Meel:**  
- `src/app/globals.css` — CSS guud  
- Tailwind: config-ka (root) + classes in components  
- Sawirrada/public: `public/` (e.g. `public/uploads/`)

- Components-ku qurka ku leeyihiin waxaa ku qoran `src/components/` iyo `src/app/`.

---

### 4. Sources (code dhan)

**Meel:** `src/`

- `src/app/` — routes + pages  
- `src/components/` — components (Header, Footer, Hero, etc.)  
- `src/lib/` — prisma, auth, site-config, landing-config  
- `src/auth.ts` — NextAuth config (root of src)

---

### 5. Generals (config, env, docs)

**Meel:** root ee `frontend/`

- `.env` — environment variables (DATABASE_URL, NEXTAUTH_SECRET, etc.)  
- `next.config.ts` — Next.js config  
- `package.json` — dependencies  
- `data/` — site-config.json, landing-config.json (haddii la isticmaalo)  
- Dokument: `STRUCTURE.md` (kani)

---

## Soo koobida (quick reference)

```
frontend/
├── src/
│   ├── app/          ← PAGES (boggyada) + API routes
│   ├── components/   ← UI components (design + logic)
│   ├── lib/          ← Database client, helpers, config readers
│   └── auth.ts       ← Authentication config
├── prisma/
│   └── schema.prisma ← DATABASE schema
├── public/           ← DESIGN assets (images, uploads)
├── .env              ← GENERALS (secrets, config)
└── STRUCTURE.md      ← Kan dokument
```

---

## Waa maxay xalka?

- **Aan la guurin** pages, db, design, src si aan loo beddelo conventions-ka Next.js (routing waa jaban).
- **Isticmaal** dokument-kan markaad rabto inaad ogaato meesha fayl ama qayb ka jirto.
- Haddii aad rabto **hagaajin yar** (e.g. subfolders gudaha `components/` ama `lib/`), waxaa suurtagal ah adoo ilaalinaya `src/app/` iyo `prisma/`.

Haddii aad su’aal ku leedahay folder gaar ah, weydii: "folder X halkee waa?" — waan kuu tusaaleeyaa.
