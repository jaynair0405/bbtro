-- ============================================================================
-- PF number corrections (div_staff_master.pf_number) - 2026-10-05
-- ============================================================================
-- Found while matching MTC KYN Automatic letters by PF: in each case the letter
-- PF was right and the master was wrong. Values confirmed on the HRMS portal.
-- pf_number is not a key and has no FKs -> plain UPDATEs, no transaction needed.
-- Each UPDATE is guarded on the OLD value, so a re-run (or an already-corrected
-- row) is a 0-row no-op. Safe to run one-shot: mysql < file.
-- ============================================================================

-- BEFORE
SELECT hrms_id, name, pf_number FROM div_staff_master
WHERE hrms_id IN ('LLGBHZ','NUDISO','SLMFQY','LSZKOU','RMBXPL','XDEIGK','ACDKUH') ORDER BY hrms_id;

UPDATE div_staff_master SET pf_number = '00201872709' WHERE hrms_id = 'LLGBHZ' AND pf_number = '1872709';      -- S A KUMBHAR: "20" dropped
UPDATE div_staff_master SET pf_number = '00202256710' WHERE hrms_id = 'NUDISO' AND pf_number = '2256710';      -- V S SHINDE: "20" dropped
UPDATE div_staff_master SET pf_number = '00211035225' WHERE hrms_id = 'SLMFQY' AND pf_number = '11035225';     -- SURESH KUMAR: "2" dropped
UPDATE div_staff_master SET pf_number = '00214584372' WHERE hrms_id = 'LSZKOU' AND pf_number = '2014584372';   -- Sanjay C Shukla: extra "0"
UPDATE div_staff_master SET pf_number = '00219488191' WHERE hrms_id = 'RMBXPL' AND pf_number = '19488191';     -- M J JADHAV: "2" dropped
UPDATE div_staff_master SET pf_number = '00229808791' WHERE hrms_id = 'XDEIGK' AND pf_number = '002298808791'; -- DHARMENDRA KUMAR: extra "8"
UPDATE div_staff_master SET pf_number = '50813882735' WHERE hrms_id = 'ACDKUH' AND pf_number = '50893882735';  -- RAHUL KHANDAGALE: "9" -> "1"

-- AFTER: all 7 should show the corrected PF
SELECT hrms_id, name, pf_number FROM div_staff_master
WHERE hrms_id IN ('LLGBHZ','NUDISO','SLMFQY','LSZKOU','RMBXPL','XDEIGK','ACDKUH') ORDER BY hrms_id;
