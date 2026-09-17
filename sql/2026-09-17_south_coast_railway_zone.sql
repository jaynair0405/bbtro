-- 2026-09-17 — six sheds move to South Coast Railway (SCOR)
--
-- WHAT THIS IS
-- Not a thousand individual transfers. South Coast Railway was carved out of
-- South Central and East Coast, and six loco sheds went with it. Our master
-- predates the split, so it still files those sheds under their old zones:
--
--     BZAD, BZAE, GTLE, GYD   we say SCR    official says SCOR
--     WATD, WATE              we say ECOR   official says SCOR
--
-- Confirmed against the official IR loco database (loco_17-09, 2026-09-17):
-- every loco that sheet places at these sheds it also places in SCOR, and
-- every loco it places in SCOR is at one of these six sheds. So this is
-- expressed BY SHED, which is both the real-world reason and far easier to
-- check than 1,093 loco numbers.
--
-- WHY ZONE MATTERS HERE
-- railway_zone is what the board shows beside a loco and what a controller
-- reads when deciding whether an engine is far from home. It does not feed the
-- mis-link check (that compares home_shed), so this is a correctness and
-- legibility fix rather than a behavioural one.
--
-- THE ONE EXCEPTION, deliberately excluded
-- 34 locos we hold at WATD are placed by the official sheet at ANGE, still in
-- ECOR. They are moving SHED, not zone, so they belong with the individual
-- transfers and must not be swept into SCOR here.
--
-- Three locos at these sheds are unknown to the official sheet. They are moved
-- anyway: the shed is what determines the zone, and they sit at these sheds in
-- our own data.

-- Step 1 — preview. Expect SCR 605 and ECOR 522 across the six sheds.
SELECT home_shed, railway_zone, COUNT(*) AS locos
FROM div_locos
WHERE home_shed IN ('BZAD','BZAE','GTLE','GYD','WATD','WATE')
GROUP BY home_shed, railway_zone
ORDER BY home_shed, railway_zone;

-- Step 2 — move the six sheds to SCOR, less the 34 that are leaving WATD.
UPDATE div_locos
SET railway_zone = 'SCOR'
WHERE home_shed IN ('BZAD','BZAE','GTLE','GYD','WATD','WATE')
  AND railway_zone <> 'SCOR'
  AND loco_number NOT IN (
      -- these 34 move WATD -> ANGE and stay in ECOR (see the transfers file)
      '32945','33055','33302','33353','33416','33418','33421','33427','33443',
      '33447','33458','33459','33483','33543','33816','41276','41277','41280',
      '41281','41285','41298','41299','41302','41303','41307','41308','41314',
      '41315','41325','41327','41335','41336','41489','41528');

-- Step 3 — verify. The six sheds should now read SCOR only, except the 34
-- still at WATD in ECOR until the transfers file moves them to ANGE.
SELECT home_shed, railway_zone, COUNT(*) AS locos
FROM div_locos
WHERE home_shed IN ('BZAD','BZAE','GTLE','GYD','WATD','WATE')
GROUP BY home_shed, railway_zone
ORDER BY home_shed, railway_zone;

SELECT railway_zone, COUNT(*) AS locos FROM div_locos
WHERE railway_zone IN ('SCOR','SCR','ECOR') GROUP BY railway_zone ORDER BY railway_zone;

-- Rollback (restores the pre-split zones by shed):
-- UPDATE div_locos SET railway_zone='SCR'
--   WHERE home_shed IN ('BZAD','BZAE','GTLE','GYD') AND railway_zone='SCOR';
-- UPDATE div_locos SET railway_zone='ECOR'
--   WHERE home_shed IN ('WATD','WATE') AND railway_zone='SCOR';
