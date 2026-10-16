# Trip Shed VVH P0 review

Reviewed 16 September 2026 against the local `bbtro` MySQL database, current repository files, authenticated localhost browser, and the three approved forms in `/Users/neeraja/Desktop/trip_shed_data/`.

The recovery build is not ready for inspection sign-off. The database survives, but checklist content is abbreviated and finalised-response locking is incomplete. No application code, schema or operational records were changed during this review. Database reads ran in read-only transactions which were rolled back.

**Subsequent Step 1 implementation:** The inspection locking, transactional save, validation, date rendering and role-control defects below were corrected later on 16 September 2026. The findings remain as the original audit record. See `TRIP_SHED_VVH_HANDOVER.md`, section 11, for implementation and test evidence. Checklist/source and migration discrepancies remain open.

## Verified database state

All ten Trip Shed tables exist. VVH is the only shed, id 1, active, named Electric Loco Trip Shed, Vidyavihar.

| Template | ID | Version | Checklist rows | Hindi labels | Entry enabled |
|---|---|---|---:|---:|---|
| GC | 1 | VVH-2025-08 | 33 | 0 | Yes |
| Conventional TI | 2 | VVH-PENDING-PROFORMA | 8 | 0 | Yes |
| Three-phase TI | 3 | VVH-2025-08 | 20 | 0 | Yes |
| IA | 4 | PENDING-APPROVED-PROFORMA | 0 | 0 | No |
| IB | 5 | PENDING-APPROVED-PROFORMA | 0 | 0 | No |
| IC | 6 | PENDING-APPROVED-PROFORMA | 0 | 0 | No |

Existing records: one finalised GC inspection, 33 response rows, one defect, three defect events, zero overdue entries and zero import batches/staging rows. Preserve the existing template and item IDs used by the finalised inspection.

## Checklist discrepancies

### GC

The approved DOCX has 33 numbered checks in General, Side Gear and Under Gear, matching the database count and broad order. However, 32 of 33 English labels differ after whitespace normalisation; only item 23 matches exactly. All 33 supplied Hindi labels are absent. Current standard values were added even though the official GC table has only SN, Items to be checked and Remarks.

Examples: item 3 omits the explicit DC-to-DC converter positions; item 5 omits the dummy-plate instruction; item 26 compresses loco-specific applicability. See `TRIP_SHED_GC_SOURCE_COMPARISON.md` for all 33 English comparisons.

### Conventional TI

The eight live items are generic summary checks, not a transcription of the accepted conventional TI form. The version still says PENDING-PROFORMA despite entry being enabled. The supplied form includes separate driver-seat/desk checks, safety inventory, electrical and mechanical checks, and detailed pneumatic/brake pressure and timing tables. These cannot be represented faithfully by eight summary rows.

The binary DOC text was extracted, but macOS textutil conversion flattened its table structure. An exact count of independent response fields remains unresolved; do not publish an inferred count from paragraph or line totals. The source mixes Unicode Hindi with legacy-font text requiring faithful conversion and visual verification.

### Three-phase TI

The accepted DOCX contains one table with 214 physical rows, including headings, notes, checks and loco-specific brake sub-tables. This is not a count of 214 checks. 163 rows have a nonempty third cell, but that is also not a final checklist count because sub-table headings and continuation rows require classification.

The 20 live rows omit or combine many independent checks and standards. Examples: cattle-guard tightness and crack/gap checks are combined; the driver's-desk BPVG/PVEF/PVSA/PVCD check is missing; pantograph timing, carbon-strip limits, upper thrust and PRV settings are not preserved as separate checks; the detailed WAP-7/WAG-9/WAP-5 brake tables are absent. All Hindi labels are absent. The source also contains some legacy-font Hindi.

### Header fields

The recovered inspection UI omits approved TI header fields including Cab Leading, equipment makes, kilometre reading, energy consumed and RTIS working status. Live schema has `cab_leading` and `kms_reading`, but the current save handler does not capture them. Remaining fields require a reviewed storage design.

## Schema drift

SHOW CREATE TABLE confirms the live schema is richer than the recovery migration. Missing migration fields include inspection cab/kilometres/staff IDs/reopen audit, template `section_no`, response remarks/defect links, defect inspection/closure/outgoing fields, and import review/validation/traceability fields. The migration contains no checklist item seeds.

Template version strings also differ. Re-running the recovery seed would create additional conventional TI and IA/IB/IC headers because the uniqueness key includes version. Do not run this migration as a repair. Prepare an additive, version-aware migration after the comparison is approved, preserving all existing roles and historical rows.

## Browser and code checks

Authenticated browser checks passed for dashboard load, opening the existing finalised GC inspection, opening a new inspection, loading the conventional and three-phase templates, and exact lookup of loco 30310 with master base AQE. IA/IB/IC options are disabled. The current-date Control Office queue was empty, so an incoming-train suggestion was not verified.

The finalised inspection displays its locked status and disables header/save/finalise controls, but all 33 checklist outcome and observation controls remain enabled. Its date field displays blank on reload; the load endpoint supplies the raw database date rather than an explicitly formatted date-only value.

Code inspection found additional P0 failures:

- Saving a final inspection skips the draft-only header update but still executes response upserts. The save route does not reject the finalised record before writing responses.
- Finalisation does not validate required checklist completion or template entry eligibility, and can overwrite finalisation metadata on repeat calls.
- Saves do not validate response item membership in the selected template and do not wrap header/response writes in a transaction.
- The inspection UI does not apply `read_only` or `can_finalize` to its controls. Backend write/finalise role middleware exists, but role-specific browser tests remain outstanding.

No write-based exploit or save/finalise test was run against the existing historical inspection. Draft/save/reload/finalise, incoming suggestion and multi-role regression remain pending after correction; this review is not a complete P0 pass.

## Concrete correction order

1. Repair server-side finalised locking, transactional saves, template/item validation, finalisation validation, date rendering and role-aware UI controls.
2. Prepare faithful versioned checklists from all three approved sources, including Unicode Hindi and complete standards/sub-tables. Retain the old GC version for the historical finalised record.
3. Reconcile the additive migration with the live schema and restore the approved TI header fields.
4. Test new records through authenticated draft/save/reload/finalise, verify locked data remains unchanged, and test operator/supervisor/read-only boundaries and incoming-train suggestions.

The handover requires discrepancies to be reported before checklist corrections. This document is that review checkpoint; no correction has yet been applied.
