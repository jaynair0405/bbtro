/**
 * ICMS Report 501 — "Train Composition Reporting Detail" — parser.
 *
 * WHY THIS EXISTS
 *   LPCs already key every DN loco into ICMS, so keying it again into the daily
 *   sheet is duplicate work they were skipping — which is why DN sheets sat
 *   empty and locos piled up at the terminals (positions only move when the
 *   sheet is filled). This reads their own ICMS export instead.
 *
 * WHY COLUMNS ARE NOT READ BY POSITION
 *   The ICMS layout drifts — the CLI-CMS due-list importer was bitten by the
 *   same thing and had to move to header-name resolution. Position alone would
 *   silently write the wrong column into real sheets.
 *
 *   So every column is found by HEADER NAME and then CONFIRMED BY THE SHAPE OF
 *   ITS VALUES. If ICMS moves a column the name still finds it; if ICMS renames
 *   one the shape still finds it; if both change we throw rather than import
 *   something wrong. A wrong loco against a real train is worse than no import.
 *
 * WHY THE *_raw* EXPORT IS REQUIRED
 *   The formatted export stores numbers as numbers, so train numbers lose their
 *   leading zero — 01103 becomes 1103. Nine of 115 rows on the 15-Sep file.
 *   Train numbers are varchar everywhere in this app, so those would match
 *   nothing (or, worse, the wrong train). We refuse that file by name.
 *
 * The header is a three-row stack (group / field / C-codes) and data starts
 * below it; nothing here assumes which physical rows those are.
 */

'use strict';

const xlsx = require('xlsx');

