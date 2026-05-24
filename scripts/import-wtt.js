/**
 * import-wtt.js
 *
 * Import Working Time Table data from Train_Timings_Summary.xlsx
 * into div_trains and div_train_stops tables.
 *
 * Usage: node scripts/import-wtt.js
 *
 * NOTE: The Excel "Route" column has incorrect station order for some trains.
 * This script builds via_route from timing sequence (earliest→latest) instead.
 */

const XLSX = require('xlsx');
const mysql = require('mysql2/promise');
const path = require('path');

// Database config
const dbConfig = {
    host: 'localhost',
    user: 'jay',
    password: '4310jay',
    database: 'bbtro'
};

// Map Excel column headers to station codes
const STATION_NAME_TO_CODE = {
    'CSMT': 'CSMT',
    'DADAR': 'DR',
    'LTT': 'LTT',
    'THANE': 'TNA',
    'KALYAN JN.': 'KYN',
    'KASARA': 'KSRA',
    'IGATPURI': 'IGP',
    'NASIK ROAD': 'NK',
    'MANMAD JN.': 'MMR',
    'KARJAT JN.': 'KJT',
    'LONAVLA': 'LNL',
    'PANVEL': 'PNVL',
    'ROHA': 'ROHA',
    'KHED': 'KHED',
    'JALGAON': 'JL',
    'BHUSAVAL': 'BSR',
    'PUNE JN.': 'PUNE',
    'CHIPLUN': 'CHI',
    'RATNAGIRI': 'RN',
    'VASAI ROAD': 'BSR'  // Some trains show VASAI ROAD
};

// Reverse map for building via_route display names
const STATION_CODE_TO_NAME = {
    'CSMT': 'CSMT',
    'DR': 'Dadar',
    'LTT': 'LTT',
    'TNA': 'Thane',
    'KYN': 'Kalyan',
    'KSRA': 'Kasara',
    'IGP': 'Igatpuri',
    'NK': 'Nasik Rd',
    'MMR': 'Manmad',
    'KJT': 'Karjat',
    'LNL': 'Lonavla',
    'PNVL': 'Panvel',
    'ROHA': 'Roha',
    'KHED': 'Khed',
    'JL': 'Jalgaon',
    'BSR': 'Bhusaval',
    'PUNE': 'Pune',
    'CHI': 'Chiplun',
    'RN': 'Ratnagiri'
};

/**
 * Parse time string like "00:05" or "00:30 / 00:35"
 * Returns { arrival, departure, sortTime }
 * sortTime is used for ordering stops chronologically
 */
function parseTime(timeStr) {
    if (!timeStr || timeStr === '' || timeStr === 'PASS') {
        return { arrival: null, departure: null, sortTime: null, isPass: timeStr === 'PASS' };
    }

    const str = String(timeStr).trim();

    // Format: "HH:MM / HH:MM" (arrival / departure)
    if (str.includes('/')) {
        const parts = str.split('/').map(s => s.trim());
        const arr = normalizeTime(parts[0]);
        const dep = normalizeTime(parts[1]);
        return {
            arrival: arr,
            departure: dep,
            sortTime: timeToMinutes(arr || dep),  // Use arrival for sorting
            isPass: false
        };
    }

    // Single time - could be arrival only (destination) or departure only (origin)
    const time = normalizeTime(str);
    return {
        arrival: time,
        departure: time,
        sortTime: timeToMinutes(time),
        isPass: false
    };
}

/**
 * Convert HH:MM:SS to minutes from midnight for sorting
 * Handles day-crossing (times < 04:00 are treated as next day)
 */
function timeToMinutes(timeStr) {
    if (!timeStr) return null;
    const match = timeStr.match(/^(\d{2}):(\d{2})/);
    if (!match) return null;
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    // Treat times 00:00-03:59 as next day (add 24 hours)
    if (hours < 4) hours += 24;
    return hours * 60 + minutes;
}

/**
 * Normalize time to HH:MM:SS format
 */
function normalizeTime(timeStr) {
    if (!timeStr) return null;
    const clean = timeStr.trim();
    if (clean.length === 0) return null;

    // Handle HH:MM format
    const match = clean.match(/^(\d{1,2}):(\d{2})$/);
    if (match) {
        const hours = parseInt(match[1], 10);
        const minutes = match[2];
        return `${String(hours).padStart(2, '0')}:${minutes}:00`;
    }
    return null;
}

/**
 * Determine train direction from train number
 * Even = DN (Down), Odd = UP
 */
function getDirection(trainNo) {
    const num = parseInt(trainNo, 10);
    return num % 2 === 0 ? 'DN' : 'UP';
}

/**
 * Determine train type from train number
 */
function getTrainType(trainNo) {
    const prefix = trainNo.substring(0, 2);
    if (prefix === '01') return 'Special';
    if (prefix === '12' || prefix === '22') return 'Superfast';
    if (prefix === '11') return 'Express';
    if (prefix === '15' || prefix === '16') return 'Express';
    return 'Express';
}

/**
 * Determine if train is regular (not special/01xxx)
 */
function isRegular(trainNo) {
    return !trainNo.startsWith('01');
}

