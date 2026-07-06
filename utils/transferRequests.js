// Shared transfer-request creation used by the single-staff biodata flow
// (transferRoutes.js POST /transfer-request) and the Transfer Letter module
// (one call per staff on a letter). Caller owns the transaction — pass a
// connection with an open transaction, commit/rollback outside (same
// convention as utils/staffExit.js).

/**
 * Create a Pending transfer request for one staff member.
 * Locks the staff row, rejects duplicates/same-office, inserts the request.
 *
 * @param {object} conn  mysql2 connection with an open transaction
 * @param {object} p     { staff_hrms_id, from_office_code, to_office_code,
 *                         transfer_category, current_cms_id, request_date,
 *                         requested_by, remarks, letter_id }
 * @returns {Promise<number>} insertId of the new request
 * @throws  {{code: 'SAME_OFFICE'|'STAFF_NOT_FOUND'|'DUPLICATE_PENDING', staff_hrms_id}}
 */
async function createPendingTransferRequest(conn, p) {
    const {
        staff_hrms_id, from_office_code, to_office_code,
        transfer_category, current_cms_id, request_date,
        requested_by, remarks, letter_id = null
    } = p;

    if (from_office_code === to_office_code) {
        throw { code: 'SAME_OFFICE', staff_hrms_id };
    }

    // Serialize per-staff: without the row lock two simultaneous submissions
    // can both pass the pending check and insert.
    const [staffCheck] = await conn.query(
        'SELECT hrms_id FROM div_staff_master WHERE hrms_id = ? FOR UPDATE',
        [staff_hrms_id]
    );
    if (staffCheck.length === 0) {
        throw { code: 'STAFF_NOT_FOUND', staff_hrms_id };
    }

    const [pendingCheck] = await conn.query(
        'SELECT request_id FROM div_transfer_requests WHERE staff_hrms_id = ? AND status = "Pending"',
        [staff_hrms_id]
    );
    if (pendingCheck.length > 0) {
        throw { code: 'DUPLICATE_PENDING', staff_hrms_id };
    }

    const [result] = await conn.query(
        `INSERT INTO div_transfer_requests
         (staff_hrms_id, from_office_code, to_office_code, transfer_category, current_cms_id,
          request_date, requested_by, remarks, letter_id, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', NOW())`,
        [
            staff_hrms_id,
            from_office_code,
            to_office_code,
            transfer_category || 'Permanent Transfer',
            current_cms_id,
            request_date,
            requested_by,
            remarks || null,
            letter_id
        ]
    );
    return result.insertId;
}

module.exports = { createPendingTransferRequest };
