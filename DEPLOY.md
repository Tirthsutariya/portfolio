# Deploy Guide — Tirth's Portfolio

Two free deploys:
- **Frontend** (static site) → Netlify or Vercel
- **Backend** (Spring Boot) → Render (Docker)

---

## 1. Push to GitHub

```bash
cd tirth-portfolio
git init
git add .
git commit -m "Portfolio + Spring Boot chatbot backend"
gh repo create tirth-portfolio --public --source=. --push
```

> ✅ No secrets are committed — the Groq key and mail password are read from
> environment variables, and `.gitignore` excludes build output.

---

## 2. Deploy the backend → Render

1. Go to [render.com](https://render.com) → **New → Web Service** → connect your GitHub repo.
2. Settings:
   - **Root Directory:** `backend`
   - **Runtime:** `Docker` (uses `backend/Dockerfile`)
   - **Instance Type:** Free
3. **Environment variables** (Dashboard → Environment):
   | Key | Value |
   |-----|-------|
   | `GROQ_API_KEY` | your Groq key (`gsk_...`) |
   | `MAIL_USER` | your Gmail (optional — for contact email) |
   | `MAIL_PASS` | Gmail 16-char app password (optional) |
   | `ALLOWED_ORIGINS` | your Netlify URL, e.g. `https://tirth.netlify.app` |
4. **Create Web Service.** Render builds the Docker image and gives you a URL like
   `https://tirth-portfolio.onrender.com`.
5. Test: open `https://<your-render-url>/api/status` → should return `{"status":"up",...}`.

> ⚠️ Free tier **sleeps after ~15 min** idle; the first request then takes 30–60s to wake.
> The frontend handles this gracefully (chatbot falls back to local KB, stats show OFFLINE).

---

## 3. Deploy the frontend → Netlify

1. Edit **`js/config.js`** → replace `YOUR-BACKEND.onrender.com` with your real Render host.
2. Commit & push that one-line change.
3. Go to [netlify.com](https://netlify.com) → **Add new site → Import from GitHub** → pick the repo.
   - **Publish directory:** repository root (`.`) — it's a static site, no build command.
   - (Or just drag-and-drop the `tirth-portfolio` folder onto Netlify.)
4. You get a URL like `https://tirth.netlify.app`.

---

## 4. Connect them

1. In Render, set `ALLOWED_ORIGINS` to your Netlify URL (step 2.3 above) and **redeploy**.
2. Open your Netlify URL → the chatbot streams, live stats load, WhatsApp + contact form work. 🎉

---

## Local development

1. **Set your secrets:**
   ```bash
   cp .env.example .env
   # Edit .env: paste your GROQ_API_KEY (required), optional MAIL_USER/MAIL_PASS
   ```

2. **Run the backend:**
   ```bash
   cd backend && mvn spring-boot:run          # http://localhost:8090
   ```

3. **Run the frontend:**
   ```bash
   # Option A: open index.html in a browser
   # Option B: python -m http.server 3399, then http://localhost:3399
   ```

`js/config.js` auto-detects localhost and uses `http://localhost:8090/api` for all calls.

> ✅ `.env` is git-ignored — secrets never commit. On Render, you'll paste them into the dashboard's **Environment** section instead.
