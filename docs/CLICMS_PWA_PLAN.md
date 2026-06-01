# CLI-CMS PWA — Plan & Architecture Notes

Status: **Planning (not yet implemented)**
Target app: CMS Due List tool at `https://crtms.in/clicms/`
Logo source: `bb Dig workplace.png` (1024×1024, square) in repo root

---

## 1. Goal

Turn the existing `/clicms/` web tool into an **installable Progressive Web App (PWA)** so the
HQ-CLI (`clicms`) user can:

- Install it to the phone home screen as an icon ("CMS Due List").
- Open it **fullscreen**, like a native app (no browser chrome).
- **Launch instantly** even on a weak signal (the app shell loads from the device).

Nothing about the existing tool's behaviour changes. The PWA layer is **additive**: if anything
in it misbehaves, the plain website still works exactly as today.

---

## 2. What a PWA is (plain language)

A PWA is just the normal website plus a few extra files that let the browser treat it like an
installed app. Three pieces:

1. **Manifest** (`manifest.json`) — a small text file with the app's name, icon, theme colour, and
   "open fullscreen". This is what produces the install prompt and the home-screen icon.
2. **Service worker** (`clicms-sw.js`) — a small background script the browser keeps. Its only job
   here: cache the **app shell** (page, CSS, JS) so the app opens offline / instantly.
3. **Icons** — PNG images (192 + 512, plus a "maskable" variant) for the home screen.

Plus ~6 lines added to `index.html` to link the manifest and register the service worker.

### Hard requirement: HTTPS — satisfied
Service workers only run on a secure origin: `https://…` ✅ or `http://localhost` ✅
(`http://<server-IP>` from a phone ❌). `crtms.in` is HTTPS, so on-phone install will work after
deploy. Local development testing works on `http://localhost:3000/clicms/`.

---

## 3. The golden rule for THIS tool: cache the shell, never the data

The tool's core promise is **"nothing is stored — the CSV is processed in memory and discarded."**
The PWA must keep that promise:

- The service worker caches **only the app files** (`index.html`, `clicms.css`, `clicms.js`,
  manifest, icons) — the *empty* tool.
- It **never** caches the uploaded CSV, the computed overdue lists, or any export.
  Those always require a fresh upload and a live network request.

Result: offline, the app opens ready-to-use, but to get data the user must upload a CSV (which
needs the server). The stale-next-day data never lingers on the device. ✔ matches requirement.

---

## 4. Architecture decisions (from discussion)

### Mental model
**One PWA = one folder with its own manifest + service worker + icons, tied to a URL "scope"
(a path prefix).** The browser decides "is this a separate installable app?" purely from the
manifest and its scope.

### Q1 — Can one person install more than one PWA? 
**Yes, unlimited.** Each tool at its own path with its own manifest becomes a separate home-screen
icon. They are independent and don't interfere.

### Q2 — Can a different user (even without a crtms login role) use a new, unrelated PWA?
**Yes.** A PWA is just a scoped web page with an app wrapper; it's independent of identity.
**Important:** the PWA wrapper does **not** handle login — the existing auth does. So a user
"without a crtms role" can use a new PWA only if that tool's page is **public** or they are given
a **credential/role for that tool's path**. The PWA neither bypasses nor adds authentication.

### Q3 — Does each PWA need its own manifest.json?
**Yes — one manifest per app**, each scoped to its own folder, with its own service worker and
icons. That is exactly what tells the browser they are separate apps. Pattern: one self-contained
folder per tool.

### Q4 — For division admin: one PWA with a sidebar instead of many?
**Yes — better for admins.** `/div/` is already a single dashboard with a sidebar to all tools.
Making **`/div/` itself one PWA** gives the admin **one icon** that opens fullscreen and navigates
everything from the sidebar. No need for ten icons.

### Resulting two-audience strategy

| Audience | PWA approach | Why |
|----------|-------------|-----|
| **Single-purpose users** (e.g. `clicms`) | Narrow PWA scoped to one tool (`/clicms/`) | One icon, opens straight to their job |
| **Power users** (division admin) | **One** broad PWA scoped to `/div/` (existing sidebar) | One icon, navigate all dashboards/reports inside |

