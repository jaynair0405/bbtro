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

## 5. Midnight Position Tables (00:00 Hrs Staff Position)
**File:** `sql/div_midnight_position.sql`
**Status:** PENDING

Creates 3 tables for tracking daily staff position at midnight:

**5.1 Main Position Summary Table**
```sql
CREATE TABLE IF NOT EXISTS `div_midnight_position` (
  `id` int NOT NULL AUTO_INCREMENT,
  `position_date` date NOT NULL,
  `lobby_code` varchar(20) NOT NULL,
  -- Per designation stats (LPG, LPS, ALP)
  `lpg_sanction` int DEFAULT 0,
  `lpg_on_roll` int DEFAULT 0,
  `lpg_net_available` int DEFAULT 0,
  -- ... (60+ stat columns for detailed tracking)
  `finalized` tinyint(1) DEFAULT 0,
  `finalized_by` varchar(100) DEFAULT NULL,
  `finalized_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_date_lobby` (`position_date`, `lobby_code`)
);
```

**5.2 Staff Detail Entries Table**
```sql
CREATE TABLE IF NOT EXISTS `div_midnight_position_staff` (
  `id` int NOT NULL AUTO_INCREMENT,
  `position_id` int NOT NULL,
  `category` varchar(50) NOT NULL,
  `staff_hrms_id` varchar(20) DEFAULT NULL,
  `staff_name` varchar(100) NOT NULL,
  `designation` varchar(20) NOT NULL,
  `working_from_as` varchar(200) DEFAULT NULL,
  `reason` varchar(200) DEFAULT NULL,
  `since_date` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`position_id`) REFERENCES `div_midnight_position` (`id`) ON DELETE CASCADE
);
```

**5.3 Category Master Table**
```sql
CREATE TABLE IF NOT EXISTS `div_midnight_position_categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category_code` varchar(50) NOT NULL,
  `category_name` varchar(100) NOT NULL,
  `display_order` int DEFAULT 0,
  PRIMARY KEY (`id`)
);
-- Includes INSERT statements for default categories
```

**Purpose:** Track daily midnight position of staff by lobby - Medical Unfit, SPAD Crew, Office/Outstation, etc. Replaces the current Google Sheets workflow.

---

## Execution Order

Run in this order on the production server:

1. `sql/add_retirement_date_column.sql`
2. `sql/div_staff_drafting_records.sql`
3. `sql/div_leave_status_history.sql`
4. `sql/div_midnight_position.sql`

---

## Pre-Deployment Checklist

- [ ] Backup production database
- [ ] Run SQL scripts in order
- [ ] Verify tables/columns created successfully
- [ ] Deploy updated code
- [ ] Test leave management functionality
- [ ] Test retirement tracking functionality
- [ ] Test midnight position entry and carry-forward

---

## 6. CTR Legs - Matched Sections Column (LRD Route Matching)
**File:** `sql/add_matched_sections_column.sql`
**Status:** PENDING

```sql
ALTER TABLE `div_ctr_legs`
ADD COLUMN `matched_sections` JSON DEFAULT NULL
COMMENT 'Resolved route matches [{route_id, stations, reason}]'
AFTER `route_name`;
```

**Purpose:** Store LRD route matching results for each leg. Used by the new JSON-based LRD system that replaces the div_lrd_sections/div_lrd_section_stations tables.

**Related Files:**
- `data/routes.json` - Route definitions generated from CSV
- `routes/division/lrd_route_resolver.js` - Runtime route resolver
- `scripts/convert_routes.js` - CSV to JSON converter

---

## 7. LRD Segment Coverage Table (Segment-based LRD Tracking)
**File:** `sql/div_lrd_segment_coverage.sql`
**Status:** PENDING

```sql
CREATE TABLE IF NOT EXISTS `div_lrd_segment_coverage` (
  `id` int NOT NULL AUTO_INCREMENT,
  `staff_hrms_id` varchar(10) NOT NULL,
  `from_station` varchar(10) NOT NULL COMMENT 'Starting station of segment',
  `to_station` varchar(10) NOT NULL COMMENT 'Ending station of segment',
  `last_worked_date` date NOT NULL COMMENT 'Most recent date this segment was worked',
  `last_duty_id` int DEFAULT NULL COMMENT 'Reference to div_ctr_duties.id',
  `work_count` int DEFAULT 1 COMMENT 'Number of times worked (for stats)',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_staff_segment` (`staff_hrms_id`, `from_station`, `to_station`),
  KEY `idx_staff` (`staff_hrms_id`),
  KEY `idx_last_worked` (`last_worked_date`),
  KEY `idx_from_station` (`from_station`),
  KEY `idx_to_station` (`to_station`),
  CONSTRAINT `fk_segment_staff` FOREIGN KEY (`staff_hrms_id`)
    REFERENCES `div_staff_master` (`hrms_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

**Purpose:** Track individual station-pair segments worked by staff for segment-based LRD validity calculation. Direction matters: ROHA→NGTN is different from NGTN→ROHA. This replaces the route-based LRD system with a more granular segment tracking approach.

**Related Files:**
- `data/lrd_beats.json` - Section/beat definitions with station sequences
- `scripts/backfill_segment_coverage.js` - One-time script to populate from existing CTR legs
- `routes/division/ctrRoutes.js` - Updated API endpoints

**Post-Deployment Steps:**
1. Run the SQL to create the table
2. Run `node scripts/backfill_segment_coverage.js` to populate from existing data

---

## Updated Execution Order

Run in this order on the production server:

1. `sql/add_retirement_date_column.sql`
2. `sql/div_staff_drafting_records.sql`
3. `sql/div_leave_status_history.sql`
4. `sql/div_midnight_position.sql`
5. `sql/add_matched_sections_column.sql`
6. `sql/div_lrd_segment_coverage.sql`

**After SQL Execution:**
- Run `node scripts/backfill_matched_sections.js` (if not done already)
- Run `node scripts/backfill_segment_coverage.js` (to populate segment coverage)

---

*Last Updated: 2026-01-20*
