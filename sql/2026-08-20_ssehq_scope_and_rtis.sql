-- =====================================================================
-- SSE-HQ: RTIS access flag
--
-- The scoping itself is in server.js (an allowlist of pages under /div and
-- of paths under /api/division, keyed on div_role = 'ssehq'), because the
-- SSE-HQ pages live under /div and so cannot be fenced off with the blunt
-- redirect that scopes CTLC to the Control Office portal.
--
-- This file carries only the account flag that goes with it.
--
-- NOTE on can_access_rtis: the column is written by the user-seeding SQL
-- files but is not read anywhere in this application — /spm/rtis is guarded
-- on realm alone (server.js), unlike /spm/sub-spm which does check
-- can_access_sub_spm. It is set here so the account's record states the
-- intent, and so it is already correct if the RTIS app (which reads this
-- database directly) starts enforcing it. Do NOT rely on this flag as the
-- access control; the guard in server.js is what actually decides.
-- =====================================================================

UPDATE users
   SET can_access_rtis = 1
 WHERE username = 'ssehq' AND realm = 'division' AND div_role = 'ssehq';

-- verify
SELECT username, div_role, div_office_code, can_access_rtis, can_access_sub_spm
  FROM users WHERE div_role = 'ssehq';
