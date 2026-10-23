#!/usr/bin/env node
/**
 * backfill_segment_coverage.js
 *
 * Rebuilds div_lrd_segment_coverage from existing CTR legs
 * Extracts adjacent station pairs from matched_sections
 *
 * Same rule as the upload path in routes/division/ctrRoutes.js:
 *   working legs only (WR, LR), route_km > 0, matched_sections set.
 * Builds into a staging copy (div_lrd_segment_coverage_new: the road-learning
 * rows, last_duty_id = 0, copied over, then every CTR-derived pair) and swaps it
 * in with one atomic RENAME at the end, so the live table is never half built.
 * Until 2026-10-23 it cleared the live table first and refilled it over several
 * minutes, during which the LRD page showed crews as overdue or missing.
 * Normally not needed after a routes/alias change any more: the backfill
 * endpoint credits coverage for the legs it resolves.
 *
 * Usage (LOCAL):
 *   set -a; . ./.env; set +a; node scripts/backfill_segment_coverage.js
 */

const mysql = require('mysql2/promise');
const path = require('path');

const LIVE = 'div_lrd_segment_coverage';
const STAGING = 'div_lrd_segment_coverage_new';

// Load database config
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'bbtro',
    waitForConnections: true,
    connectionLimit: 5
};

/**
 * Extract adjacent pairs from station array
 * ["PEN", "JITE", "APTA"] => [["PEN","JITE"], ["JITE","APTA"]]
 */
function extractAdjacentPairs(stations) {
    const pairs = [];
    if (!Array.isArray(stations) || stations.length < 2) return pairs;

    for (let i = 0; i < stations.length - 1; i++) {
        const from = String(stations[i]).trim().toUpperCase();
        const to = String(stations[i + 1]).trim().toUpperCase();
        if (from && to && from !== to) {
            pairs.push([from, to]);
        }
    }
    return pairs;
}

