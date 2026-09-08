-- ============================================================================
-- Eleven of the 13 unmatched motorman nominations, now resolved
-- ============================================================================
--
-- From the 28-Aug list. Each is a MOTORMAN whose identity is settled by
-- evidence, not by a guess:
--
--   sr 267  Mukesh Kumar Mahto      CSTS2007  -> J S KARDAM
--           The sheet has two Mukesh Kumar Mahtos and so does the master.
--           Sheet 253 ("C MAHTO") already matched CSTS2067, so 267 ("R MAHTO")
--           is the other one. Elimination, and both are CSMT-SUB motormen.
--
--   sr 346  RAMESH KUMAR PRASAD     KYNS1681  -> PRAMOD TAPSE
--           Exact name, and a motorman. The sheet's mobile 9004442155 belongs
--           to M U MUJAWAR, an LPM -- the number in the sheet is simply wrong.
--
--   sr 365  Rajendra Kumar Gupta    CSTS2226  -> PRAMOD TAPSE
--           Mobile 9004410739 matches exactly, and he is a CSMT-SUB motorman.
--
--   sr 38   SANTOSH K SAW           PNVS1194  -> A S MARKAND
--           Written "SANTOSH KUMAR SHAW" in the sheet. Confirmed by HQ. The
--           master holds no mobile for him at all, which is why nothing matched
--           on either name or number -- the sheet's 9004442182 was right, there
--           was simply nothing to match it against. Recorded below.
--
--   sr 226  S. T. DALVI             LNLX2399  -> D K MAHTO
--           Written "SANTOSH P DALVI" in the sheet; confirmed by HQ as the same
--           man. "EX GHAT DR" in the old-CLI column fits LNL, and the mobiles
--           differ by a transposition: 9004442325 against 9004442235.
--           He has ALSO moved -- see the correction below.
--
--   sr 412  PRAMOD KUMAR            PNVS1196  -> R K RAI
--           Already his CLI, so this row confirms rather than moves; it is here
--           so the run reports it rather than leaving it unaccounted for.
--           No search could find him: the sheet spells the name with GREEK
--           letters -- "MAΗΤΟ" uses Greek Η and Ο, not Latin H and O -- so no
--           LIKE '%MAHTO%' would ever match. Worth fixing in the workbook.
--
--   sr 736  Amit Kumar Sharma       CSTS2106  -> V B TELI
--           The sheet holds two Amit Kumar Sharmas and so does the master.
--           Sheet 563 (HQ PNVL) matched PNVS1170 on an exact mobile, so 736
--           (HQ CSMT) is the other -- CSMT-SUB, and "Batch No.74" fits someone
--           recently promoted, which is why the master has no mobile for him.
--           Confirmed by HQ, who also supplied the missing mobile.
--
--   sr 742  SAMAR JEET BHARTI       CSTS2266  -> V B TELI
--           A CSMT-SUB motorman. Missed because the sheet spaces the name
--           differently ("SAMARJEET") and carries a mobile, 9004413135, that
--           is not his. HQ CSMT matches CSMT-SUB.
--
--   sr 759  RAJ KUMAR               KYNS1597  -> VINOD KUMAR D
--           A KYN-SUB motorman, which matches the sheet's HQ. The sheet carries
--           9004442635 for him, which is C VASUDEVAN S's number and already
--           matched sheet row 101 -- the sheet holds that mobile twice. HQ gave
--           his real one, 9004442654, and it is KYNS1597's. No other sheet row
--           claims it.
--
--   sr 772  Rajkumar Pal            CSTS2103  -> VINOD KUMAR D
--
--   sr 778  Kumar Gaurav            KYN5716   -> VINOD KUMAR D
--           Confirmed by HQ. The master still has him as an LPG at KYN-ML --
--           "BATCH NO 80" in the old-CLI column is the promotion course, and
--           his transfer has not been entered yet. HQ is doing that separately.
--           Nominating him now is safe and deliberate: a CLI's own nominees are
--           always selectable whatever their designation or lobby, so he can be
--           counselled today. He will simply be counted in the LPG column on
--           the officers' sheet until the transfer lands.
--           Name matches, CSMT-SUB motorman, and the sheet's HQ says CSMT.
--           The master holds no mobile for him, which is why the join missed.
--
-- The other nine are NOT here. Four need a decision that is not mine to make
-- and five are not in the master at all; both lists are at the foot of the file.
--
-- Same shape as the 28-Aug load: expire the outgoing nomination with a date so
-- it can be restored, insert the new one, keep current_cli_id in step. The
-- NOT EXISTS guard matters for the same reason it did there -- uniq_cli_nomination
-- is (staff, cli, from_date), so ON DUPLICATE KEY alone does not catch someone
-- already nominated to this CLI on an earlier date.
--
-- SAFE TO RE-RUN.
--   mysql -u railway_user -p bbtro < sql/2026-09-07_nominate_resolved_four.sql
-- ============================================================================

