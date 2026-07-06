-- ============================================
-- div_locos — last-done maintenance schedule (LPC-entered, optional)
-- Created: 2026-07-06
-- Module:  Control Office / Loco Schedule Due report
--
-- Complements the existing schedule_type / schedule_due_date (which hold the
-- NEXT-DUE schedule). These two hold the LAST-DONE schedule the LPC optionally
-- records on the "Loco Schedule Due" (Coaching Loco Overdue) report — e.g.
-- last IA done on 25-03-26. Purely informational; the overdue calc still uses
-- schedule_due_date. LPC-owned, so scripts/load_locos.js never touches them.
-- ============================================

ALTER TABLE `div_locos`
  ADD COLUMN `last_sched_type` ENUM('IA','IB','IC','IOH','TOH','POH') DEFAULT NULL AFTER `schedule_updated_at`,
  ADD COLUMN `last_sched_date` DATE DEFAULT NULL AFTER `last_sched_type`;
