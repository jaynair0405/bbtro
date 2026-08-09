-- ============================================================================
-- Cadre Management — HQ CLI (Cadre) letter platform — schema + type catalogue
-- Date: 2026-08-07
--
-- The HQ CLI cadre desk writes its correspondence in MS Word on a network
-- share (\\10.31.212.176\mydoc\word\tech 04.doc). Every letter is the same
-- skeleton with different fillings:
--
--   मध्य रेल                      <office header block, 3 Devanagari lines>
--   No. BB.TRSO.TECH.04/0x        Date : dd.mm.yyyy
--   <addressee>                   Sr.DPO | DRM(P) | Principal ZRTI/BSL |
--                                 Dy.CEE(OP) | MTC/DTC KYN | ALL CONCERNED
--             <banner>            optional: NOTE | Reminder – I | *******
--       Sub: …   Ref: …
--   <body paragraphs>
--   <table>                       columns vary by letter type
--                                 <signature block>
--   Encl: …    C/- …              optional
--   ADEE (TRO) / DEE (TRO) / Sr.DEE (TRO)      NOTE types only
--
-- Only the table columns really vary, so the letter TYPES are seeded data
-- (div_cadre_letter_types) rather than code: a type carries the defaults and
-- a JSON column schema, and every one of them is overridable on the letter.
--
-- Lifecycle: draft -> finalized. On finalize the rendered letter is filed
-- into div_documents as source_type='composed' (category CADRE_LETTER,
-- folder = family). NOT a pdfkit PDF: pdfkit's built-in fonts are WinAnsi
-- and cannot render Devanagari (see utils/transferLetterPdf.js:5-7), and
-- these letters are Devanagari in the letterhead, addressee AND signature.
--
-- Unlike div_transfer_letters this module does NOT route anything inside the
-- portal — no receiver, no div_transfer_requests. The letter is prepared,
-- printed, and leaves on paper.
--
-- IDEMPOTENT: safe to re-run. CREATE IF NOT EXISTS + guarded ENUM ALTER +
-- INSERT IGNORE for the seeds (so hand-edits to types survive a re-run).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Letter type catalogue
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS div_cadre_letter_types (
    type_code           VARCHAR(40) NOT NULL PRIMARY KEY,
    type_name           VARCHAR(120) NOT NULL,
    family              ENUM('TRANSFER','POSTING','TRAINING','CADRE','MISC') NOT NULL,
    doc_kind            ENUM('LETTER','NOTE') NOT NULL DEFAULT 'LETTER',
    letter_series       VARCHAR(20)  DEFAULT NULL,  -- transfer / promotion / posting / training / misc
    banner_text         VARCHAR(60)  DEFAULT NULL,  -- centred line: 'NOTE', 'Reminder – I', '*******'
    addressee_text      VARCHAR(255) DEFAULT NULL,  -- newline-separated, English
    addressee_text_hi   VARCHAR(255) DEFAULT NULL,  -- newline-separated, Devanagari (preferred when set)
    subject_tpl         VARCHAR(255) DEFAULT NULL,
    ref_tpl             VARCHAR(500) DEFAULT NULL,  -- newline-separated Ref: lines
    body_tpl            TEXT,                       -- paragraphs, blank-line separated, carries {{tokens}}
    footer_tpl          TEXT,                       -- closing paragraph(s), printed AFTER the table
    table_schema        JSON DEFAULT NULL,          -- {"columns":[…]}  NULL = no staff table
    aux_schema          JSON DEFAULT NULL,          -- non-staff grids (Reminder stats, day-wise schedule)
    encl_text           VARCHAR(255) DEFAULT NULL,
    cc_text             TEXT,                       -- newline-separated C/- lines
    approval_chain_text VARCHAR(255) DEFAULT NULL,  -- NOTE routing, newline-separated
    signing_designation       VARCHAR(100) DEFAULT NULL,
    signing_designation_hindi VARCHAR(100) DEFAULT NULL,
    -- Place line under the signature. NULL on purpose for the NOTE types:
    -- an internal note is signed "CLI (Cader ) CSMT" with no place line.
    signing_place       VARCHAR(60)  DEFAULT NULL,
    office_header_text  VARCHAR(255) DEFAULT NULL,  -- the 3-line Devanagari right block
    is_active           TINYINT(1) NOT NULL DEFAULT 1,
    sort_order          INT NOT NULL DEFAULT 100,
    created_at          TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_clt_family (family, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Cadre letter type catalogue — defaults + JSON column schemas';

-- ---------------------------------------------------------------------------
-- 2. The letters themselves
--    Every type default is copied onto the letter at creation, so editing a
--    type never rewrites history and the CLI can override anything per letter.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS div_cadre_letters (
    id                  INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    letter_no           VARCHAR(80)  DEFAULT NULL,  -- auto-suggested, editable free text
    letter_series       VARCHAR(20)  DEFAULT NULL,
    letter_date         DATE NOT NULL,
    type_code           VARCHAR(40) NOT NULL,
    doc_kind            ENUM('LETTER','NOTE') NOT NULL DEFAULT 'LETTER',
    banner_text         VARCHAR(60)  DEFAULT NULL,
    office_header_text  VARCHAR(255) DEFAULT NULL,
    addressee_text      VARCHAR(255) DEFAULT NULL,
    addressee_text_hi   VARCHAR(255) DEFAULT NULL,
    subject_text        VARCHAR(255) DEFAULT NULL,
    ref_text            VARCHAR(500) DEFAULT NULL,
    body_text           TEXT,
    footer_text         TEXT,
    table_columns       JSON DEFAULT NULL,          -- resolved copy of the type's table_schema
    aux_data            JSON DEFAULT NULL,          -- {"schema":{…},"rows":[…]} for non-staff grids
    encl_text           VARCHAR(255) DEFAULT NULL,
    cc_text             TEXT,
    approval_chain_text VARCHAR(255) DEFAULT NULL,
    signing_designation       VARCHAR(100) DEFAULT NULL,
    signing_designation_hindi VARCHAR(100) DEFAULT NULL,
    signing_place       VARCHAR(60)  DEFAULT NULL,
    tokens              JSON DEFAULT NULL,         -- {{designation}}, {{from_lobby}}, {{course_no}} …
    total_staff         INT NOT NULL DEFAULT 0,
    status              ENUM('draft','finalized') NOT NULL DEFAULT 'draft',
    document_id         INT DEFAULT NULL,           -- filed composed doc in div_documents
    finalized_at        DATETIME DEFAULT NULL,
    created_by          VARCHAR(50) DEFAULT NULL,
    created_at          TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_cl_type_date (type_code, letter_date),
    KEY idx_cl_status (status),
    KEY idx_cl_date (letter_date),
    CONSTRAINT fk_cl_type FOREIGN KEY (type_code)
        REFERENCES div_cadre_letter_types (type_code) ON UPDATE CASCADE,
    CONSTRAINT fk_cl_doc  FOREIGN KEY (document_id)
        REFERENCES div_documents (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Cadre Management letters (HQ CLI cadre desk) — prepare and print';

-- ---------------------------------------------------------------------------
-- 3. Staff rows on a letter
--    Common columns are real (so staff can be searched across letters);
--    type-specific cells live in `extra` keyed by the schema column key.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS div_cadre_letter_staff (
    id              INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    letter_id       INT NOT NULL,
    sr_no           INT NOT NULL,
    -- NULLABLE ON PURPOSE: the initial-ALP letters (69 rows) are about
    -- trainees arriving from ZRTI who are not yet on div_staff_master.
    staff_hrms_id   VARCHAR(10) DEFAULT NULL,
    pf_number       VARCHAR(20)  DEFAULT NULL,
    name            VARCHAR(120) DEFAULT NULL,
    designation     VARCHAR(40)  DEFAULT NULL,
    present_lobby   VARCHAR(30)  DEFAULT NULL,
    proposed_lobby  VARCHAR(30)  DEFAULT NULL,
    remarks         VARCHAR(255) DEFAULT NULL,
    extra           JSON DEFAULT NULL,   -- zrti_ac, zrti_dsl, km_lobby, km_employee, ref_due …
    created_at      TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_cls_letter (letter_id, sr_no),
    KEY idx_cls_staff (staff_hrms_id),
    CONSTRAINT fk_cls_letter FOREIGN KEY (letter_id)
        REFERENCES div_cadre_letters (id) ON DELETE CASCADE,
    CONSTRAINT fk_cls_staff  FOREIGN KEY (staff_hrms_id)
        REFERENCES div_staff_master (hrms_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Staff rows on a cadre letter; staff_hrms_id NULL = manual/pasted row';
-- NOTE: deliberately NO UNIQUE(letter_id, staff_hrms_id) — unlike the transfer
-- and training letters. Manual rows have no hrms_id, and a list may legitimately
-- repeat a person across sections.

-- ---------------------------------------------------------------------------
-- 4. File the finalized letter into the documents repository
-- ---------------------------------------------------------------------------
SET @have_cat := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE()
     AND TABLE_NAME = 'div_documents'
     AND COLUMN_NAME = 'category'
     AND COLUMN_TYPE LIKE '%CADRE_LETTER%');
SET @sql := IF(@have_cat = 0,
  "ALTER TABLE div_documents MODIFY COLUMN category
     ENUM('TRAINING_LETTER','INITIAL_APPOINTMENT','PROMOTION_ORDER','SR_DEE_INSTRUCTION',
          'CEE_OP_INSTRUCTION','SAFETY_CIRCULAR','NEWS_LETTER','E_CASE_STUDY','STUDY_MATERIAL',
          'MANUAL','PRESENTATION','BROCHURE','MISC','TRANSFER_LETTER','CADRE_LETTER') NOT NULL",
  "SELECT 'div_documents.category already has CADRE_LETTER' AS note");
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- ---------------------------------------------------------------------------
-- 4b. Where does this letter's staff list come from?
--
-- Most cadre letters are about people already on the division roll, so the
-- staff picker searches div_staff_master. The initial-ALP letters are NOT:
-- they are about trainees who have just finished at ZRTI/BSL and whose
-- posting order does not exist yet — this letter is what ASKS the DPO to
-- issue it. They only reach div_staff_master after that order. Searching
-- staff records for them can only ever return nothing, so for those types the
-- picker is hidden and Excel paste is the primary entry mode.
--
--   ROLL     - on the division roll; picker is the primary entry mode (default)
--   EXTERNAL - not on roll yet; picker hidden, paste/manual only
--   BOTH     - a mixed list; picker offered alongside paste
--
-- This is why div_cadre_letter_staff.staff_hrms_id is nullable.
-- ---------------------------------------------------------------------------
SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'div_cadre_letter_types'
      AND COLUMN_NAME = 'staff_source') = 0,
  "ALTER TABLE div_cadre_letter_types
     ADD COLUMN staff_source ENUM('ROLL','EXTERNAL','BOTH')
     NOT NULL DEFAULT 'ROLL' AFTER doc_kind",
  "SELECT 'div_cadre_letter_types.staff_source already present' AS note");
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'div_cadre_letters'
      AND COLUMN_NAME = 'staff_source') = 0,
  "ALTER TABLE div_cadre_letters
     ADD COLUMN staff_source ENUM('ROLL','EXTERNAL','BOTH')
     NOT NULL DEFAULT 'ROLL' AFTER doc_kind",
  "SELECT 'div_cadre_letters.staff_source already present' AS note");
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- The two initial-ALP types. Applied as an UPDATE (not left to the seed
-- INSERTs) so an existing install picks it up when this file is re-run.
UPDATE div_cadre_letter_types
   SET staff_source = 'EXTERNAL'
 WHERE type_code IN ('POSTING_INITIAL_ALP', 'RELIEVING_INITIAL_ALP');

-- ============================================================================
-- 5. Seed the type catalogue
--    INSERT IGNORE: re-running never clobbers a type the CLI has edited.
--    Bodies transcribed from the reference letters in cadre-management/.
--    Tokens: {{count}} {{designation}} {{from_lobby}} {{to_lobby}} {{course_no}}
--            {{course_date}} {{letter_date}} {{year}} — see utils/cadreLetterHtml.js
-- ============================================================================

SET @HDR   := 'मंडल कार्यालय\nवरि.मं.वि.इं.(क.च.परि)का\nकार्यालय, मुंबई छ.शि.म.ट.';
SET @HDR_S := 'मंडल कार्यालय\nवरि.मं.वि.इं.(क.च.स्टाक/परि)का\nकार्यालय, मुंबई छ.शि.म.ट.';
SET @SIGN  := 'वरि.मं.वि.इं.(क.च.परि)';
SET @SIGN_S:= 'वरि.मं.वि.इं.(क.च.स्टाक/परि)';
SET @PLACE := 'मुंबई छ.शि.म.ट';
SET @DPO   := 'वरिष्ठ मंडल कार्मिक अधिकारी,\nमुंबई छ.शि.म.ट.';

-- ── TRANSFER ────────────────────────────────────────────────────────────────
INSERT IGNORE INTO div_cadre_letter_types
 (type_code, type_name, family, letter_series, addressee_text, addressee_text_hi,
  subject_tpl, body_tpl, footer_tpl, table_schema,
  signing_designation, signing_designation_hindi, signing_place, office_header_text, sort_order)
VALUES
('TRANSFER', 'Transfer of crew (any designation)', 'TRANSFER', 'transfer',
 'The Senior Divisional Personnel Officer,\nMumbai CSMT.', @DPO,
 'Transfer of {{designation}}.',
 'With reference to the above subject, the following {{designation}} are proposed to be transferred as per their seniority, as given below:',
 'Kindly issue necessary transfer order considering their seniority and rotation policy.',
 '{"columns":[
    {"key":"sr","label":"SR. NO.","w":"8%","auto":"index"},
    {"key":"pf","label":"PF NO","w":"22%","src":"pf_number"},
    {"key":"name","label":"NAME","w":"38%","src":"name"},
    {"key":"present_lobby","label":"Present LOBBY","w":"16%","src":"present_lobby"},
    {"key":"proposed_lobby","label":"Proposed LOBBY","w":"16%","src":"proposed_lobby"}]}',
 @SIGN, @SIGN, @PLACE, @HDR, 10),