DROP TABLE IF EXISTS stg_nom_resolved4;
CREATE TABLE stg_nom_resolved4 (
  sr INT, staff_cms VARCHAR(15), new_cli_cmsid VARCHAR(15), note VARCHAR(120)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
-- staff_cms is matched against original_cms_id OR current_cms_id, because
-- S. T. DALVI's current id is corrected in this same run.
INSERT INTO stg_nom_resolved4 (sr, staff_cms, new_cli_cmsid, note) VALUES
  (38,  'PNVS1194', 'CSTM0108', 'SANTOSH K SAW, written SANTOSH KUMAR SHAW; confirmed by HQ'),
  (226, 'LNLX2399', 'CSTM0059', 'S. T. DALVI, written SANTOSH P DALVI in the sheet'),
  (267, 'CSTS2007', 'CSTM0083', 'the other Mukesh Kumar Mahto; 253 took CSTS2067'),
  (346, 'KYNS1681', 'CSTM0122', 'exact name; sheet mobile belongs to M U MUJAWAR'),
  (365, 'CSTS2226', 'CSTM0122', 'mobile 9004410739 matches exactly'),
  (412, 'PNVS1196', 'CSTM0007', 'PRAMOD KUMAR; already with R K RAI, confirming only'),
  (736, 'CSTS2106', 'CSTM0116', 'the CSMT one; 563 took PNVS1170. Confirmed by HQ'),
  (742, 'CSTS2266', 'CSTM0116', 'SAMAR JEET vs SAMARJEET; sheet mobile is not his'),
  (759, 'KYNS1597', 'CSTM0027', 'RAJ KUMAR, KYN-SUB motorman; HQ gave mobile 9004442654'),
  (772, 'CSTS2103', 'CSTM0027', 'name and lobby match; master holds no mobile'),
  (778, 'KYN5716',  'CSTM0027', 'Kumar Gaurav, confirmed by HQ; transfer to CSMT-SUB pending');

-- ---- pre-flight ------------------------------------------------------------
SELECT s.sr, s.staff_cms, m.name AS staff_name, d.designation_code, m.current_office_code,
       c.cli_name AS new_cli, c.current_office_code AS cli_office,
       cc.cli_name AS currently_nominated_to,
       CASE WHEN m.hrms_id IS NULL THEN '*** staff not found'
            WHEN c.cli_id  IS NULL THEN '*** CLI not found'
            WHEN m.current_cli_id = c.cli_id THEN 'already there, will skip'
            ELSE 'will move' END AS verdict
FROM stg_nom_resolved4 s
LEFT JOIN div_staff_master m ON (m.current_cms_id = s.staff_cms OR m.original_cms_id = s.staff_cms)
LEFT JOIN designations d ON d.id = m.designation_id
LEFT JOIN div_cli_master c ON c.cmsid = s.new_cli_cmsid AND c.is_active = 1
LEFT JOIN div_cli_master cc ON cc.cli_id = m.current_cli_id
ORDER BY s.sr;

CREATE TABLE IF NOT EXISTS bak_20260907_nom4 AS
SELECT m.hrms_id, m.name, m.current_cli_id
FROM div_staff_master m JOIN stg_nom_resolved4 s ON (s.staff_cms = m.current_cms_id OR s.staff_cms = m.original_cms_id);

-- ---- S. T. DALVI has moved and the master has not caught up ---------------
-- HQ gives his current CMS ID as CSTS1865; the master still holds LNLX2399 and
-- posts him at LNL. A CSTS prefix belongs to CSMT-SUB, so the office moves with
-- the ID: leaving a CSTS id at LNL breaks the CMS-to-office invariant, and he
-- would keep being counted on the LNL row of the officers' sheet, not CSMT.
--
-- original_cms_id stays LNLX2399. That column remembers where someone started,
-- and it is UNIQUE, so it must not be rewritten.
--
-- IF THE OFFICE MOVE IS WRONG, delete the second UPDATE and re-run. The CMS ID
-- correction stands on its own.
SELECT 'is CSTS1865 already held by someone else?' AS check_name, COUNT(*) AS n
FROM div_staff_master WHERE current_cms_id = 'CSTS1865' AND original_cms_id <> 'LNLX2399';

START TRANSACTION;

UPDATE div_staff_master SET current_cms_id = 'CSTS1865'
 WHERE original_cms_id = 'LNLX2399' AND current_cms_id = 'LNLX2399';

UPDATE div_staff_master SET current_office_code = 'CSMT-SUB'
 WHERE original_cms_id = 'LNLX2399' AND current_office_code = 'LNL';

-- Mobiles the master was missing. Worth recording while they are known: the
-- number is the only reliable key for matching these lists, and its absence is
-- why both of these rows had to be resolved by hand.
--
-- Each is written ONLY if no one else already holds it. A shared mobile is what
-- made three rows of this list match the wrong man, so adding another would be
-- repeating the mistake we spent the morning undoing.
UPDATE div_staff_master SET cug_number = '9004442330'
 WHERE current_cms_id = 'CSTS2106' AND (cug_number IS NULL OR cug_number = '')
   AND NOT EXISTS (SELECT 1 FROM (SELECT 1 FROM div_staff_master x
        WHERE RIGHT(REPLACE(IFNULL(x.cug_number,''),' ',''),10) = '9004442330') y);

UPDATE div_staff_master SET cug_number = '9004442182'
 WHERE current_cms_id = 'PNVS1194' AND (cug_number IS NULL OR cug_number = '')
   AND NOT EXISTS (SELECT 1 FROM (SELECT 1 FROM div_staff_master x
        WHERE RIGHT(REPLACE(IFNULL(x.cug_number,''),' ',''),10) = '9004442182') y);

UPDATE div_staff_master SET cug_number = '9004442211'
 WHERE current_cms_id = 'PNVS1196' AND (cug_number IS NULL OR cug_number = '')
   AND NOT EXISTS (SELECT 1 FROM (SELECT 1 FROM div_staff_master x
        WHERE RIGHT(REPLACE(IFNULL(x.cug_number,''),' ',''),10) = '9004442211') y);

UPDATE div_cli_nominations n
  JOIN div_staff_master m ON m.hrms_id = n.staff_hrms_id
  JOIN stg_nom_resolved4 s ON (s.staff_cms = m.current_cms_id OR s.staff_cms = m.original_cms_id)
  JOIN div_cli_master c ON c.cmsid = s.new_cli_cmsid
   SET n.status = 'Expired', n.nominated_to_date = CURDATE(),
       n.updated_by = 'nom-resolved4', n.updated_at = NOW()
 WHERE n.status = 'Active' AND n.cli_id <> c.cli_id;

INSERT INTO div_cli_nominations
    (staff_hrms_id, cli_id, nominated_from_date, status, remarks, created_by, created_at)
SELECT m.hrms_id, c.cli_id, CURDATE(), 'Active',
       CONCAT('Motorman nomination list 28-08-2026, sr ', s.sr, ' (resolved by hand)'),
       'nom-resolved4', NOW()
  FROM stg_nom_resolved4 s
  JOIN div_staff_master m ON (m.current_cms_id = s.staff_cms OR m.original_cms_id = s.staff_cms)
  JOIN div_cli_master c ON c.cmsid = s.new_cli_cmsid
 WHERE NOT EXISTS (
   SELECT 1 FROM div_cli_nominations n
    WHERE n.staff_hrms_id = m.hrms_id AND n.cli_id = c.cli_id AND n.status = 'Active');

UPDATE div_staff_master m
  JOIN stg_nom_resolved4 s ON (s.staff_cms = m.current_cms_id OR s.staff_cms = m.original_cms_id)
  JOIN div_cli_master c ON c.cmsid = s.new_cli_cmsid
   SET m.current_cli_id = c.cli_id;

COMMIT;

-- ---- verify ----------------------------------------------------------------
SELECT s.sr, m.name, m.current_cms_id, c.cli_name AS now_nominated_to,
       IF(m.current_cli_id = c.cli_id, 'ok', '*** did not move') AS verdict
FROM stg_nom_resolved4 s
JOIN div_staff_master m ON (m.current_cms_id = s.staff_cms OR m.original_cms_id = s.staff_cms)
JOIN div_cli_master c ON c.cmsid = s.new_cli_cmsid
LEFT JOIN div_cli_master cn ON cn.cli_id = m.current_cli_id
ORDER BY s.sr;

SELECT 'mobiles now recorded' AS check_name, GROUP_CONCAT(CONCAT(current_cms_id,'=',cug_number)) AS n
FROM div_staff_master WHERE current_cms_id IN ('CSTS2106','PNVS1194','PNVS1196')
UNION ALL
SELECT 'left with more than one active nomination (must be 0)', COUNT(*) FROM (
  SELECT n.staff_hrms_id FROM div_cli_nominations n
   JOIN div_staff_master m ON m.hrms_id = n.staff_hrms_id
   JOIN stg_nom_resolved4 s ON (s.staff_cms = m.current_cms_id OR s.staff_cms = m.original_cms_id)
  WHERE n.status = 'Active' GROUP BY n.staff_hrms_id HAVING COUNT(*) > 1) x;

-- ============================================================================
-- STILL OPEN -- one that needs a decision:
--   sr 778  KUMAR GAURAV          -> VINOD KUMAR D
--           Kumar Gaurav (KYN5716) is an LPG at KYN-ML; the sheet says CSMT.
--
-- STALE ROWS -- in the master, but off the running roster. No nomination:
--   sr 384  A S SHELAR      CSTS1066  MOTORMAN CSMT-SUB  Retired
--           Exact name AND exact mobile. Missed only because every earlier
--           search filtered status='Active'.
--   sr 54   SANTOSH GHODKE  KYN2787   LPG      KYN-ML    Drafted/Ex-Cadre
--
-- ALL 13 ACCOUNTED FOR. Eleven nominated above; two are stale rows for staff
-- off the running roster, listed just above.

--
-- ROLLBACK
-- DELETE FROM div_cli_nominations WHERE created_by = 'nom-resolved4';
-- UPDATE div_cli_nominations n JOIN div_staff_master m ON m.hrms_id = n.staff_hrms_id
--   JOIN stg_nom_resolved4 s ON (s.staff_cms = m.current_cms_id OR s.staff_cms = m.original_cms_id)
--   SET n.status='Active', n.nominated_to_date=NULL WHERE n.updated_by='nom-resolved4';
-- UPDATE div_staff_master m JOIN bak_20260907_nom4 b ON b.hrms_id = m.hrms_id
--   SET m.current_cli_id = b.current_cli_id;
-- ============================================================================
