# Demo accounts and multi-instance runs

## Demo logins (same database as your primary stack)

After migrations, seed the DB:

```bash
cd backend && npm run db:seed
```

| Email | Name | Password | Notes |
|-------|------|----------|--------|
| alex@demo.knode | Alex Chen | demo1234 | Owns a seed **OPEN** SOS (CUDA / ML). |
| priya@demo.knode | Priya Nair | demo1234 | Owns a seed **OPEN** SOS (graphs / DSA). |
| jordan@demo.knode | Jordan Lee | demo1234 | React / JS skills for match demos. |
| sam@demo.knode | Sam Rivera | demo1234 | SQL / Postgres skills. |

**SOS accept + reply:** Log in as **Priya** (or **Jordan**), open the SOS queue, pick **Alex**’s or **Priya**’s demo request, then open the help session page to chat and use the Jitsi link.

**Matchmaking:** Use **Match** (or community flows) while logged in as two different demo users in two browsers (or normal + incognito), both on **the same** frontend port and backend — they share one Postgres, so lists and picks stay in sync.

## Two isolated instances (prove “no sync” between worlds)

**Instance 1 (default):** your usual `docker compose` Postgres `:5432`, Redis `:6379`, backend `:4000`, Next `:3000`.

**Instance 2:** separate DB + Redis:

```bash
docker compose -f docker-compose.instance2.yml -p knode2 up -d
cd backend
DATABASE_URL=postgresql://knode:knode@localhost:5433/knode npx prisma migrate deploy
DATABASE_URL=postgresql://knode:knode@localhost:5433/knode npm run db:seed
```

Run a **second** API (use `backend/.env.instance2.example` as a reference — `PORT=4001`, `REDIS_URL` → `:16380`, `CORS_ORIGIN` including both `http://localhost:3000` and `http://localhost:3001`).

Run a **second** Next app on port **3001** with `BACKEND_PROXY_URL=http://127.0.0.1:4001` (see `frontend/.env.instance2.example`).

Accounts created on `:3000` / instance 1 **do not** appear on `:3001` / instance 2 — different databases. JWTs from instance 1 are not valid on instance 2 if you use a **different** `JWT_SECRET` for that API.

## Backend CORS

Set `CORS_ORIGIN` to a comma-separated list when multiple browser origins hit one API, e.g. `http://localhost:3000,http://localhost:3001`.
