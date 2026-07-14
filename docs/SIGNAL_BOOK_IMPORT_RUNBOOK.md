# Signal Book — Section Import Runbook

The exact, repeatable process used to import every signal-book section (LOCAL,
TH, HB, THB, SE, NE, BSU, KHPI, …). Follow this so every section goes in
consistently. The authoritative state + per-section history is in
`bbtro_signal_aws_master_plan.md` (§0 coverage tracker + decision log).

## ⚠️ Branch policy (read first)
**All signal-book / signal-AWS work commits to the `signal-book` branch ONLY — never to
`master`.** `master` is the deployable line (the server runs `git pull origin master`);
signal-book work must stay off it until the whole effort is complete and explicitly merged.
This keeps in-progress data, migrations, render tweaks and any new pages from leaking to
production. When signal-book is done & verified, merge `signal-book` → `master` and only
then run the SQL migrations + data imports on the server. Workflow:
`git checkout signal-book` before doing any work here.

## 0. Tooling
- Importer: `node scripts/import-signal-section.js <section.xlsx> --signals <signals.xlsx|csv> [--commit] [--force]`
  - Dry-run without `--commit`. `--force` only to overwrite a `ui`-owned section.
- Renderer: `node scripts/render-signal-book.js <BEAT_CODE>` → `signal-book-<BEAT>.html`
- RI (de)serialise: `scripts/ri-spec.js`. DB creds in `CLAUDE.md` (jay / 4310jay / bbtro).

## 1. Inputs (user provides a master workbook per corridor)
A master `.xlsx` with, per direction, three tabs (PSR optional / may come later):
- **spine** — signals, columns like `signal_number, station_code, station_name,
  section, line, direction, location_text, km_text, …, signal_type,
  signal_function, placement, on_curve, is_rhs, is_ext_rhs, is_lhs, is_ext_lhs,
  has_legend_board, ri_left_arms, ri_right_arms, book_description,
  route_indicator_notes, visibility_distance_m, sighting_remarks`
- **stations** — `station_header, before_signal` (header inserts *before* that signal; blank = append at end)
- **PSR** — `section, line, direction, start_km_text, end_km_text, speed_kmph, …, insert_before_signal`

## 2. Pre-flight checks (ALWAYS, before building)
For each (spine, stations, PSR) trio, with whitespace normalised:
1. **Duplicate signal numbers within a spine** — must be unique within `(section, line)`.
   Distants/gates that repeat (e.g. "IB DIST") must be made unique (e.g. `OMB IB DIST`)
   — see §6 (identity vs display).
2. **Broken `before_signal` / `insert_before_signal` targets** — every target must
   exist in that spine (exact match after whitespace normalisation).
3. **PSR km**: flag Excel date-mangling (numeric > 10000 = a date serial, e.g. `46247`)
   and blank `start/end_km_text`. PSR rows REQUIRE non-blank km + a target.
4. **Enum validity**: `signal_type` ∈ {Automatic, Semi-Automatic, Manual, Gate, IBS,
   Repeater, Board, Other}; `signal_function` ∈ {Distant, Inner Distant, Home,
   Starter, Advance Starter, Advanced Starter, IBS, IBS Distant, Gate Distant, …}.
   Common error: gates with `signal_function='Gate'` (invalid — clear it; the Ⓖ
   badge comes from `signal_type='Gate'`).
5. **section / line / direction** columns are often scrambled in the master — IGNORE
   them and derive identity from the TAB NAME (see §3).

Report issues to the user and let them fix the master (they prefer to). Only the
mechanical fixes below are done in the build.

## 3. Build per-section import files (generate from the master — never import the master directly)
For each section, write `<code>.xlsx` (section_info + inserts + PSR) and
`<code>_signals.xlsx`, applying these transforms:
- **Identity from the tab name**, overriding the (often wrong) spine columns:
  `section` = clean segment name; `line` = `'<DN|UP> <LINETYPE>'` (direction baked in —
  e.g. `DN TH`, `UP HB`, `DN THB`, `DN BSU`, `DN KHPI`). **Direction MUST be in the
  line name** — the uniqueness key is `(normalized_signal_number, section, line)` with
  direction NOT included, so a bare `line='THB'` merges a signal that appears in both
  DN and UP. `direction` column also set.
- **Whitespace normalise** every signal number AND every target:
  `s.replace(/\s*-\s*/g,'-').replace(/\s+/g,' ').trim()` (tightens `TN - 27`→`TN-27`,
  `TNA  S-62`→`TNA S-62`). Apply to BOTH spine and station/PSR targets so they match.
- **Station inserts**: `row_type='STATION_HEADER'`; blank `before_signal` ⇒ omit it
  (importer appends at section end). Apply any agreed target fixes here.
- **Neutral-section / board groups**: master keeps them in book order (500M, 250M,
  N/S); REVERSE within a same-target group so the importer's `-10` sub-offset lands
  them in book order. Set `display_signal_no`=the label, `highlight_color='GREY'`,
  `icon_type='NEUTRAL_SECTION'` for N/S.
- **PSR**: pass through with `section/line/direction` overridden; empty PSR sheet =
  just the header row (signals+stations import without PSR).
