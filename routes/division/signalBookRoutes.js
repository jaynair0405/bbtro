/**
 * signalBookRoutes.js — Signal Book preview endpoints
 * Mounted at /api/division/signal-book
 *
 * Endpoints:
 *   GET  /beats                          → list beats + section/row counts
 *   GET  /beat/:beatCode/preview         → server-rendered HTML signal book
 *                                          (open in browser, Cmd+P → Save as PDF)
 *
 * Render logic lives in scripts/render-signal-book.js and is shared with the
 * CLI script (node scripts/render-signal-book.js <BEAT>).
 */

const express = require('express');
const router = express.Router();
const { loadBook, renderHtml } = require('../../scripts/render-signal-book');
const { parseRiSpec, serializeRiSpec, armCounts } = require('../../scripts/ri-spec');

// ---------------------------------------------------------------------------
// Editor helpers
// ---------------------------------------------------------------------------

// Build the editable model for one section straight from the live tables.
async function loadEditableFromLive(conn, section) {
  const [rows] = await conn.execute(
    `SELECT r.id AS row_id, r.row_order, r.row_type, r.signal_id,
            r.display_signal_no, r.display_location, r.display_description,
            r.speed_kmph, r.km_range_text,
            r.station_code, r.station_name, r.station_km_text,
            r.highlight_color, r.text_color, r.icon_type, r.remarks,
            s.signal_number, s.location_text, s.km_text, s.placement, s.on_curve,
            s.is_rhs, s.is_ext_rhs, s.is_lhs, s.is_ext_lhs,
            s.signal_type, s.signal_function, s.ri_left_arms, s.ri_right_arms,
            s.book_description, s.route_indicator_notes, s.has_legend_board,
            s.visibility_distance_m
       FROM div_signal_book_rows r
       LEFT JOIN div_signals s ON s.id = r.signal_id
      WHERE r.book_section_id = ? AND r.is_active = 1
      ORDER BY r.row_order`,
    [section.id]
  );

  return rows.map((r) => {
    const m = {
      key: String(r.row_id),
      row_id: r.row_id,
      row_order: r.row_order,
      row_type: r.row_type,
      signal_id: r.signal_id,
      display_signal_no: r.display_signal_no,
      display_location: r.display_location,
      display_description: r.display_description,
      speed_kmph: r.speed_kmph,
      km_range_text: r.km_range_text,
      station_code: r.station_code,
      station_name: r.station_name,
      station_km_text: r.station_km_text,
      highlight_color: r.highlight_color,
      text_color: r.text_color,
      icon_type: r.icon_type,
      remarks: r.remarks,
    };
    if (r.row_type === 'SIGNAL') {
      m.signal = {
        signal_number: r.signal_number,
        location_text: r.location_text,
        km_text: r.km_text,
        placement: r.placement,
        on_curve: r.on_curve,
        is_rhs: !!r.is_rhs, is_ext_rhs: !!r.is_ext_rhs,
        is_lhs: !!r.is_lhs, is_ext_lhs: !!r.is_ext_lhs,
        signal_type: r.signal_type,
        signal_function: r.signal_function,
        has_legend_board: !!r.has_legend_board,
        visibility_distance_m: r.visibility_distance_m,
        book_description: r.book_description,
        route_indicator_notes: r.route_indicator_notes,
        arms: parseRiSpec(r.book_description, r.ri_left_arms, r.ri_right_arms),
      };
    }
    return m;
  });
}

function normalizeSignalNumber(s) {
  return String(s || '').toUpperCase().replace(/\s+/g, '').replace(/[\/\-_.]/g, '');
}


// GET /beats — list every beat with a count of sections and book rows.
router.get('/beats', async (req, res) => {
  let conn;
  try {
    conn = await req.app.locals.pool.getConnection();
    const [rows] = await conn.query(`
      SELECT b.id, b.beat_code, b.beat_name, b.office_code, b.beat_category,
             COUNT(DISTINCT bs.section_id) AS section_count,
             COALESCE(SUM(rc.row_count), 0) AS row_count
        FROM div_signal_beats b
        LEFT JOIN div_signal_beat_sections bs ON bs.beat_id = b.id AND bs.is_active = 1
        LEFT JOIN (
          SELECT book_section_id, COUNT(*) AS row_count
            FROM div_signal_book_rows
           WHERE is_active = 1
           GROUP BY book_section_id
        ) rc ON rc.book_section_id = bs.section_id
       WHERE b.is_active = 1
       GROUP BY b.id
       ORDER BY b.id
    `);
    res.json({ beats: rows });
  } catch (err) {
    console.error('signal-book/beats failed:', err);
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.release();
  }
});

