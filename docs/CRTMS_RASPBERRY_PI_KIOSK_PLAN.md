# CRTMS Raspberry Pi Kiosk Plan

## Purpose

This document captures the recommended approach for showing a protected `crtms.in` page on a TV in kiosk mode using a Raspberry Pi 4B.

It is written for the current CRTMS codebase and for a first-time Raspberry Pi setup.

## Current Situation In This Repo

CRTMS currently uses normal user login with server-side sessions:

- `server.js` uses `express-session` with `express-mysql-session`
- session and cookie expiry are set to `8 * 60 * 60 * 1000` (8 hours)
- `routes/authRoutes.js` creates `req.session.user` after `/api/login`
- protected division pages under `/div/*` and most `/api/*` routes require a valid session

This means a normal TV browser session will eventually expire and redirect back to login.

## Chosen Display Target

The selected TV page is:

- `public/div/slate.html`

Important findings from the current implementation:

- this is a Division page, not a public page
- it already has a big-screen mode via `?display=1`
- it currently loads data from `/api/division/slate/board`
- that API is protected by the normal division session
- the current frontend config is hardcoded to office code `PNVL-ML`

What this means:

- we should **not** expose `/div/slate.html` directly to the TV
- we should reuse its display-mode UI pattern
- we should create a separate kiosk route and separate read-only kiosk API for slate data

Recommended kiosk target for this page:

- `/kiosk/slate/:displayId`

Example:

- `https://crtms.in/kiosk/slate/pnvl-main`

Confirmed first display:

- display id: `pnvl-office`
- office code: `PNVL-ML`
- first kiosk URL shape: `https://crtms.in/kiosk/slate/pnvl-office?token=YOUR_KIOSK_TOKEN`
- first server env var: `KIOSK_PNVL_SLATE_TOKEN`

## What The Slate Kiosk Should Do

For the first version, the kiosk should:

- open directly to slate display mode
- show only read-only slate data
- auto-refresh
- survive beyond the current 8-hour login timeout
- not show edit controls
- not depend on a staff login session

Recommended first scope:

- one office only
- one display only
- one token only
- current shift by default
- allow manual shift/date switching on the TV only if needed

## Slate-Specific Build Approach

The safest implementation is:

1. Keep `/div/slate.html` unchanged for normal division users
2. Add a new kiosk page for display-only use
3. Add a new kiosk API that returns only the slate board data needed by the TV
4. Reuse the slate display rendering logic where practical

Do not:

- remove session protection from `/div/slate.html`
- point the TV directly to `/div/slate.html`
- open `/api/division/slate/board` to unauthenticated users

## Slate-Specific Implementation Notes

### Existing useful pieces

The current slate frontend already gives us:

- display-mode layout
- auto-refresh behavior
- date navigation
- shift navigation
- board rendering

This reduces implementation work.

### Existing constraints

The current slate frontend is not kiosk-ready as-is because:

- it depends on the division session-protected API
- it is tied to the current division page structure
- it still includes normal page navigation elements
- it currently assumes office code `PNVL-ML`

### Recommended first implementation

Build a dedicated page such as:

- `public/kiosk/slate.html`

And a dedicated API such as:

- `/api/kiosk/slate/board`

The new kiosk page can borrow rendering logic from the existing slate page, but it should be independent from the normal division route.

## Main Questions Answered

### 1. If the page requires login, how can it be shown on the TV?

Recommended approach:

Create a dedicated read-only kiosk access mode instead of using the normal login session.

Example target URL:

`https://crtms.in/kiosk/display1`

or

`https://crtms.in/kiosk/display/slate-csmt`

The kiosk route should:

- not depend on `req.session.user`
- use a dedicated display token or display key
- expose only the minimum read-only data needed for the TV
- never allow edit/create/delete actions

### 2. The current page logs out after 8 hours. Should we change that?

For kiosk mode, do **not** solve this by extending the user session to 24 hours or forever.

Why:

- it weakens security for all users
- browser sessions can still break after reboot/network loss
- normal user login is not a good fit for unattended TV screens
- a kiosk should behave like a device, not like a staff member's browser

Recommended solution:

- keep the current 8-hour user session for normal staff login
- create a separate kiosk access mechanism with its own token

### 3. Can we show more than one page?

Yes.

There are three practical patterns:

