# CLI-CMS Due List Module (for CRTMS)

HQ-CLI tool to upload a CMS Report CSV, view the **overdue** list for one
parameter at a time, sort and trim it, and download it as Excel or PDF.

**The Due List stores nothing.** The CSV is parsed in memory and discarded. Exports are
built from the row set the browser posts back. This matches the requirement that
the data is stale the next day and must not be persisted. (The Daily Position page
*does* store its reports — see "Daily Position → Storage" below.)

## What it does

- Upload a CMS Report CSV (drag-drop or file picker).
- Three parameters, switched one at a time — **Grading**, **Counselling**,
  **Foot Plate Monitoring** (see *Reading the CSV* below for where each one lives).
- The table shows **only overdue rows** for the active parameter
  (due date ≤ today, IST). Everything dated today-or-later is filtered out.
- Sort by: due date (oldest first), CLI name, designation, category (A/B/C/D).
- Remove rows the CLI doesn't want (per-parameter; "Restore removed" undoes it).
- Export the current list to **Excel** or **PDF**.
- Dashboard counters show overdue totals for all three parameters.

## Reading the CSV

Columns are located by **header name**, not by position. The CMS export has changed
shape before — an older 24-column export gained a `STATUS` column after `DESIG.`,
which pushed every date column one to the right. Fixed indices parsed that file
silently wrong (the Grading due list simply came out empty), so `lib/cmsReport.js`
reads the header row instead. Both the 24- and 25-column exports work.

The catch is that `DONE DATE`, `DUE DATE`, `MODE` and `#` each appear **three times**
— once per parameter block — so the repeated pairs are resolved by occurrence order:

```
S.No. | CLI ID | CLI NAME | CREW ID | NAME | DESIG. | [STATUS] |
PREVIOUS DATE | PREVIOUS GRADE | DONE DATE | CURRENT GRADE | DUE DATE |  <- 1st pair = Grading
# | MODE | DONE DATE | DUE DATE |                                       <- 2nd pair = Counselling
# | REMARK-[SUBJECT] | MODE | DONE DATE | DUE DATE |                     <- 3rd pair = Foot Plate
REMARK | MODE | PLAY DATE | SCORE
```

`CURRENT GRADE` is the safety category (A/B/C/D, matching `div_staff_master.safety_category`). `STATUS` is the crew duty state
(REST / SIGNON / LEAVE / …) — shown in the table and in both exports; it is blank
for an old-format upload.

If a required header can't be found, the parser falls back to fixed positions **and
returns a warning** that the page displays — it never fails silently. A due column
holding non-date values raises a warning too.

## Files

```
lib/cmsReport.js          Processing core: header→column resolution, dd-mm-yyyy parsing, IST overdue logic
routes/clicms.js          Express router: /upload, /export/xlsx, /export/pdf
public/clicms/index.html  Page
public/clicms/clicms.css  Styles
public/clicms/clicms.js   Client logic
server.js                 Standalone test harness (NOT needed inside CRTMS)
```

## Test it standalone first

```bash
npm install
node server.js
# open http://localhost:3000/clicms/
```

Upload one of your CMS Report CSVs and try each parameter, sort, remove, export.

## Integrate into CRTMS

1. Copy `lib/cmsReport.js`, `routes/clicms.js`, and `public/clicms/` into your
   CRTMS project (adjust the `require('../lib/cmsReport')` path if needed).

2. Make sure the JSON body parser is large enough for export payloads
   (the due list comes back as JSON):

   ```js
   app.use(express.json({ limit: '15mb' }));
   ```

3. Mount the page + router **behind your existing auth + HQ-CLI role check**.
   Replace `requireHqCli` with your own middleware (the role you create for the
   `clicms` user):

   ```js
   const clicmsRouter = require('./routes/clicms');
   app.use('/clicms', requireLogin, requireHqCli, express.static(path.join(__dirname, 'public', 'clicms')));
   app.use('/clicms', requireLogin, requireHqCli, clicmsRouter);
   ```

   The page uses **relative** fetch paths, so it works under any mount point
   (`/clicms/`, `/tools/clicms/`, etc.) without code changes.

4. Add a link to `/clicms/` wherever your HQ-level tools live in the nav.

## If the CMS export format changes

Usually nothing needs doing — columns are matched by header name, so an inserted,
removed or reordered column is absorbed automatically (see *Reading the CSV*).

Act only if an upload now shows a warning banner. That means a header was renamed
or a parameter block was added/dropped, and the parser has fallen back to fixed
positions. Fix it in `lib/cmsReport.js`:

- **renamed header** → add the new spelling to that field's `aliases` in `SIMPLE_FIELDS`
- **a fourth parameter block** → add it to `BLOCKS` in `buildColumnMap`, and to
  `PARAMETERS`
- **last-resort layout change** → update `positionalMap()`, the fallback map

## Changing the UI shell