async function main() {
    const excelPath = path.join(__dirname, '..', 'Train_Timings_Summary.xlsx');
    console.log('Reading Excel file:', excelPath);

    const wb = XLSX.readFile(excelPath);
    console.log('Sheets found:', wb.SheetNames);

    // Connect to database
    const connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database');

    try {
        // Process both sheets
        let totalTrains = 0;
        let totalStops = 0;

        for (const sheetName of wb.SheetNames) {
            console.log(`\nProcessing sheet: ${sheetName}`);
            const sheet = wb.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

            if (data.length < 2) {
                console.log('  Skipping - no data');
                continue;
            }

            // Get headers (station names)
            const headers = data[0];
            console.log(`  Headers: ${headers.slice(0, 10).join(', ')}...`);

            // Map header indices to station codes
            const stationColumns = [];
            for (let i = 1; i < headers.length; i++) {
                const headerName = headers[i];
                if (headerName === 'Route') continue;  // Skip Route column

                const stationCode = STATION_NAME_TO_CODE[headerName];
                if (stationCode) {
                    stationColumns.push({ index: i, code: stationCode, name: headerName });
                }
            }

            console.log(`  Mapped ${stationColumns.length} station columns`);

            // Determine direction from sheet name
            const isDN = sheetName.includes('to Onward') || sheetName.includes('CSMT to');

            // Process each train row
            for (let rowIdx = 1; rowIdx < data.length; rowIdx++) {
                const row = data[rowIdx];
                const trainNo = String(row[0] || '').trim();

                if (!trainNo || trainNo.length < 4) continue;  // Skip invalid

                const stops = [];

                for (const col of stationColumns) {
                    const cellValue = row[col.index];
                    if (cellValue && cellValue !== '') {
                        const parsed = parseTime(cellValue);
                        if (parsed.arrival || parsed.departure || parsed.isPass) {
                            stops.push({
                                stationCode: col.code,
                                stationName: col.name,
                                arrival: parsed.arrival,
                                departure: parsed.departure,
                                sortTime: parsed.sortTime,
                                isHalt: !parsed.isPass
                            });
                        }
                    }
                }

                if (stops.length === 0) continue;

                // Sort stops by time to get correct geographic sequence
                stops.sort((a, b) => {
                    if (a.sortTime === null) return -1;
                    if (b.sortTime === null) return 1;
                    return a.sortTime - b.sortTime;
                });

                // Build via_route from sorted stops (correct geographic order)
                const viaRoute = stops
                    .map(s => STATION_CODE_TO_NAME[s.stationCode] || s.stationCode)
                    .join(' → ');

                // Origin = first stop, destination = last stop (after sorting)
                const originStation = stops[0].stationCode;
                const destStation = stops[stops.length - 1].stationCode;

                // Insert train
                const direction = getDirection(trainNo);
                const trainType = getTrainType(trainNo);
                const regular = isRegular(trainNo);

                try {
                    await connection.execute(`
                        INSERT INTO div_trains
                        (train_no, train_type, direction, is_regular, is_active)
                        VALUES (?, ?, ?, ?, TRUE)
                        ON DUPLICATE KEY UPDATE
                            train_type = VALUES(train_type),
                            direction = VALUES(direction)
                    `, [trainNo, trainType, direction, regular]);

                    totalTrains++;

                    // Insert stops with sequence order (based on sorted time order)
                    for (let seq = 0; seq < stops.length; seq++) {
                        const stop = stops[seq];

                        // For origin, arrival is null. For destination, departure is null.
                        let arrival = stop.arrival;
                        let departure = stop.departure;

                        if (seq === 0) {
                            // Origin station - no arrival
                            arrival = null;
                        }
                        if (seq === stops.length - 1) {
                            // Destination station - no departure
                            departure = null;
                        }

                        await connection.execute(`
                            INSERT INTO div_train_stops
                            (train_no, station_code, seq_order, arrival_time, departure_time, is_halt)
                            VALUES (?, ?, ?, ?, ?, ?)
                            ON DUPLICATE KEY UPDATE
                                seq_order = VALUES(seq_order),
                                arrival_time = VALUES(arrival_time),
                                departure_time = VALUES(departure_time),
                                is_halt = VALUES(is_halt)
                        `, [trainNo, stop.stationCode, seq + 1, arrival, departure, stop.isHalt]);

                        totalStops++;
                    }
                } catch (err) {
                    console.error(`  Error inserting train ${trainNo}:`, err.message);
                }
            }
        }

        console.log('\n=== Import Summary ===');
        console.log(`Trains processed: ${totalTrains}`);
        console.log(`Stops inserted: ${totalStops}`);

        // Update run_days from div_loco_link_master
        console.log('\nUpdating run_days from div_loco_link_master...');
        const [updateResult] = await connection.execute(`
            UPDATE div_trains dt
            JOIN (
                SELECT train_no, MAX(run_days) as run_days
                FROM div_loco_link_master
                WHERE run_days IS NOT NULL AND run_days != ''
                GROUP BY train_no
            ) llm ON dt.train_no = llm.train_no
            SET dt.run_days = llm.run_days
            WHERE dt.run_days IS NULL
        `);
        console.log(`  Updated run_days for ${updateResult.affectedRows} trains`);

        // Show final counts
        const [trainCount] = await connection.execute('SELECT COUNT(*) as cnt FROM div_trains');
        const [stopCount] = await connection.execute('SELECT COUNT(*) as cnt FROM div_train_stops');
        const [runDaysCount] = await connection.execute('SELECT COUNT(*) as cnt FROM div_trains WHERE run_days IS NOT NULL');

        console.log(`\nFinal table counts:`);
        console.log(`  div_trains: ${trainCount[0].cnt}`);
        console.log(`  div_train_stops: ${stopCount[0].cnt}`);
        console.log(`  trains with run_days: ${runDaysCount[0].cnt}`);

    } finally {
        await connection.end();
        console.log('\nDatabase connection closed');
    }
}

main().catch(console.error);
