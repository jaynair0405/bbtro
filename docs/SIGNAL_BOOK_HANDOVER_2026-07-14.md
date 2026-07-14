# Signal Book — handover (2026-07-14)

Written from the **AWS** chat. AWS work is finished and safe; while doing it I found
things that belong to signal-book. Nothing here is urgent, nothing is broken, and
**AWS does not depend on any of it** — see §6.

---

## 1. What I found (the one real issue)

`div_signals` duplicates a signal **once per line**, so the same physical signal can
appear on two signal-book pages (e.g. Through and Local). That is intentional and it
works. The copies are meant to be tied together by a shared **`magnet_id`** — one
physical magnet, several display rows.

**The suburban sections do this correctly. The ghat import did not.**

```
CSMT S-3    CSMT-KYN DN    id 1    : DN TH      magnet_id 1     <-- LINKED
                           id 234  : DN LOC     magnet_id 1     <-- same magnet
KJT S-22    KJT-LNL  DN    id 2012 : DN SE      magnet_id NULL  <-- NOT linked
                           id 2062 : DN SE MID  magnet_id NULL  <-- NOT linked
```

**All 158 ghat signals (KJT-LNL 98, KSRA-IGP 60) have `magnet_id = NULL`.**
Every signal in every other section has one. That is the whole defect: the rows are
right, the link is missing.

### Scale

| shape | groups | rows |
|---|---|---|
| Same name+section+direction, differing only by **line** | | |
| • CSMT-KYN (suburban) | 6 | 12 — **magnet-linked, correct** |
| • KJT-LNL | **18** | 36 — `magnet_id` NULL |
| • KSRA-IGP | **12** | 24 — `magnet_id` NULL |
| Same name in **different sections** (KJT-KHPI vs KJT-LNL) | 28 | — |
| **Total duplicated `signal_number`** | **76** | **169 rows** |

So it is **30 ghat line-duplicate groups**, not one.

### Query to see them

```sql
SELECT s.signal_number, s.section, s.direction,
       GROUP_CONCAT(CONCAT(s.id,':',s.line) ORDER BY s.id SEPARATOR '  |  ') AS copies,
       COUNT(DISTINCT s.magnet_id) AS distinct_magnets
FROM div_signals s
WHERE s.is_active = 1
GROUP BY s.signal_number, s.section, s.direction
HAVING COUNT(*) > 1
ORDER BY s.section, s.signal_number;
```
`distinct_magnets = 1` → correct. `0` → `magnet_id` is NULL on all copies → needs fixing.

---

## 2. The doc rule, and whether it is being broken

`docs/SIGNAL_BOOK_IMPORT_RUNBOOK.md` §6 says two things:

> **Shared trunk pattern** … model that segment as its OWN section (stored once) …
> **Don't duplicate the trunk signals.** *Exception when the user explicitly accepts
> duplication (VDLR-GMN: RVJ S-6/S-9 intentionally shared with CSMT-PNVL).*

> **Identity vs display**: `div_signals.signal_number` is the UNIQUE id.

**In the database, `signal_number` is NOT unique — 76 names repeat across 169 rows.**
So the rule as written does not describe the data.

**This is not a mistake in the design; it is a gap in the doc.** Two different problems
were being solved and the doc only names one:

* **Shared trunk** = two *routes* share a *segment*. Solution: store the segment once as
  its own section, bind it to several beats. Correctly stated, correctly done.
* **One signal, two lines** = a signal at a station is read from *both* the main and the
  MID line, and must print on *both* pages. There is no "section" to factor out here —
  the same signal genuinely belongs to two lines. The only way to render it twice is to
  hold two rows.

The second case is the one in the data, and it is handled by **duplicating the row and
tying the copies with `magnet_id`**. That is a sound model: **`id` = display row,
`magnet_id` = physical identity.** It is exactly what CSMT-KYN already does.

### Recommendation

1. Keep the duplicate rows. They are what makes the signal appear on both pages.
2. **Make `magnet_id` mandatory for any duplicated signal**, and backfill the 30 ghat groups.
3. Update the runbook: `signal_number` is **not** a unique key — it is the *book label*.
   The unique physical identity is `magnet_id`. Add the "one signal, two lines" pattern
   next to the shared-trunk one, and state the rule: *if a signal_number appears more than
   once, every copy MUST carry the same magnet_id.*
4. Optionally add a DB check so this cannot regress:
   ```sql
   -- must return 0 rows
   SELECT signal_number, section, direction
   FROM div_signals WHERE is_active = 1
   GROUP BY signal_number, section, direction
   HAVING COUNT(*) > 1 AND COUNT(DISTINCT magnet_id) <> 1;
   ```

---

## 3. Is `magnet_id` needed on ALL signals?

**No — only where identity matters.**

* **Duplicated signals: YES, mandatory.** Without it the copies are separate magnets.
* **Signals appearing once: not needed for rendering.** The convention in the existing
  data is `magnet_id = the row's own id`, which is harmless and keeps things uniform.
  1345 of 1503 signals already follow it; the 158 without one are exactly the ghat rows.

Signal-book rendering does **not** read `magnet_id` at all — it is an *analysis* field.
So this backfill cannot break the book. It only affects modules that count magnets.

---

## 4. Why this matters beyond the book

`magnet_id` is what AWS uses to decide that two acts hit the **same magnet**:

* **JPO Rule 3b** — ≥3 acts/week on one magnet → S&T responsibility.
* **Chronic repeaters report** — groups by `COALESCE(magnet_id, id + 1000000)`.