// GET /beat/:beatCode/preview — rendered HTML page for printing.
router.get('/beat/:beatCode/preview', async (req, res) => {
  const beatCode = req.params.beatCode;
  let conn;
  try {
    conn = await req.app.locals.pool.getConnection();
    const book = await loadBook(beatCode, conn);

    if (book.sections.length === 0) {
      res.status(404).type('text/html').send(
        `<h2>${beatCode}: no sections bound yet.</h2>` +
        `<p>Add rows to <code>div_signal_beat_sections</code> for this beat.</p>`
      );
      return;
    }

    const html = renderHtml(book);
    res.type('text/html').send(html);
  } catch (err) {
    console.error(`signal-book preview failed for ${beatCode}:`, err);
    res.status(500).type('text/html').send(`<h2>Render failed</h2><pre>${err.message}</pre>`);
  } finally {
    if (conn) conn.release();
  }
});

// ---------------------------------------------------------------------------
// GET /section/:code/preview — render just this section (published/live state)
// ---------------------------------------------------------------------------
router.get('/section/:code/preview', async (req, res) => {
  let conn;
  try {
    conn = await req.app.locals.pool.getConnection();
    const [secs] = await conn.execute(
      `SELECT id, section_title FROM div_signal_book_sections WHERE section_code = ? AND is_active = 1`,
      [req.params.code]
    );
    if (!secs.length) return res.status(404).type('text/html').send('<h2>Section not found</h2>');
    const section = secs[0];
    const [rows] = await conn.execute(
      `SELECT r.row_order, r.row_type, r.signal_id, r.psr_id, r.neutral_section_id,
              r.display_signal_no, r.display_location, r.display_description,
              r.speed_kmph, r.km_range_text, r.station_code, r.station_name, r.station_km_text,
              r.highlight_color, r.text_color, r.icon_type, r.remarks,
              sg.ri_left_arms, sg.ri_right_arms, sg.route_indicator_notes,
              sg.is_rhs, sg.is_ext_rhs, sg.on_curve
         FROM div_signal_book_rows r
         LEFT JOIN div_signals sg ON sg.id = r.signal_id
        WHERE r.book_section_id = ? AND r.is_active = 1
        ORDER BY r.row_order`,
      [section.id]
    );
    const html = renderHtml({ beat: { beat_name: section.section_title }, sections: [{ section_title: section.section_title, rows }] });
    res.type('text/html').send(html);
  } catch (err) {
    console.error(`signal-book section preview failed for ${req.params.code}:`, err);
    res.status(500).type('text/html').send(`<h2>Render failed</h2><pre>${err.message}</pre>`);
  } finally {
    if (conn) conn.release();
  }
});

// ---------------------------------------------------------------------------
// GET /sections — all sections with beat usage, edit_source and draft status
// ---------------------------------------------------------------------------
router.get('/sections', async (req, res) => {
  let conn;
  try {
    conn = await req.app.locals.pool.getConnection();
    const [rows] = await conn.query(`
      SELECT s.id, s.section_code, s.section_title, s.line, s.direction, s.edit_source,
             (SELECT COUNT(*) FROM div_signal_book_rows r WHERE r.book_section_id = s.id AND r.is_active = 1) AS row_count,
             (SELECT GROUP_CONCAT(b.beat_code ORDER BY b.beat_code SEPARATOR ', ')
                FROM div_signal_beat_sections bs JOIN div_signal_beats b ON b.id = bs.beat_id
               WHERE bs.section_id = s.id AND bs.is_active = 1) AS beats,
             (SELECT d.updated_at FROM div_signal_section_drafts d WHERE d.section_id = s.id) AS draft_updated_at
        FROM div_signal_book_sections s
       WHERE s.is_active = 1
       ORDER BY s.section_code
    `);
    res.json({ sections: rows });
  } catch (err) {
    console.error('signal-book/sections failed:', err);
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.release();
  }
});

