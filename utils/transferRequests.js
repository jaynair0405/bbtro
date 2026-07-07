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

/**
 * Accept a Pending transfer request — the full receiving-lobby flow:
 * CMS-ID validation + duplicate guard, request → Approved, history row,
 * category-based div_staff_master update (incl. CSMT-ML yard flag),
 * optional reporting_date write-back, and matching proposed_lobby clear.
 *
 * Used by the single-request dashboard flow (PUT /transfer-request/:id/accept)
 * and the Transfer Letter bulk-accept. Caller owns the transaction.
 *
 * @param {object} conn mysql2 connection with an open transaction
 * @param {number} requestId
 * @param {object} o { new_cms_id, remarks, is_yard_staff, reporting_date, reviewed_by }
 * @returns {Promise<{isReturningToOriginalCMS: boolean, staff_hrms_id: string}>}
 * @throws  {{code:'INVALID_CMS'|'NOT_FOUND'|'NOT_PENDING'|'CMS_TAKEN', ...}}
 */
async function acceptTransferRequest(conn, requestId, o) {
    const { new_cms_id, remarks, is_yard_staff, reporting_date, reviewed_by } = o;

    if (typeof new_cms_id !== 'string' || !new_cms_id.trim()) {
        throw { code: 'INVALID_CMS' };
    }
    const normalizedCmsId = new_cms_id.trim().toUpperCase();
    if (new_cms_id !== new_cms_id.trim() || !/^[A-Z]+[0-9]+$/.test(normalizedCmsId)) {
        throw { code: 'INVALID_CMS' };
    }

    const [request] = await conn.query(
        'SELECT * FROM div_transfer_requests WHERE request_id = ?', [requestId]
    );
    if (request.length === 0) throw { code: 'NOT_FOUND' };
    const transferReq = request[0];
    if (transferReq.status !== 'Pending') {
        throw { code: 'NOT_PENDING', status: transferReq.status };
    }

    // Duplicate CMS guard — reuse of the staff's own original CMS is allowed.
    const [duplicateCheck] = await conn.query(
        'SELECT hrms_id, name FROM div_staff_master WHERE current_cms_id = ? OR original_cms_id = ?',
        [normalizedCmsId, normalizedCmsId]
    );
    let isReturningToOriginalCMS = false;
    if (duplicateCheck.length > 0) {
        const existingStaff = duplicateCheck[0];
        if (existingStaff.hrms_id !== transferReq.staff_hrms_id) {
            throw { code: 'CMS_TAKEN', cms: normalizedCmsId, name: existingStaff.name, hrms_id: existingStaff.hrms_id };
        }
        isReturningToOriginalCMS = true;
    }

    await conn.query(
        `UPDATE div_transfer_requests
         SET status = 'Approved', proposed_cms_id = ?, reviewed_by = ?, review_date = CURDATE()
         WHERE request_id = ?`,
        [normalizedCmsId, reviewed_by, requestId]
    );

    await conn.query(
        `INSERT INTO div_transfer_history
         (staff_hrms_id, from_office_code, to_office_code, transfer_category, from_cms_id, to_cms_id,
          transfer_date, reporting_date, transfer_order_no, transfer_reason,
          initiated_by, approved_by, status, remarks, created_at)
         VALUES (?, ?, ?, ?, ?, ?, CURDATE(), ?, '', ?, ?, ?, 'Completed', ?, NOW())`,
        [
            transferReq.staff_hrms_id, transferReq.from_office_code, transferReq.to_office_code,
            transferReq.transfer_category || 'Permanent Transfer',
            transferReq.current_cms_id, normalizedCmsId,
            reporting_date || null,
            transferReq.remarks, transferReq.requested_by, reviewed_by, remarks || '',
        ]
    );

    const category = transferReq.transfer_category || 'Permanent Transfer';

    // Yard flag: LPS/Sr.LPS (3,4) at CSMT-ML always 1; ALP/Sr.ALP/LPG (1,2,5)
    // there use the provided value; everyone else 0.
    const [staffInfo] = await conn.query(
        'SELECT designation_id FROM div_staff_master WHERE hrms_id = ?',
        [transferReq.staff_hrms_id]
    );
    const designationId = staffInfo[0]?.designation_id;
    let yardStaffValue = 0;
    if (transferReq.to_office_code === 'CSMT-ML') {
        if ([3, 4].includes(designationId)) yardStaffValue = 1;
        else if ([1, 2, 5].includes(designationId)) yardStaffValue = is_yard_staff ? 1 : 0;
    }

    if (category === 'Inter Railway') {
        await conn.query(
            `UPDATE div_staff_master
             SET current_office_code = 'OTHER', hq_station = NULL, current_cms_id = ?, status = 'Transferred'
             WHERE hrms_id = ?`,
            [normalizedCmsId, transferReq.staff_hrms_id]
        );
    } else if (category === 'Temporary Transfer') {
        await conn.query(
            `UPDATE div_staff_master
             SET current_office_code = ?, hq_station = ?, current_cms_id = ?, is_yard_staff = ?
             WHERE hrms_id = ?`,
            [transferReq.to_office_code, transferReq.to_office_code, normalizedCmsId, yardStaffValue, transferReq.staff_hrms_id]
        );
    } else {
        // Permanent Transfer / Promotion
        await conn.query(
            `UPDATE div_staff_master
             SET current_office_code = ?, home_office_code = ?, hq_station = ?, current_cms_id = ?, is_yard_staff = ?
             WHERE hrms_id = ?`,
            [transferReq.to_office_code, transferReq.to_office_code, transferReq.to_office_code, normalizedCmsId, yardStaffValue, transferReq.staff_hrms_id]
        );
    }

    // Reporting date at the new lobby (letter default or edited by the
    // receiving lobby) — written back so the NEXT transfer letter's
    // "reporting date of existing lobby" picks it up automatically.
    if (reporting_date) {
        await conn.query(
            'UPDATE div_staff_master SET reporting_date = ? WHERE hrms_id = ?',
            [reporting_date, transferReq.staff_hrms_id]
        );
    }

    // proposed_lobby wiring: the transfer to that lobby is now real, so a
    // MATCHING informational proposed_lobby is confirmed → cleared.
    await conn.query(
        `UPDATE div_cli_nominations
         SET proposed_lobby = NULL
         WHERE staff_hrms_id = ? AND status = 'Active' AND proposed_lobby = ?`,
        [transferReq.staff_hrms_id, transferReq.to_office_code]
    );

    return { isReturningToOriginalCMS, staff_hrms_id: transferReq.staff_hrms_id, transferReq };
}

module.exports = { createPendingTransferRequest, acceptTransferRequest };
