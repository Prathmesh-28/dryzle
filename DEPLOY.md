# Dryzle – Deployment Guide

Backend → **Render** (Docker + PostgreSQL + Redis)  
Frontends → **Vercel** (4 separate Next.js projects)

---

## Prerequisites

- GitHub repo with this monorepo pushed (Render and Vercel both connect to GitHub)
- [Render account](https://render.com)
- [Vercel account](https://vercel.com)

---

## Step 1 — Push to GitHub

```bash
cd /path/to/Dryzle
git init
git add .
git commit -m "Initial scaffold"
# create a repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/dryzle.git
git push -u origin main
```

---

## Step 2 — Deploy backend on Render

### 2a — Blueprint (recommended — one click)

1. Go to **Render Dashboard → New → Blueprint**
2. Connect your GitHub repo
3. Render will detect `render.yaml` and create:
   - `dryzle-api` web service (Docker)
   - `dryzle-postgres` PostgreSQL database
   - `dryzle-redis` Redis instance
4. Click **Apply**

### 2b — Set secret environment variables

After the first deploy, go to **dryzle-api → Environment** and add:

| Key | Value |
|-----|-------|
| `RAZORPAY_KEY_ID` | From Razorpay dashboard |
| `RAZORPAY_KEY_SECRET` | From Razorpay dashboard |
| `RAZORPAY_WEBHOOK_SECRET` | From Razorpay dashboard |
| `FIREBASE_PROJECT_ID` | From Firebase console |
| `FIREBASE_PRIVATE_KEY` | Full private key (include `\n`) |
| `FIREBASE_CLIENT_EMAIL` | From Firebase service account JSON |
| `TWILIO_ACCOUNT_SID` | From Twilio console |
| `TWILIO_AUTH_TOKEN` | From Twilio console |
| `TWILIO_PHONE_NUMBER` | Your Twilio number (E.164) |
| `GOOGLE_MAPS_API_KEY` | From Google Cloud console |
| `AWS_ACCESS_KEY_ID` | For S3 file uploads |
| `AWS_SECRET_ACCESS_KEY` | For S3 file uploads |
| `AWS_S3_BUCKET` | Your S3 bucket name |

### 2c — Note your API URL

After deploy succeeds, your API is live at:
```
https://dryzle-api.onrender.com
```
(or similar — copy the exact URL from the Render dashboard)

### 2d — Verify

```bash
curl https://dryzle-api.onrender.com/api/v1/health
# → {"status":"ok","timestamp":"..."}
```

---

## Step 3 — Deploy frontends on Vercel

Create **4 separate Vercel projects**, one per app. Repeat for each:

### Admin panel

1. **Vercel Dashboard → Add New Project**
2. Import your GitHub repo
3. **Root Directory** → `apps/admin`
4. Framework: Next.js (auto-detected)
5. **Environment Variables**:
   - `NEXT_PUBLIC_API_URL` = `https://dryzle-api.onrender.com`
   - `NEXT_PUBLIC_SOCKET_URL` = `https://dryzle-api.onrender.com`
6. Deploy

Repeat with root directories `apps/customer`, `apps/vendor`, `apps/delivery`.

### Project summary

| Project name | Root Directory | Port |
|---|---|---|
| `dryzle-admin` | `apps/admin` | 3000 |
| `dryzle-customer` | `apps/customer` | 3002 |
| `dryzle-vendor` | `apps/vendor` | 3003 |
| `dryzle-delivery` | `apps/delivery` | 3004 |

---

## Step 4 — Update CORS on Render

After all 4 Vercel projects are deployed, note their URLs (e.g. `https://dryzle-admin.vercel.app`) and update `CORS_ORIGIN` in the Render environment:

```
CORS_ORIGIN=https://dryzle-admin.vercel.app,https://dryzle-customer.vercel.app,https://dryzle-vendor.vercel.app,https://dryzle-delivery.vercel.app
```

Trigger a redeploy on Render after saving.

---

## Step 5 — Custom domains (optional)

### Render
- dryzle-api → **api.dryzle.app** (CNAME to `dryzle-api.onrender.com`)

### Vercel
- dryzle-admin → **admin.dryzle.app**
- dryzle-customer → **dryzle.app**
- dryzle-vendor → **vendor.dryzle.app**
- dryzle-delivery → **delivery.dryzle.app**

Add DNS CNAME records via your domain registrar pointing to Vercel's assigned hostnames.

---

## Step 6 — Razorpay webhook

In the Razorpay dashboard, add a webhook endpoint:

```
https://dryzle-api.onrender.com/api/v1/payments/webhook/razorpay
```

Events to subscribe:
- `payment.captured`
- `payment.failed`
- `refund.created`

Copy the webhook secret and set `RAZORPAY_WEBHOOK_SECRET` in Render.

---

## CI/CD (auto-deploys)

- **Render**: auto-deploys on every push to `main` (enabled via `autoDeploy: true` in `render.yaml`)
- **Vercel**: auto-deploys on every push to `main` (enabled by default)

Push to main → backend and all 4 frontends rebuild automatically.

---

## Database migrations in production

Migrations run automatically on container startup via:
```sh
npx prisma migrate deploy
```
(see the `CMD` in `Dockerfile`)

To run manually:
```bash
# SSH into Render shell (dryzle-api → Shell tab)
cd /app/backend && npx prisma migrate deploy
```

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| Build fails with `Cannot find module @dryzle/shared` | Vercel root directory not set correctly — must be `apps/<name>` |
| `prisma generate` fails in Docker | Ensure `postinstall` script is in `backend/package.json` ✓ |
| CORS errors in browser | Add Vercel URLs to `CORS_ORIGIN` in Render env and redeploy |
| Socket.IO not connecting | Render starter plan supports WebSockets — ensure no proxy stripping `Upgrade` headers |
| Render health check failing | Check `/api/v1/health` returns 200; DB must be connected |
| OTP not arriving | Set Twilio credentials in Render env; check Twilio logs |