// ---------------------------------------------------------------------------
// GET /section/:code/editable — load the editable model.
// Returns the draft if one exists, else a fresh model built from live tables.
// ---------------------------------------------------------------------------
router.get('/section/:code/editable', async (req, res) => {
  let conn;
  try {
    conn = await req.app.locals.pool.getConnection();
    const [secs] = await conn.execute(
      `SELECT id, section_code, section_title, line, direction, edit_source
         FROM div_signal_book_sections WHERE section_code = ? AND is_active = 1`,
      [req.params.code]
    );
    if (!secs.length) return res.status(404).json({ error: 'Section not found' });
    const section = secs[0];

    const [drafts] = await conn.execute(
      `SELECT draft_json, updated_at, updated_by FROM div_signal_section_drafts WHERE section_id = ?`,
      [section.id]
    );

    if (drafts.length) {
      const model = JSON.parse(drafts[0].draft_json);
      return res.json({
        section, rows: model.rows, hasDraft: true,
        draftUpdatedAt: drafts[0].updated_at,
      });
    }

    const liveRows = await loadEditableFromLive(conn, section);
    res.json({ section, rows: liveRows, hasDraft: false });
  } catch (err) {
    console.error(`signal-book/editable failed for ${req.params.code}:`, err);
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.release();
  }
});

