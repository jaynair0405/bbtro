'use strict';

/*
 * Header layout for a generic table with grouped headings.
 *
 * t.groups is either one level — [label|null per column] — or several, outermost
 * first: [[...level 0], [...level 1]]. A column's groups run from the top until its
 * first null; its own header then fills the rows below. Neighbouring columns merge
 * at a level when every label from the top down to that level is the same.
 *
 * Returns { rows, cells: [{ r, c, rs, cs, label }] } — r/c 0-based — or null when
 * the table has no groups. The page, Excel and PDF all draw from this one layout.
 */
function headLayout(t) {
  if (!Array.isArray(t.groups) || t.groups.length === 0) return null;
  const levels = Array.isArray(t.groups[0]) ? t.groups : [t.groups];
  if (!levels.some((l) => Array.isArray(l) && l.some(Boolean))) return null;

  const n = t.headers.length;
  const L = levels.length;
  const at = (k, i) => (Array.isArray(levels[k]) && levels[k][i]) || null;
  const depth = [];
  for (let i = 0; i < n; i++) {
    let d = 0;
    while (d < L && at(d, i)) d++;
    depth.push(d);
  }
  const samePath = (i, j, k) => {
    for (let x = 0; x <= k; x++) if (at(x, i) !== at(x, j)) return false;
    return true;
  };

  const cells = [];
  for (let k = 0; k < L; k++) {
    for (let i = 0; i < n;) {
      if (depth[i] > k) {
        let j = i + 1;
        while (j < n && depth[j] > k && samePath(i, j, k)) j++;
        cells.push({ r: k, c: i, rs: 1, cs: j - i, label: at(k, i) });
        i = j;
      } else {
        if (depth[i] === k) cells.push({ r: k, c: i, rs: L + 1 - k, cs: 1, label: t.headers[i] });
        i++;
      }
    }
  }
  for (let i = 0; i < n; i++) {
    if (depth[i] === L) cells.push({ r: L, c: i, rs: 1, cs: 1, label: t.headers[i] });
  }
  return { rows: L + 1, cells };
}

module.exports = { headLayout };
