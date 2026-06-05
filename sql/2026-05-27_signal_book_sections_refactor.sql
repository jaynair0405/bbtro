-- =============================================================
-- Signal Book Sections Refactor
-- =============================================================
-- Reason: A single logical section (e.g. "CSMT-KYN DN LL") appears
-- in multiple beats. The original schema tied sections + rows
-- directly to beat_id, forcing duplicate copies of identical row
-- lists across beats. Editing one signal then meant editing it
-- in every beat copy.
--
-- This migration:
--   1. Strips beat ownership off sections and rows.
--   2. Adds a new join table div_signal_beat_sections to express
--      "beat X includes section Y at display_order N (pages P-Q)".
--   3. Makes section_code UNIQUE so sections can be referenced
--      by stable code from Excel imports.
--
-- Pre-state (verified 2026-05-27):
--   div_signal_book_sections : 1 row (CSMT-KYN DN TH LINE, beat 6)
--   div_signal_book_rows     : 130 rows, all beat_id=6 section_id=1
--
-- Run on local first; tested rollback included at end of file.
-- =============================================================

START TRANSACTION;

-- -----------------------------------------------------------
-- 1. Create the new join table.
--    Inserts existing (beat_id, section_id) pairings BEFORE we
--    drop beat_id off div_signal_book_sections.
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS div_signal_beat_sections (
    id INT AUTO_INCREMENT PRIMARY KEY,

    beat_id INT NOT NULL,
    section_id INT NOT NULL,

    display_order INT NOT NULL,

    start_page_no INT DEFAULT NULL,
    end_page_no INT DEFAULT NULL,

    is_active TINYINT(1) NOT NULL DEFAULT 1,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uk_beat_section (beat_id, section_id),
    UNIQUE KEY uk_beat_display_order (beat_id, display_order),
    INDEX idx_section_id (section_id),

    CONSTRAINT fk_beat_sections_beat
        FOREIGN KEY (beat_id) REFERENCES div_signal_beats(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_beat_sections_section
        FOREIGN KEY (section_id) REFERENCES div_signal_book_sections(id)
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO div_signal_beat_sections
    (beat_id, section_id, display_order, start_page_no, end_page_no, is_active)
SELECT beat_id, id, display_order, start_page_no, end_page_no, is_active
FROM div_signal_book_sections;

-- -----------------------------------------------------------
-- 2. Promote section_code to a stable unique identifier.
--    Existing row had section_code = 'CSMT-KYN' (not specific
--    enough to differentiate lines/directions). Rename it to
--    SECTION_DIR_LINE convention.
-- -----------------------------------------------------------
UPDATE div_signal_book_sections
SET section_code = 'CSMT_KYN_DN_TH'
WHERE id = 1;

-- -----------------------------------------------------------
-- 3. div_signal_book_rows: drop beat_id, make book_section_id
--    NOT NULL, swap FK to ON DELETE RESTRICT (was SET NULL).
-- -----------------------------------------------------------
ALTER TABLE div_signal_book_rows
    DROP FOREIGN KEY fk_signal_book_rows_beat;

ALTER TABLE div_signal_book_rows
    DROP INDEX idx_beat_id;

ALTER TABLE div_signal_book_rows
    DROP COLUMN beat_id;

ALTER TABLE div_signal_book_rows
    DROP FOREIGN KEY fk_signal_book_rows_section;

ALTER TABLE div_signal_book_rows
    MODIFY COLUMN book_section_id INT NOT NULL;

ALTER TABLE div_signal_book_rows
    ADD CONSTRAINT fk_signal_book_rows_section
        FOREIGN KEY (book_section_id) REFERENCES div_signal_book_sections(id)
        ON DELETE RESTRICT;

-- -----------------------------------------------------------
-- 4. div_signal_book_sections: drop beat ownership, make
--    section_code mandatory + unique.
-- -----------------------------------------------------------
ALTER TABLE div_signal_book_sections
    DROP FOREIGN KEY fk_signal_book_sections_beat;

ALTER TABLE div_signal_book_sections
    DROP INDEX uk_beat_section_order;

ALTER TABLE div_signal_book_sections
    DROP INDEX idx_beat_id;

ALTER TABLE div_signal_book_sections
    DROP COLUMN beat_id,
    DROP COLUMN display_order,
    DROP COLUMN start_page_no,
    DROP COLUMN end_page_no;

ALTER TABLE div_signal_book_sections
    MODIFY COLUMN section_code VARCHAR(50) NOT NULL;

ALTER TABLE div_signal_book_sections
    DROP INDEX idx_section_code,
    ADD UNIQUE KEY uk_section_code (section_code);

COMMIT;

-- =============================================================
-- Verification queries (run after commit):
--   SELECT * FROM div_signal_book_sections;
--   SELECT * FROM div_signal_beat_sections;
--   SELECT COUNT(*) FROM div_signal_book_rows WHERE book_section_id IS NULL;  -- expect 0
--   SHOW CREATE TABLE div_signal_book_rows\G
--   SHOW CREATE TABLE div_signal_book_sections\G
-- =============================================================

-- =============================================================
-- ROLLBACK (only if migration breaks before COMMIT, or to
-- reverse a successful migration; lives here for reference):
--
--   ALTER TABLE div_signal_book_rows
--       ADD COLUMN beat_id INT NOT NULL DEFAULT 0,
--       ADD INDEX idx_beat_id (beat_id),
--       ADD CONSTRAINT fk_signal_book_rows_beat
--           FOREIGN KEY (beat_id) REFERENCES div_signal_beats(id)
--           ON DELETE CASCADE;
--   UPDATE div_signal_book_rows r
--   JOIN div_signal_beat_sections bs ON bs.section_id = r.book_section_id
--   SET r.beat_id = bs.beat_id;
--
--   ALTER TABLE div_signal_book_rows
--       DROP FOREIGN KEY fk_signal_book_rows_section,
--       MODIFY COLUMN book_section_id INT DEFAULT NULL,
--       ADD CONSTRAINT fk_signal_book_rows_section
--           FOREIGN KEY (book_section_id) REFERENCES div_signal_book_sections(id)
--           ON DELETE SET NULL;
--
--   ALTER TABLE div_signal_book_sections
--       ADD COLUMN beat_id INT NOT NULL DEFAULT 0,
--       ADD COLUMN display_order INT NOT NULL DEFAULT 1,
--       ADD COLUMN start_page_no INT DEFAULT NULL,
--       ADD COLUMN end_page_no INT DEFAULT NULL;
--   UPDATE div_signal_book_sections s
--   JOIN div_signal_beat_sections bs ON bs.section_id = s.id
--   SET s.beat_id = bs.beat_id,
--       s.display_order = bs.display_order,
--       s.start_page_no = bs.start_page_no,
--       s.end_page_no   = bs.end_page_no;
--   ALTER TABLE div_signal_book_sections
--       DROP INDEX uk_section_code,
--       ADD INDEX idx_section_code (section_code),
--       MODIFY COLUMN section_code VARCHAR(50) DEFAULT NULL,
--       ADD INDEX idx_beat_id (beat_id),
--       ADD UNIQUE KEY uk_beat_section_order (beat_id, display_order),
--       ADD CONSTRAINT fk_signal_book_sections_beat
--           FOREIGN KEY (beat_id) REFERENCES div_signal_beats(id)
--           ON DELETE CASCADE;
--
--   DROP TABLE div_signal_beat_sections;
-- =============================================================