/** Normalise a header cell for comparison: case, spaces and punctuation out. */
function key(s) {
    return String(s == null ? '' : s).toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * The columns we need. `names` are (group, field) pairs as ICMS writes them —
 * several spellings allowed. `shape` must match most non-empty values in the
 * column for it to be accepted. `required` columns throw when unresolved.
 */
const COLUMNS = {
    train_no:  { names: [['traindetail', 'trainno']],
                 shape: /^\d{4,6}$/, required: true },
    train_type:{ names: [['traindetail', 'type']],
                 shape: /^[A-Z][A-Z0-9_]{1,9}$/, required: true },
    src:       { names: [['schsource', 'src'], ['schsource', 'source']],
                 shape: /^[A-Z]{2,6}$/, required: true },
    std:       { names: [['schsource', 'std']],
                 shape: /^\d{1,2}\s+\w{3}\s+\d{2}:\d{2}$/, required: false },
    act_src:   { names: [['actsource', 'actsrc'], ['actsource', 'actsource']],
                 shape: /^[A-Z]{2,6}$/, required: false },
    atd:       { names: [['actsource', 'atd']],
                 shape: /^\d{1,2}\s+\w{3}\s+\d{2}:\d{2}$/, required: false },
    dstn:      { names: [['schdestination', 'dstn'], ['schdestination', 'destination']],
                 shape: /^[A-Z]{2,6}$/, required: false },
    loco_dep:  { names: [['locolist', 'dep'], ['locolist', 'departure']],
                 shape: /^\d{4,6}-[A-Z0-9]{2,12}(\s*,\s*\d{4,6}-[A-Z0-9]{2,12})*$/, required: true },
    loco_arr:  { names: [['locolist', 'arr'], ['locolist', 'arrival']],
                 shape: /^\d{4,6}-[A-Z0-9]{2,12}(\s*,\s*\d{4,6}-[A-Z0-9]{2,12})*$/, required: false },
    rake_sch:  { names: [['rakedetail', 'schraketype']],
                 shape: /^[A-Z0-9]{2,12}$/, required: false },
    rake_act:  { names: [['rakedetail', 'actraketype']],
                 shape: /^[A-Z0-9]{2,12}$/, required: false },
};

/** Trainsets have no separate loco and never will — not a gap to chase. */
const TRAINSET_TYPES = new Set(['MEMU', 'VNDB', 'EMU', 'DEMU', 'MEMUD']);

const MONTHS = { jan:1, feb:2, mar:3, apr:4, may:5, jun:6,
                 jul:7, aug:8, sep:9, oct:10, nov:11, dec:12 };

/** "15-Sep-2026" -> "2026-09-15". Returns null if unrecognised. */
function dmyToISO(d, mon, y) {
    const mm = MONTHS[String(mon).toLowerCase()];
    if (!mm) return null;
    return `${y}-${String(mm).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

/**
 * The title carries either one date or a RANGE:
 *   [Date: 16-Sep-2026]
 *   [Date: 14-Sep-2026 to 16-Sep-2026]
 * A range file holds one block of rows per day, so its rows must NOT all be
 * attributed to the first date — that would write three days of locos onto one
 * sheet. Returns { from, to }.
 */
function parseTitleDates(title) {
    const t = String(title || '');
    const all = [...t.matchAll(/(\d{1,2})-([A-Za-z]{3})-(\d{4})/g)]
        .map(m => dmyToISO(m[1], m[2], m[3]))
        .filter(Boolean);
    // The generated-at stamp lives in its own cell, so anything here is a
    // report date; still, only take what follows "Date:".
    const idx = t.search(/\[\s*Date\s*:/i);
    const scoped = idx >= 0
        ? [...t.slice(idx).matchAll(/(\d{1,2})-([A-Za-z]{3})-(\d{4})/g)]
              .map(m => dmyToISO(m[1], m[2], m[3])).filter(Boolean)
        : all;
    if (!scoped.length) return { from: null, to: null };
    return { from: scoped[0], to: scoped[scoped.length - 1] };
}

/**
 * A row's own working date, from its scheduled departure ("14 Sep 20:35").
 * The cell carries no year, so it is resolved against the title's range —
 * trying both endpoints' years handles a file spanning 31 Dec to 1 Jan.
 */
function rowDate(std, atd, from, to) {
    const cell = String(std || atd || '').trim();
    const m = /^(\d{1,2})\s+([A-Za-z]{3})/.exec(cell);
    if (!m) return from;                      // no date in the row — single-day file
    const years = [...new Set([from, to].filter(Boolean).map(d => d.slice(0, 4)))];
    if (!years.length) return null;
    for (const y of years) {
        const iso = dmyToISO(m[1], m[2], y);
        if (!iso) continue;
        if (!from || !to) return iso;
        if (iso >= from && iso <= to) return iso;
    }
    // Outside the stated range: keep the row's own day rather than silently
    // moving it, and let the caller report it.
    return dmyToISO(m[1], m[2], years[0]);
}

/** "43706-WAG9HC,30550-WAP7" -> [{number:'43706', type:'WAG9HC'}, ...] */
function parseLocoList(cell) {
    const s = String(cell == null ? '' : cell).trim();
    if (!s) return [];
    return s.split(',').map(p => p.trim()).filter(Boolean).map(p => {
        const i = p.indexOf('-');
        // The class from ICMS is advisory only — it disagrees with our own
        // master (ICMS "WAG9HC" vs div_locos "WAG9H"), so callers prefer
        // div_locos where the loco is known and use this only where it is not.
        return i < 0 ? { number: p, type: null }
                     : { number: p.slice(0, i).trim(), type: p.slice(i + 1).trim() || null };
    }).filter(l => /^\d{3,7}$/.test(l.number));
}

/** Read every cell as text, so a numeric-looking train number keeps its zeros. */
function sheetToGrid(ws) {
    const range = xlsx.utils.decode_range(ws['!ref']);
    const grid = [];
    const numeric = [];   // parallel grid: was this cell STORED as a number?
    for (let r = range.s.r; r <= range.e.r; r++) {
        const row = [], numRow = [];
        for (let c = range.s.c; c <= range.e.c; c++) {
            const cell = ws[xlsx.utils.encode_cell({ r, c })];
            if (!cell) { row.push(''); numRow.push(false); continue; }
            // `w` is the formatted text; fall back to the raw value.
            row.push(String(cell.w !== undefined ? cell.w : (cell.v !== undefined ? cell.v : '')).trim());
            numRow.push(cell.t === 'n');
        }
        grid.push(row);
        numeric.push(numRow);
    }
    grid.numeric = numeric;
    return grid;
}

/**
 * Locate the header stack: the row carrying the field names (it contains
 * "Train no."), with the group row directly above it. Searched rather than
 * hard-coded so an extra title line does not break the parse.
 */
function findHeader(grid) {
    for (let r = 0; r < Math.min(grid.length, 15); r++) {
        const idx = grid[r].findIndex(v => key(v) === 'trainno');
        if (idx >= 0 && r > 0) return { fieldRow: r, groupRow: r - 1 };
    }
    return null;
}

/** Group cells are merged, so carry the last non-empty value forward. */
function forwardFill(row) {
    const out = []; let last = '';
    for (const v of row) { if (String(v).trim()) last = String(v).trim(); out.push(last); }
    return out;
}

function resolveColumns(grid, header, warnings) {
    const group = forwardFill(grid[header.groupRow]);
    const field = grid[header.fieldRow];
    const width = Math.max(group.length, field.length);
    const dataRows = grid.slice(header.fieldRow + 1);

    // How well does a column's values match an expected shape? Blank-heavy
    // columns score 0 so an empty column is never mistaken for a match.
    const fit = (ci, shape) => {
        const vals = dataRows.map(r => (r[ci] || '').trim()).filter(Boolean);
        if (!vals.length) return 0;
        return vals.filter(v => shape.test(v)).length / vals.length;
    };

    const resolved = {};
    // A source column belongs to at most one field. Without this, two fields
    // with identical content (Loco List Dep./Arr.) both fall back onto the
    // same column and one of them is silently wrong.
    const claimed = new Set();

    for (const [name, spec] of Object.entries(COLUMNS)) {
        let ci = -1, how = null;

        for (let c = 0; c < width; c++) {
            if (claimed.has(c)) continue;
            const g = key(group[c]), f = key(field[c]);
            if (spec.names.some(([gn, fn]) => g === gn && f === fn)) { ci = c; how = 'name'; break; }
        }

        if (ci >= 0) {
            // Found by name — confirm the values look right before trusting it.
            const score = fit(ci, spec.shape);
            if (score < 0.6) {
                warnings.push(`Column "${field[ci] || name}" was found by name but its values do not look like ${name} (${Math.round(score * 100)}% match). Ignoring it and searching by content.`);
                ci = -1; how = null;
            }
        }

        if (ci < 0) {
            // Name failed or was renamed — fall back to the best-fitting column.
            let best = -1, bestScore = 0;
            for (let c = 0; c < width; c++) {
                if (claimed.has(c)) continue;
                const s = fit(c, spec.shape);
                if (s > bestScore) { bestScore = s; best = c; }
            }
            if (bestScore >= 0.85) {
                ci = best; how = 'shape';
                warnings.push(`Column "${name}" was not found by its heading; matched column ${ci + 1} ("${field[ci] || group[ci] || '?'}") on content instead. Check the ICMS layout has not changed.`);
            }
        }

        if (ci < 0 && spec.required) {
            throw new Error(`Could not find the "${name}" column, by heading or by content. The ICMS report layout has probably changed — do not import this file until the parser is updated.`);
        }
        if (ci >= 0) { resolved[name] = { index: ci, matchedBy: how }; claimed.add(ci); }
    }
    return resolved;
}

/**
 * Parse an ICMS Report 501 export.
 * @param {string|Buffer} input path or buffer of the .xlsx
 * @returns {{reportDate, mode, rows, warnings, columns, counts}}
 */
function parseReport501(input) {
    const wb = Buffer.isBuffer(input)
        ? xlsx.read(input, { type: 'buffer', cellDates: false })
        : xlsx.readFile(input, { cellDates: false });
    const ws = wb.Sheets[wb.SheetNames[0]];
    if (!ws) throw new Error('The workbook has no sheets.');

    const grid = sheetToGrid(ws);
    const warnings = [];

    const titleCell = (grid[0] || []).find(v => /Train Composition/i.test(v || '')) || '';
    const modeMatch = /\[(ACT_SCH|SCH|ACT)\]/i.exec(titleCell);
    const mode = modeMatch ? modeMatch[1].toUpperCase() : null;
    const { from: reportDate, to: reportDateTo } = parseTitleDates(titleCell);

    const header = findHeader(grid);
    if (!header) {
        throw new Error('Could not find the header row (no "Train no." heading). This does not look like an ICMS Report 501 export.');
    }

    const columns = resolveColumns(grid, header, warnings);
    const ti = columns.train_no.index;

    const rows = [];
    for (let r = header.fieldRow + 1; r < grid.length; r++) {
        const raw = grid[r];
        const trainNo = (raw[ti] || '').trim();
        if (!COLUMNS.train_no.shape.test(trainNo)) continue;   // skips the C-code row and any footer

        const get = (n) => columns[n] ? (raw[columns[n].index] || '').trim() : '';
        const type = get('train_type').toUpperCase();
        const locos = parseLocoList(get('loco_dep'));

        const workingDate = rowDate(get('std'), get('atd'), reportDate, reportDateTo);
        // A train that departs after midnight still belongs to its SCHEDULED
        // day's sheet — that is the day the LPC works it, and the log's unique
        // key is (working_date, train_no, direction), so moving it to the
        // actual day would collide with that day's own service of the same
        // train. Flagged instead, so the late running is visible on the sheet.
        const actualDate = rowDate(get('atd'), null, reportDate, reportDateTo);
        const departedNextDay = Boolean(get('atd') && actualDate && workingDate
                                        && actualDate > workingDate);

        rows.push({
            working_date: workingDate,         // the row's OWN date, not the title's
            train_no: trainNo,                 // text — leading zeros intact
            train_type: type || null,
            is_trainset: TRAINSET_TYPES.has(type),
            src: get('src') || null,
            dstn: get('dstn') || null,
            std: get('std') || null,
            atd: get('atd') || null,
            departed: Boolean(get('atd')),
            actual_date: actualDate,
            departed_next_day: departedNextDay,
            locos,                             // [] when ICMS has none yet
            loco_front: locos[0] || null,
            loco_rear: locos[1] || null,
            rake_type: get('rake_act') || get('rake_sch') || null,
            row_number: r + 1,                 // 1-based, for pointing at the file
        });
    }

    if (!rows.length) {
        throw new Error('No data rows found under the header. The file may be empty or a different report.');
    }

    // The formatted export stores train numbers as NUMBERS, which drops the
    // leading zero on the 0-prefixed specials (01103 -> 1103) — they would then
    // match the wrong train, or none. Ask the cell directly rather than
    // inferring it from the report mode: mode is not the discriminator (a raw
    // export can be [SCH] just as well as [ACT_SCH]).
    const numericTrainCells = grid.numeric
        .slice(header.fieldRow + 1)
        .filter((_, i) => {
            const raw = grid[header.fieldRow + 1 + i];
            return raw && COLUMNS.train_no.shape.test((raw[ti] || '').trim());
        })
        .filter(nr => nr[ti]).length;

    if (numericTrainCells > 0) {
        throw new Error(`This is the formatted ICMS export, not the raw one — ${numericTrainCells} train numbers are stored as numbers, so any leading zero is already lost (01103 becomes 1103) and they will not match. Download the *_raw* export and upload that instead.`);
    }

    const zeroPrefixed = rows.filter(r => r.train_no.startsWith('0')).length;
    if (zeroPrefixed === 0) {
        warnings.push('No train number in this file starts with a zero. If this date had 0-prefixed specials, check the export is the raw one.');
    }

    // One entry per day the file actually covers, in order.
    const dates = [...new Set(rows.map(r => r.working_date).filter(Boolean))].sort();
    const outOfRange = (reportDate && reportDateTo)
        ? dates.filter(d => d < reportDate || d > reportDateTo) : [];
    if (outOfRange.length) {
        warnings.push(`Rows dated ${outOfRange.join(', ')} fall outside the report's stated range (${reportDate} to ${reportDateTo}). They are kept on their own date.`);
    }

    const counts = {
        rows: rows.length,
        dates: dates.length,
        with_loco: rows.filter(r => r.locos.length).length,
        without_loco: rows.filter(r => !r.locos.length).length,
        trainsets: rows.filter(r => r.is_trainset).length,
        not_departed: rows.filter(r => !r.departed).length,
    };

    return { reportDate, reportDateTo, dates, mode, rows, warnings, columns, counts };
}

module.exports = { parseReport501, parseLocoList, rowDate, TRAINSET_TYPES };