('TRANSFER_NARRATIVE', 'Transfer proposal (no list)', 'TRANSFER', 'transfer',
 'The Senior Divisional Personnel Officer,\nMumbai CSMT.', @DPO,
 'Transfer of {{designation}}.',
 'It is propose to transfer {{count}} {{designation_full}} from {{from_lobby}} Lobby to {{to_lobby}} Lobby in accordance with the their seniority and rotation policy.',
 'It is requested to issue necessary transfer orders at the earliest.',
 NULL, @SIGN, @SIGN, @PLACE, @HDR, 20);

-- ── POSTING ─────────────────────────────────────────────────────────────────
INSERT IGNORE INTO div_cadre_letter_types
 (type_code, type_name, family, letter_series, addressee_text, addressee_text_hi,
  subject_tpl, ref_tpl, body_tpl, footer_tpl, table_schema, cc_text,
  signing_designation, signing_designation_hindi, signing_place, office_header_text, sort_order)
VALUES
('POSTING_GENERIC', 'Posting after promotion course (LPM / Motorman / LPG)', 'POSTING', 'posting',
 'The Senior Divisional Personnel Officer,\nMumbai CSMT.', @DPO,
 'Posting of {{designation}}.', NULL,
 'With reference to the above subject, the following {{present_designation}} have completed {{course_name}} promotion course & Loco practical training and is to be posted as under',
 'Kindly issue necessary posting order.',
 '{"columns":[
    {"key":"sr","label":"SR. NO.","w":"8%","auto":"index"},
    {"key":"pf","label":"PF NO","w":"22%","src":"pf_number"},
    {"key":"name","label":"NAME","w":"38%","src":"name"},
    {"key":"present_design","label":"Present DESIGN","w":"16%","src":"designation"},
    {"key":"proposed_posting","label":"PROPOSED POSTING","w":"16%","src":"proposed_lobby"}]}',
 NULL, @SIGN, @SIGN, @PLACE, @HDR, 30),

