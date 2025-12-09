const express = require('express');
const router = express.Router();

// Middleware to check authentication
function requireAuth(req, res, next) {
    if (!req.session.user || req.session.user.realm !== 'division') {
        return res.status(401).json({ error: 'Authentication required' });
    }
    next();
}

// GET /api/division/transfer-history/:hrms_id - Get transfer history for a staff
router.get('/transfer-history/:hrms_id', requireAuth, async (req, res) => {
    try {
        const { hrms_id } = req.params;
        const conn = await req.app.locals.pool.getConnection();

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
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// POST /api/division/transfer-request - Create transfer request
router.post('/transfer-request', requireAuth, async (req, res) => {
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

        const conn = await req.app.locals.pool.getConnection();

        // Check if staff exists
        const [staffCheck] = await conn.query(
            'SELECT hrms_id, current_office_code FROM div_staff_master WHERE hrms_id = ?',
            [staff_hrms_id]
        );

        if (staffCheck.length === 0) {
            conn.release();
            return res.status(404).json({ error: 'Staff not found' });
        }

        // Check for pending transfer request
        const [pendingCheck] = await conn.query(
            'SELECT request_id FROM div_transfer_requests WHERE staff_hrms_id = ? AND status = "Pending"',
            [staff_hrms_id]
        );

        if (pendingCheck.length > 0) {
            conn.release();
            return res.status(409).json({
                error: 'A pending transfer request already exists for this staff member'
            });
        }

        // Insert transfer request
        const [result] = await conn.query(
            `INSERT INTO div_transfer_requests
             (staff_hrms_id, from_office_code, to_office_code, transfer_category, current_cms_id,
              request_date, requested_by, remarks, status, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending', NOW())`,
            [
                staff_hrms_id,
                from_office_code,
                to_office_code,
                transfer_category || 'Permanent Transfer',
                current_cms_id,
                request_date || new Date().toISOString().split('T')[0],
                req.session.user.username,
                remarks
            ]
        );

        conn.release();

        res.json({
            success: true,
            message: 'Transfer request submitted successfully',
            request_id: result.insertId
        });

    } catch (error) {
        console.error('Error creating transfer request:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// GET /api/division/transfer-requests/pending - Get pending requests for user's office
router.get('/transfer-requests/pending', requireAuth, async (req, res) => {
    try {
        const userOfficeCode = req.session.user.div_office_code;
        const conn = await req.app.locals.pool.getConnection();

        const query = `
            SELECT
                tr.*,
                s.name as staff_name,
                o1.office_name as from_office_name,
                o2.office_name as to_office_name
            FROM div_transfer_requests tr
            JOIN div_staff_master s ON tr.staff_hrms_id = s.hrms_id
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
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// PUT /api/division/transfer-request/:id/accept - Accept transfer request
router.put('/transfer-request/:id/accept', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { new_cms_id, remarks } = req.body;

        if (!new_cms_id || !new_cms_id.trim()) {
            return res.status(400).json({ error: 'New CMS ID is required' });
        }

        const conn = await req.app.locals.pool.getConnection();

        await conn.beginTransaction();

        try {
            // Get transfer request details FIRST
            const [request] = await conn.query(
                'SELECT * FROM div_transfer_requests WHERE request_id = ?',
                [id]
            );

            if (request.length === 0) {
                await conn.rollback();
                conn.release();
                return res.status(404).json({ error: 'Transfer request not found' });
            }

            const transferReq = request[0];

            if (transferReq.status !== 'Pending') {
                await conn.rollback();
                conn.release();
                return res.status(400).json({
                    error: `Cannot accept transfer request with status: ${transferReq.status}`
                });
            }

            // NOW check for duplicate CMS ID (after we have transferReq.staff_hrms_id)
            const [duplicateCheck] = await conn.query(
                'SELECT hrms_id, name FROM div_staff_master WHERE current_cms_id = ? OR original_cms_id = ?',
                [new_cms_id.trim().toUpperCase(), new_cms_id.trim().toUpperCase()]
            );

            let isReturningToOriginalCMS = false;

            if (duplicateCheck.length > 0) {
                // Check if the CMS ID belongs to the same staff member (same HRMS ID)
                const existingStaff = duplicateCheck[0];

                if (existingStaff.hrms_id !== transferReq.staff_hrms_id) {
                    // CMS ID is assigned to a DIFFERENT staff member - BLOCK
                    await conn.rollback();
                    conn.release();
                    return res.status(409).json({
                        error: `CMS ID ${new_cms_id.toUpperCase()} is already assigned to ${existingStaff.name} (${existingStaff.hrms_id})`
                    });
                } else {
                    // CMS ID was originally assigned to THIS staff member - ALLOW with info
                    isReturningToOriginalCMS = true;
                }
            }

            // Update transfer request
            await conn.query(
                `UPDATE div_transfer_requests
                 SET status = 'Approved', proposed_cms_id = ?,
                     reviewed_by = ?, review_date = CURDATE()
                 WHERE request_id = ?`,
                [new_cms_id.trim().toUpperCase(), req.session.user.username, id]
            );

            // Insert into transfer history
            await conn.query(
                `INSERT INTO div_transfer_history
                 (staff_hrms_id, from_office_code, to_office_code, transfer_category, from_cms_id, to_cms_id,
                  transfer_date, transfer_order_no, transfer_reason,
                  initiated_by, approved_by, status, remarks, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, CURDATE(), '', ?, ?, ?, 'Completed', ?, NOW())`,
                [
                    transferReq.staff_hrms_id,
                    transferReq.from_office_code,
                    transferReq.to_office_code,
                    transferReq.transfer_category || 'Permanent Transfer',
                    transferReq.current_cms_id,
                    new_cms_id.trim().toUpperCase(),
                    transferReq.remarks,
                    transferReq.requested_by,
                    req.session.user.username,
                    remarks || ''
                ]
            );

            // Determine what to update based on transfer category
            const category = transferReq.transfer_category || 'Permanent Transfer';
            let staffUpdate = '';
            let staffParams = [];

            if (category === 'Inter Railway') {
                // Inter Railway: Set office to OTHER, preserve home_office_code, set status to Transferred
                staffUpdate = `UPDATE div_staff_master
                               SET current_office_code = 'OTHER', hq_station = NULL, current_cms_id = ?, status = 'Transferred'
                               WHERE hrms_id = ?`;
                staffParams = [new_cms_id.trim().toUpperCase(), transferReq.staff_hrms_id];
            } else if (category === 'Temporary Transfer') {
                // Temporary: Update current_office_code only, keep home_office_code unchanged
                staffUpdate = `UPDATE div_staff_master
                               SET current_office_code = ?, hq_station = ?, current_cms_id = ?
                               WHERE hrms_id = ?`;
                staffParams = [transferReq.to_office_code, transferReq.to_office_code, new_cms_id.trim().toUpperCase(), transferReq.staff_hrms_id];
            } else if (category === 'Permanent Transfer' || category === 'Promotion') {
                // Permanent/Promotion: Update both current and home office
                staffUpdate = `UPDATE div_staff_master
                               SET current_office_code = ?, home_office_code = ?, hq_station = ?, current_cms_id = ?
                               WHERE hrms_id = ?`;
                staffParams = [transferReq.to_office_code, transferReq.to_office_code, transferReq.to_office_code, new_cms_id.trim().toUpperCase(), transferReq.staff_hrms_id];
            }

            await conn.query(staffUpdate, staffParams);

            await conn.commit();
            conn.release();

            res.json({
                success: true,
                message: 'Transfer request accepted and staff transferred successfully',
                info: isReturningToOriginalCMS ?
                    `Staff member has been reassigned their original CMS ID (${new_cms_id.toUpperCase()})` : null
            });

        } catch (error) {
            await conn.rollback();
            conn.release();
            throw error;
        }

    } catch (error) {
        console.error('Error accepting transfer request:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// PUT /api/division/transfer-request/:id/reject - Reject transfer request
router.put('/transfer-request/:id/reject', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { remarks } = req.body;

        const conn = await req.app.locals.pool.getConnection();

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
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// GET /api/division/transfer-activity - Get recent transfer activity (last 30 days)
router.get('/transfer-activity', requireAuth, async (req, res) => {
    try {
        const userOffice = req.session.user.div_office_code;
        const userRole = req.session.user.div_role;
        const conn = await req.app.locals.pool.getConnection();

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
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

module.exports = router;
