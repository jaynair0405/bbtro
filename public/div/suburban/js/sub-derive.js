/**
 * Suburban Crew Ops — pure derivations, shared by Node and the browser.
 *
 * WHY THIS FILE LIVES UNDER public/
 *   The server requires() it (lib/subCrew/dataset.js) and the pages <script>-load
 *   it. That is deliberate: the train index and the block totals are derived on
 *   the CLIENT from the dataset payload, and the offline snapshot builder derives
 *   them on the SERVER. Sharing one file is what guarantees the two agree — if
 *   they were separate copies they would drift, and the parity gate that lets us
 *   delete the mockups would be meaningless. It also killed the old duplicate,
 *   scripts/extract_train_index.js.
 *
 * Everything here is pure: no DB, no DOM, no I/O. Keep it that way.
 *
 * KEY ORDER IS LOAD-BEARING in the builders that consume this. The snapshot
 * pages are byte-compared against their previous contents, so object literals
 * below must keep their existing key order. Add new keys at the END.
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory();
  else root.SubDerive = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // ---------------------------------------------------------------- scalars

  /** MySQL TIME/DATETIME -> "HH:MM". Null-preserving. */
  const hhmm = (v) => (v == null ? null : String(v).slice(0, 5));

  /**
   * Train number -> index key: drop a leading "P/" (piloting), upper-case,
   * strip spaces. Null-safe on purpose — a NULL trains.train_number used to
   * throw here, which is a visible crash in a script but a 500 on every page
   * once the same code runs per request.
   */
  const norm = (tn) => {
    const s = String(tn == null ? '' : tn).trim();
    return (s.startsWith('P/') ? s.slice(2) : s).toUpperCase().replace(/\s+/g, '');
  };

  /**
   * Is this leg a train, as opposed to duty time?
   * A waiting/standby block still renders inside the duty but must never become
   * an entry in the train index. Some legacy rows are typed 'working' but named
   * WAITING, so both signals are tested. Accepts either the raw DB row
   * (train_type/train_number) or the canonical leg shape (ty/tn).
   */
  const isTrain = (l) => {
    const ty = l.ty !== undefined ? l.ty : l.train_type;
    const tn = l.tn !== undefined ? l.tn : l.train_number;
    return ty !== 'waiting' && norm(tn) !== 'WAITING';
  };

  /** "HH:MM" -> minutes since midnight. */
  const toMin = (t) => {
    if (!t) return null;
    const p = String(t).split(':');
    return (+p[0]) * 60 + (+p[1]);
  };

  /** minutes -> "H:MM" */
  const fmtHM = (m) => {
    if (m == null || isNaN(m)) return '';
    const s = m < 0 ? '-' : '';
    const a = Math.abs(m);
    return s + Math.floor(a / 60) + ':' + String(a % 60).padStart(2, '0');
  };

  /** Rest between two clock times, wrapping across midnight. */
  const restBetween = (offTime, onTime) => {
    const a = toMin(offTime), b = toMin(onTime);
    if (a == null || b == null) return null;
    return ((b - a) % 1440 + 1440) % 1440;
  };

  const esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  // ------------------------------------------------------------------ maps

  const OFFN = { 'CSMT-SUB': 'CSMT', 'KYN-SUB': 'KYN', 'PNVL-SUB': 'PNVL' };
  const LINE_C = { continuous: 'var(--cont)', fix: 'var(--fix)', memu: 'var(--memu)' };

  // ---------------------------------------------------------------- blocks

  /**
   * Resolve a detail to its block by line + number range.
   * First match wins and ranges are hand-maintained, so an overlapping or
   * inverted range would silently misattribute details to the wrong office and
   * shift every dashboard total. checkBlockRanges() below surfaces that as a
   * warning rather than letting it pass unnoticed.
   */
  const blockOf = (blocks, line, num) => {
    const n = +num;
    if (!isFinite(n)) return null;   // departmental dummies (410-412, 558, 999)
    return blocks.find((b) => b.line === line
      && n >= b.start_number && n <= b.end_number) || null;
  };

  /** Overlapping / inverted ranges among active blocks, as human-readable strings. */
  function checkBlockRanges(blocks) {
    const w = [];
    for (const b of blocks) {
      if (+b.start_number > +b.end_number) {
        w.push('block ' + b.id + ' "' + b.label + '" has an inverted range ('
          + b.start_number + '-' + b.end_number + ')');
      }
    }
    for (let i = 0; i < blocks.length; i++) {
      for (let j = i + 1; j < blocks.length; j++) {
        const a = blocks[i], b = blocks[j];
        if (a.line !== b.line) continue;
        if (+a.start_number <= +b.end_number && +b.start_number <= +a.end_number) {
          w.push('blocks "' + a.label + '" (' + a.start_number + '-' + a.end_number
            + ') and "' + b.label + '" (' + b.start_number + '-' + b.end_number
            + ') overlap on the ' + a.line + ' line');
        }
      }
    }
    return w;
  }

  /**
   * Per-block detail counts for the dashboard.
   * Counts by the block each detail was ALREADY resolved to (d.blk), not by
   * re-testing office+link+range — re-testing is only correct while same-office
   * same-link ranges stay disjoint, which is not enforced anywhere.
   * Returns every block, including empty ones; the caller decides whether to
   * hide them. (A freshly created empty block silently vanishing reads as a
   * failed save on the future Detail Blocks editor.)
   */
  function blockTotals(blocks, details) {
    return blocks.map((b) => {
      const inB = details.filter((d) => d.blk === b.id);
      return {
        d: inB.filter((x) => x.type === 'double').length,
        n: inB.length,
        s: inB.filter((x) => x.type === 'single').length,
        t: inB.filter((x) => x.type === 'triple').length,
        line: b.line, link: b.link_type, label: b.label, office: b.office_code,
        id: b.id, sn: b.start_number, en: b.end_number,
      };
    });
  }

  // ----------------------------------------------------------------- legs

  /** The detail-book's single remarks line: relief markers then operational text. */
  const bookRemarks = (l) => [
    l.rt && 'R/T ' + l.rt,
    l.rb && 'R/B ' + l.rb,
    l.rmk,
  ].filter(Boolean).join(' · ');

  // ---------------------------------------------------------- train index

  /**
   * Reverse index: train -> the details that work it.
   *
   * @param details canonical details (needs id, num)
   * @param legs    canonical legs (needs did, tn, ty, ss, st, es, et, rmk, rt, rb
   *                and the master-joined svc/car/ac/lg/dir)
   * @param master  [{n, tn, f, to}] slice of suburban_train_master
   * @returns {TRAINS, TDET, TLEGS}
   */
  function buildTrainIndex(details, legs, master) {
    const trains = new Map();
    const dById = {};
    for (const d of details) dById[d.id] = d;

    for (const l of legs) {
      if (!isTrain(l)) continue;
      const k = norm(l.tn);
      if (!k) continue;                       // nothing to index under
      if (!trains.has(k)) {
        trains.set(k, {
          t: k, disp: l.tn, svc: l.svc,
          car: l.car ? l.car.replace('_CAR', '') : null,
          ac: l.ac, lg: l.lg, dir: l.dir,
          f: null, to: null, mm: l.svc ? 1 : 0, w: 0, p: 0, ds: [],
        });
      }
      const T = trains.get(k);
      if (l.ty === 'working') T.w++; else if (l.ty === 'piloting') T.p++;
      const num = dById[l.did] ? dById[l.did].num : null;
      if (num && !T.ds.includes(num)) T.ds.push(num);
    }

    const TDET = {};
    for (const d of details) {
      TDET[d.id] = {
        num: d.num, ln: d.line, off: d.office, lk: d.link, dt: d.type,
        son: d.son, soff: d.soff, sonp: d.sonp, soffp: d.soffp, an: d.anchor,
      };
    }

    const TLEGS = legs.map((l) => {
      const k = norm(l.tn);
      const o = {
        t: k, ty: l.ty, ss: l.ss, st: l.st, es: l.es, et: l.et, did: l.did,
      };
      if (l.tn !== k) o.tn = l.tn;
      if (l.rmk) o.rmk = l.rmk;
      if (l.rt) o.rt = l.rt;
      if (l.rb) o.rb = l.rb;
      return o;
    });

    // from/to and the display number come from the master where matched
    const mByN = {};
    for (const m of (master || [])) mByN[m.n] = m;
    const TRAINS = [...trains.values()]
      .sort((a, b) => a.t.localeCompare(b.t))
      .map((x) => {
        const m = mByN[x.t];
        if (m) { x.disp = m.tn; x.f = m.f; x.to = m.to; }
        if (x.disp === x.t) delete x.disp;
        for (const k of Object.keys(x)) if (x[k] == null) delete x[k];
        return x;
      });

    return { TRAINS: TRAINS, TDET: TDET, TLEGS: TLEGS };
  }

  return {
    hhmm: hhmm, norm: norm, isTrain: isTrain,
    toMin: toMin, fmtHM: fmtHM, restBetween: restBetween, esc: esc,
    OFFN: OFFN, LINE_C: LINE_C,
    blockOf: blockOf, checkBlockRanges: checkBlockRanges, blockTotals: blockTotals,
    bookRemarks: bookRemarks, buildTrainIndex: buildTrainIndex,
  };
});