('POSTING_INITIAL_ALP', 'Posting of Initial Assistant Loco Pilot', 'POSTING', 'posting',
 'The Senior Divisional Personnel Officer,\nMumbai CSMT.', @DPO,
 'Posting of Initial Assistant Loco Pilot.',
 'M.T.C/KYN/5 Dated: {{ref_date}}',
 'With reference to the above subject, following trainee ALPs who have completed their training at ZRTI/BSL, are proposed to be posted as under.',
 'Kindly issue necessary posting order as per their seniority.',
 -- Widths measured in a browser against the real 69-row letter
 -- (cadre-management/Document 3.pdf), not guessed. With these the letter prints
 -- on 2 pages and wraps exactly rows 5, 7, 37 and 62 — the same four the Word
 -- original wraps. Every column is tight, so do not shave one to make room:
 --   * zrti_dsl at 13% left "ADAD-0089" 0.3mm short of fitting, which wrapped
 --     ALL 69 rows and cost a whole printed page. It needs 14%.
 --   * name must hold "RAJEEVRANJAN NARENDRA KUMAR YADAV";
 --     zrti_ac must hold the two-code case "IAIA-0102 / IAIA-0103";
 --     pf must hold an 11-digit number ("33329810870");
 --     remark needs 9% or the word "REMARK" itself will not fit its header.
 '{"columns":[
    {"key":"sr","label":"SR NO","w":"6%","auto":"index"},
    {"key":"pf","label":"PF NO","w":"14%","src":"pf_number"},
    {"key":"name","label":"NAME","w":"32%","src":"name"},
    {"key":"zrti_ac","label":"ZRTI BSL (AC+TFC)","w":"14%"},
    {"key":"zrti_dsl","label":"ZRTI BSL (DSL)","w":"14%"},
    {"key":"remark","label":"REMARK","w":"9%","default":"PASS"},
    {"key":"proposed_lobby","label":"PROPOSED LOBBY OF POSTING","w":"11%","src":"proposed_lobby"}]}',
 NULL, @SIGN, @SIGN, @PLACE, @HDR, 40),

