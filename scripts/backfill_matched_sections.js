#!/usr/bin/env node
/**
 * backfill_matched_sections.js
 *
 * One-time script to populate matched_sections for existing CTR legs
 *
 * Usage:
 *   node scripts/backfill_matched_sections.js
 *
 * Environment:
 *   Requires DATABASE_URL or individual DB env vars (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME)
 */

const mysql = require('mysql2/promise');
const path = require('path');
const { loadRoutesJson, buildRouteIndex, resolveLegWithRoutes } = require('../routes/division/lrd_route_resolver');

// Load database config from environment or use defaults
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'bbtro',
    waitForConnections: true,
    connectionLimit: 5
};

// Parse DATABASE_URL if provided
if (process.env.DATABASE_URL) {
    const url = new URL(process.env.DATABASE_URL);
    dbConfig.host = url.hostname;
    dbConfig.user = url.username;
    dbConfig.password = url.password;
    dbConfig.database = url.pathname.slice(1);
    dbConfig.port = url.port || 3306;
}

async function backfillMatchedSections() {
    console.log('='.repeat(60));
    console.log('CTR Legs - Backfill matched_sections');
    console.log('='.repeat(60));

    // Load routes
    const routesJsonPath = path.join(__dirname, '../data/routes.json');
    console.log(`\nLoading routes from: ${routesJsonPath}`);

    let routeCtx;
    try {
        const routeDb = loadRoutesJson(routesJsonPath);
        routeCtx = buildRouteIndex(routeDb);
        console.log(`Loaded ${routeDb.routes.length} routes`);
    } catch (err) {
        console.error('Failed to load routes.json:', err.message);
        process.exit(1);
    }

    // Connect to database
    console.log(`\nConnecting to database: ${dbConfig.host}/${dbConfig.database}`);
    const pool = mysql.createPool(dbConfig);

    try {
        // Get count of legs to process
        const [countResult] = await pool.query(
            `SELECT COUNT(*) as total FROM div_ctr_legs
             WHERE matched_sections IS NULL
               AND duty_type IN ('WR', 'PL')
               AND from_station IS NOT NULL
               AND to_station IS NOT NULL`
        );
        const totalLegs = countResult[0].total;
        console.log(`\nLegs to process: ${totalLegs}`);

        if (totalLegs === 0) {
            console.log('No legs need backfilling. Done!');
            await pool.end();
            return;
        }

        // Process in batches
        const BATCH_SIZE = 500;
        let processed = 0;
        let updated = 0;
        let matched = 0;
        let unmapped = 0;
        let ambiguous = 0;

        console.log(`\nProcessing in batches of ${BATCH_SIZE}...`);
        console.log('-'.repeat(60));

        while (processed < totalLegs) {
            // Fetch batch
            const [legs] = await pool.query(
                `SELECT id, from_station, to_station
                 FROM div_ctr_legs
                 WHERE matched_sections IS NULL
                   AND duty_type IN ('WR', 'PL')
                   AND from_station IS NOT NULL
                   AND to_station IS NOT NULL
                 LIMIT ?`,
                [BATCH_SIZE]
            );

            if (legs.length === 0) break;

            // Process each leg
            for (const leg of legs) {
                const resolved = resolveLegWithRoutes(leg.from_station, leg.to_station, routeCtx);

                let matchedSections = null;
                if (resolved.status === 'OK' && resolved.route_id) {
                    matchedSections = JSON.stringify([{
                        route_id: resolved.route_id,
                        stations: resolved.stations,
                        reason: resolved.reason
                    }]);
                    matched++;
                } else if (resolved.status === 'AMBIGUOUS') {
                    ambiguous++;
                } else {
                    unmapped++;
                }

                // Update the leg (even if null, so we don't reprocess)
                await pool.query(
                    `UPDATE div_ctr_legs SET matched_sections = ? WHERE id = ?`,
                    [matchedSections, leg.id]
                );
                updated++;
            }

            processed += legs.length;

            // Progress update
            const pct = ((processed / totalLegs) * 100).toFixed(1);
            process.stdout.write(`\rProcessed: ${processed}/${totalLegs} (${pct}%) | Matched: ${matched} | Unmapped: ${unmapped} | Ambiguous: ${ambiguous}`);
        }

        console.log('\n' + '-'.repeat(60));
        console.log('\nBackfill complete!');
        console.log(`  Total processed: ${processed}`);
        console.log(`  Matched to routes: ${matched}`);
        console.log(`  Unmapped (no route found): ${unmapped}`);
        console.log(`  Ambiguous (multiple routes): ${ambiguous}`);

        // Show sample of unmapped legs
        if (unmapped > 0) {
            console.log('\nSample unmapped legs (first 10):');
            const [unmappedSample] = await pool.query(
                `SELECT DISTINCT from_station, to_station, COUNT(*) as cnt
                 FROM div_ctr_legs
                 WHERE matched_sections IS NULL
                   AND duty_type IN ('WR', 'PL')
                 GROUP BY from_station, to_station
                 ORDER BY cnt DESC
                 LIMIT 10`
            );
            unmappedSample.forEach(u => {
                console.log(`  ${u.from_station} -> ${u.to_station} (${u.cnt} legs)`);
            });
        }

        await pool.end();
        console.log('\nDone!');

    } catch (err) {
        console.error('\nError during backfill:', err);
        await pool.end();
        process.exit(1);
    }
}

// Run
backfillMatchedSections();
