# CLI CMS — Lobby page, lobby uploads and remarks

Design spec, 2026-10-16. Module: CLI CMS (`/clicms`). Status: approved in discussion,
awaiting review of this file.

## 1. Purpose

The Daily Position sheet (`/clicms/daily.html`) prints counts per lobby. Officers want
the names behind each count and the lobby's explanation. HQ's CMS downloads carry
names for some reports and only counts for others.

This module lets each lobby:

- open the Due List and Daily Position **read-only**, exactly as HQ sees them;
- for each count that points at the lobby, see the names behind it — from HQ's file
  where it has them, else from a **CMS list the lobby uploads**;
- write a **remark per name**, which HQ then sees when it clicks the count.

Nothing here changes how HQ's counts are built, stored or exported.

## 2. Drill reports

Ten reports on the sheet get a lobby drill. Six need a lobby upload because HQ's file
is counts only; four already store names from HQ's file.

| Report | HQ file | Lobby uploads | Lobby from | Scope |
|---|---|---|---|---|
| FSD not carried | counts | FSD N list (9 cols) | SIGN ON STATION | N only |
| WR / WOR lobbywise | counts | WOR list (23 cols) + WR→WOR list (22 cols) | Call Book Lobby | WR→WOR and WOR |
| WR / WOR HQ-wise | counts | same two lists from the HQ-wise screen | HQ column | WR→WOR and WOR |
| Working Hours Mainline | counts | duty list (25 cols) | crew id prefix | **>14 h only** |
| Working Hours Suburban | counts or duty list | duty list (25 cols) when HQ loaded counts | crew id prefix | >14 h only |
| Continuous Night | counts | night list (8 cols) | crew id prefix | **>4 nights only** |
| PR Overdue | counts | PR due list (16 cols) | LOBBY CODE | 7-day column |
| PME / REFT / ASIG | names | nothing | crew id prefix | counted rows only |
| Change on Approval | names | nothing | as stored | |
| Breach of Rest | names | nothing | as stored | |

Sample files: `data/cms-report/lobby-upload/`. Findings from them:

- The Safety Due lobby file is HQ's own report filtered to one lobby; every row
  difference seen was the lobby downloading a day later than HQ.
- The WR/WOR WOR list and WR→WOR list have different headers (two reason columns
  versus one `SignOFF Wor Reason`). The HQ-wise lists have the same layouts as the
  lobbywise ones; a KYN crew booked at KYN appears in both, a CSMT crew booked at RN
  appears HQ-wise only. ServiceType FGHT and DEPT count as freight, CCHM as coaching.
- The Working Hours lobby file is the duty list the suburban parser already reads;
  one duty spans several rows grouped by S.No.
- The Continuous Night list is a month's record per lobby **and per crew type** (CMS
  header: Lobby, Month-Year, Crew Type). A streak that ended days ago may still be
  listed. To re-check on a later day.
- The PR due list pads CREW ID with `@` and spaces, and the 7-day flag with `Y/` and
  spaces. All rows have the 7-day flag set.
- Names are missing from the night list; name and designation come from
  `div_staff_master` via `current_cms_id`, as drill lists do today.

## 3. Access

### Accounts

Ten accounts, srcc naming pattern: csmtmljrcc, kynmljrcc, pnvlmljrcc, igpjrcc,
lnljrcc, vvhmljrcc, nrljrcc, csmtsubjrcc, kynsubjrcc, pnvlsubjrcc. Realm `division`,
div_role `jrcc` (new enum value; to be reused later for other division pages),
div_office_code set, must_change_password = 1. Created in the dated sql file.

### Office → lobby map

One constant in code (`lib/cmsReports/lobbies.js`), read by the page, the upload check
and the drill:

| Office | Lobby | Also covers |
|---|---|---|
| CSMT-ML | CSMT | DR |
| KYN-ML | KYN | |
| PNVL-ML | PNVL | JNPN, ROHA |
| IGP | IGP | |
| LNL | LNLX | LNL |
| VVH | VVH | |
| NRL | NRL | |
| CSMT-SUB | CSTS | |
| KYN-SUB | KYNS | |
| PNVL-SUB | PNVS | |

### Gate

`requireClicms` in `server.js` accepts div_role `jrcc` and `office_hr` in addition to
`clicms` and `division_admin`. jrcc is **not** confined to `/clicms` (unlike the
`clicms` account).

Writers for a lobby: any `jrcc` or `office_hr` user whose office maps to it. HQ-only
writes (`daily/upload`, the slot uploads, `daily/manual`, `daily/move`) return 403
for both roles. Lobby writes (`lobby/upload`, `lobby/remark`) require a writer of
that lobby. `clicms` and `division_admin` open the Lobby page for any lobby in view
mode.

### Pages for lobby users

Due List and Daily Position render read-only: the page asks `/api/current-user`,
hides the upload stage, drop zone and change-date controls. The report switcher
gains a **Lobby** tab for every role.

## 4. Storage

One dated sql file, additive only.

- `cms_daily_loads` + `lobby VARCHAR(20) NULL`. NULL = HQ's load (all rows today).
  A lobby upload is a load with the drill report's `report_key`, its `lobby`, the
  same `data_date` rule, raw file kept, `is_current` history. Current load is unique
  per (report_key, data_date, lobby). Index extended accordingly.
- `cms_daily_crew` + `source ENUM('hq','lobby') NOT NULL DEFAULT 'hq'`. Lobby loads
  write crew rows with source `lobby`. Measures use the HQ vocabulary (`n`,
  `freight.wor.hq`, `b8`, `n5`, `d7`, …) so one join compares count and list.