('RELIEVING_INITIAL_ALP', 'Relieving of Initial Assistant Loco Pilot', 'POSTING', 'posting',
 'ALL CONCERNED', NULL,
 'Relieving of Initial Assistant Loco Pilot.',
 'i) Sr.DPO letter No.BB.P.Loco.558.Asst.LocoPilot office order No.{{order_no}} dtd {{order_date}}',
 'With reference to the above letter, the following Trainee Assistant Loco Pilots (ALPs), after completion of their training at ZRTI, reported to MTC/KYN and were sent to their proposed lobbies ({{lobbies}}) for Divisional learning road, which is part of their prescribed training . They have now been posted as ALP w.e.f. {{posting_date}}.

You are requested to relieve the following staff from their present depot to the proposed station crew lobby as per Office Order No. {{order_no}}.',
 NULL,
 '{"columns":[
    {"key":"sr","label":"SR NO","w":"8%","auto":"index"},
    {"key":"name","label":"NAME","w":"46%","src":"name"},
    {"key":"pf","label":"PF NO","w":"24%","src":"pf_number"},
    {"key":"proposed_lobby","label":"PROPOSED LOBBY","w":"22%","src":"proposed_lobby"}]}',
 'C/- SR.DEE(TRS-O) BB SR.DFM BB : for information & n.action
C/-CPO(M&T)CST,SPO(EL)OPTG for information & n.action
C/-Sr.DME/CSMT, Sr. DME(D)KYN,SR.DME CLA ADEE(EMU POH)SNPD for information & n.action
C/- Sr.DEE(TRS) KYN, CLA, KLVA SNPD for information & n.action
C/- DY.CEE(EMU-POH)MTN for information & n.action
C/-Sr.DEN(CO)CSMT for information & n.action
C/ Sr.DEE (TD), Sr.DSTE/CSMT for information & n.action
C/-All concern SSE, SSE(P/WAY) & Depo incharge, for information & n.action',
 @SIGN, @SIGN, @PLACE, @HDR, 50);