// ---------------------------------------------------------------------------
// PUT /section/:code/draft — save (upsert) the working draft. Body: { rows, section? }
// ---------------------------------------------------------------------------
router.put('/section/:code/draft', async (req, res) => {
  let conn;
  try {
    if (!req.session || !req.session.user) return res.status(401).json({ error: 'Not authenticated' });
    const userId = req.session.user.id || null;
    const { rows, section: secEdits } = req.body || {};
    if (!Array.isArray(rows)) return res.status(400).json({ error: 'rows[] required' });

    conn = await req.app.locals.pool.getConnection();
    const [secs] = await conn.execute(
      `SELECT id FROM div_signal_book_sections WHERE section_code = ? AND is_active = 1`,
      [req.params.code]
    );
    if (!secs.length) return res.status(404).json({ error: 'Section not found' });

    const draftJson = JSON.stringify({ rows, section: secEdits || null });
    await conn.execute(
      `INSERT INTO div_signal_section_drafts (section_id, draft_json, updated_by, base_loaded_at)
       VALUES (?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE draft_json = VALUES(draft_json), updated_by = VALUES(updated_by)`,
      [secs[0].id, draftJson, userId]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(`signal-book/draft save failed for ${req.params.code}:`, err);
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.release();
  }
});

// ---------------------------------------------------------------------------
// POST /section/:code/discard — drop the draft (revert to published)
// ---------------------------------------------------------------------------
router.post('/section/:code/discard', async (req, res) => {
  let conn;
  try {
    if (!req.session || !req.session.user) return res.status(401).json({ error: 'Not authenticated' });
    conn = await req.app.locals.pool.getConnection();
    await conn.execute(
      `DELETE d FROM div_signal_section_drafts d
         JOIN div_signal_book_sections s ON s.id = d.section_id
        WHERE s.section_code = ?`,
      [req.params.code]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(`signal-book/discard failed for ${req.params.code}:`, err);
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.release();
  }
});

// ---------------------------------------------------------------------------
// POST /section/:code/publish — apply the draft to the live tables atomically.
// Upserts signals (canonicalising RI arms), rebuilds book rows, flips
// edit_source to 'ui', logs signal field changes, deletes the draft.
// ---------------------------------------------------------------------------
router.post('/section/:code/publish', async (req, res) => {
  let conn;
  try {
    if (!req.session || !req.session.user) return res.status(401).json({ error: 'Not authenticated' });
    const userId = req.session.user.id || null;

    conn = await req.app.locals.pool.getConnection();
    const [secs] = await conn.execute(
      `SELECT id, section_code, section_title, line, direction
         FROM div_signal_book_sections WHERE section_code = ? AND is_active = 1`,
      [req.params.code]
    );
    if (!secs.length) return res.status(404).json({ error: 'Section not found' });
    const section = secs[0];

    const [drafts] = await conn.execute(
      `SELECT draft_json FROM div_signal_section_drafts WHERE section_id = ?`,
      [section.id]
    );
    if (!drafts.length) return res.status(400).json({ error: 'No draft to publish' });
    const model = JSON.parse(drafts[0].draft_json);
    const rows = model.rows || [];

    await conn.beginTransaction();
    try {
      const historyEntries = [];

      // Canonical partition for any newly-inserted signals: read it from an
      // existing signal in this section rather than parsing the section code.
      const [[partition]] = await conn.execute(
        `SELECT s.section, s.line, s.direction
           FROM div_signal_book_rows r JOIN div_signals s ON s.id = r.signal_id
          WHERE r.book_section_id = ? LIMIT 1`,
        [section.id]
      );
      const partSection = partition ? partition.section : section.section_code.replace(/_/g, '-');
      const partLine = partition ? partition.line : section.line;
      const partDirection = partition ? partition.direction : (section.direction === 'NA' ? 'UNKNOWN' : section.direction);

      // 1. Upsert signals for SIGNAL rows; resolve signal_id for book rows.
      for (const r of rows) {
        if (r.row_type !== 'SIGNAL' || !r.signal) continue;
        const sig = r.signal;
        const arms = sig.arms || null;
        const riString = arms ? serializeRiSpec(arms) : (sig.book_description || null);
        const counts = arms ? armCounts(arms) : { left: sig.ri_left_arms || 0, right: sig.ri_right_arms || 0 };
        const sigFields = {
          signal_number: sig.signal_number,
          normalized_signal_number: normalizeSignalNumber(sig.signal_number),
          location_text: sig.location_text || null,
          km_text: sig.km_text || null,
          placement: sig.placement || 'Unknown',
          on_curve: sig.on_curve || 'Unknown',
          is_rhs: sig.is_rhs ? 1 : 0, is_ext_rhs: sig.is_ext_rhs ? 1 : 0,
          is_lhs: sig.is_lhs ? 1 : 0, is_ext_lhs: sig.is_ext_lhs ? 1 : 0,
          signal_type: sig.signal_type || 'Automatic',
          signal_function: sig.signal_function || null,
          has_legend_board: sig.has_legend_board ? 1 : 0,
          visibility_distance_m: sig.visibility_distance_m || null,
          ri_left_arms: counts.left, ri_right_arms: counts.right,
          book_description: riString,
          route_indicator_notes: sig.route_indicator_notes || null,
        };

        if (r.signal_id) {
          // capture old values for history
          const [[old]] = await conn.execute(
            `SELECT signal_number, placement, location_text, km_text, book_description FROM div_signals WHERE id = ?`,
            [r.signal_id]
          );
          await conn.execute(
            `UPDATE div_signals SET signal_number=?, normalized_signal_number=?, location_text=?, km_text=?,
                    placement=?, on_curve=?, is_rhs=?, is_ext_rhs=?, is_lhs=?, is_ext_lhs=?,
                    signal_type=?, signal_function=?, has_legend_board=?, visibility_distance_m=?,
                    ri_left_arms=?, ri_right_arms=?, book_description=?, route_indicator_notes=?
              WHERE id=?`,
            [sigFields.signal_number, sigFields.normalized_signal_number, sigFields.location_text, sigFields.km_text,
             sigFields.placement, sigFields.on_curve, sigFields.is_rhs, sigFields.is_ext_rhs, sigFields.is_lhs, sigFields.is_ext_lhs,
             sigFields.signal_type, sigFields.signal_function, sigFields.has_legend_board, sigFields.visibility_distance_m,
             sigFields.ri_left_arms, sigFields.ri_right_arms, sigFields.book_description, sigFields.route_indicator_notes,
             r.signal_id]
          );
          if (old) {
            if (old.signal_number !== sigFields.signal_number)
              historyEntries.push([r.signal_id, 'Renumbered', old.signal_number, sigFields.signal_number, userId]);
            if (old.placement !== sigFields.placement)
              historyEntries.push([r.signal_id, 'Placement Changed', old.placement, sigFields.placement, userId]);
            if ((old.location_text || '') !== (sigFields.location_text || '') || (old.km_text || '') !== (sigFields.km_text || ''))
              historyEntries.push([r.signal_id, 'Location Changed', `${old.location_text||''} / ${old.km_text||''}`, `${sigFields.location_text||''} / ${sigFields.km_text||''}`, userId]);
            if ((old.book_description || '') !== (sigFields.book_description || ''))
              historyEntries.push([r.signal_id, 'Description Changed', old.book_description, sigFields.book_description, userId]);
          }
        } else {
          const [ins] = await conn.execute(
            `INSERT INTO div_signals (signal_number, normalized_signal_number, station_code, station_name,
                section, line, direction, location_text, km_text, placement, on_curve,
                is_rhs, is_ext_rhs, is_lhs, is_ext_lhs, signal_type, signal_function, has_legend_board,
                visibility_distance_m, ri_left_arms, ri_right_arms, book_description, route_indicator_notes, is_active)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,1)`,
            [sigFields.signal_number, sigFields.normalized_signal_number, r.station_code || null, r.station_name || null,
             partSection, partLine, partDirection,
             sigFields.location_text, sigFields.km_text, sigFields.placement, sigFields.on_curve,
             sigFields.is_rhs, sigFields.is_ext_rhs, sigFields.is_lhs, sigFields.is_ext_lhs,
             sigFields.signal_type, sigFields.signal_function, sigFields.has_legend_board,
             sigFields.visibility_distance_m, sigFields.ri_left_arms, sigFields.ri_right_arms,
             sigFields.book_description, sigFields.route_indicator_notes]
          );
          r.signal_id = ins.insertId;
          historyEntries.push([r.signal_id, 'Created', null, sigFields.signal_number, userId]);
        }
      }

      // 2. Rebuild book rows for this section (atomic replace, like the importer).
      await conn.execute(`DELETE FROM div_signal_book_rows WHERE book_section_id = ?`, [section.id]);
      let order = 0;
      for (const r of rows) {
        order += 100;
        await conn.execute(
          `INSERT INTO div_signal_book_rows (
             book_section_id, row_order, row_type, row_source,
             signal_id, psr_id, neutral_section_id,
             display_signal_no, display_location, display_description,
             speed_kmph, km_range_text, station_code, station_name, station_km_text,
             highlight_color, text_color, icon_type, remarks, is_active
           ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,1)`,
          [section.id, order, r.row_type, 'ui',
           r.signal_id || null, r.psr_id || null, r.neutral_section_id || null,
           r.display_signal_no || (r.signal && r.signal.signal_number) || null, r.display_location || null, r.display_description || null,
           r.speed_kmph || null, r.km_range_text || null,
           r.station_code || null, r.station_name || null, r.station_km_text || null,
           r.highlight_color || 'NONE', r.text_color || 'BLACK', r.icon_type || 'NONE', r.remarks || null]
        );
      }

      // 3. Section-level edits + flip ownership to UI.
      const secEdits = model.section || {};
      await conn.execute(
        `UPDATE div_signal_book_sections
            SET section_title = ?, line = ?, direction = ?, edit_source = 'ui'
          WHERE id = ?`,
        [secEdits.section_title || section.section_title,
         secEdits.line || section.line,
         secEdits.direction || section.direction,
         section.id]
      );

      // 4. History log.
      for (const h of historyEntries) {
        await conn.execute(
          `INSERT INTO div_signal_history (signal_id, change_type, old_value, new_value, change_date, changed_by_user_id, remarks)
           VALUES (?,?,?,?,CURDATE(),?, 'Signal book editor')`,
          h
        );
      }

      // 5. Clear the draft.
      await conn.execute(`DELETE FROM div_signal_section_drafts WHERE section_id = ?`, [section.id]);

      await conn.commit();
      res.json({ ok: true, signalsChanged: historyEntries.length, rowCount: rows.length });
    } catch (txErr) {
      await conn.rollback();
      throw txErr;
    }
  } catch (err) {
    console.error(`signal-book/publish failed for ${req.params.code}:`, err);
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.release();
  }
});

module.exports = router;