The same report is reachable **both ways**: as its own mini-PWA (dedicated user) and as a page
inside the admin's `/div/` app — same page, two doors.

### Path decision: CMS stays at top-level `/clicms/` (DECIDED)
The CMS module stays at **`/clicms/`** (not moved under `/div/`). Rationale: the `clicms` user
(primary PWA target) is unaffected by path, and the only gain from nesting under `/div` is seamless
in-app navigation for a *future* admin PWA — for which a browser tab is acceptable. Avoids refactor
and keeps the "public shell, gated data" split clean (no public path nested inside gated `/div`).
PWA `scope`/`start_url` = `/clicms/`.

### Scope nuance (important)
A PWA's `scope` is a **single path prefix**. The admin's `/div/` app contains everything under
`/div/…`. But `/clicms/` is **not** under `/div/`, so tapping a CMS link from inside the `/div/`
app would open it in a normal browser tab (not inside the installed app). Acceptable for now.
To put *truly everything* in one admin app, tools would need a common parent path. Not changing
paths now — just noting the rule.

---

## 5. Implementation plan — the `clicms` PWA (build first)

All files live under `public/clicms/`.

### 5.1 Icons
Generate from `bb Dig workplace.png` (1024×1024) into `public/clicms/icons/`:
- `icon-192.png` (192×192)
- `icon-512.png` (512×512)
- `icon-maskable-512.png` (512×512, with safe padding so Android's circular/rounded mask doesn't
  clip the logo)
- `apple-touch-icon.png` (180×180, for iOS home screen)

Tooling: `sips` (built into macOS) for resizing.

### 5.2 `manifest.json`
Key fields:
- `name`: "CMS Due List"
- `short_name`: "CMS Due"
- `description`: "HQ-CLI CMS Report due-list tool"
- `start_url`: `.` (resolves to `/clicms/` — relative keeps it mount-agnostic)
- `scope`: `.` (`/clicms/`)
- `display`: `standalone` (fullscreen app feel)
- `background_color`: `#eef1f5` (app background)
- `theme_color`: `#1f3a5f` (navy top bar)
- `icons`: the three icons above (192, 512, maskable)

### 5.3 `clicms-sw.js` (service worker)
Design — **shell cache-first, navigations network-first, data never cached**:
- **Versioned cache name**, e.g. `clicms-shell-v1`. Bump the version string on every release so
  devices fetch fresh files instead of stale ones.
- **`install`**: pre-cache the shell — `./`, `./index.html`, `./clicms.css`, `./clicms.js`,
  `./manifest.json`, the icons. Call `skipWaiting()`.
- **`activate`**: delete any old `clicms-shell-*` caches; `clients.claim()`.
- **`fetch`** handling:
  - **Never touch** `/clicms/upload` and `/clicms/export/*` and any `/api/*` → bypass the SW
    entirely (always live network). The SW only ever handles `GET`, so POSTs are already safe, but
    we explicitly skip these paths for clarity.
  - **Navigations** (opening the page): **network-first** — try the server (so auth redirects and
    fresh HTML work), fall back to cached `index.html` only when offline.
  - **Static shell assets** (css/js/icons/manifest, same-origin GET under `/clicms/`):
    **cache-first** — instant load, update cache in background.
- **Why network-first for navigations:** if the session has expired, the server redirects
  `/clicms/` to the login page; cache-first would wrongly show the cached shell to a logged-out
  user. Network-first respects auth and only uses cache when genuinely offline.

### 5.4 `index.html` additions (~6 lines in `<head>` / end of body)
- `<link rel="manifest" href="manifest.json">` (see §7 re: credentials)
- `<meta name="theme-color" content="#1f3a5f">`
- iOS support: `<meta name="apple-mobile-web-app-capable" content="yes">`,
  `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">`,
  `<meta name="apple-mobile-web-app-title" content="CMS Due">`,
  `<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">`
- A small script to register the service worker:
  `if ('serviceWorker' in navigator) navigator.serviceWorker.register('clicms-sw.js')`

---

## 6. Update / versioning strategy

