const express = require('express');
const router = express.Router();
const {
    nominationStatusForExit,
    endActiveCliNomination,
    completePendingTransferRequests
} = require('../../utils/staffExit');
const { createPendingTransferRequest, acceptTransferRequest } = require('../../utils/transferRequests');

// Middleware to check authentication
function requireAuth(req, res, next) {
    if (!req.session.user || req.session.user.realm !== 'division') {
        return res.status(401).json({ error: 'Authentication required' });
    }
    next();
}

// GET /api/division/transfer-history/:hrms_id - Get transfer history for a staff
router.get('/transfer-history/:hrms_id', requireAuth, async (req, res) => {
    let conn;
    try {
        const { hrms_id } = req.params;
        conn = await req.app.locals.pool.getConnection();

        const query = `
            SELECT
                th.*,
                o1.office_name as from_office_name,
                o2.office_name as to_office_name
            FROM div_transfer_history th
            LEFT JOIN offices o1 ON th.from_office_code = o1.office_code
            LEFT JOIN offices o2 ON th.to_office_code = o2.office_code
            WHERE th.staff_hrms_id = ?
            ORDER BY th.transfer_date DESC
        `;

        const [results] = await conn.query(query, [hrms_id]);
        conn.release();

        res.json({ success: true, data: results });
    } catch (error) {
        console.error('Error fetching transfer history:', error);
        if (conn) conn.release();
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// POST /api/division/transfer-request - Create transfer request
router.post('/transfer-request', requireAuth, async (req, res) => {
    let conn;
    try {
        const {
            staff_hrms_id,
            from_office_code,
            to_office_code,
            current_cms_id,
            request_date,
            transfer_category,
            remarks
        } = req.body;

        // Validation
        if (!staff_hrms_id || !from_office_code || !to_office_code || !current_cms_id) {
            return res.status(400).json({
                error: 'Missing required fields: staff_hrms_id, from_office_code, to_office_code, current_cms_id'
            });
        }

        if (from_office_code === to_office_code) {
            return res.status(400).json({ error: 'Cannot transfer to the same office' });
        }

        conn = await req.app.locals.pool.getConnection();
        await conn.beginTransaction();

        const effectiveDate = request_date || new Date().toISOString().split('T')[0];
        const category = transfer_category || 'Permanent Transfer';

        // Handle Inter Railway - Auto-approve (no receiving office to accept)
        if (category === 'Inter Railway') {
            // Serialize transfer creation for this staff member. Without the row lock,
            // two simultaneous submissions can both pass the pending check and insert.
            const [staffCheck] = await conn.query(
                'SELECT hrms_id, current_office_code FROM div_staff_master WHERE hrms_id = ? FOR UPDATE',
                [staff_hrms_id]
            );

            if (staffCheck.length === 0) {
                await conn.rollback();
                conn.release();
                return res.status(404).json({ error: 'Staff not found' });
            }

            const [pendingCheck] = await conn.query(
                'SELECT request_id FROM div_transfer_requests WHERE staff_hrms_id = ? AND status = "Pending"',
                [staff_hrms_id]
            );

            if (pendingCheck.length > 0) {
                await conn.rollback();
                conn.release();
                return res.status(409).json({
                    error: 'A pending transfer request already exists for this staff member'
                });
            }

            try {
                // Insert transfer request as Approved
                const [result] = await conn.query(
                    `INSERT INTO div_transfer_requests
                     (staff_hrms_id, from_office_code, to_office_code, transfer_category, current_cms_id,
                      request_date, requested_by, remarks, status, reviewed_by, review_date, created_at)
                     VALUES (?, ?, 'OTHER', ?, ?, ?, ?, ?, 'Approved', ?, CURDATE(), NOW())`,
                    [
                        staff_hrms_id,
                        from_office_code,
                        category,
                        current_cms_id,
                        effectiveDate,
                        req.session.user.username,
                        remarks,
                        req.session.user.username
                    ]
                );

                // Insert into transfer history
                await conn.query(
                    `INSERT INTO div_transfer_history
                     (staff_hrms_id, from_office_code, to_office_code, transfer_category, from_cms_id, to_cms_id,
                      transfer_date, transfer_order_no, transfer_reason,
                      initiated_by, approved_by, status, remarks, created_at)
                     VALUES (?, ?, 'OTHER', ?, ?, ?, CURDATE(), '', ?, ?, ?, 'Completed', ?, NOW())`,
                    [
                        staff_hrms_id,
                        from_office_code,
                        category,
                        current_cms_id,
                        current_cms_id,
                        remarks,
                        req.session.user.username,
                        req.session.user.username,
                        remarks || ''
                    ]
                );

                // Update staff: Set office to OTHER, status to Transferred
                await conn.query(
                    `UPDATE div_staff_master
                     SET current_office_code = 'OTHER', hq_station = NULL, status = 'Transferred'
                     WHERE hrms_id = ?`,
                    [staff_hrms_id]
                );

                // Transfer-out side-effects: strip CLI nomination + complete pending requests
                await endActiveCliNomination(conn, staff_hrms_id, effectiveDate, nominationStatusForExit('Transferred'));
                await completePendingTransferRequests(conn, staff_hrms_id);

                await conn.commit();
                conn.release();

                return res.json({
                    success: true,
                    message: 'Inter Railway transfer completed successfully. Staff marked as Transferred.',
                    request_id: result.insertId,
                    auto_approved: true
                });
            } catch (error) {
                await conn.rollback();
                throw error;
            }
        }

        // For other transfer types - create pending request (shared with Transfer Letter module)
        let requestId;
        try {
            requestId = await createPendingTransferRequest(conn, {
                staff_hrms_id,
                from_office_code,
                to_office_code,
                transfer_category: category,
                current_cms_id,
                request_date: effectiveDate,
                requested_by: req.session.user.username,
                remarks
            });
        } catch (err) {
            if (err && err.code === 'STAFF_NOT_FOUND') {
                await conn.rollback();
                conn.release();
                return res.status(404).json({ error: 'Staff not found' });
            }
            if (err && err.code === 'DUPLICATE_PENDING') {
                await conn.rollback();
                conn.release();
                return res.status(409).json({
                    error: 'A pending transfer request already exists for this staff member'
                });
            }
            throw err;
        }

        await conn.commit();
        conn.release();

        res.json({
            success: true,
            message: 'Transfer request submitted successfully',
            request_id: requestId
        });

    } catch (error) {
        console.error('Error creating transfer request:', error);
        if (conn) {
            try {
                await conn.rollback();
            } catch (rollbackError) {
                console.error('Error rolling back transfer request:', rollbackError);
            }
            conn.release();
        }
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// GET /api/division/transfer-requests/pending - Get pending requests for user's office
router.get('/transfer-requests/pending', requireAuth, async (req, res) => {
    let conn;
    try {
        const userOfficeCode = req.session.user.div_office_code;
        conn = await req.app.locals.pool.getConnection();

        const query = `
            SELECT
                tr.*,
                s.name as staff_name,
                s.designation_id,
                d.designation_name,
                o1.office_name as from_office_name,
                o2.office_name as to_office_name
            FROM div_transfer_requests tr
            JOIN div_staff_master s ON tr.staff_hrms_id = s.hrms_id
            LEFT JOIN designations d ON s.designation_id = d.id
            LEFT JOIN offices o1 ON tr.from_office_code = o1.office_code
            LEFT JOIN offices o2 ON tr.to_office_code = o2.office_code
            WHERE tr.to_office_code = ? AND tr.status = 'Pending'
            ORDER BY tr.request_date DESC
        `;

        const [results] = await conn.query(query, [userOfficeCode]);
        conn.release();

        res.json({ success: true, data: results });
    } catch (error) {
        console.error('Error fetching pending transfer requests:', error);
        if (conn) conn.release();
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// PUT /api/division/transfer-request/:id/accept - Accept transfer request
// (core logic shared with the Transfer Letter bulk-accept: utils/transferRequests.js)
router.put('/transfer-request/:id/accept', requireAuth, async (req, res) => {
    let conn;
    try {
        const { id } = req.params;
        const { new_cms_id, remarks, is_yard_staff, reporting_date } = req.body;

        conn = await req.app.locals.pool.getConnection();
        await conn.beginTransaction();

        let result;
        try {
            result = await acceptTransferRequest(conn, id, {
                new_cms_id, remarks, is_yard_staff, reporting_date,
                reviewed_by: req.session.user.username,
            });

            // Inter Railway = transfer-out of the division: strip CLI nomination
            // + complete any dangling pending requests. In-division transfers
            // (Temporary/Permanent/Promotion) keep the staff Active - no strip.
            if ((result.transferReq.transfer_category || 'Permanent Transfer') === 'Inter Railway') {
                const effectiveDate = new Date().toISOString().split('T')[0];
                await endActiveCliNomination(conn, result.staff_hrms_id, effectiveDate, nominationStatusForExit('Transferred'));
                await completePendingTransferRequests(conn, result.staff_hrms_id);
            }

            await conn.commit();
        } catch (err) {
            await conn.rollback();
            conn.release();
            conn = null;
            if (err && err.code === 'INVALID_CMS') {
                return res.status(400).json({
                    error: 'Invalid CMS ID. Enter letters immediately followed by digits, for example PNVL5545. Spaces, hyphens and other symbols are not allowed.'
                });
            }
            if (err && err.code === 'NOT_FOUND') {
                return res.status(404).json({ error: 'Transfer request not found' });
            }
            if (err && err.code === 'NOT_PENDING') {
                return res.status(400).json({ error: `Cannot accept transfer request with status: ${err.status}` });
            }
            if (err && err.code === 'CMS_TAKEN') {
                return res.status(409).json({ error: `CMS ID ${err.cms} is already assigned to ${err.name} (${err.hrms_id})` });
            }
            throw err;
        }
        conn.release();
        conn = null;

        res.json({
            success: true,
            message: 'Transfer request accepted and staff transferred successfully',
            info: result.isReturningToOriginalCMS ?
                `Staff member has been reassigned their original CMS ID (${new_cms_id.trim().toUpperCase()})` : null
        });

    } catch (error) {
        console.error('Error accepting transfer request:', error);
        if (conn) conn.release();
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// PUT /api/division/transfer-request/:id/reject - Reject transfer request
router.put('/transfer-request/:id/reject', requireAuth, async (req, res) => {
    let conn;
    try {
        const { id } = req.params;
        const { remarks } = req.body;

        conn = await req.app.locals.pool.getConnection();

        // Update transfer request
        const [result] = await conn.query(
            `UPDATE div_transfer_requests
             SET status = 'Rejected', reviewed_by = ?, review_date = CURDATE(), remarks = ?
             WHERE request_id = ? AND status = 'Pending'`,
            [req.session.user.username, remarks || '', id]
        );

        conn.release();

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: 'Transfer request not found or already processed'
            });
        }

        res.json({
            success: true,
            message: 'Transfer request rejected'
        });

    } catch (error) {
        console.error('Error rejecting transfer request:', error);
        if (conn) conn.release();
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// GET /api/division/transfer-activity - Get recent transfer activity (last 30 days)
router.get('/transfer-activity', requireAuth, async (req, res) => {
    let conn;
    try {
        const userOffice = req.session.user.div_office_code;
        const userRole = req.session.user.div_role;
        conn = await req.app.locals.pool.getConnection();

        // For non-admin users, get incoming and outgoing for their office only
        // For admin users, get all transfers
        let outgoingQuery = `
            SELECT COUNT(*) as count
            FROM div_transfer_history
            WHERE transfer_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        `;

        let incomingQuery = `
            SELECT COUNT(*) as count
            FROM div_transfer_history
            WHERE transfer_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        `;

        const outgoingParams = [];
        const incomingParams = [];

        if (userRole !== 'division_admin') {
            outgoingQuery += ' AND from_office_code = ?';
            outgoingParams.push(userOffice);

            incomingQuery += ' AND to_office_code = ?';
            incomingParams.push(userOffice);
        }

        const [outgoingResult] = await conn.query(outgoingQuery, outgoingParams);
        const [incomingResult] = await conn.query(incomingQuery, incomingParams);

        conn.release();

        res.json({
            success: true,
            outgoing: outgoingResult[0].count,
            incoming: incomingResult[0].count,
            total: outgoingResult[0].count + incomingResult[0].count,
            isAdmin: userRole === 'division_admin'
        });

    } catch (error) {
        console.error('Error fetching transfer activity:', error);
        if (conn) conn.release();
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

module.exports = router;
