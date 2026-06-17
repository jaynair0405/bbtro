-- =============================================================
-- Signal Book Editor — schema foundation
-- =============================================================
-- Supports the in-app section editor with two decisions:
--   * UI-authoritative + import guard: once a section is edited/published
--     in the UI, edit_source flips to 'ui' and the spreadsheet importer
--     refuses to overwrite it without --force.
--   * Draft -> Publish: edits accumulate in a per-section draft snapshot
--     (div_signal_section_drafts.draft_json); Publish applies the draft to
--     the live tables (div_signals + div_signal_book_rows) atomically.
-- The driver-facing render always reads the live tables = published state,
-- so the renderer needs no change.
-- =============================================================

-- 1. Import guard flag on each book section.
ALTER TABLE div_signal_book_sections
  ADD COLUMN edit_source ENUM('import','ui') NOT NULL DEFAULT 'import'
    COMMENT 'import = spreadsheet-owned (re-import overwrites freely); ui = edited in editor, importer must pass --force'
    AFTER is_active;

-- 2. Per-section draft snapshot. A row exists only while a section has
--    unpublished edits; Publish applies then deletes it.
CREATE TABLE IF NOT EXISTS div_signal_section_drafts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  section_id INT NOT NULL,
  draft_json LONGTEXT NOT NULL
    COMMENT 'Full editable snapshot of the section: { signals: [...], rows: [...] }',
  base_loaded_at TIMESTAMP NULL
    COMMENT 'Live-table state timestamp the draft was seeded from (stale-edit detection)',
  updated_by INT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_draft_section (section_id),
  KEY idx_draft_updated (updated_at),
  CONSTRAINT fk_draft_section FOREIGN KEY (section_id)
    REFERENCES div_signal_book_sections(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Allow 'ui' as a book-row provenance (rows written by the editor on publish).
ALTER TABLE div_signal_book_rows
  MODIFY COLUMN row_source ENUM('manual','generated','import','ui') NOT NULL DEFAULT 'manual';

-- Verification:
-- SHOW COLUMNS FROM div_signal_book_sections LIKE 'edit_source';
-- SELECT section_code, edit_source FROM div_signal_book_sections ORDER BY id;
-- SHOW TABLES LIKE 'div_signal_section_drafts';
