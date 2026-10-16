# Trip Shed TI source review checkpoint

The approved Word forms were transcribed into the two JSON catalogs in `data/trip-shed/vvh-2025-08/` without changing their source order:

| Source | Physical source rows | Catalog entries | Entries with Hindi | Notes |
|---|---:|---:|---:|---|
| Conventional TI | 179 | 148 | 142 | Includes detailed brake pressure/timing table rows. |
| 3-phase TI | 214 | 163 | 157 | Includes headings and loco-specific brake checks represented as ordered rows. |

The catalogs deliberately retain source row numbers so a reviewer can trace every entry back to the Word form. They are not a claim that every physical table row is an independent operational response. In particular, brake-table headings, continuation rows and standards need a railway subject-matter decision about whether they should be displayed as a checklist row, a grouped standard, or a note.

Rows that still need source-owner review include legacy-font fragments where the original document mixes Hindi and English in one cell, rows whose table cell is a standard rather than a check, and the conventional brake sub-table around source rows 168–177. The conversion preserves the English text and the converted Unicode text for review; it does not silently drop an ambiguous row.

The flagged groups were reviewed for traceability and retained, then `sql/2026-09-18_trip_shed_vvh_step2_templates.sql` was applied. The new versioned templates are entry-enabled, but the brake-table and continuation rows should receive a subject-matter display review before routine operational use. The migration is additive and leaves the existing abbreviated template IDs and historical responses intact.

## Step 3 display cleanup applied 18 September 2026

`sql/2026-09-18_trip_shed_vvh_step3_display_cleanup.sql` applies a conservative display cleanup to the live source-restored templates only. It updates 107 rows across template 346 and 347, mainly section headings, obvious legacy-font value fragments, safety-item punctuation, and clear source-backed labels such as the spare BP/FP hose entry. The update does not change checklist item counts, template IDs, or inspection response relationships.

The cleanup deliberately skipped 26 changed label/standard fields where the transformed value still contained legacy-font residue or belonged to a brake-table/continuation row. Those rows remain traceable to the source catalog and need a source-owner decision before routine operational use.

## Step 4 source-row and brake-table resolution applied 18 September 2026

`sql/2026-09-18_trip_shed_vvh_step4_source_rows_brake_tables.sql` resolves the Step 3 review rows with a fixed display rule:

- source rows that are actual inspection checks remain required checklist rows;
- brake-table header/value rows become non-required reference rows;
- the inspection page renders non-required rows as `Reference` and omits outcome/observation controls for them;
- source text with clear Hindi/English meaning was cleaned in the catalog and live template rows without changing source order.

Resolved groups:

| Template | Source rows | Reason |
|---|---|---|
| Conventional TI | 36, 44, 49, 51, 52, 57, 83, 93, 117, 127, 132, 134, 146 | Cleaned labels/standards where the source meaning was clear. |
| Conventional TI | 168, 169, 171, 173 | Converted brake-table header/value rows to reference rows. |
| Conventional TI | 175, 176, 177 | Kept as required brake-pressure/brake-power checks with cleaned display text. |
| 3-phase TI | 4, 43, 44, 49, 57, 61, 115, 165, 191, 199, 209 | Cleaned labels/standards where the source meaning was clear. |
| 3-phase TI | 180, 182, 183, 184, 185, 186, 187 | Converted A-9/SA-9 brake-table header/value rows to reference rows. |

Post-apply verification confirmed template 346 still has 148 items with 4 reference rows, template 347 still has 163 items with 7 reference rows, and historical finalized inspection #1 remains on template 1 with 33 responses. Browser verification on the authenticated local fixture confirmed template 346 loads with cleaned text and the brake-table rows render as `Reference` with no outcome or observation input.
