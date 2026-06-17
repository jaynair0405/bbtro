# Signal Book Editor

In-app editing of the division signal book — change signal numbers, diversion
hands (route indicators), placement, inter-signal location/km, PSRs, station
headers, boards, neutral sections and row order, with a draft → publish safety
gate. Built 2026-06-16 (Phase 8 of the signal/AWS programme).

> **Why this exists.** Until now every section was bootstrapped from a curated
> Excel master and loaded by `scripts/import-signal-section.js`. That is great
> for first load but painful for the small, frequent corrections a live signal
> book needs (a signal renumbered, an arm re-pointed, a PSR speed changed). The
> editor lets an authorised division user make those edits in the browser, see
> the glyphs redraw live, and publish — without touching a spreadsheet or the DB.

---

## 1. Design decisions (locked 2026-06-16)

| Decision | Choice | Consequence |
|----------|--------|-------------|
| When to build | **Now**, in parallel with data curation | Schema was already stable across 12 sections; editing is the project's core goal. |
| Excel vs UI source of truth | **UI-authoritative + import guard** | Once a section is published from the editor, `edit_source` flips to `ui` and `import-signal-section.js` refuses to overwrite it without `--force`. Excel bootstraps; the UI then owns the section. |
| How edits take effect | **Draft → Publish** | Edits accumulate in a per-section draft. Nothing reaches the driver-facing book until an explicit **Publish**. |
| Editing diversion arms | **Structured arm editor** | Add/remove arms, pick side, type the route label, set the Y/main route. A live SVG glyph redraws as you type — no `RI:` syntax to learn. |

Single-editor model is assumed (one person edits at a time). See
[§7 Future plans](#7-future-plans) for multi-editor locking.

---

## 2. Where things live

| Piece | File |
|-------|------|
| Editor page (UI) | `public/div/signal-book-editor.html` |
| Page route (auth-gated) | `server.js` → `GET /div/signal-book-editor.html` |
| API endpoints | `routes/division/signalBookRoutes.js` |
| RI (de)serialiser, shared | `scripts/ri-spec.js` |
| Book renderer (unchanged by editor) | `scripts/render-signal-book.js` |
| Import guard | `scripts/import-signal-section.js` |
| Schema | `sql/2026-06-16_signal_book_editor_schema.sql` |

Entry point: `/div/signal-book.html` → **✎ Edit signal book**, or directly
`/div/signal-book-editor.html`. Both require a logged-in `division` realm user.

---

## 3. Data model

### Tables touched
- **`div_signals`** — the signal master. Editing a signal's number/placement/
  arms/etc. updates this row. Because a signal belongs to one
  `(section, line, direction)` partition, an edit propagates to **every beat**
  whose book includes that section (e.g. editing `KYN S-9` updates `KYN_SUB`,
  `CSMT_ML_MMR`, … at once — one physical signal, one row).
- **`div_signal_book_rows`** — the ordered rows of a section's book (signals +
  station headers + PSRs + boards + neutral sections + notes). Reordering,
  adding and deleting rows happens here.
- **`div_signal_book_sections.edit_source`** — `import` (spreadsheet-owned) or
  `ui` (editor-owned). Set to `ui` on first publish.
- **`div_signal_section_drafts`** — one row per section *while it has unpublished
  edits*. Holds the full editable snapshot as JSON. Deleted on publish/discard.
- **`div_signal_history`** — append-only audit; publish writes one row per
  changed signal (Renumbered / Placement Changed / Location Changed /
  Description Changed / Created).

### The editable model (JSON shape)
`GET /section/:code/editable` returns `{ section, rows[], hasDraft }`. Each row:

```jsonc
{
  "row_id": 123,                // div_signal_book_rows.id (null if new)
  "row_type": "SIGNAL",         // or STATION_HEADER | PSR | NEUTRAL_SECTION | BOARD | TEXT_NOTE | BLANK
  "row_order": 100,
  "signal_id": 45,              // SIGNAL rows
  "signal": {                   // SIGNAL rows only
    "signal_number": "KYN S-9",
    "location_text": "...", "km_text": "...",
    "placement": "Right", "on_curve": "Left",
    "is_rhs": true, "is_ext_rhs": false, "is_lhs": false, "is_ext_lhs": false,
    "signal_type": "Semi-Automatic", "signal_function": null,
    "has_legend_board": false, "visibility_distance_m": 200,
    "arms": { "main": "Y=S-25", "left": ["DN TH (S-13)","S-28"], "right": [] }
  },
  // non-signal rows use display fields:
  "display_signal_no": "...", "display_location": "...", "display_description": "...",
  "speed_kmph": 50, "km_range_text": "...", "station_code": "...", "station_km_text": "...",
  "highlight_color": "GREY", "text_color": "BLACK", "icon_type": "NEUTRAL_SECTION"
}
```

