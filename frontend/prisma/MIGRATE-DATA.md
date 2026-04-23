# Xogta database-kii hore ugu gudub NeonDB (talaabo talaabo)

## Talaabada 1: Ku dar connection-kii hore ee PostgreSQL

Fur **`frontend/.env`** oo ku dar qoraalkan (hoos ugu dar, safar cusub):

```env
# Database-kii hore (loo isticmaalo kaliya gudubinta xogta)
OLD_DATABASE_URL="postgresql://postgres:GOLGALGAR%401020@localhost:5432/barosmart?sslmode=disable"
```

- Haddii password-kaaga PostgreSQL ka duwan yahay **GOLGALGAR@1020**, beddel **GOLGALGAR%401020** (oo ku beddel @ sida %40).
- **Important:** PostgreSQL-ka local (localhost:5432) waa inuu socdaal (running) markaad talaabada 2 sameyso.

---

## Talaabada 2: Hubi in NeonDB ay diyaar tahay

Schema (tables) waa inuu hore ugu jiraa Neon (waxaad orodisay `npx prisma db push`).

Haddii aadan sameyn, orodi:

```bash
cd frontend
npx prisma db push
```

---

## Talaabada 3: Orodi script-ka gudubinta

Terminal:

```bash
cd frontend
npx tsx prisma/migrate-data-to-neon.ts
```

Waa inaad arki:
- `✓ Xiriirka database-kii hore (OLD) waa la furan.`
- `✓ Xiriirka NeonDB (NEW) waa la furan.`
- Kadib safar kasta: [categories], [users], [courses], … iyo tirada rows la soo guuray.
- Ugu dambayn: `✓ Dhamaad. Xogta waa lagu soo guuray NeonDB.`

---

## Talaabada 4: Ka saar OLD_DATABASE_URL (optional)

Marka gudubinta dhamaato, haddii aad rabto in aad xiriirka hore ka saarto `.env`:

- Fur **`frontend/.env`**
- Ka saar ama comment-garee safafka **OLD_DATABASE_URL=...**

**DATABASE_URL** (Neon) ha taaban; ha ka saarin.

---

## Cillado caam ah

| Cillad | Sabab | Tallaabada |
|--------|--------|------------|
| `OLD_DATABASE_URL ma jiro` | Talaabada 1 lama dhamaystiirin | Ku dar OLD_DATABASE_URL .env |
| `connection refused` / `ECONNREFUSED` | PostgreSQL local ma socdo | Bixi PostgreSQL (WAMP/XAMPP) ka dibna orodi script-ka |
| `relation "xxx" does not exist` | Neon ma lahan tables | Orodi `npx prisma db push` (talaabada 2) |
| Duplicate key / conflict | Xog hore ayey Neon ku jirtaa | Script-ku wuxuu isticmaalaa ON CONFLICT DO NOTHING – rows cusub oo kaliya ayaa lagu darayaa |

Markaad dhamaato, website-ka adoo isticmaalaya Neon wuu ku shaqeyn karaa xogtaadii hore.
