# CLI-CMS Due List Module (for CRTMS)

HQ-CLI tool to upload a CMS Report CSV, view the **overdue** list for one
parameter at a time, sort and trim it, and download it as Excel or PDF.

**Nothing is stored.** The CSV is parsed in memory and discarded. Exports are
built from the row set the browser posts back. This matches the requirement that
the data is stale the next day and must not be persisted.

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
