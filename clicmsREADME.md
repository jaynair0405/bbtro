# CLI-CMS Due List Module (for CRTMS)

HQ-CLI tool to upload a CMS Report CSV, view the **overdue** list for one
parameter at a time, sort and trim it, and download it as Excel or PDF.

**Nothing is stored.** The CSV is parsed in memory and discarded. Exports are
built from the row set the browser posts back. This matches the requirement that
the data is stale the next day and must not be persisted.

## What it does

- Upload a CMS Report CSV (drag-drop or file picker).
- Three parameters, switched one at a time:
  - **Foot Plate Monitoring** — due column **T**
  - **Grading** — due column **K**
  - **Counselling** — due column **O**
- The table shows **only overdue rows** for the active parameter
  (due date ≤ today, IST). Everything dated today-or-later is filtered out.
- Sort by: due date (oldest first), CLI name, designation, category (A/B/C).
- Remove rows the CLI doesn't want (per-parameter; "Restore removed" undoes it).
- Export the current list to **Excel** or **PDF**.
- Dashboard counters show overdue totals for all three parameters.

## Files

```
lib/cmsReport.js          Processing core: column map, dd-mm-yyyy parsing, IST overdue logic
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

All column positions live in one place: the `COL` object at the top of
`lib/cmsReport.js`. If HQ changes the export layout, edit those indices only —
nothing else needs to change. The parser also warns if the column count isn't 24.

## Next step: PWA

Once the page works, add `public/clicms/manifest.json` (scope `/clicms/`) and a
service worker (`clicms-sw.js`) that caches only the app shell (index.html, css,
js) — never the data. That makes it installable on the `clicms` user's phone.
A second scoped PWA (e.g. `/admin/`) can be added later the same way.