PWAs cache aggressively, so stale versions are the classic trap. Our approach:
- A single `CACHE_VERSION` constant at the top of `clicms-sw.js`.
- **Every time we change `index.html` / `clicms.css` / `clicms.js`, bump `CACHE_VERSION`.**
- On next launch the new SW installs, `activate` purges old caches, `clients.claim()` takes over →
  device gets fresh files (typically on the second open after a release).
- (Optional later: an in-page "New version available — refresh" toast. Not in v1.)

---

## 7. Decision needed: auth vs installability of shell assets

**Context:** today the whole `/clicms` path (including `index.html`, css, js) is behind the
`requireClicms` gate (`server.js:543`). For install to work, the browser must be able to fetch the
**manifest and icons** — and browsers often fetch those **without cookies** by default, which would
hit the gate and fail (302/401), breaking the install prompt.

**Two options:**

- **Option A (recommended): serve the static shell publicly, keep DATA gated.**
  Mount `public/clicms/` static **without** `requireClicms`, but keep the **router**
  (`/clicms/upload`, `/clicms/export/*`) behind `requireClicms`. The empty tool UI becomes
  publicly viewable, but **no data** is ever reachable without login. This is the standard PWA
  pattern and avoids all credential-fetch problems.
  - Side effects to handle: an unauthenticated visitor could load the empty page; uploads/exports
    return 401. The topbar's `/api/current-user` call already returns 401 cleanly (button hidden).
    Optionally add a small "please log in" hint when no session.
  - The global `clicms`-confinement guard (`server.js:119`) already allowlists `/clicms/*`, so it
    is unaffected.

- **Option B: keep the gate, add `crossorigin="use-credentials"` to the manifest link.**
  Forces the manifest fetch to send cookies. Works only while logged in, and **icon** fetches
  behind auth remain fragile across browsers. More brittle. Not recommended.

**DECIDED: Option A** (shell public, data gated). Confirmed by user.

---

## 8. Testing plan

### Local (desktop Chrome, `http://localhost:3000/clicms/`)
- DevTools → Application → **Manifest**: fields + icons load, no errors.
- DevTools → Application → **Service Workers**: registered, activated; tick "Offline" and reload —
  shell still loads, uploads correctly fail (network needed).
- **Lighthouse → PWA audit**: installable, has manifest, has service worker, etc.
- Confirm a data upload still works online (shell-only caching, data not cached).

### Phone (after deploy, `https://crtms.in/clicms/`)
- Log in as `clicms` → "Add to Home Screen" (Android Chrome prompt; iOS via Share menu).
- Launch icon → opens fullscreen, navy theme.
- Upload a CSV, switch parameters, export — verify all work.
- Airplane mode → app shell still opens (data needs network — expected).

---

## 9. Deployment notes

- The PWA is **code/asset only — no new npm dependencies**, so on the server:
  `git pull` + restart (pm2). **No `npm install` needed.**
- If Option A (§7) is chosen, `server.js` changes (split static vs router gating) — still
  code-only.
- After deploy, bump `CACHE_VERSION` discipline applies for all future shell changes.

---

## 10. Follow-up (separate task): admin `/div/` PWA

After the `clicms` PWA is proven:
- Add `manifest.json` + service worker + icons scoped to `/div/`.
- Admin installs **one** icon; the existing sidebar navigates all dashboards/reports inside.
- Mind the scope rule (§4): tools outside `/div/` (like `/clicms/`) open in a browser tab from
  inside the `/div/` app.
- Reuse the same shell-not-data caching discipline (and be extra careful: `/div/` has many pages —
  decide what, if anything, to pre-cache; likely just the dashboard shell).

---

## 11. Build checklist (clicms PWA)

- [x] Decide §7 — **Option A chosen** (shell public, data gated)
- [ ] Generate icons (192, 512, maskable, apple-touch) from `bb Dig workplace.png`
- [ ] Add `public/clicms/manifest.json`
- [ ] Add `public/clicms/clicms-sw.js` (versioned; shell cache-first, nav network-first, data never)
- [ ] Add manifest/theme/iOS tags + SW registration to `index.html`
- [ ] (If Option A) adjust `server.js` static vs router gating
- [ ] Local test (manifest, SW, offline shell, Lighthouse, live upload)
- [ ] Commit + push
- [ ] Deploy (git pull + pm2 restart) and test install on phone at `https://crtms.in/clicms/`
