# ⚡️ Codecove Bolt.new Clone — Interactive Demo Guide

Welcome! This short guide walks you through *everything* you need to know to go from zero-to-deployed in minutes.

---

## 1  ·  Getting Started Walk-through

| Step | Action | Result |
|------|--------|--------|
| 1 | **Visit** `https://codecove.io/new` | A brand-new project spins up instantly. |
| 2 | **Name your project** in the top bar (e.g. “Todo App”) | Title updates live; URL stays `/new`. |
| 3 | **Pick a Type** – Web, Mobile, or API | Tailors the Claude 4.0 prompt & preview environment. |
| 4 | **Describe what you want** in the *Enhanced Prompt* box | Example: *“Build a dark-mode React todo app with local storage.”* |
| 5 | Hit **Generate with Claude 4.0** | 🎉 Files populate + live preview boots. |
| 6 | **Tweak code** in Monaco Editor – changes save locally. | Hot-reload preview shows updates instantly. |
| 7 | Click **Save** to persist to Supabase. | Private project stored under your account. |

*Time to first running app: ~15 seconds.*

---

## 2  ·  Example Prompts by Project Type

### 🖥 Web

- *“Responsive landing page for a SaaS with pricing tiers and FAQ section. Tailwind CSS.”*
- *“Kanban board like Trello using React DnD and Zustand state.”*

### 📱 Mobile (React Native / Expo)

- *“Workout tracker with exercises list, sets/reps logging, async storage.”*
- *“Photo gallery app using Expo Camera and Cloudinary upload.”*

### 🔌 API (Express / TypeScript)

- *“REST API for books with CRUD endpoints, JWT auth, Swagger docs.”*
- *“Serverless endpoint that scrapes a webpage and returns meta-tags as JSON.”*

> 🔍 **Pro tip:** The clearer the *output format* you ask for (“return JSON with keys x, y, z”), the better Claude 4.0 structures the code.

---

## 3  ·  Using the Sharing Feature

1. After saving, hit **Share** (🔗 icon)  
2. Project flips to **public read-only** and a link like `https://codecove.io/p/8f3k2t9s` is copied to your clipboard.  
3. Anyone opening that link sees:  
   - File tree, syntax-highlighted code  
   - Live preview (web) or sample output (API)  
   - **Fork** button — signed-in users clone it to their own `/new` workspace to iterate further.

Great for tutorials, bug repros, client demos!

---

## 4  ·  Tips for Better Code Generation

| Tip | Why it Helps |
|-----|--------------|
| **Add constraints** – “no external UI libs”, “use Tailwind” | Guides dependency choices. |
| **Specify folder structure** – e.g. *“place API routes in `/routes`”* | Cleaner output, less manual rearranging. |
| **Iterate** – regenerate individual files by editing them & asking Claude to *“improve the validation logic in this file only”*. | Fine-grained control. |
| **Mind token budget** – shorter prompts generate faster & cheaper; reuse templates. | Saves your monthly allowance. |

---

## 5  ·  Common Use Cases

| Scenario | How Codecove Helps |
|----------|--------------------|
| Rapid prototypes | 15-minute idea → shareable demo URL for feedback. |
| Coding interviews / live streams | Show step-by-step AI-powered dev without local setup. |
| API mock servers | Spin up Express endpoint, share doc link with frontend team. |
| Teaching & workshops | Students fork starter projects; instructors track progress. |
| Design-to-code hand-off | Designers paste component specs, get live playgrounds. |

---

## 6  ·  Troubleshooting Guide

| Issue | Fix |
|-------|-----|
| **“Generate” button stuck on spinning** | Check Anthropic API key quota in *Settings → API*. |
| Files created but **preview is blank** | Ensure project type = Web; verify an `index.html` or `src/App.(t)sx` exists. |
| **Syntax errors** after generation | Use Monaco’s red squiggles; ask Claude: *“fix TypeScript errors in file X.”* |
| **Exceeded token limit** | Shorten prompt or upgrade to *Pro* in billing page. |
| **403 on Share URL** | Project is still private – press **Share** again or toggle *Public* in header. |
| Need **real device preview** for Mobile | Click *“Open in Snack”* (coming soon) or use Expo Go with QR code. |

---

### ❤️  We’re Listening

Found a bug or have a killer feature idea?  
Open an issue, ping @BigSteppaHR on X, or drop by our community Discord. Happy coding! 🛠
