// utils/staffExit.js
// Centralized side-effects for staff EXIT statuses.
// When a staff member's status becomes an "exit" status they leave the active
// rosters/counts, their active CLI nomination must be ended and current_cli_id
// cleared, and (for Transferred) any dangling 'Pending' transfer request is
// completed since no receiving office will ever accept it.
//
// Helpers take a live `conn` so they run inside the caller's transaction.

// Staff statuses that remove a person from active rosters/counts.
const EXIT_STATUSES = new Set([
    'Transferred',
    'Retired',
    'Resigned',
    'Expired',
    'Returned to Parent depot'
]);

function isExitStatus(status) {
    return EXIT_STATUSES.has(status);
}

// Nomination status to write when a staff exits.
// Transferred -> 'Transferred'; everything else -> 'Expired'
// (both are valid values of the div_cli_nominations.status enum).
function nominationStatusForExit(exitStatus) {
    return exitStatus === 'Transferred' ? 'Transferred' : 'Expired';
}

// End any ACTIVE CLI nomination for this staff and clear current_cli_id.
// Mirrors retirementRoutes.js (end nomination) + cliRoutes.js (clear current_cli_id).
async function endActiveCliNomination(conn, staffHrmsId, effectiveDate, newNomStatus) {
    await conn.query(
        `UPDATE div_cli_nominations
            SET status = ?, nominated_to_date = ?
          WHERE staff_hrms_id = ? AND status = 'Active'`,
        [newNomStatus, effectiveDate, staffHrmsId]
    );
    await conn.query(
        'UPDATE div_staff_master SET current_cli_id = NULL WHERE hrms_id = ?',
        [staffHrmsId]
    );
}

// A transferred-out staff's 'Pending' transfer requests can never be accepted
// (no receiving office) -> mark them 'Completed'.
async function completePendingTransferRequests(conn, staffHrmsId) {
    await conn.query(
        `UPDATE div_transfer_requests
            SET status = 'Completed'
          WHERE staff_hrms_id = ? AND status = 'Pending'`,
        [staffHrmsId]
    );
}

// For a NON-transfer exit (Resigned/Retired/Expired/Returned), a still-'Pending'
// transfer request can never be fulfilled -> 'Rejected' (NOT 'Completed', since
// the transfer did not happen).
async function rejectPendingTransferRequests(conn, staffHrmsId, reason) {
    await conn.query(
        `UPDATE div_transfer_requests
            SET status = 'Rejected',
                remarks = TRIM(CONCAT(COALESCE(remarks, ''), ' ', ?)),
                review_date = CURDATE()
          WHERE staff_hrms_id = ? AND status = 'Pending'`,
        [reason || 'Auto-rejected on staff exit', staffHrmsId]
    );
}

// Resolve any dangling 'Pending' transfer requests appropriately for the exit:
// Transferred -> Completed; every other exit -> Rejected.
async function resolvePendingTransferRequests(conn, staffHrmsId, exitStatus) {
    if (exitStatus === 'Transferred') {
        await completePendingTransferRequests(conn, staffHrmsId);
    } else {
        await rejectPendingTransferRequests(conn, staffHrmsId, `Auto-rejected: staff ${exitStatus}`);
    }
}

module.exports = {
    EXIT_STATUSES,
    isExitStatus,
    nominationStatusForExit,
    endActiveCliNomination,
    completePendingTransferRequests,
    rejectPendingTransferRequests,
    resolvePendingTransferRequests
};
