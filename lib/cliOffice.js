/**
 * Moving a CLI between lobbies, in one place.
 *
 * Extracted from routes/division/cliRoutes.js so the CLI app's transfer
 * shortcut uses the same code as the CLI Management screen rather than a second
 * copy that drifts. Every path that changes a CLI's office must go through
 * this: it records the posting AND syncs the login, and forgetting either is
 * what produced the mismatches this file exists to prevent.
 */
/**
 * Keep a CLI's office change honest, wherever it is made.
 *
 * Two things used to be missed. The Edit CLI form wrote current_office_code
 * straight to div_cli_master and recorded NOTHING, which is why the history
 * table held only a handful of rows -- the path everyone actually uses did not
 * feed it. And users.div_office_code, which scopes a CLI's login, was never
 * updated by anything at all.
 *
 * Call this instead of updating current_office_code by hand. It is a no-op when
 * the office has not actually changed, so it is safe on every save.
 */
async function moveCliOffice(conn, cliId, newOffice, username, remarks) {
    if (!newOffice) return { changed: false };

    const [[cur]] = await conn.query(
        'SELECT current_office_code FROM div_cli_master WHERE cli_id = ?', [cliId]
    );
    const oldOffice = cur ? cur.current_office_code : null;
    if (oldOffice === newOffice) return { changed: false, office: newOffice };

    // Close the posting that is open, if any.
    //
    // GREATEST guards the same-day case. Closing at "yesterday" is right for a
    // posting that began earlier, but a posting created today and corrected
    // today would otherwise end the day before it started.
    await conn.query(
        `UPDATE div_cli_office_history
            SET is_current = 0,
                to_date = COALESCE(
                    to_date,
                    GREATEST(COALESCE(from_date, CURDATE()), DATE_SUB(CURDATE(), INTERVAL 1 DAY))
                )
          WHERE cli_id = ? AND is_current = 1`, [cliId]
    );
    await conn.query(
        `INSERT INTO div_cli_office_history
            (cli_id, office_code, from_date, is_current, remarks, created_by)
         VALUES (?, ?, CURDATE(), 1, ?, ?)`,
        [cliId, newOffice, remarks || (oldOffice ? `Moved from ${oldOffice}` : 'Initial posting'), username || null]
    );
    await conn.query(
        'UPDATE div_cli_master SET current_office_code = ? WHERE cli_id = ?', [newOffice, cliId]
    );
    // The login is scoped by this column for accounts that have no CLI of their
    // own; the counselling module derives a CLI's lobby from the CLI record, but
    // leaving a stale value here is a lie that someone will eventually read.
    await conn.query(
        `UPDATE users SET div_office_code = ? WHERE cli_id = ? AND div_role = 'cli'`,
        [newOffice, cliId]
    );
    return { changed: true, from: oldOffice, to: newOffice };
}

module.exports = { moveCliOffice };
