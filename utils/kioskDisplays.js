const crypto = require('crypto');

const kioskSlateDisplays = {
  'pnvl-office': {
    displayId: 'pnvl-office',
    officeCode: 'PNVL-ML',
    title: 'PNVL Booking Slate',
    tokenEnvVar: 'KIOSK_PNVL_SLATE_TOKEN'
  }
};

function getSlateDisplay(displayId) {
  return kioskSlateDisplays[displayId] || null;
}

function getSlateDisplayToken(display) {
  if (!display?.tokenEnvVar) return '';
  return (process.env[display.tokenEnvVar] || '').trim();
}

function isValidKioskToken(expectedToken, suppliedToken) {
  const expected = (expectedToken || '').trim();
  const supplied = (suppliedToken || '').trim();

  if (!expected || !supplied) return false;

  const expectedBuffer = Buffer.from(expected);
  const suppliedBuffer = Buffer.from(supplied);

  if (expectedBuffer.length !== suppliedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, suppliedBuffer);
}

module.exports = {
  kioskSlateDisplays,
  getSlateDisplay,
  getSlateDisplayToken,
  isValidKioskToken
};
