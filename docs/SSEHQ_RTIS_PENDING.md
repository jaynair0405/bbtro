# SSE-HQ → RTIS access — deferred

**Status:** wanted, not built. Deliberately blocked for now.
**Deferred:** 2026-08-20.

## What was asked for

The SSE-HQ desk writes the OPR (one page report of detention) and the
DElogging Note. Both argue about *why* a train lost time, so the running data
behind the detention — which RTIS holds — is the natural evidence to cite.
Giving the desk RTIS reports was asked for and is still wanted; it was pulled
back to be looked at properly rather than bolted on.

## What is in place right now (the block)

`ssehq` is scoped by an allowlist, not the blunt `/div` redirect that scopes
CTLC, because the SSE-HQ pages live under `/div` themselves:

| Layer | Where | Allowed |
|---|---|---|
| Pages | `server.js`, `/div` guard, `SSEHQ_PAGES` | `ssehq-opr`, `ssehq-note`, `ssehq-manual`, `documents.html`, `/div` assets |
| Division API | `server.js`, `/api/division` guard, `SSEHQ_API` | `/ssehq/*`, `/documents/*`, `/loco-link/*` |
| RTIS proxy | `server.js`, `/spm/rtis` guard | **explicitly 403 for `div_role === 'ssehq'`** |

`/loco-link/*` is there because it backs the **Control Office portal**, which
this account has always had (`requireControlOffice` lists `ssehq`, and the
original seeding SQL says the account "retains the read-only Control Office
portal"). Leaving it out of the allowlist silently broke that portal — the page
still loaded but every panel on it failed. `locoLinkRoutes` enforces `ssehq` as
view-only itself, so reads pass and writes are refused there rather than here.
`/control-office/consolidated-sheet.html` stays closed to this account, but that
is a pre-existing rule of its own and unrelated.

The third row is the one that is easy to miss. `/spm/rtis` is a proxy to a
separate app on **port 8765** and its guard checks the **realm only**. Every
division login therefore reaches RTIS by default. Removing the link from the
SSE-HQ app bar does *not* remove the access — an `ssehq` user could type the
URL. Hence the explicit role check at that guard.

## To turn it on later, three things must change together

1. **`SSEHQ_API`** in `server.js` — add `/^\/rtis(\/|$)/` for
   `/api/division/rtis/*` (`lp-search`, `lp/:hrms_id`, `cli-search`).
2. **The `/spm/rtis` guard** in `server.js` — drop the `ssehq` 403.
3. **A link** in the app bar of `ssehq-opr.html` and `ssehq-note.html`,
   pointing at `/spm/rtis/rtis` directly. Not at `/div/spm-hub.html`: the hub
   also carries Sub-SPM, the goods analyses and CVVRS/ADAS, none of which this
   desk has a call to open, and the hub page is not on the page allowlist.

## Things to know before doing it

- **`can_access_rtis` is not the control.** The column exists on `users` and is
  written by the user-seeding SQL files, but **nothing in this application
  reads it**. `/spm/rtis` guards on realm alone — unlike `/spm/sub-spm`, which
  does check `can_access_sub_spm`. If the flag is ever meant to be the gate,
  the `/spm/rtis` guard has to start reading it, and every existing division
  account needs auditing first, because they all pass today.
  The flag is currently **0** for `ssehq`.
- **`/api/division/rtis/lp-search` returns loco-pilot identity data** (hrms_id
  and personal fields, ~50 rows, scoped by an office that resolved to `CSMT`
  for a `CO-BB` account in testing). That office scoping is worth understanding
  before opening it up — a `CO-BB` desk getting `CSMT` scope looks unintended.
- The RTIS app on port 8765 was **not running** during this work, so only
  `/api/division/rtis/lp-search` was exercised; the proxied UI itself is
  unverified against an `ssehq` session.

## Related

- `routes/division/ssehqRoutes.js` — the module's own API, including the
  `search-staff` and `search-loco` pickers, which are what keep working while
  the general staff endpoints are closed to this desk.
- Broader issue: every division API is mounted with `requireRealm('division')`,
  which checks the realm and **not** the role, and only 20 of 33 route files in
  `routes/division/` do a `div_role` check of their own. `ssehq` is now
  allowlisted, but other roles are not — this is worth a separate pass.
