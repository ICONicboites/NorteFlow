# NorteFlow

Small-business dashboard: **React 19**, **Vite 8**, **TypeScript**, **Tailwind CSS**, and **Supabase** (auth + Postgres).

## What you need on your machine

- [Node.js](https://nodejs.org/) 20+ (LTS is fine)
- A [GitHub](https://github.com/) account (to host the code)
- A [Supabase](https://supabase.com/) project (database + login for the live app)

---

## Run it locally

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Connect Supabase**

   - In the Supabase dashboard: **Project Settings → API**
   - Copy **Project URL** and the **anon public** key.

3. **Environment file**

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and set:

   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

   Never commit `.env.local` (it is gitignored).

4. **Create tables and security rules**

   In Supabase: **SQL Editor → New query**, paste the contents of [`supabase/schema.sql`](./supabase/schema.sql), then **Run**.

   Also enable **Authentication → Providers → Email** (sign up / sign in use email + password).

5. **Start the dev server**

   ```bash
   npm run dev
   ```

6. **Production build (sanity check)**

   ```bash
   npm run build
   npm run preview
   ```

---

## Publish the code on GitHub (you do this in the browser + terminal)

These steps cannot be done for you from inside the repo; they use your GitHub login.

1. On GitHub: **New repository** (name it e.g. `norteflow`), leave it empty (no README/license from GitHub if you already have a README here).

2. In your project folder (where `package.json` is):

   ```bash
   git status
   ```

   If the repo is new or you need to set the remote:

   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git branch -M main
   git add .
   git commit -m "Initial commit"
   git push -u origin main
   ```

   Replace `YOUR_USERNAME` and `YOUR_REPO` with yours. If `origin` already exists, use `git remote set-url origin ...` instead of `add`.

3. Optional: in the GitHub repo **Settings → Secrets and variables → Actions**, you normally **do not** need secrets for the included CI workflow; it only runs `npm ci` and `npm run build` without Supabase keys.

---

## Make the app work on the internet (hosting)

The GitHub repo only stores **source code**. The **running site** needs a host (and env vars there).

### Deploy to Netlify

The repo includes [`netlify.toml`](./netlify.toml): build command `npm run build`, publish folder `dist`, Node 20, and an SPA fallback so routes like `/dashboard` work on refresh.

1. Push this project to GitHub (if it is not already).
2. In [Netlify](https://www.netlify.com/): **Add new site → Import an existing project** → connect GitHub → pick the repo.
3. Netlify should read `netlify.toml` automatically. If anything is empty, set **Build command** to `npm run build` and **Publish directory** to `dist`.
4. **Site configuration → Environment variables** → add (same values as `.env.local`):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`  
   Vite bakes these in at **build** time, so add them **before** the first deploy (or **Deploys → Trigger deploy → Clear cache and deploy site** after adding them).
5. In **Supabase → Authentication → URL configuration**:
   - **Site URL**: your Netlify URL, e.g. `https://random-name.netlify.app` (or your custom domain).
   - **Redirect URLs**: include the same URL (needed for email confirmation and password reset).

### Other hosts (e.g. Vercel)

Same idea: build `npm run build`, output `dist`, set the two `VITE_*` env vars, then point Supabase **Site URL** / **Redirect URLs** at the live URL.

---

## Project layout (quick reference)

| Path | Purpose |
|------|--------|
| `src/lib/supabase.ts` | Supabase client; reads `VITE_*` env vars |
| `src/services/dbService.ts` | CRUD for `businesses`, `income`, `expenses` |
| `supabase/schema.sql` | Tables + Row Level Security (run in Supabase) |
| `.env.example` | Template for local env (safe to commit) |
| `.github/workflows/ci.yml` | Builds on push/PR to `main`/`master` |
| `netlify.toml` | Netlify build, Node 20, SPA redirects |

---

## License

Add a `LICENSE` file in the repo if you want others to know how they may use the code (GitHub can generate one when you create the repo or via **Add file**).