-- ── TRAINING / DEPUTATION ───────────────────────────────────────────────────
INSERT IGNORE INTO div_cadre_letter_types
 (type_code, type_name, family, letter_series, addressee_text, addressee_text_hi,
  subject_tpl, ref_tpl, body_tpl, footer_tpl, table_schema, aux_schema, cc_text,
  signing_designation, signing_designation_hindi, signing_place, office_header_text, sort_order)
VALUES
('MLD_NOMINATION', 'MLD promotional training nomination', 'TRAINING', 'training',
 'The Senior Divisional Personnel Officer,\nMumbai CSMT.', @DPO,
 'MLD training to Sr.Asst.L.P. of Mumbai Division.',
 'ZRTI/BSL training calendar for the year of {{year}}.',
 'With reference to above, additional batch of {{count}} eligible Sr. ALPs is to be send for Promotional training of L.P.Goods (M.L.D) in Course no {{course_no}} at ZRTI/BSL from {{course_date}}.',
 'You are requested to nominate eligible {{count}} Sr.ALPs as per seniority for the course as mentioned above.',
 NULL, NULL, NULL, @SIGN, @SIGN, @PLACE, @HDR, 60),

('SIMULATOR_DEPUTATION', 'Deputation for Diesel Simulator training / exam', 'TRAINING', 'training',
 'Sr. Crew Controller/CSMT\nDTC/KYN', NULL,
 'Deputation of {{designation}} for Diesel Simulator Training/Exam at ZRTI/BSL.',
 'ZRTI Letter No. {{ref_no}} dated {{ref_date}}',
 'With refrence of above subject the following {{designation}} who were deputed for MLD Training in {{batch_no}} batch and have reported to DTC/KYN for Diesel Conversion Course {{course_no}} are required to undergo Diesel Simulator Training at ZRTI/BSL from {{course_date}} as per the training calendar issued by ZRTI/BSL',
 NULL,
 '{"columns":[
    {"key":"sr","label":"SR.NO.","w":"8%","auto":"index"},
    {"key":"pf","label":"PF NO","w":"24%","src":"pf_number"},
    {"key":"name","label":"NAME","w":"40%","src":"name"},
    {"key":"designation","label":"DESGN.","w":"14%","src":"designation"},
    {"key":"lobby","label":"LOBBY","w":"14%","src":"present_lobby"}]}',
 NULL, NULL, @SIGN_S, @SIGN_S, @PLACE, @HDR_S, 70),

('COURSE_DEPUTATION', 'Deputation for promotional course (ZRTI)', 'TRAINING', 'training',
 'Principal\nZRTI/BSL', NULL,
 'Filling up of vacancies of {{designation}} in Mumbai Division.', NULL,
 'With reference to the above subject, the following crew are to be deputed for the {{course_name}} promotional Course No- {{course_no}} on {{course_date}}.',
 'It is requested accomodate above staff for above promotional training course.',
 '{"columns":[
    {"key":"sr","label":"SR. NO.","w":"10%","auto":"index"},
    {"key":"pf","label":"PF NO","w":"28%","src":"pf_number"},
    {"key":"name","label":"NAME","w":"40%","src":"name"},
    {"key":"designation","label":"DESIGN","w":"11%","src":"designation"},
    {"key":"lobby","label":"LOBBY","w":"11%","src":"present_lobby"}]}',
 NULL,
 'C:/ Sr.CC CSMT-ML/NRL/KYN for kind information and n.a.
C:/ DRM (P) for kind information and n.a.',
 @SIGN, @SIGN, @PLACE, @HDR, 80),

('DSL_CONTINUATION', 'Continuation of DSL Conversion course', 'TRAINING', 'training',
 'Principal\nZRTI/BSL', NULL,
 'Continuation of DSL Conversion course for initial ALPs of Mumbai Division.', NULL,
 'With reference to the above subject, it is submitted that the Initial Assistant Loco Pilots of Mumbai Division are presently undergoing Initial AC Course under Batch Nos. {{batch_no}}, which are scheduled to be completed on {{course_date}} respectively.

As per message received from CEE(OP) Office, after successful completion of the above course candidates will remain available for Diesel conversion Course. It is requested that the DSL Conversion Course may kindly be scheduled immediately after completion of the Initial AC Course.',
 'It is, therefore, requested to advise the schedule of the DSL Conversion Course in continuation of the Initial AC Course so that the trained staff can be utilized efficiently upon completion of their training.',
 NULL, NULL,
 'C/-DY CEE(OP)/CSMT for kind information please.',
 @SIGN_S, @SIGN_S, @PLACE, @HDR_S, 90),

