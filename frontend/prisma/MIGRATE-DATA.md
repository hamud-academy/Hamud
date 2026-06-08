# Gudubinta xogta Neon → Neon (database cusub)

## Talaabada 1: Neon cusub — Connection string

1. Fur [Neon Console](https://console.neon.tech) → project **hamud Academy**
2. **Connect** → **Connection string** → **Show password** → **Copy**
3. Fur `frontend/.env` oo ku dar:

```env
NEW_DATABASE_URL="postgresql://neondb_owner:PASSWORD@ep-spring-shape-aqgwbqg2-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

`OLD_DATABASE_URL` waa inuu tilmaamaa database-kii **hore** (lively-rice). Script-ku wuxuu hore u dhigay.

---

## Talaabada 2: Orodi gudubinta

```bash
cd frontend
npm run db:migrate-to-neon
```

Waxa uu sameeyaa:
- `prisma db push` → tables-ka schema-ga ah target-ka
- Nuqul dhammaan tables (users, courses, orders, app_configs, iwm.)
- Hubinta: source vs target row counts

---

## Talaabada 3: Beddel DATABASE_URL

Marka gudubintu dhamaato:

```env
DATABASE_URL="<isla NEW_DATABASE_URL>"
```

Vercel → Settings → Environment Variables → beddel `DATABASE_URL` → **Redeploy**

Ka saar (optional):
```env
OLD_DATABASE_URL=
NEW_DATABASE_URL=
```

---

## Hubi xogta ka hor gudubinta

```bash
npm run db:audit
```

---

## Cillado

| Cillad | Tallaabada |
|--------|------------|
| `NEW_DATABASE_URL ma jiro` | Talaabada 1 — ku dar connection string |
| `Source iyo target isku mid` | OLD ≠ NEW — hubi labada URL |
| `Connection failed` | Password sax? Neon project socda? |
| `SKIP — ma jiro target-ka` | Orodi `npm run db:migrate-to-neon` (wuxuu leeyahay `--push-schema`) |
