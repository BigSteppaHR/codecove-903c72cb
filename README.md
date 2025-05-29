# ⚡️ Codecove — Bolt.new Clone

Codecove has evolved into a **bolt.new style instant-creation experience**.  
Paste `/new` in your URL bar, describe what you want, and get a live, shareable project in seconds.

![Hero Screenshot](docs/screenshots/hero.png)
*Instant generation, live preview, and one-click sharing.*

---

## 🚀  Why You’ll Love It

| Feature | Description |
|---------|-------------|
| **⚡️ Instant Generation** | Claude 4.0 turns natural-language prompts into complete, production-ready projects. |
| **📝 Real-time Editing** | Monaco Editor with IntelliSense plus Tailwind styling. |
| **🖥 Live Preview** | Sandpack shows a running app while you type—no rebuilds. |
| **🔗 Public Sharing** | Toggle **public** and hand out a `/p/ID` link—read-only or forkable. |
| **🔄 Bolt.new Workflow** | `/new` creates, `/p/{id}` shares. Zero dashboards or config screens. |

---

## 🗺  Route Map

| Route | Purpose |
|-------|---------|
| `/` | Marketing landing page (auto-redirects authenticated users to `/new`). |
| `/new` | Instant Editor – create & edit a private project. |
| `/p/:id` | Public, read-only share view with **Fork** button. |
| `/auth` | Supabase Auth sign-in / sign-up. |

---

## 🛠  Tech Stack

| Layer | Tooling |
|-------|---------|
| **AI** | Anthropic **Claude 4.0** (chat completions) |
| **Frontend** | React 18 + Vite 5, TypeScript, Tailwind CSS, Shadcn-UI |
| **Code Editor** | `@monaco-editor/react` |
| **Live Preview** | `@codesandbox/sandpack-react` |
| **State/Data** | React Query, Zod, Framer Motion |
| **Backend/API** | **Supabase Edge Functions** (Deno) |
| **Auth & DB** | Supabase Auth + Postgres (RLS) |
| **ID Generation** | `nanoid` |
| **Icons** | Lucide-React |

> Previous Clerk authentication has been **fully replaced** by Supabase Auth.

---

## ⚙️  Setup

1. **Clone**
   ```bash
   git clone https://github.com/BigSteppaHR/codecove-903c72cb.git
   cd codecove-903c72cb
   ```

2. **Install**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Environment**

   Create `.env`:

   ```
   VITE_SUPABASE_URL=https://<your-project>.supabase.co
   VITE_SUPABASE_ANON_KEY=<public-anon-key>
   VITE_SUPABASE_SERVICE_ROLE=<service-role-key>   # optional, used only by functions
   VITE_ANTHROPIC_API_KEY=<your-claude-api-key>
   ```

4. **Supabase**

   ```bash
   supabase db reset         # applies migrations in supabase/migrations
   supabase functions deploy generate-code
   supabase start            # local dev db & Edge runtime
   ```

5. **Run Dev**

   ```bash
   npm run dev
   # open http://localhost:5173/new
   ```

6. **Build / Preview**

   ```bash
   npm run build
   npm run preview
   ```

---

## 🌐  Deployment

| Target | Steps |
|--------|-------|
| **Vercel** | 1) Import Git repo<br>2) Add env vars (see above)<br>3) Set build command `npm run build` and output `dist`.<br>4) Enable `supabase/functions` as Edge Functions (requires supabase link). |
| **Supabase** | `supabase functions deploy generate-code` (auto-deploys on push if CI configured). |
| **GitHub Pages / Netlify** | Static front-end only (`dist`) can be hosted anywhere; AI & DB calls remain on Supabase. |

---

## 📸  Screenshots / Usage

| View | Image |
|------|-------|
| Instant Editor | ![Editor](docs/screenshots/editor.png) |
| Prompt Templates | ![Prompt](docs/screenshots/prompt.png) |
| Public Share Page | ![Share](docs/screenshots/share.png) |

> Screenshots live in `docs/screenshots/`. Feel free to update with your own.

---

## 🤝  Contributing

1. **Fork** the repo & create a feature branch  
2. Run `npm run dev` to reproduce locally  
3. Commit using [Conventional Commits](https://www.conventionalcommits.org/)  
4. Open a Pull Request – template will guide you  
5. Be kind, clear, and concise ❤️

### Code Style

- **ESLint** & **Prettier** enforce standards  
- Use descriptive names & TypeScript strict null checks  
- Keep UI in Shadcn components; avoid inline styles except for dynamic Tailwind classes

---

## ✨  Roadmap

- Expo live device preview for mobile projects  
- One-click deploy to Vercel / Netlify from the editor  
- Real-time multiplayer collaboration  
- Marketplace for prompt templates  

Stay tuned!

---

## License

MIT © Henry Reid / Codecove