1. One fixed kiosk page that internally rotates widgets/tables
2. One kiosk page that rotates multiple CRTMS pages on a timer
3. Multiple separate TV URLs, one per display

Recommended starting point:

Start with one fixed display page. After that is stable, add multi-page rotation only if still needed.

### 4. Can it be controlled from a PC?

Yes.

Best long-term control model:

- TV always opens one kiosk URL
- the server decides what content that kiosk URL shows
- changes are made from the CRTMS admin side or database, not by touching the Pi every time

This is better than remotely changing browser tabs on the Pi.

## Recommended Architecture For CRTMS

### Summary

Build a dedicated kiosk route and dedicated read-only API for the TV.

Recommended structure:

- route: `/kiosk/:displayId`
- API: `/api/kiosk/...`
- auth method: display token, not user session
- data scope: only the fields needed for the TV
- permission: read-only

### Why this fits the current codebase

The current app already separates:

- page routes in `server.js`
- session login in `routes/authRoutes.js`
- feature APIs under `routes/` and `routes/division/`

So the clean way is to add kiosk support as a parallel path instead of weakening the existing login system.

## What We Need To Build In The Website

### 1. A dedicated kiosk route

Add a route such as:

- `/kiosk/slate-csmt`
- `/kiosk/midnight-position-kyn`
- `/kiosk/display/:displayId`

This route should serve a display-only HTML page.

Suggested files:

- `server.js`
- `public/kiosk/display.html`
- `public/kiosk/display.js`
- `public/kiosk/display.css`

### 2. A kiosk authentication model

Do not use `req.session.user` for the TV.

Use a display token instead.

Recommended design:

- create one record per display
- each record has a random token
- store only a hash of the token in the database
- Pi stores the real token
- server verifies the token before returning data

Suggested DB table:

- `kiosk_displays`

Suggested columns:

- `id`
- `display_id`
- `display_name`
- `token_hash`
- `page_type`
- `page_config_json`
- `enabled`
- `last_seen_at`
- `created_at`
- `updated_at`

### 3. A read-only kiosk API

Add routes such as:

- `/api/kiosk/display/:displayId/config`
- `/api/kiosk/display/:displayId/data`
- `/api/kiosk/heartbeat/:displayId`

Rules:

- no session required
- token required
- only read operations
- return exactly the fields needed by the screen

Suggested new backend file:

- `routes/kioskRoutes.js`

### 4. A display-only frontend

The kiosk page should:

- fetch only kiosk APIs
- auto-refresh data on an interval
- show a clear timestamp like `Last updated`
- show an offline/error banner if data fetch fails
- recover automatically when network returns
- avoid all edit buttons and admin controls

### 5. Optional admin control later

After the first kiosk works, add an admin screen to:

- create a display
- rotate/regenerate token
- enable or disable a display
- assign which page/config a display shows
- configure refresh interval
- configure rotation between multiple views

This is optional for phase 1.

## Proposed File-Level Implementation Plan

### Backend

`server.js`

- add `/kiosk/*` route to serve kiosk HTML
- allow `/api/kiosk/*` before the normal `/api` session guard, or explicitly allowlist it

`routes/kioskRoutes.js`

- validate display token
- return display config
- return display data
- update heartbeat or last seen time

`sql/..._kiosk_access.sql`

- create `kiosk_displays` table
- optionally create `kiosk_display_logs` table

### Frontend

`public/kiosk/display.html`

- TV layout
- no login dependencies

`public/kiosk/display.js`

- read `displayId`
- send kiosk token
- fetch config/data
- poll for updates
- rotate between views if needed later

`public/kiosk/display.css`

- simple high-contrast TV-friendly layout
- larger text
- table spacing suitable for distance viewing

## Recommended Token Pattern

For simplicity, one of these approaches can be used:

### Option A: Token in URL query

Example:

`https://crtms.in/kiosk/slate-csmt?token=LONG_RANDOM_SECRET`

Pros:

- easiest to set up on Raspberry Pi

Cons:

- token is visible in the URL

### Option B: Token in local config and sent as header

Example:

- Pi loads `/kiosk/slate-csmt`
- page JS sends `X-Kiosk-Token: ...`

Pros:

- cleaner than putting token in the address bar

Cons:

- slightly more setup work

Recommended starting point for this project:

Option A is acceptable for the first working version if:

- the token is long and random
- HTTPS is used
- the kiosk is read-only
- the token can be rotated quickly if needed

