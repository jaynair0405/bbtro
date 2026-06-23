-- ============================================================================
-- div_loco_transfers — lean audit/history trail for the Loco Management page
-- (Phase 4 of LOCO_MASTER_MIGRATION.md)
--
-- One row per shed/zone TRANSFER or per CONDEMN (withdraw/scrap) performed from
-- the Control Office Loco Management page. The master roster itself lives in
-- div_locos; this table only records "what changed, by whom, when" so a loco's
-- past sheds can be shown.
--
-- A plain field edit (loco_type / traction_type / hotel_load_oem) is NOT logged
-- here by design — only transfers and condemns.
--
-- No FK to div_locos(loco_number): kept deliberately lean and to avoid a
-- collation/charset coupling on migration; the endpoints validate that the loco
-- exists in div_locos before inserting. (See LOCO_LINK_ARCHITECTURE_REVIEW.md.)
-- ============================================================================

CREATE TABLE IF NOT EXISTS div_loco_transfers (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  loco_number VARCHAR(20)  NOT NULL,
  action      ENUM('TRANSFER','CONDEMN') NOT NULL DEFAULT 'TRANSFER',
  from_shed   VARCHAR(20),
  to_shed     VARCHAR(20),
  from_zone   VARCHAR(10),
  to_zone     VARCHAR(10),
  reason      VARCHAR(255),                 -- mainly for CONDEMN; optional for TRANSFER
  changed_by  VARCHAR(100),                 -- session username of the LPC/admin
  changed_at  DATETIME     NOT NULL,
  INDEX idx_transfer_loco (loco_number),
  INDEX idx_transfer_when (changed_at)
);