('FIELD_TRAINING_SCHEDULE', 'Field training / trouble shooting schedule (MLD trainee)', 'TRAINING', 'training',
 'MTC/DTC KYN', NULL,
 'Footplate/Field training/trouble shooting  for MLD trainee (for Loco Pilot Shunter).',
 'Railway Board''s letter no 2024/E(Trg.)/41/13 dated 19/11/2024.
Railway Board''s letter no E(NG)I/2023/PM7/21 dated 30/05/2024.',
 'With reference of above letter, Sr.ALP/LPS, who are under MLD training and are supposed to be posted as LPS just after complition of MLD training, comes in Division for AC LOCO handling (06 days) and Diesel Loco handling (09 days) they will be follow the field training schedule as under____',
 'Further after completion of the prescribed promotional training courses trainee LPS/Sr.ALP will report their HQ and as per their proposed posting they will report to concern lobby for LRD/handling up to their ZRTI result. After complition of LRD/handling they will be go through written LRD exam/ CLI suitability and AEE/ADME suitability for posting.

Before deputing newly promoted Loco Pilot (Shunter)  for independent shunting, it is to be ensured that
(a)  shall be given LR of the yard where he has to work.
(b)  shall be deputed along with qualified regular Loco Pilot Shunter on Loco for shunting for at least one day or more for learning.
(c)  shall be deputed with a CLI for handling trains for at least two days or more.
(d)  shall be produced before the RSO Officer, for necessary assessment for issue of competency certificate, after he is found suitable by the CLI.

NOTE- Nodal Divisinol training institute for LPS training with be MTC KYN. All perfoma of field traning/Handling will be distributed by MTC KYN. MTC/DTC KYN will take all copies of LRD/handling particular from all trainees.',
 NULL,
 '{"title":"Field training schedule","columns":[
    {"key":"field","label":"Field","w":"18%"},
    {"key":"activity","label":"Electric (MTC KYN)","w":"56%"},
    {"key":"remark","label":"REMARK","w":"26%"}],
  "rows":[
    {"field":"DAY-1","activity":"REPORTING AND TRAINING AT MTC"},
    {"field":"DAY-2","activity":"FIELD TRAINING/HANDLING"},
    {"field":"DAY-3","activity":"FIELD TRAINING/HANDLING"},
    {"field":"DAY-4","activity":"FIELD TRAINING/HANDLING"},
    {"field":"DAY-5","activity":"FIELD TRAINING/HANDLING"},
    {"field":"DAY-6","activity":"REPORTING AND RELIVING"},
    {"field":"","activity":"DIESEL (DTC KYN)","span":true},
    {"field":"DAY-1","activity":"REPORTING AND TRAINING AT DTC"},
    {"field":"DAY-2","activity":"TRAINING AT DTC"},
    {"field":"DAY-3","activity":"FIELD TRAINING/HANDLING"},
    {"field":"DAY-4","activity":"FIELD TRAINING/HANDLING"},
    {"field":"DAY-5","activity":"FIELD TRAINING/HANDLING"},
    {"field":"DAY-6","activity":"FIELD TRAINING/HANDLING"},
    {"field":"DAY-7","activity":"FIELD TRAINING/HANDLING"},
    {"field":"DAY-8","activity":"FIELD TRAINING/HANDLING"},
    {"field":"DAY-9","activity":"REPORTING, TRAINING AND RELIVING"}]}',
 NULL, @SIGN, @SIGN, @PLACE, @HDR, 100);

-- ── CADRE & VACANCY ─────────────────────────────────────────────────────────
INSERT IGNORE INTO div_cadre_letter_types
 (type_code, type_name, family, doc_kind, letter_series, banner_text,
  addressee_text, addressee_text_hi, subject_tpl, ref_tpl, body_tpl, footer_tpl,
  table_schema, aux_schema, encl_text, approval_chain_text,
  signing_designation, signing_designation_hindi, signing_place, office_header_text, sort_order)
VALUES
('FRESH_PANEL', 'Request for fresh promotion panel', 'CADRE', 'LETTER', 'promotion', '*******',
 'The Senior Divisional Personnel Officer,\nMumbai CSMT.', @DPO,
 'Filling up of vacancies of {{designation}} in Mumbai Division.',
 'DRM(P) L.NO.{{ref_no}} dated {{ref_date}}.',
 'With reference to the above subject, a part panel of {{panel_1_count}} staff for promotion to the post of {{designation}} was issued on {{panel_1_date}}, followed by another panel of {{panel_2_count}} {{panel_2_designation}} on {{panel_2_date}}, and suitable staff have been promoted as {{designation}} from mentioned panel.

As per the letter under reference, the assessed vacancies for {{designation}} as on {{as_on_date}}, including higher grade and anticipated vacancies, are {{vacancy_breakup}}. Hence, there is an urgent requirement to prepare a promotion panel.',
 'In view of the above, it is requested that remaining process for preparation of the further panel for promotion to the post of {{designation}} may kindly be completed and the panel issued at the earliest to meet the operational requirements of the Division.',
 NULL, NULL, NULL, NULL, @SIGN_S, @SIGN_S, @PLACE, @HDR_S, 110),