The `arms` object is the **structured** form. On publish it is serialised back to
the canonical stored string (`RI: L1=…;R1=…;MAIN=…`) and the `ri_left_arms` /
`ri_right_arms` counts are derived. All three places that touch arms —
the renderer, the editor frontend, and the publish step — go through
`scripts/ri-spec.js` so they can never drift.

---

## 4. API

All under `/api/division/signal-book`, `division` realm required.

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/sections` | List sections with beats, `edit_source`, draft status. |
| GET | `/section/:code/editable` | Load the editable model (draft if present, else live). |
| PUT | `/section/:code/draft` | Save/replace the working draft (`{ rows, section }`). |
| POST | `/section/:code/publish` | Apply draft → live tables (transactional). |
| POST | `/section/:code/discard` | Drop the draft, revert to published. |
| GET | `/section/:code/preview` | Render just this section (published state) as the print HTML. |

### Publish is one transaction
1. Upsert each SIGNAL row's signal into `div_signals` (serialise arms → canonical
   `RI:` string + counts). New signals inherit the section's
   `(section, line, direction)` from an existing signal in the section.
2. `DELETE` the section's book rows and re-insert from the draft (atomic replace,
   identical to the importer) with `row_source='ui'`.
3. Update section title/line/direction; set `edit_source='ui'`.
4. Write `div_signal_history` rows for changed signals.
5. Delete the draft.

If anything throws, the whole thing rolls back. The driver-facing renderer always
reads the live tables, so it only ever shows published state.

---

## 5. Editing workflow

1. Open the editor, pick a section (left list shows `IMPORT`/`UI` and `DRAFT`
   badges).
2. Edit fields inline. For arms, use the structured editor — the glyph on the
   right redraws live.
3. Reorder rows (↑/↓), add rows (+ Signal / Station header / PSR / Board /
   Neutral section / Note), or delete (✕).
4. **Save draft** — persists without affecting the live book. The section now
   shows a `DRAFT` badge; you can leave and come back.
5. **Publish** — applies to the live book (drivers' view). Section flips to `UI`.
6. **Discard draft** — throw away unpublished edits, revert to the published
   version.
7. **Open published ↗** — opens the current live render in a new tab (Cmd/Ctrl+P
   → Save as PDF to export).

---

## 6. Interaction with the Excel import pipeline

- A section first loaded from Excel is `edit_source = import`. Re-importing it
  overwrites freely (spreadsheet is the source of truth).
- The first **Publish** flips it to `edit_source = ui`. From then on,
  `import-signal-section.js` **refuses** to overwrite it unless you pass
  `--force`. This stops a stray re-import from silently wiping curated edits.
- Practical rule once a section is UI-owned: **edit it in the UI, not Excel.**
  If you must re-import (e.g. a big structural redo from a corrected master),
  pass `--force` — and know it discards the UI state for that section.

---

## 7. Future plans

Near-term, in rough priority:

1. **Inline-special / raw RI escape hatch** — a "raw" toggle for diagrams the
   stem-and-arm vocabulary can't express (crossings like `VVH S-36`, multi-line
   junctions). The structured editor covers the common cases today.
2. **Drag-and-drop reordering** — currently ↑/↓ buttons; drag is nicer for long
   sections.
3. **PSR as first-class rows** — PSR rows currently edit display fields; wire
   them to `div_psr` master records (link/create) so PSR edits feed SPM/RTIS too.
4. **Per-row history view** — surface `div_signal_history` in the UI ("show
   changes to this signal").
5. **Bulk operations** — renumber a run, shift km, toggle RHS across a selection.
6. **Multi-editor safety** — `base_loaded_at` is already stored on the draft; add
   a stale-check so a second editor can't clobber a newer publish. Not needed
   while editing is single-user.
7. **Section create/clone in-UI** — today new sections come from Excel; allow
   creating a blank section or cloning one (useful for the ghat MID/route
   variants).
8. **Ghat columnar rendering** — render the middle line as a parallel column
   beside the main line (matches the paper book); data already supports it via
   separate `line` values.
9. **Approval workflow (optional)** — if editing ever goes multi-user, add a
   maker-checker step before publish (deferred per the single-editor decision).

---

## 8. Notes / gotchas

- **Server restart** is required to pick up route changes (the render/route
  modules are required once at boot).
- Editing a signal changes it in **all** beats sharing that section — by design.
  Position/order edits are per-section (they live on `div_signal_book_rows`).
- The publish "atomic replace" of book rows means row IDs are not stable across
  publishes; nothing should reference a book-row id long-term.
- Draft is a full-section snapshot; concurrent editing is last-publish-wins
  (acceptable for single-editor use).
