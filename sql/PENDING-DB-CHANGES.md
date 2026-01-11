# Pending Database Changes for Server Update

## Overview
This document lists all database changes that need to be applied to the production server before deploying the latest code.

---

## 1. Retirement Columns (div_staff_master)
**File:** `sql/add_retirement_date_column.sql`
**Status:** PENDING

```sql
ALTER TABLE `div_staff_master`
ADD COLUMN `retirement_date` date DEFAULT NULL COMMENT 'Actual retirement date' AFTER `status`,
ADD COLUMN `retirement_type` ENUM('Superannuation', 'VRS') DEFAULT NULL COMMENT 'Type of retirement' AFTER `retirement_date`;

CREATE INDEX `idx_retirement_date` ON `div_staff_master` (`retirement_date`);
```

**Purpose:** Track retirement date and type (Superannuation/VRS) for upcoming retirements page.

---

## 2. Staff Drafting Records Table
**File:** `sql/div_staff_drafting_records.sql`
**Status:** PENDING

```sql
CREATE TABLE IF NOT EXISTS `div_staff_drafting_records` (
  `record_id` int NOT NULL AUTO_INCREMENT,
  `staff_hrms_id` varchar(10) NOT NULL,
  `drafted_to_designation_id` int NOT NULL,
  `drafted_date` date NOT NULL,
  `order_number` varchar(100) DEFAULT NULL,
  `drafting_type` enum('Temporary','Permanent') DEFAULT 'Temporary',
  `expected_duration_years` int DEFAULT NULL,
  `relieved_date` date DEFAULT NULL,
  `relieving_order_number` varchar(100) DEFAULT NULL,
  `remarks` text,
  `status` enum('Active','Relieved') DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`record_id`),
  KEY `staff_hrms_id` (`staff_hrms_id`),
  KEY `drafted_to_designation_id` (`drafted_to_designation_id`),
  KEY `status` (`status`),
  KEY `drafted_date` (`drafted_date`),
  CONSTRAINT `div_staff_drafting_records_ibfk_1` FOREIGN KEY (`staff_hrms_id`) REFERENCES `div_staff_master` (`hrms_id`) ON DELETE CASCADE,
  CONSTRAINT `div_staff_drafting_records_ibfk_2` FOREIGN KEY (`drafted_to_designation_id`) REFERENCES `designations` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

**Purpose:** Track staff drafted to administrative posts (Jr.CC, Sr.CC, CLI, etc.)

---

## 3. Leave Status History Table (Audit Trail)
**File:** `sql/div_leave_status_history.sql`
**Status:** CREATED LOCALLY - PENDING ON SERVER

```sql
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
--
-- When leave is created:
--   INSERT INTO div_leave_status_history (leave_id, old_status, new_status, changed_by)
--   VALUES (123, NULL, 'Pending', 'user@example.com');
--
-- When leave is forwarded:
--   INSERT INTO div_leave_status_history (leave_id, old_status, new_status, changed_by)
--   VALUES (123, 'Pending', 'Forwarded', 'user@example.com');
--
-- When leave is approved:
--   INSERT INTO div_leave_status_history (leave_id, old_status, new_status, changed_by)
--   VALUES (123, 'Forwarded', 'Approved', 'approver@example.com');
--
-- View history for a leave:
--   SELECT * FROM div_leave_status_history WHERE leave_id = 123 ORDER BY changed_at;
-- ============================================
```

**Purpose:** Complete audit trail for leave status changes. Track when status changed from Pending → Forwarded → Approved etc., and by whom.

**Backend Changes Required:**
- Modify POST `/api/division/leave` to insert initial status into history
- Modify PUT `/api/division/leave/:id` to log status changes
- Add GET endpoint to retrieve status history for a leave

---

## 4. Leave Tracking Table - Existing Columns Check
**Table:** `div_leave_tracking`

Verify these columns exist:
- `created_at` DATETIME - When leave was created
- `approved_by` VARCHAR - Who approved (if applicable)

---

## Execution Order

Run in this order on the production server:

1. `sql/add_retirement_date_column.sql`
2. `sql/div_staff_drafting_records.sql`
3. `sql/div_leave_status_history.sql` (create this file first)

---

## Pre-Deployment Checklist

- [ ] Backup production database
- [ ] Run SQL scripts in order
- [ ] Verify tables/columns created successfully
- [ ] Deploy updated code
- [ ] Test leave management functionality
- [ ] Test retirement tracking functionality

---

*Last Updated: 2026-01-11*