('VACANCY_REMINDER', 'Reminder — filling up of vacancies', 'CADRE', 'LETTER', 'promotion', 'Reminder – I',
 'The Senior Divisional Personnel Officer,\nMumbai CSMT.', @DPO,
 'Filling up of vacancies of {{designation}} in Mumbai Division.',
 'L.No.{{ref_no}} dated {{ref_date}}.',
 'The sanctioned strength of {{designation}} in Mumbai Division is {{sanctioned}}, whereas the present man-on-roll strength is {{on_roll}}. Accordingly, {{vacancies}} vacancies presently exist in the cadre details of which is as given below.',
 'In view of the above, it is requested that a fresh selection panel for the post of {{designation}} may kindly be initiated at the earliest.',
 NULL,
 '{"title":"Cadre position","groupLabel":"LOBBY","columns":[
    {"key":"sr","label":"SR NO","w":"8%","auto":"index"},
    {"key":"particulars","label":"PARTICULARS","w":"40%"},
    {"key":"csmt","label":"CSMT","w":"12%","group":"LOBBY"},
    {"key":"kyn","label":"KYN","w":"12%","group":"LOBBY"},
    {"key":"pnvl","label":"PNVL","w":"12%","group":"LOBBY"},
    {"key":"total","label":"TOTAL","w":"16%"}],
  "rows":[
    {"particulars":"SANCTIONED STRENGTH"},
    {"particulars":"WORKING ON DETAILS"},
    {"particulars":"VACANCIES"},
    {"particulars":"TOTAL VACANT DETAIL"}]}',
 NULL, NULL, @SIGN_S, @SIGN_S, @PLACE, @HDR_S, 120),

('DISPENSATION_SUBMISSION', 'Submission of documents for dispensation', 'CADRE', 'LETTER', 'promotion', NULL,
 'DRM(P), CSMT', NULL,
 'Submission of  Documents/Information for Dispensation for promotion to {{designation}}, ML-6, in Mumbai Division.',
 '1.{{ref_no_1}} Dtd {{ref_date_1}}
2.DRM(P)BB''s letter No.{{ref_no_2}} Dtd {{ref_date_2}}',
 'With reference to the above, the information/documents sought in point,

1.1-	The list showing names of {{list_summary}} is herewith enclosed in prescribed format.
1.2-	The list provided is as per their Seniority.

1.3 – 1.6 Copies of documents is attached.

The information furnished has been verified from the available official records and the enclosed certificates have been issued by the competent authority.',
 'It is, therefore, requested that the enclosed documents may kindly be taken on record and the proposal for grant of dispensation for promotion to the post of {{designation}} may please be processed further at an early date.',
 NULL, NULL, 'As above.', NULL, @SIGN, @SIGN, @PLACE, @HDR, 130),

('FOOTPLATE_KM_EVIDENCE', 'Footplate kilometre documentary evidence', 'CADRE', 'LETTER', 'promotion', NULL,
 'ALL Concerned', NULL,
 'Submission of documentary evidence in support of self-declared footplate kilometres for promotion.',
 'Representation submitted by Sr. ALPs/LPS regarding footplate kilometre calculation for promotion.',
 'With reference to the above subject, it is submitted that the certified footplate experience furnished by the Sr. Crew Controllers in respect of the following employees, for the period during which they worked as LP Shunters and Sr. ALP/ALP in their respective lobbies up to {{as_on_date}}, has been examined along with the self-declared footplate kilometres submitted by the employees.

As per the records made available by the Sr. Crew Controllers, the following employees have not completed the prescribed {{prescribed_km}} footplate kilometres. However, these employees have submitted representations claiming that they have earned more than {{prescribed_km}} footplate kilometres, but no documentary evidence has been furnished in support of their claims.

Accordingly, the following employees are hereby advised to submit their representations along with supporting documentary evidence in support of their claimed footplate kilometres.',
 'The representations received along with the supporting documentary evidence will be examined while finalizing the eligibility of the above employees. In the absence of documentary evidence, footplate kilometres of the employee shall be considered based on the official records available with the Administration.',
 '{"columns":[
    {"key":"sr","label":"Sr No.","w":"8%","auto":"index"},
    {"key":"pf","label":"PF NO","w":"22%","src":"pf_number"},
    {"key":"name","label":"NAME","w":"32%","src":"name"},
    {"key":"designation","label":"Desig","w":"14%","src":"designation"},
    {"key":"km_lobby","label":"As per Lobby","w":"12%","group":"TOTAL KM"},
    {"key":"km_employee","label":"As per Employee","w":"12%","group":"TOTAL KM"}]}',
 NULL, NULL, NULL, @SIGN, @SIGN, @PLACE, @HDR, 140),

