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

module.exports = router;
