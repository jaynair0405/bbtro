const express = require('express');
const router = express.Router();

// GET /api/division/offices - Get all offices
router.get('/offices', async (req, res) => {
    try {
        const conn = await req.app.locals.pool.getConnection();
        const query = 'SELECT * FROM offices WHERE is_active = 1 ORDER BY office_name';
        const [results] = await conn.query(query);
        conn.release();
        
        res.json({ success: true, data: results });
    } catch (error) {
        console.error('Error fetching offices:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// GET /api/division/staff - Get staff by office
router.get('/staff', async (req, res) => {
    try {
        const { office_code } = req.query;
        const conn = await req.app.locals.pool.getConnection();
        
        let query = `
            SELECT s.hrms_id, s.name, s.current_cms_id, o.office_name, d.designation_name,
                   s.safety_category, s.assignment_status
            FROM div_staff_master s
            JOIN offices o ON s.current_office_code = o.office_code
            JOIN designations d ON s.designation_id = d.id
        `;
        
        const params = [];
        if (office_code) {
            query += ' WHERE s.current_office_code = ?';
            params.push(office_code);
        }
        
        query += ' ORDER BY o.office_name, s.name';
        
        const [results] = await conn.query(query, params);
        conn.release();
        
        res.json({ success: true, data: results });
    } catch (error) {
        console.error('Error fetching staff:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// GET /api/division/transfer-requests - Get pending transfers
router.get('/transfer-requests', async (req, res) => {
    try {
        const conn = await req.app.locals.pool.getConnection();
        const query = `
            SELECT tr.request_id, tr.staff_hrms_id, s.name, 
                   tr.from_office_code, tr.to_office_code, tr.request_date, tr.status
            FROM div_transfer_requests tr
            JOIN div_staff_master s ON tr.staff_hrms_id = s.hrms_id
            WHERE tr.status = 'Pending'
            ORDER BY tr.request_date DESC
        `;
        
        const [results] = await conn.query(query);
        conn.release();
        
        res.json({ success: true, data: results });
    } catch (error) {
        console.error('Error fetching transfer requests:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

module.exports = router;