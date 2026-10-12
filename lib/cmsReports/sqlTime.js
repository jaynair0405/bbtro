'use strict';

// CMS "21-09-2026 11:44" (or "21-09-26 11:44") -> "2026-09-21 11:44:00" for a DATETIME
// column, or null when the text is anything else. Used by the reports' facts().
function sqlTime(s) {
  const m = String(s || '').trim().match(/^(\d{2})-(\d{2})-(\d{2}|\d{4}) (\d{2}):(\d{2})/);
  if (!m) return null;
  const y = m[3].length === 2 ? `20${m[3]}` : m[3];
  return `${y}-${m[2]}-${m[1]} ${m[4]}:${m[5]}:00`;
}

module.exports = { sqlTime };
