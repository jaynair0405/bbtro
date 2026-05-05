/**
 * locoLinkRoutes.js — Control Office loco-link endpoints
 * Mounted at /api/division/loco-link
 *
 * Slice 1 (this file): Loco lookup widget
 *   - GET /loco/:loco_number/details
 *
 * Future slices:
 *   - GET /today                            → daily entry sheet
 *   - GET /loco/:loco_number/lookup         → lightweight autofill (just shed/type)
 *   - POST /log                             → upsert daily log row
 *   - POST /sick                            → mark loco sick
 *   - PATCH /sick/:id/fit                   → mark loco fit
 *   - GET /sick                             → currently-sick list
 *   - GET /reports/mislinks                 → mis-link reports
 */

const express = require('express');
const router = express.Router();

function isTableNotExistError(err) {
    return err && (err.code === 'ER_NO_SUCH_TABLE' || err.errno === 1146);
}

// ── GET /loco/:loco_number/details ───────────────────────────────────────
// Returns full loco master row + currently-sick status + last 5 log entries.
// Used by the always-visible Loco Lookup widget on Control Office pages.
router.get('/loco/:loco_number/details', async (req, res) => {
    const locoNo = String(req.params.loco_number || '').trim();
    if (!locoNo) {
        return res.status(400).json({ error: 'loco_number required' });
    }
    try {
        const pool = req.app.locals.pool;

        // 1. Master record
        const [locoRows] = await pool.query(
            `SELECT loco_number, loco_type, traction_type, railway_zone,
                    home_shed, status, commission_date,
                    traction_converter, arno_siv, rtis_oem, hrpt_count,
                    microprocessor_type, hotel_load_oem,
                    data_source, entered_by, remarks
             FROM div_locos WHERE loco_number = ? LIMIT 1`,
            [locoNo]
        );
        if (locoRows.length === 0) {
            return res.status(404).json({ error: 'Loco not found in master', loco_number: locoNo });
        }
        const loco = locoRows[0];

        // 2. Currently-sick status (latest open record)
        let sick = null;
        try {
            const [sickRows] = await pool.query(
                `SELECT id, sick_from, sick_at_shed, sick_reason, sicked_by, remarks
                 FROM div_loco_sick_records
                 WHERE loco_number = ? AND fit_from IS NULL
                 ORDER BY sick_from DESC LIMIT 1`,
                [locoNo]
            );
            if (sickRows.length) sick = sickRows[0];
        } catch (e) {
            if (!isTableNotExistError(e)) throw e;
            // table missing → leave sick as null
        }

        // 3. Last 5 log entries (front + rear position, merged)
        let recentTrains = [];
        try {
            const [logRows] = await pool.query(
                `(SELECT working_date, train_no, direction, base_shed,
                         is_mislink, expected_shed, 'front' AS position, hog
                  FROM div_loco_link_log
                  WHERE actual_loco_no = ?)
                 UNION ALL
                 (SELECT working_date, train_no, direction, base_shed_rear,
                         is_mislink_rear, expected_shed, 'rear' AS position, hog
                  FROM div_loco_link_log
                  WHERE actual_loco_no_rear = ?)
                 ORDER BY working_date DESC, train_no
                 LIMIT 5`,
                [locoNo, locoNo]
            );
            recentTrains = logRows;
        } catch (e) {
            if (!isTableNotExistError(e)) throw e;
        }

        res.json({ loco, sick, recent_trains: recentTrains });
    } catch (err) {
        console.error('[loco-link /loco/:n/details]', err);
        res.status(500).json({ error: 'Lookup failed' });
    }
});

// ── GET /me ──────────────────────────────────────────────────────────────
// Returns current LPC session info (used by header + audit trails)
router.get('/me', (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'not logged in' });
    const u = req.session.user;
    res.json({
        username: u.username,
        full_name: u.full_name,
        div_role: u.div_role,
        office: u.office,
    });
});

module.exports = router;
