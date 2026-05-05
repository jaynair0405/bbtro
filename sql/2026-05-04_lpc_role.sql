-- ============================================
-- Add 'lpc' value to users.div_role ENUM
-- Created: 2026-05-04
-- Plan:    LOCO_LINK_FEATURE.md (Slice 0 — auth)
--
-- LPC = Loco Power Controller. After login, LPC users are
-- redirected straight to /control-office/ (similar to how
-- trgcentre_admin lands on /div/training-centre.html).
-- ============================================

ALTER TABLE `users`
  MODIFY COLUMN `div_role`
    ENUM('division_admin','office_hr','trgcentre_admin','lpc') DEFAULT NULL;