- **section_info**: `{section_code, section_title, direction, line}`. `section_code`
  e.g. `KYN_KSRA_DN_NE`. `section_title` is the printed book heading (can differ from
  `line`, e.g. KJT-KHPI prints "DN SE LINE" while `line='DN KHPI'`).

## 4. Dry-run → commit
`import-signal-section.js <code>.xlsx --signals <code>_signals.xlsx` (dry-run),
fix any errors, then re-run with `--commit`. It atomically replaces the section's
`div_signal_book_rows` and upserts `div_signals` (+ aliases) and `div_psr`.

## 5. Orphan cleanup (after RE-importing a changed section)
Re-import upserts signals but does NOT delete ones removed/renamed from the spine.
After any re-import where numbers changed, delete orphans:
```sql
DELETE a FROM div_signal_aliases a JOIN div_signals sg ON sg.id=a.signal_id
  WHERE sg.line LIKE '%<LINETYPE>%'
    AND NOT EXISTS (SELECT 1 FROM div_signal_book_rows r WHERE r.signal_id=sg.id AND r.is_active=1);
DELETE sg FROM div_signals sg
  WHERE sg.line LIKE '%<LINETYPE>%'
    AND NOT EXISTS (SELECT 1 FROM div_signal_book_rows r WHERE r.signal_id=sg.id AND r.is_active=1);
```

## 6. Conventions
- **Shared trunk pattern** (TNA-TUH, KILLE-URAN, CSMT-VDLR): where two routes share a
  segment, model that segment as its OWN section (stored once) + the branch/leg
  sections; bind all of them to the beat. Don't duplicate the trunk signals.
  Exception when the user explicitly accepts duplication (VDLR-GMN: RVJ S-6/S-9
  intentionally shared with CSMT-PNVL).
- **One signal, two lines** (distinct from shared trunk): at a junction a single signal
  is read from BOTH the main and the MID line (or from a suburban and a ghat page), so it
  must PRINT on both. There is no segment to factor out — the same physical signal
  genuinely belongs to two lines/sections, so it is held as two+ rows. `id` = display row
  (one per line/page); `magnet_id` = the ONE physical magnet all copies share.
- **Identity vs display**: `div_signals.signal_number` is the **book label, NOT a unique
  key** — 76 names legitimately repeat (per-line/per-section copies; also case-collisions
  like `GATE-7` KJT-KHPI vs `Gate-7` KYN-KJT = two different gates). The unique PHYSICAL
  identity is **`magnet_id`**. Optional `display_signal_no` on the spine = the short book
  label (e.g. id `ASO DIST`, label `DIST`); falls back to signal_number.
- **magnet_id invariant**: if a signal appears more than once, every copy MUST carry the
  same `magnet_id` (canonical = lowest id in the group). AWS magnet-counting (JPO Rule 3b,
  chronic-repeaters) groups by `magnet_id`; NULL/mismatched copies count as separate
  magnets and never trip a rule. Rendering ignores `magnet_id` — it is an analysis field.
  Check (must return 0 rows): `SELECT signal_number,section,direction FROM div_signals
  WHERE is_active=1 GROUP BY signal_number,section,direction HAVING COUNT(*)>1 AND
  COUNT(DISTINCT magnet_id)<>1;`  Cross-section same-magnet linking (e.g. ghat KJT S-16
  → its KJT-KHPI copy) is applied when the user confirms it is the same physical signal;
  see `sql/2026-07-14_ghat_magnet_ids.sql`.
- **Class badges** (rendered, not typed): `signal_function` contains "Distant" → Ⓟ;
  else `signal_type`/`function` IBS → ⒾⒷ; else `signal_type='Gate'` → Ⓖ.
- **Tags in description cell**: red `RHS`/`Ext RHS` from is_rhs/is_ext_rhs; blue
  `Ext LHS` from is_ext_lhs; curve arrows ↶/↷ from on_curve.
- **Diversion-hand glyphs**: `book_description` `RI: L1=…;R1=…;MAIN=Y=…` → SVG
  (stem + circle head + arms). Explicit `L1=/R1=` dialect renders exactly; positional
  dialect resolved via ri_left/right_arms.

## 7. Beat binding
One dated `sql/YYYY-MM-DD_bind_<x>_to_<beat>.sql`, `INSERT IGNORE` into
`div_signal_beat_sections (beat_id, section_id, display_order)`. Order = book/reading
order (for merge/diverge: legs then trunk on the merging direction; trunk then legs on
the diverging direction). Append after the beat's existing max display_order.

## 8. Verify
`render-signal-book.js <BEAT>` → check section titles, row count, badges, and the
tricky orderings (neutral-section groups, PSR placement, shared-trunk order). Confirm
0 orphans and the per-partition `div_signals` counts match the spines.

## 9. Log it
Add a row to §0 coverage tracker AND a decision-log entry in
`bbtro_signal_aws_master_plan.md` (what/counts/source file/beat/any deviations).

## 10. Build-vs-master sync caveat
Build-time fixes (whitespace, target corrections, section/line override, signal renames)
live in the generated build files and the DB — NOT always in the user's master. When a
fix is applied in the build, also write it back to the master tab (or tell the user), or
a regenerate-from-master will reintroduce the problem.