With `magnet_id` NULL, three acts on the *same* Karjat signal — one matched to the DN SE
copy, two to the DN SE MID copy — count as **three different magnets** and never trip a
rule. The magnet would stay invisible forever.

That is why the field is worth getting right even though the book does not use it.

---

## 5. Suggested fix (signal-book chat)

One dated file, e.g. `sql/2026-07-XX_ghat_magnet_ids.sql`:

* For each duplicate group in KJT-LNL and KSRA-IGP, set every copy's `magnet_id` to the
  **lowest id in the group** (the convention CSMT-KYN follows: `CSMT S-3` ids 1 and 234
  both carry `magnet_id = 1`).
* For the ghat signals that are **not** duplicated, set `magnet_id = id`.
* Verify with the check query in §2.

Sketch — **review before running, this is not tested**:

```sql
-- duplicated ghat signals: all copies share the lowest id in the group
UPDATE div_signals s
  JOIN (SELECT signal_number, section, direction, MIN(id) AS canon
          FROM div_signals
         WHERE is_active = 1 AND section IN ('KJT-LNL','KSRA-IGP')
         GROUP BY signal_number, section, direction
        HAVING COUNT(*) > 1) g
    ON g.signal_number = s.signal_number
   AND g.section       = s.section
   AND g.direction     = s.direction
   SET s.magnet_id = g.canon
 WHERE s.is_active = 1 AND s.section IN ('KJT-LNL','KSRA-IGP');

-- the rest: their own id
UPDATE div_signals SET magnet_id = id
 WHERE is_active = 1 AND section IN ('KJT-LNL','KSRA-IGP') AND magnet_id IS NULL;
```

**Open question for you:** the 28 groups where the same name appears in *different
sections* (`KJT S-22` in KJT-KHPI **and** KJT-LNL). Is the Karjat S-22 seen by a Khopoli
train the *same physical magnet* as the one seen by a ghat train? If yes, those should
share a `magnet_id` too, across sections. I have deliberately NOT assumed either way.
(It does not affect AWS — see §6.)

---

## 6. AWS is not affected — do not let this block it

AWS matching is now **scoped to the suburban sections only** (commit `f137cc7`,
`AWS_SECTIONS` in `routes/division/awsUploadRoutes.js`). The ghats (KJT-LNL, KSRA-IGP)
and everything beyond (Roha, RN) are excluded as a **hard filter at every match tier**,
including the alias tier.

Consequences:

* AWS never looks at a ghat signal, so the NULL `magnet_id` there cannot affect it.
* Every signal AWS *can* match has a `magnet_id`.
* The 6 suburban line-duplicate groups (CSMT S-3, S-4, S-5, S-6, S-26, S-27) are already
  magnet-linked, so AWS counts them as one magnet each — correctly.

**So the ghat `magnet_id` backfill is signal-book housekeeping, not an AWS blocker.**

---

## 7. Production status of signal-book

**Code is on master and deployed** — `public/div/signal-book.html`,
`signal-book-editor.html`, `routes/division/signalBookRoutes.js`, and the schema files
`sql/2026-05-27_signal_book_sections_refactor.sql`,
`sql/2026-06-16_signal_book_editor_schema.sql`.

**The page opens but renders no signals on prod.** That is almost certainly *data*, not
code: the book content lives in four tables that were built up locally by the import
runbook and have never been migrated to prod.

Local content:

| table | local rows |
|---|---|
| `div_signal_beats` | 8 |
| `div_signal_book_sections` | 36 |
| `div_signal_beat_sections` | 86 |
| `div_signal_book_rows` | **1985** |
| `div_signals` | 1503 (prod now also 1503 — synced 2026-07-13) |

**Diagnose on prod first:**

```sql
SELECT 'div_signal_beats' t, COUNT(*) n FROM div_signal_beats
UNION ALL SELECT 'div_signal_book_sections', COUNT(*) FROM div_signal_book_sections
UNION ALL SELECT 'div_signal_beat_sections', COUNT(*) FROM div_signal_beat_sections
UNION ALL SELECT 'div_signal_book_rows',     COUNT(*) FROM div_signal_book_rows
UNION ALL SELECT 'div_signals',              COUNT(*) FROM div_signals;
```

* Tables missing → run the two schema files above.
* Tables present but **0 rows** → this is the cause. The book content must be migrated
  from local (a dated `sql/` file, or a dump of those four tables). `div_signals` is
  already in step on both sides (1503), so ids will line up.

The 8 beats are: PNVL_GOODS, PNVL_SUB_HB, CSMT_HB, CSMT_ML_KR, CSMT_ML_MMR,
CSMT_SUB_ML, KYN_GOODS, KYN_SUB.

---

## 8. What was done to production on 2026-07-13/14 (for context)

| | |
|---|---|
| AWS tables | **truncated** — the module had never been released; all data was trial uploads. `sql/2026-07-13_aws_truncate_reload.sql` |
| `div_signals` | **1345 → 1503.** KJT-LNL (98) + KSRA-IGP (60) were missing on prod. `sql/2026-07-13_signals_sync_kjt_lnl_ksra_igp.sql`. Ids preserved (2010-2167; prod's max was 2009). |
| `div_signal_aliases` | 1297 → 1409. 12 of the 124 alias inserts were skipped (an alias with the same text already existed, pointing elsewhere). **Harmless now** — an out-of-scope alias cannot win after `f137cc7`. |
| AWS code | scoped to suburban sections; no schema change |

**Note:** the ghat signals were pushed to prod for the AWS matching problem, before we
established AWS is suburban-only. They are harmless there (AWS ignores them) and
signal-book will need them anyway — but they arrived on prod **without `magnet_id`**, so
the §5 backfill should be applied to prod as well as local.