If stricter security is required, move to Option B.

## Step-By-Step Execution Order

This is the order we should follow.

### Phase 1: Decide the exact display target

1. Identify the exact page to show on the TV
2. Decide whether it is a division page or suburban page
3. List the exact data the TV needs
4. Remove anything that should not appear publicly on a screen

Output of this phase:

- one clearly defined display requirement

Example:

- show only the digital slate for one office
- refresh every 60 seconds
- no edit buttons
- no staff login required on TV

### Phase 2: Build kiosk support in CRTMS

1. Add database table for kiosk displays and tokens
2. Add backend token validation
3. Add kiosk HTML page
4. Add read-only kiosk API
5. Test the kiosk URL on a laptop browser first
6. Confirm it still works after 8+ hours without user login

Output of this phase:

- a stable CRTMS kiosk URL that works independently of staff login

### Phase 3: Prepare Raspberry Pi OS

1. Flash Raspberry Pi OS with Desktop using Raspberry Pi Imager
2. Set hostname, Wi-Fi, locale, and user account in Imager customization
3. Enable SSH during flashing
4. Boot the Pi on a monitor/TV
5. Update the OS
6. Confirm Chromium opens normally

Output of this phase:

- Pi is ready and reachable

### Phase 4: Set kiosk mode on the Pi

1. Configure Chromium to auto-start in kiosk/full-screen mode
2. Point it to the kiosk URL, not the normal login page
3. Disable screen blanking and sleep
4. Reboot and verify auto-launch
5. Test power loss and reboot recovery

Output of this phase:

- TV always comes back to the CRTMS kiosk page after reboot

### Phase 5: Office deployment

1. Update Wi-Fi or use Ethernet in office
2. Test page reachability from office network
3. Confirm time/date are correct
4. Confirm display survives overnight
5. Document token, hostname, and support steps

Output of this phase:

- stable office deployment

## What We Should Do Right Now

Before touching the Raspberry Pi, do this first:

1. Choose the exact CRTMS page/view that must be displayed
2. Build the dedicated kiosk route for that view
3. Test that route on a PC browser for at least one full workday

This is the most important point.

The Pi setup should come **after** the website can already show the display without manual login.

## If You Want To Start With A Temporary Test First

Yes, we can use a temporary mirror/test page first and switch later.

When the actual kiosk URL is ready, only the Pi startup URL needs to change.

## Home Wi-Fi vs Office Wi-Fi

If the Pi is tested at home and moved later:

- the kiosk URL stays the same
- only the network connection changes
- Wi-Fi credentials may need updating
- local Pi IP address will usually change

Potential office blockers:

- captive portal Wi-Fi
- enterprise Wi-Fi
- firewall restrictions
- proxy restrictions

If CRTMS is publicly reachable on the internet and office policy allows it, the Pi should work on either network.

## Multi-Page Display Control

If more than one page must be shown, recommended control methods are:

### Option 1: Server-side playlist

Store a sequence in `page_config_json`, for example:

- page A for 30 seconds
- page B for 30 seconds
- page C for 60 seconds

This is the best long-term model because the Pi keeps one fixed URL.

### Option 2: One summary dashboard page

Build one display page containing multiple tables/sections instead of rotating multiple URLs.

This is usually simpler and more reliable.

### Option 3: Remote control the Pi

Use SSH, VNC, or Raspberry Pi Connect to change the Pi browser manually.

This should only be a fallback, not the main control model.

## Security Notes

For kiosk access:

- keep it read-only
- expose only required data
- use a random token
- store hashed token in DB
- use HTTPS only
- support token rotation
- add a quick disable switch for each display

Do not:

- reuse a staff username/password on the TV
- keep a powerful division admin logged in permanently
- expose edit APIs to kiosk mode
- globally increase all user session timeouts for this use case

## Suggested First Implementation Scope

For the first working version, keep scope tight:

1. One display
2. One page
3. One token
4. Read-only data
5. Auto-refresh every 60 seconds
6. No admin panel yet

After this works reliably, add:

- multiple displays
- admin controls
- playlists or page rotation
- monitoring and heartbeat alerts

## Immediate Next Step

The next actual build step should be:

Define the exact target view to be shown on the TV, then implement a dedicated kiosk route for that one view.

Only after that should Raspberry Pi flashing and kiosk boot setup begin.