- `cms_lobby_remarks`: id, report_key, lobby, cms_id, item_key VARCHAR(60), remark
  TEXT, written_by, written_at, is_current. An edit inserts a new current row and
  retires the old; empty text retires without replacement (withdraw). Unique current
  per (report_key, lobby, cms_id, item_key).
- div_role enum gains `jrcc`.

Item keys name the event, not the day, so a remark follows the item across sheets:

| Report | item_key |
|---|---|
| PME / REFT / ASIG | `<test>|<due date>` |
| FSD N | sign-on datetime |
| WR / WOR (both) | TA number |
| Working Hours (ML, Sub) | sign-on datetime |
| Continuous Night | first night date |
| PR Overdue | last PR datetime |
| Change on Approval | approval datetime |
| Breach of Rest | sign-on datetime |

"Pending" is computed (items current today without a current remark); no status table.

## 5. Lobby uploads

Six parser modules in `lib/cmsReports/`, registered in a separate `LOBBY_LISTS`
registry (`lib/cmsReports/lobbyLists.js`) so HQ files and lobby files are never
confused: a lobby file dropped on the HQ page is refused, and vice versa.

Each module exports `key, drills (HQ report key), label, dateOffset (= the HQ
report's), matchesHeader, parse, items(parsed) → [{ lobby, cmsId, name?, desig?,
measure, itemKey, eventTime, cols }], checkDate`.

| Module | Date check | Notes |
|---|---|---|
| fsdn | sign-on date = data date | FSD RECEIVED must be N |
| wrworlist | Ord Time date = data date | several files joined by TA number; row counts under lobbywise by Call Book Lobby and HQ-wise by HQ column |
| whlist | sign-on date = data date; TOTAL DUTY > 14:00 | reuses `subhours` parsing; one item per duty (S.No.), not per leg; serves ML and Sub by prefix |
| nightlist | month of nights = sheet month | no name in file |
| prlist | none (no run date in file) | strip `@` padding |

Flow: the Lobby page posts the file(s) with the report key to `POST
/clicms/lobby/upload`. The route recognises the file against `LOBBY_LISTS` only,
refuses it if any row's lobby is not the writer's own or a covered one, runs the date
check, saves a lobby load with crew rows, and returns the items with existing remarks
merged in.

Against HQ's count: the response carries HQ's current figure and the list's row
count. Equal = green; different = amber with both figures shown, **never refused**
(the lobby downloads later than HQ); no HQ load = "HQ has not loaded this report".

A second upload for the same report, lobby and date replaces the current load and
keeps the earlier as history. Remarks survive a replace because they key by item.

## 6. Lobby page

Files: `public/clicms/lobby.html`, `lobby.js`, `lobby.css`, laid out as the approved
mockup (chip strip, one card per drill report in sheet order, remark box per name,
collapsed line for reports with nothing against the lobby).

Routes, all POST (never cached by the service worker):

- `lobby/day` { sheetDate, lobby? } → cards: for each drill report, HQ's count for the
  lobby, the current list (HQ crew rows or the lobby load), items with remarks, state
  (done / pending / needed / none). `lobby` is honoured only for viewers; writers get
  their own.
- `lobby/upload` — section 5.
- `lobby/remark` { reportKey, cmsId, itemKey, remark } → saved row with author and time.

Date box as on Daily Position: today by default, step back/forward; each report at its
own data date. Covered lobbies (DR under CSMT) appear in the same cards with the lobby
shown on the row. Save per card sends only changed boxes. Viewers see remarks as text,
no Save, no upload.

## 7. HQ drill on Daily Position

Counts are unchanged. The drill panel gains a second source: the lobby's current list
for (report, lobby, data date) with each name's current remark and author.

- Lobby list present: its rows with a Lobby remark column and the line "list from
  <user> <time>"; if HQ's count differs, both figures in the head.
- No lobby list, HQ names present: HQ's names with any remarks.
- Neither: "<lobby>: list not uploaded".

The six counts-only reports become clickable through the existing `drill` table hook.
Lobby rows and remarks are fetched **live when a day is opened**, not frozen into
`tables_json`, so a remark written after the sheet was saved still shows. Exports keep
printing counts only.

## 8. Build and deploy

Worktree `/Users/neeraja/bbtro-lobby-cms`, branch `feature/lobby-cms` off
origin/master. One approved step at a time, each committed and pushed.

1. sql: jrcc enum, loads.lobby, crew.source, cms_lobby_remarks, ten accounts.
2. `lobbies.js` map; `requireClicms` + 403s on HQ writes.
3. Lobby list parsers, one per step, each against its sample.
4. Store functions + the three lobby routes.
5. lobby.html / js / css.
6. Read-only mode on Daily Position and Due List; Lobby tab.
7. HQ drill additions.
8. Help page section, README "Lobby" section, SW cache version bump.
9. Merge; prod: sql as the .env user, `git pull`, `pm2 restart bbtro`; retire worktree.

Tests: plain node scripts under `scripts/` (the repo has no test runner) covering each
parser against its sample, the padded PR crew id, both WR/WOR headers, the lobby
mismatch refusal, and remark history (edit retires, empty withdraws). Acceptance:
log in locally as csmtmljrcc, upload the CSMT samples, write remarks, then as clicms
click the counts on Daily Position.

## 9. Open items (not blocking)

- Does the Continuous Night list drop a crew once the streak ends? Check on a later day.
- One night list per Crew Type: a lobby may need several downloads for one count.
- BOR fortnight / month boundaries (pre-existing).