('REFRESHER_EXEMPTION', 'Exemption of Refresher on account of promotion (NOTE)', 'CADRE', 'NOTE', 'promotion', 'NOTE',
 NULL, NULL,
 'Exemption  of Refersher on account of {{designation}}  promotion.',
 'Rly Bds L.No.E (MPP)98/3/8 dtd 25.02.2003.( RBE 39/2003).',
 'The following {{present_designation}} of {{lobby}} Lobby, some of whom are presently working at {{officiating_lobby}} Lobby on an officiating basis, will be getting due for Refresher Course during the period from {{period}}.',
 'The above {{present_designation}} have been empanelled for promotion to the post of {{designation}} and have been declared suitable in the aptitude test conducted on {{aptitude_date}}. The {{present_designation}} to {{designation}} promotional training is presently in progress. The above-mentioned {{present_designation}} are proposed to be nominated for {{designation}} training batches during {{batch_months}}, subject to operational requirements and availability of staff.

In terms of Rly Bds letter referred above " if any staff belonging to safety category who is due for Refresher course and in the meanwhile gets selected/empanelled and is scheduled for promotional course, he may be exempted from refresher course and to be sent to Promotional course only. The decision to grant exemption from attending the refresher course is based on the criterion that the promotional course is not beyond 3 months from the scheduled date of refresher course".

In view of above, it is requested to approve for exemption of refresher of above mention {{present_designation}} as they will be send for {{designation}} training within 3 months from their refresher due date.

Put up for approval please.',
 '{"columns":[
    {"key":"sr","label":"Sr No","w":"8%","auto":"index"},
    {"key":"name","label":"Name","w":"40%","src":"name"},
    {"key":"ref_due","label":"Ref. Due Date","w":"17%"},
    {"key":"next_due","label":"Next  Due Date after 3 Months","w":"18%"},
    {"key":"forecast_month","label":"Forecast Promotion Month","w":"17%"}]}',
 NULL, NULL,
 'ADEE (TRO)\nDEE (TRO)\nSr.DEE (TRO)',
 'CLI (Cader ) CSMT', NULL, NULL, @HDR_S, 150);

-- ── MISC ────────────────────────────────────────────────────────────────────
INSERT IGNORE INTO div_cadre_letter_types
 (type_code, type_name, family, letter_series, addressee_text, addressee_text_hi,
  subject_tpl, ref_tpl, body_tpl, footer_tpl, encl_text, cc_text,
  signing_designation, signing_designation_hindi, signing_place, office_header_text, sort_order)
VALUES
('GENERIC', 'Free-form letter', 'MISC', 'misc',
 'The Senior Divisional Personnel Officer,\nMumbai CSMT.', @DPO,
 NULL, NULL, NULL, NULL, NULL, NULL, @SIGN, @SIGN, @PLACE, @HDR, 200),

('SENIORITY_VERIFICATION', 'Verification of seniority', 'MISC', 'misc',
 'The Senior Divisional Personnel Officer,\nMumbai CSMT.', @DPO,
 'Verification of seniority of {{designation}}.',
 'Application submitted by employee dated {{ref_date}}.',
 'An application dated {{ref_date}} has been received from Shri {{staff_name}}, {{designation}}, PF No. {{pf_number}}, working at {{lobby}} Lobby, regarding verification and correction of his seniority position in the {{designation}} seniority list. A copy of the application is forwarded herewith for necessary action.

The employees have represented that their seniority has not been reflected correctly in the {{designation}} seniority list issued on {{list_date}} and have requested restoration of their seniority based on seniority list issued by ZRTI/BSL. He has further requested verification of the relevant records and correction/restoration of their seniority, if any discrepancy is found.',
 'It is requested that the matter may kindly be examined with reference to the relevant documents/Office orders. If any discrepancy is noticed, necessary action may be taken as per the extant rules.The findings of the verification may please be communicated to this office for further necessary action.',
 NULL, NULL, 'व.मं.वि. इंजि. (क.च.परि)', 'व.मं.वि. इंजि. (क.च.परि)', @PLACE, @HDR, 210),

('MEDICAL_REDEPLOYMENT', 'Redeployment of medically de-categorized staff', 'MISC', 'misc',
 'The Senior Divisional Personnel Officer,\nMumbai CSMT.', @DPO,
 'Request for early redeployment of medically de-categorized staff due to {{cause}}',
 '1. Railway Board''s letter No. {{ref_no_1}} dated {{ref_date_1}}
2. DRM(P) office Letter No. {{ref_no_2}} dated {{ref_date_2}}',
 'It is submitted that certain running staff of this department have been medically de-categorized on account of having undergone {{cause}} and are presently awaiting redeployment. A list of such employees is enclosed herewith for  reference and necessary action.

As these employees are not being utilized against suitable alternative posts, their services are presently not being effectively utilized. The delay in redeployment is also causing administrative difficulties and affecting manpower planning within the department.',
 'In view of the Railway Board''s instructions on the subject, it is requested that such cases may kindly be processed on priority and redeployment against suitable posts, as per their medical classification and extant rules, may be finalized at the earliest.',
 'List of medically de-categorized staff due to {{cause}} awaiting redeployment.',
 NULL, @SIGN_S, @SIGN_S, @PLACE, @HDR_S, 220),

('TRAINING_MODULE_SUGGESTION', 'Suggestions for training modules', 'MISC', 'misc',
 'Dy.CEE(OP)\n  CSMT', NULL,
 'Suggestions for Inclusion of Additional Training Modules.',
 'PCEE office letter No. {{ref_no}} dtd {{ref_date}}',
 'With reference to above letter, suggestion from this office as follows,',
 NULL, NULL, NULL, @SIGN, @SIGN, @PLACE, @HDR, 230);

-- ============================================================================
-- Verify
--   SELECT type_code, family, doc_kind FROM div_cadre_letter_types ORDER BY sort_order;
--   SHOW COLUMNS FROM div_documents LIKE 'category';
-- ============================================================================
