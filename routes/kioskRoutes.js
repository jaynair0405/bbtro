const express = require('express');
const router = express.Router();

const {
  getSlateDisplay,
  getSlateDisplayToken,
  isValidKioskToken
} = require('../utils/kioskDisplays');

function formatLocalDate(date) {
  if (typeof date === 'string') date = new Date(date);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function initBoardBucket() {
  return {
    '00_08': [],
    '08_16': [],
    '16_24': []
  };
}

function initVacancyBucket() {
  return {
    lp: { '00_08': 0, '08_16': 0, '16_24': 0 },
    alp: { '00_08': 0, '08_16': 0, '16_24': 0 }
  };
}

function getSubmittedToken(req) {
  return req.get('x-kiosk-token') || req.query.token || '';
}

function authorizeSlateDisplay(req, res, next) {
  const display = getSlateDisplay(req.params.displayId);
  if (!display) {
    return res.status(404).json({ success: false, error: 'Display not found' });
  }

  const expectedToken = getSlateDisplayToken(display);
  if (!expectedToken) {
    return res.status(503).json({
      success: false,
      error: `Kiosk token is not configured for display ${display.displayId}`
    });
  }

  if (!isValidKioskToken(expectedToken, getSubmittedToken(req))) {
    return res.status(403).json({ success: false, error: 'Kiosk access denied' });
  }

  req.kioskDisplay = display;
  next();
}

router.get('/slate/:displayId/board', authorizeSlateDisplay, async (req, res) => {
  let conn;

  try {
    const display = req.kioskDisplay;
    const startDate = req.query.date || formatLocalDate(new Date());
    const numDays = Math.min(parseInt(req.query.days, 10) || 1, 3);

    conn = await req.app.locals.pool.getConnection();

    const board = {};
    const vacancy = {};

    for (let i = 0; i < numDays; i++) {
      const targetDate = new Date(`${startDate}T00:00:00`);
      targetDate.setDate(targetDate.getDate() + i);
      const dateKey = formatLocalDate(targetDate);

      board[dateKey] = initBoardBucket();
      vacancy[dateKey] = initVacancyBucket();

      await conn.query('CALL sp_generate_daily_slots(?, ?)', [display.officeCode, dateKey]);
    }

    const [slots] = await conn.query(
      `
        SELECT
          ds.id,
          DATE_FORMAT(ds.slot_date, '%Y-%m-%d') AS slot_date,
          TIME_FORMAT(ds.slot_time, '%H:%i:%s') AS slot_time,
          ds.shift_code,
          ds.is_adhoc,
          ds.lp_hrms_id,
          lp.name AS lp_name,
          ds.lp_status,
          ds.lp_exception,
          DATE_FORMAT(ds.lp_signed_on_at, '%Y-%m-%d %H:%i:%s') AS lp_signed_on_at,
          ds.alp_hrms_id,
          alp.name AS alp_name,
          ds.alp_status,
          ds.alp_exception,
          DATE_FORMAT(ds.alp_signed_on_at, '%Y-%m-%d %H:%i:%s') AS alp_signed_on_at,
          TIME_FORMAT(ds.alp_cross_slot_time, '%H:%i:%s') AS alp_cross_slot_time,
          ds.train_no,
          ds.loco_no
        FROM div_daily_slate ds
        LEFT JOIN div_staff_master lp ON ds.lp_hrms_id = lp.hrms_id
        LEFT JOIN div_staff_master alp ON ds.alp_hrms_id = alp.hrms_id
        WHERE ds.office_code = ?
          AND ds.slot_date >= ?
          AND ds.slot_date < DATE_ADD(?, INTERVAL ? DAY)
        ORDER BY ds.slot_date, ds.slot_time, ds.is_adhoc
      `,
      [display.officeCode, startDate, startDate, numDays]
    );

    slots.forEach((slot) => {
      if (!board[slot.slot_date]) {
        board[slot.slot_date] = initBoardBucket();
      }
      if (!vacancy[slot.slot_date]) {
        vacancy[slot.slot_date] = initVacancyBucket();
      }

      if (!slot.lp_hrms_id) vacancy[slot.slot_date].lp[slot.shift_code] += 1;
      if (!slot.alp_hrms_id) vacancy[slot.slot_date].alp[slot.shift_code] += 1;

      board[slot.slot_date][slot.shift_code].push({
        id: slot.id,
        slot_date: slot.slot_date,
        slot_time: slot.slot_time,
        shift_code: slot.shift_code,
        is_adhoc: !!slot.is_adhoc,
        lp_name: slot.lp_name,
        lp_status: slot.lp_status || 'AVAILABLE',
        lp_exception: slot.lp_exception,
        lp_signed_on_at: slot.lp_signed_on_at,
        alp_name: slot.alp_name,
        alp_status: slot.alp_status || 'AVAILABLE',
        alp_exception: slot.alp_exception,
        alp_signed_on_at: slot.alp_signed_on_at,
        alp_cross_slot_time: slot.alp_cross_slot_time,
        train_no: slot.train_no,
        loco_no: slot.loco_no
      });
    });

    res.set('Cache-Control', 'no-store, max-age=0');
    res.json({
      success: true,
      display_id: display.displayId,
      title: display.title,
      office_code: display.officeCode,
      start_date: startDate,
      days: numDays,
      fetched_at: new Date().toISOString(),
      board,
      vacancy
    });
  } catch (error) {
    console.error('Error loading kiosk slate board:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load kiosk slate board'
    });
  } finally {
    if (conn) conn.release();
  }
});

module.exports = router;