async function backfillSegmentCoverage() {
    console.log('='.repeat(60));
    console.log('LRD Segment Coverage - Backfill from CTR Legs');
    console.log('='.repeat(60));

    const pool = mysql.createPool(dbConfig);

    try {
        // Check if table exists, create if not
        console.log('\nChecking div_lrd_segment_coverage table...');
        const sqlFile = path.join(__dirname, '../sql/div_lrd_segment_coverage.sql');
        const fs = require('fs');
        if (fs.existsSync(sqlFile)) {
            const createTableSQL = fs.readFileSync(sqlFile, 'utf8');
            // Extract just the CREATE TABLE statement
            const match = createTableSQL.match(/CREATE TABLE IF NOT EXISTS[^;]+;/s);
            if (match) {
                await pool.query(match[0]);
                console.log('Table ready.');
            }
        }

        // Staging table: same keys as the live one; road learning (last_duty_id = 0) carried over
        await pool.query(`DROP TABLE IF EXISTS ${STAGING}`);
        await pool.query(`CREATE TABLE ${STAGING} LIKE ${LIVE}`);
        const [kept] = await pool.query(
            `INSERT INTO ${STAGING} (staff_hrms_id, from_station, to_station, last_worked_date, last_duty_id, work_count)
             SELECT staff_hrms_id, from_station, to_station, last_worked_date, last_duty_id, work_count
             FROM ${LIVE} WHERE last_duty_id = 0`
        );
        console.log(`\nStaging table ${STAGING} created; ${kept.affectedRows} road-learning rows carried over. Live table untouched until the swap.`);

        // Get working legs with matched_sections
        console.log('\nFetching working legs with matched_sections...');
        const [legs] = await pool.query(
            `SELECT
                l.id as leg_id,
                l.matched_sections,
                l.from_station,
                l.to_station,
                COALESCE(DATE(l.departure_datetime), d.duty_date) AS work_date,
                d.id as duty_id,
                d.staff_hrms_id,
                d.staff_cms_id
             FROM div_ctr_legs l
             JOIN div_ctr_duties d ON l.duty_id = d.id
             WHERE l.matched_sections IS NOT NULL
               AND l.duty_type IN ('WR', 'LR')
               AND l.route_km > 0
             ORDER BY work_date ASC`
        );
        // work_date: the leg's own departure date, the duty date only when the leg has no
        // departure. Legs glued onto the wrong duty by the old parser (fixed 05667fc) carry
        // the right time of their own, so coverage is dated from the leg (lobby, 2026-10-23).

        console.log(`Found ${legs.length} legs with matched_sections`);

        if (legs.length === 0) {
            console.log('No legs to process. Run backfill_matched_sections.js first.');
            await pool.end();
            return;
        }

        // Build staff HRMS ID mapping for legs without hrms_id
        const cmsToHrms = new Map();
        const [staffMapping] = await pool.query(
            `SELECT hrms_id, original_cms_id, current_cms_id FROM div_staff_master`
        );
        for (const s of staffMapping) {
            if (s.original_cms_id) cmsToHrms.set(s.original_cms_id, s.hrms_id);
            if (s.current_cms_id) cmsToHrms.set(s.current_cms_id, s.hrms_id);
        }

        // Process legs
        console.log('\nProcessing legs...');
        console.log('-'.repeat(60));

        let processed = 0;
        let segmentsInserted = 0;
        let segmentsUpdated = 0;
        let errors = 0;
        let skippedNoHrms = 0;

        for (const leg of legs) {
            try {
                // Get HRMS ID
                let hrmsId = leg.staff_hrms_id;
                if (!hrmsId && leg.staff_cms_id) {
                    hrmsId = cmsToHrms.get(leg.staff_cms_id);
                }

                if (!hrmsId) {
                    skippedNoHrms++;
                    continue;
                }

                // Parse matched_sections JSON (may already be parsed by MySQL)
                let matched = leg.matched_sections;
                if (typeof matched === 'string') {
                    matched = JSON.parse(matched);
                }
                if (!Array.isArray(matched) || matched.length === 0) continue;

                // Get stations from first match
                const stations = matched[0].stations;
                if (!Array.isArray(stations) || stations.length < 2) continue;

                // Extract adjacent pairs
                const pairs = extractAdjacentPairs(stations);

                // Insert/update each pair
                for (const [fromStn, toStn] of pairs) {
                    const [result] = await pool.query(
                        `INSERT INTO ${STAGING}
                         (staff_hrms_id, from_station, to_station, last_worked_date, last_duty_id, work_count)
                         VALUES (?, ?, ?, ?, ?, 1)
                         ON DUPLICATE KEY UPDATE
                           last_worked_date = CASE
                             WHEN VALUES(last_worked_date) > last_worked_date
                             THEN VALUES(last_worked_date)
                             ELSE last_worked_date
                           END,
                           last_duty_id = CASE
                             WHEN VALUES(last_worked_date) > last_worked_date
                             THEN VALUES(last_duty_id)
                             ELSE last_duty_id
                           END,
                           work_count = work_count + 1`,
                        [hrmsId, fromStn, toStn, leg.work_date, leg.duty_id]
                    );

                    if (result.affectedRows === 1) {
                        segmentsInserted++;
                    } else if (result.affectedRows === 2) {
                        segmentsUpdated++;
                    }
                }

                processed++;

                // Progress
                if (processed % 100 === 0) {
                    process.stdout.write(`\rProcessed: ${processed}/${legs.length} | Segments: +${segmentsInserted} / ~${segmentsUpdated}`);
                }

            } catch (err) {
                errors++;
                if (errors <= 5) {
                    console.error(`\nError processing leg ${leg.leg_id}:`, err.message);
                }
            }
        }

        console.log(`\rProcessed: ${processed}/${legs.length} | Segments: +${segmentsInserted} / ~${segmentsUpdated}`);
        console.log('-'.repeat(60));

        // Summary
        console.log('\nBackfill complete!');
        console.log(`  Legs processed: ${processed}`);
        console.log(`  Segments inserted: ${segmentsInserted}`);
        console.log(`  Segments updated: ${segmentsUpdated}`);
        console.log(`  Skipped (no HRMS): ${skippedNoHrms}`);
        console.log(`  Errors: ${errors}`);

        // Swap: one atomic rename, then drop the old copy
        await pool.query(`DROP TABLE IF EXISTS ${LIVE}_old`);
        await pool.query(`RENAME TABLE ${LIVE} TO ${LIVE}_old, ${STAGING} TO ${LIVE}`);
        await pool.query(`DROP TABLE ${LIVE}_old`);
        console.log(`  Swapped ${STAGING} into ${LIVE} (atomic rename).`);

        // Show stats
        const [stats] = await pool.query(
            `SELECT COUNT(DISTINCT staff_hrms_id) as staff_count,
                    COUNT(*) as total_segments,
                    COUNT(DISTINCT CONCAT(from_station, '-', to_station)) as unique_segments
             FROM ${LIVE}`
        );
        console.log(`\nDatabase stats:`);
        console.log(`  Staff with segments: ${stats[0].staff_count}`);
        console.log(`  Total segment records: ${stats[0].total_segments}`);
        console.log(`  Unique segment types: ${stats[0].unique_segments}`);

        await pool.end();
        console.log('\nDone!');

    } catch (err) {
        console.error('\nFatal error:', err);
        try { await pool.query(`DROP TABLE IF EXISTS ${STAGING}`); console.log(`Staging table ${STAGING} dropped; live table untouched.`); } catch (e) { /* ignore */ }
        await pool.end();
        process.exit(1);
    }
}

backfillSegmentCoverage();
