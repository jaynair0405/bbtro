# Signal-Book → Prod Deployment Plan (issues + remedies)


> ## ✅ DEPLOYED TO PROD 2026-08-10 — all 12 steps done. Book renders grouped on prod (CSMT_ML_MMR: 41 sections / 2813 rows). div_signals 3043, 0 NULL magnet, 7 ABH S-9 events re-matched, renderer d6d639c live.

Status legend: ☑ TODO · ◐ IN PROGRESS · ☑ DONE

**Guiding principle: ADDITIVE & ID-PRESERVING.** Prod's existing rows and ids are never
deleted or reordered — especially the AWS tables (`div_aws_events`, `div_signal_successors`).
We only ADD, so prod's live AWS analysis stays valid with no re-match. (One deliberate
exception under evaluation: delete + re-add ABH S-9 — see the ID-alignment hypothesis.)

Prod baseline (2026-08-10): `div_signals` 1504, `div_signal_aliases` 1296,
`div_signal_successors` 399. The 4 book tables + `div_psr` + `div_ohe_neutral_sections` absent.
Local: `div_signals` 2982, aliases 2620, psr 327, beats 8, sections 67, beat_sections 153,
book_rows 4144.

---

## ID-ALIGNMENT HYPOTHESIS — ☑ CONFIRMED (2026-08-10). SIMPLIFIED PATH IS GO.
Diff of `(id | signal_number | section | direction)` prod-vs-local returned exactly 8 rows:
- **7 ATG** rows — same id, only the number changed by the local renumber (id 1223 ATG S-12→S-6,
  1224 S-13→S-12, 1265 S-27→S-48, 1266 S-18→S-43, 1267 S-17→S-41, 1880 S-11→S-5, 1926 S-19→S-44).
- **1 id collision at 2168** — prod `ABH S-9`, but local `2168` = `LNL S-8` (LNL-PUNE); local's
  ABH S-9 = id 3603. When ABH S-9 was added to prod it grabbed 2168; on local 2168 was already taken.

Every other prod id == local id == same signal. So **C1 remapping is ELIMINATED**:
delete prod ABH S-9 (frees 2168) → bulk-load local signals with LOCAL ids directly (LNL S-8 lands
at 2168, ABH S-9 at 3603) → prod == local. The 7 ATG rows keep their ids (just `UPDATE` number on
prod), so their AWS links are untouched. **Only ABH S-9's AWS match is redone** (its id changes 2168→3603).

---

## A. Structural gaps
- ☑ **A1** Create 4 book tables: `div_signal_beats`, `div_signal_book_sections`,
  `div_signal_beat_sections`, `div_signal_book_rows` (from local structure; incl. `display_group`,
  `lead_in_note` on beat_sections).
- ☑ **A2** Create + load `div_psr` (327; 316 book_rows reference it).
- ☑ **A3** Create `div_ohe_neutral_sections` empty (FK target; unused).
- ☑ **A4** `ALTER` `div_signals.signal_function` enum → add `'Intermediate Starter'` (before signal load).

## B. Data gaps
- ☑ **B1** INSERT the ~1478 missing signals (local not in prod). Ids: see hypothesis (direct if aligned).
- ☑ **B2** INSERT missing aliases (`signal_id` direct if aligned, else remapped).
- ☑ **B3** Load book tables (beats 8, sections 67, beat_sections 153, book_rows 4144) — fresh tables.

## C. Divergence traps
- ☑ **C1** ID mismatch — **ELIMINATED** (hypothesis confirmed). Delete prod ABH S-9 → load with local
  ids directly. No remapping. The only clash was id 2168 (ABH S-9 prod ↔ LNL S-8 local).
- ☑ **C2** ATG renumber local-only (old S-27/18/19/17, S-11/12/13 → new S-48/43/44/41, S-5/6/12;
  number reused old S-13→S-12). Apply committed two-phase ATG renumber UPDATE on prod (ids/AWS preserved).
  NOTE: if hypothesis path loads local signals directly, ATG arrives already-new — reconcile so prod
  doesn't end with BOTH old and new ATG rows.
- ☑ **C3** `magnet_id`: do NOT copy local ids; **re-run magnet backfill on prod** (recomputes from
  station+number+direction → correct prod ids).
- ☑ **C4** `div_signal_successors`: prod 399 stale (KJT-yard dups + SE labels) vs local 372
  (deduped/KHPI). Optional: regenerate on prod from successor CSV (text-resolved, no FK). Or leave. DECIDE.

## D. Code
- ☑ **D1** Merge `signal-book` renderer + route to master (prod's `render-signal-book.js` is the old one,
  no display_group/lead_in_note); deploy + `pm2 restart bbtro`.

## E. AWS safety (why additive)
- `div_aws_events.signal_id` FK → `div_signals`. Additive/id-preserving ⇒ aws_events, classifications,
  successors stay valid; **no re-match** (except ABH S-9 if we delete+re-add it).

---

## Deployment sequence (SIMPLIFIED — C1 eliminated)
1. ☑ **Backup** prod (`~/backup_signalbook_predeploy_20260810.sql` — div_signals/aliases/successors/aws_events).
2. ☑ **Verify ID-alignment** — confirmed; only ABH S-9 (id 2168 collision) + 7 ATG (renumber) differ.
3. ☑ **Enum** `Intermediate Starter` on prod (A4) — safe, additive.
4. ☑ **Create** empty tables: 4 book tables + `div_psr` + `div_ohe_neutral_sections` (A1–A3) — safe, new.
5. ☑ **Delete prod ABH S-9** (id 2168) — frees the colliding id (its aws match re-done at step 10).
6. ☑ **ATG renumber** on prod (C2) — `UPDATE` the 7 numbers to new (ids unchanged → AWS links intact).
7. ☑ **Load signals** — INSERT the ~1479 local signals prod lacks, with **explicit local ids**
   (LNL S-8→2168, ABH S-9→3603, all corridors). Baseline rows already aligned, left as-is.
8. ☑ **Load** aliases (new) + `div_psr` + book tables — all with **local ids directly** (no remap).
9. ☑ **Magnet backfill** on prod (C3) — recompute from station+number+direction.
10. ☑ **Re-match ABH S-9** AWS (its id changed 2168→3603). *(Optional: regenerate successors C4.)*
11. ☑ **Deploy code** (merge signal-book → master, pull, `pm2 restart`) + smoke-test (D1).
12. ☑ **Verify**: counts match local, 0 NULL magnet, page renders, aws_events count unchanged.

## Rollback
Restore from `~/backup_signalbook_predeploy_20260810.sql`. Steps 3–11 are one-DB, reversible from backup.
Code (D1) reverts via `git checkout` + restart.
