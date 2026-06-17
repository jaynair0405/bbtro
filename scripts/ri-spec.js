/**
 * ri-spec.js — single source of truth for route-indicator (diversion-hand)
 * encoding, shared by the renderer, the editor backend, and (mirrored) the
 * editor frontend.
 *
 * Canonical stored form (in div_signals.book_description):
 *   RI: L1=H-03;L2=L-001;R1=S-45;MAIN=Y=S-45
 *
 * Structured form (what the UI arm editor works with):
 *   { main: 'Y=S-45', left: ['H-03','L-001'], right: ['S-45'] }
 *
 * parseRiSpec  — string  -> structured   (handles explicit L1=/R1=/MAIN= and
 *                                          positional dialects)
 * serializeRiSpec — structured -> canonical string
 * armCounts    — structured -> { left, right } counts for ri_left_arms/right
 */

function parseRiSpec(text, leftCount, rightCount) {
  if (!text) return { main: null, left: [], right: [] };
  const body = String(text).replace(/^RI:\s*/i, '');
  const tokens = body.split(';').map((t) => t.trim()).filter(Boolean);
  const left = [];
  const right = [];
  const bare = [];
  let main = null;
  for (const t of tokens) {
    let m;
    if ((m = t.match(/^L(\d+)\s*=\s*(.+)$/i))) left[Number(m[1]) - 1] = m[2].trim();
    else if ((m = t.match(/^R(\d+)\s*=\s*(.+)$/i))) right[Number(m[1]) - 1] = m[2].trim();
    else if ((m = t.match(/^MAIN\s*=\s*(.+)$/i))) main = m[1].trim();
    else if (/^Y\s*=/.test(t)) main = main ? `${main} / ${t}` : t;
    else bare.push(t);
  }
  let li = left.filter(Boolean).length;
  let ri = right.filter(Boolean).length;
  for (const t of bare) {
    if (li < (leftCount || 0)) { left.push(t); li += 1; }
    else if (ri < (rightCount || 0)) { right.push(t); ri += 1; }
    else if (!main) main = t;
    else { right.push(t); ri += 1; }
  }
  return { main: main || null, left: left.filter(Boolean), right: right.filter(Boolean) };
}

// Structured -> canonical "RI: L1=..;R1=..;MAIN=.." string.
function serializeRiSpec(spec) {
  if (!spec) return null;
  const parts = [];
  (spec.left || []).forEach((label, i) => { if (label) parts.push(`L${i + 1}=${String(label).trim()}`); });
  (spec.right || []).forEach((label, i) => { if (label) parts.push(`R${i + 1}=${String(label).trim()}`); });
  if (spec.main) parts.push(`MAIN=${String(spec.main).trim()}`);
  return parts.length ? `RI: ${parts.join(';')}` : null;
}

function armCounts(spec) {
  return {
    left: (spec && spec.left ? spec.left.filter(Boolean).length : 0),
    right: (spec && spec.right ? spec.right.filter(Boolean).length : 0),
  };
}

module.exports = { parseRiSpec, serializeRiSpec, armCounts };
