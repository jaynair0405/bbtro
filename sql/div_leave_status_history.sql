-- ============================================
-- Leave Status History / Audit Trail
-- Tracks all status changes for leave entries
-- Created: 2026-01-11
-- ============================================

CREATE TABLE IF NOT EXISTS `div_leave_status_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `leave_id` int NOT NULL COMMENT 'Reference to div_leave_tracking.id',
  `old_status` varchar(20) DEFAULT NULL COMMENT 'Previous status (NULL for new entry)',
  `new_status` varchar(20) NOT NULL COMMENT 'New status after change',
  `changed_by` varchar(100) DEFAULT NULL COMMENT 'User who made the change',
  `changed_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT 'When the change was made',
  `remarks` text COMMENT 'Optional remarks for the status change',
  PRIMARY KEY (`id`),
  KEY `idx_leave_id` (`leave_id`),
  KEY `idx_changed_at` (`changed_at`),
  CONSTRAINT `fk_leave_status_history_leave` FOREIGN KEY (`leave_id`)
    REFERENCES `div_leave_tracking` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================
-- Usage Examples:
-- ============================================

-- When leave is created (status = Pending):
-- INSERT INTO div_leave_status_history (leave_id, old_status, new_status, changed_by)
-- VALUES (123, NULL, 'Pending', 'user@example.com');

-- When leave is forwarded:
-- INSERT INTO div_leave_status_history (leave_id, old_status, new_status, changed_by)
-- VALUES (123, 'Pending', 'Forwarded', 'user@example.com');

-- When forwarded leave is approved:
-- INSERT INTO div_leave_status_history (leave_id, old_status, new_status, changed_by)
-- VALUES (123, 'Forwarded', 'Approved', 'approver@example.com');

-- View complete history for a leave:
-- SELECT h.*, DATE_FORMAT(h.changed_at, '%d-%m-%Y %H:%i') as changed_at_formatted
-- FROM div_leave_status_history h
-- WHERE h.leave_id = 123
-- ORDER BY h.changed_at;

-- View all forwarded leaves that were later approved:
-- SELECT DISTINCT h.leave_id
-- FROM div_leave_status_history h
-- WHERE h.leave_id IN (
--     SELECT leave_id FROM div_leave_status_history WHERE new_status = 'Forwarded'
-- )
-- AND h.new_status = 'Approved';

-- ============================================
-- Backend Integration Notes:
-- ============================================
-- 1. POST /api/division/leave (create leave):
--    - After INSERT, also insert into div_leave_status_history
--    - old_status = NULL, new_status = 'Pending' or 'Absent'
--
-- 2. PUT /api/division/leave/:id (update status):
--    - Before UPDATE, fetch current status
--    - After UPDATE, insert into div_leave_status_history
--    - old_status = previous status, new_status = updated status
--
-- 3. GET /api/division/leave/:id/history (new endpoint):
--    - Return all status changes for a specific leave
-- ============================================