`index.html`, `clicms.css` and `clicms.js` are cached by the service worker. When you
edit any of them, bump `CACHE_VERSION` in `clicms-sw.js` **and** the matching `?v` tags
on the `<link>`/`<script>` in `index.html`. Navigations are network-first while assets
are cache-first, so skipping this can pair a fresh `index.html` with a stale
`clicms.js` — which silently misaligns the table columns.

## Next step: PWA

Once the page works, add `public/clicms/manifest.json` (scope `/clicms/`) and a
service worker (`clicms-sw.js`) that caches only the app shell (index.html, css,
js) — never the data. That makes it installable on the `clicms` user's phone.
A second scoped PWA (e.g. `/admin/`) can be added later the same way.

## Daily Position (`daily.html`)

The second page of the same `/clicms/` app (one install, two pages; switch at the
top). It builds the officers' daily CMS position sheet (15 blocks, 2-page A4) from
the CMS count/duty downloads.

- **Drop the files together.** CMS names every download `CMS  REPORT (n).csv`, so each
  file is recognised by its **header row**. One module per report in
  `lib/cmsReports/` plus one registry line; the page, Excel and PDF render generic
  tables, so a new report needs no UI code. `lib/cmsReports/position.js` (`PAGES`)
  is the sheet layout and drives both the page and the one-view export.
- **Date box = SHEET date.** Each report has its own `dateOffset`: D-0 CLI Monitoring
  Due, Kiosk; D-2 Working Hours (ML + Sub), PDD, Sign On/Off Biometric; D-1 the rest.
- Special uploads: Continuous Night Working = three files via the 3 / 4 / >4 tabs
  (`POST daily/upload-night`); Sign On/Off without Biometric = per-lobby slot files
  (`POST daily/upload-nonbio`); count-only reports are typed in (`POST daily/manual`).
- Exports print each report's first (sheet) table unless "Include detail tables" is
  ticked; Position (one view) PDF/Excel prints the whole sheet.
- Counts differing by 2-3 from a hand sheet are expected: a later CMS download picks
  up sign-offs done after the earlier one was taken.
- Files must be the CSTM division (`DIV` is checked; a BSL download is refused).
- Bump `CACHE_VERSION` in `clicms-sw.js` and the `?v` tags when shell files change;
  `daily.css`/`daily.js` carry their own `?v` (listed in SHELL).

### Storage (Daily Position only)

Every report loaded — uploaded file, slot part or Fill by hand — is **saved
automatically** for its data date. Tables: `sql/2026-10-12_cms_daily_storage.sql`.

| Table | One row per | Holds |
|---|---|---|
| `cms_daily_loads` | load of one report for one data date | report_key, data_date, sheet_date, source (file / hand / mixed), file names + sha256, **raw file** (one CSV, or a JSON bundle `{slot: {name, data(base64)}}` for slot reports), typed hand values, `tables_json` (exactly as shown), warnings, loaded_by / at, `is_current` |
| `cms_daily_counts` | load × lobby × measure | `value` — every figure of the report, all lobbies and columns (the trend table) |
| `cms_daily_crew` | load × crew × measure | cms_id, name, event_time, `detail` JSON — the names behind a figure (drill-down; lobby uploads will add here) |

- **Code:** `lib/cmsReports/store.js` (`saveLoad`, `loadDay`, `currentParts`); each
  report module's `facts(parsed)` returns its `{ counts, crew }`, attached to the
  processed report as a non-enumerable `facts` so it is saved but never sent to the page.
  Routes call `autoSave` after building; `POST daily/day` returns a saved sheet date.
- **Data date** = sheet date − the report's `dateOffset`; the page sends `sheetDate`
  with every load. No `sheetDate` (an old cached page) = not saved, with a warning.
- **Replace, never delete:** a later load of the same report + data date becomes
  current; the earlier stays with `is_current = 0`. Use this for late sign-offs.
- **Slot reports** (night working, without biometric): parts not sent are filled from
  the day's stored load, so adding one file to a reopened day keeps the others. For
  DR / LTT the newer entry wins — a file replaces typed figures and vice versa.
- **Division totals** are stored under lobby `DIVISION` — CMS has a real lobby named
  CSTM, so that name cannot be used. CLI Monitoring stores one row per division code.
- **Measures** are the report's own column keys (`n`, `over2`, `b8`,
  `freight.wor.hq`, `drltt_on_nobio` …). Breakdown suffixes: `:<desig>` per designation,
  `@<call lobby>` (WR / WOR HQ). A part or figure that was not loaded stores nothing,
  never 0, so a gap is not mistaken for "none".
- **A save failure** never loses the upload: the report is shown with a "Not saved"
  warning and a red flag; load it again to save.
- Opening the page, or picking a date, opens what is saved for that date.

Useful queries:

```sql
-- FSD "N" for KYN, day by day
SELECT l.data_date, c.value FROM cms_daily_counts c JOIN cms_daily_loads l ON l.id = c.load_id
 WHERE l.is_current = 1 AND c.report_key = 'fsd' AND c.lobby = 'KYN' AND c.measure = 'n'
 ORDER BY l.data_date;

-- Crew who appear most often in PDD over 3 hours
SELECT cms_id, crew_name, COUNT(*) n FROM cms_daily_crew r JOIN cms_daily_loads l ON l.id = r.load_id
 WHERE l.is_current = 1 AND r.report_key = 'pdd' AND r.measure = 'over3'
 GROUP BY cms_id, crew_name ORDER BY n DESC LIMIT 20;
```

## Lobby page (`lobby.html`)

Spec: `docs/superpowers/specs/2026-10-16-lobby-cms-design.md`. Lobby users read the HQ
pages and, on their own page, upload the CMS crew list behind each of their counts and
write a remark per name; HQ sees both in the Daily Position drill.

- **Roles.** `jrcc` (new, one account per lobby, `<office>jrcc`) and `office_hr` (the
  srcc accounts) of an office write for that office's lobby; `clicms` / `division_admin`
  view any lobby. `requireClicms` in `server.js` admits all four; the HQ write routes
  (`daily/upload*`, `daily/manual`, `daily/move`) return 403 to lobby roles. `jrcc` is
  **confined** to `/clicms` by its own allowlist block in `server.js` (same shape as the
  `cli` and `clicms` blocks) and logs in straight to `lobby.html`; a later page for jrcc is
  one more prefix in that block. `office_hr` is not confined (it uses the HR pages).
- **Office → lobby** is one constant, `lib/cmsReports/lobbies.js`: CSMT-ML → CSMT (+DR),
  KYN-ML → KYN, PNVL-ML → PNVL (+JNPN, ROHA), IGP, LNL → LNLX (+LNL), VVH, NRL,
  CSMT-SUB → CSTS, KYN-SUB → KYNS, PNVL-SUB → PNVS.
- **Lobby lists** are their own registry, `lib/cmsReports/lobbyLists.js` → `lobby/*.js`
  (fsdn, wrworlist, whlist, nightlist, prlist). An HQ file dropped there is refused and a
  lobby list dropped on the Daily Position is refused — the two never share a header.
  Each module: `matchesHeader`, `parse`, `items(parsed)` → rows with an **item key**
  naming the event, `checkDate`, optional `merge`. A list is never refused for differing
  from HQ's count (the lobby downloads later); only for another lobby's crew or a wrong date.
- **Storage** (`sql/2026-10-16_lobby_cms.sql`): a lobby upload is a `cms_daily_loads` row
  with `lobby` set (NULL = HQ's load; every HQ reader selects `lobby IS NULL`); its crew
  rows carry `source = 'lobby'` and the item key + display columns in `detail`. Remarks
  live in `cms_lobby_remarks`, one row per version (edit = new current row, old retired;
  empty = withdrawn), keyed by report, lobby, crew and item key, so a remark follows the
  item across sheets.

| Report | item key |
|---|---|
| PME / REFT / ASIG | `<test>|<due date>` |
| FSD N, Working Hours, Breach of Rest | sign-on datetime |
| WR / WOR | TA number |
| Continuous Night | first night date |
| PR Overdue | last PR datetime |
| Change on Approval | approval datetime |

- **Cards** (`lib/cmsReports/lobbyDay.js`): HQ's figure is `null` only when HQ has no
  current load of that report for the day ("HQ has not loaded"); a load with no row for
  the lobby is a figure of 0 ("Nothing against CSMT"), e.g. Working Hours Suburban for a
  mainline lobby. One WR/WOR upload fills both WR/WOR cards and the two share one remark
  per booking (TA). **copy to blanks** under a remark box writes its text into every empty
  box on the card; written and saved boxes are left alone.
- **Routes** (`routes/clicmsLobby.js`, all POST): `lobby/day` (cards, from
  `lib/cmsReports/lobbyDay.js`), `lobby/upload`, `lobby/remark`.
- **HQ drill** (`lib/cmsReports/lobbyDrill.js`): attached live when a day is opened or
  uploaded, never saved into `tables_json`. Counts-only reports gain a drill per lobby
  count; names-from-HQ reports' drills gain "Lobby remark" / "By" columns.
- **Tests:** `scripts/test/run-all.sh` (parsers against `data/cms-report/lobby-upload/`,
  store and drill against the local DB; both clean up after themselves).

```sql
-- Current remarks for one lobby, newest first
SELECT report_key, cms_id, item_key, remark, written_by, written_at FROM cms_lobby_remarks
 WHERE lobby = 'CSMT' AND is_current = 1 ORDER BY written_at DESC;
-- Lobby uploads per day
SELECT data_date, lobby, report_key, loaded_by, loaded_at FROM cms_daily_loads
 WHERE lobby IS NOT NULL AND is_current = 1 ORDER BY data_date DESC, lobby;
```
