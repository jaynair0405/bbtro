-- 2026-09-10  Signal sync outbox: prod announces UI edits to div_signals.
--
-- One row per signal (PK signal_id, latest snapshot wins). Written by the
-- signal-book publish endpoint in the same transaction as div_signal_history.
-- Rows are MARKED synced (synced_at), never deleted, so a mistimed run cannot
-- lose the delta. See docs/SIGNAL_SYNC_PLAN.md.
--
-- Columns mirror div_signals 1:1 (same names, same types) so the snapshot can
-- be written as INSERT ... SELECT * and the sync SQL generator can copy columns
-- by name. Four bookkeeping columns follow the mirror.

CREATE TABLE IF NOT EXISTS div_signal_sync_queue (
  -- ---- mirror of div_signals -------------------------------------------
  `signal_id` int NOT NULL,
  `signal_number` varchar(40) NOT NULL,
  `normalized_signal_number` varchar(40) NOT NULL,
  `station_code` varchar(10) DEFAULT NULL,
  `station_name` varchar(80) DEFAULT NULL,
  `section` varchar(40) NOT NULL,
  `line` varchar(40) NOT NULL,
  `direction` enum('UP','DN','BOTH','UNKNOWN') NOT NULL DEFAULT 'UNKNOWN',
  `location_text` varchar(80) DEFAULT NULL,
  `km_text` varchar(30) DEFAULT NULL,
  `km_from_csmt` decimal(8,3) DEFAULT NULL,
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  `signal_type` enum('Automatic','Semi-Automatic','Manual','Gate','IBS','Repeater','Board','Other') NOT NULL DEFAULT 'Automatic',
  `signal_function` enum('Double Distant','Distant','Inner Distant','Home','Inner Home','Starter','Starter (Loop)','Advance Starter','Advanced Starter','IBS','IBS Distant','Gate Distant','Repeater','Other','Intermediate Starter') DEFAULT NULL,
  `aspects` tinyint DEFAULT NULL,
  `placement` enum('Left','Right','Extreme Right','Extreme Left','Gantry','Unknown') NOT NULL DEFAULT 'Unknown',
  `on_curve` enum('Left','Right','None','Unknown') NOT NULL DEFAULT 'Unknown',
  `curve_remarks` varchar(255) DEFAULT NULL,
  `is_rhs` tinyint(1) NOT NULL DEFAULT '0',
  `is_ext_rhs` tinyint(1) NOT NULL DEFAULT '0',
  `is_lhs` tinyint(1) NOT NULL DEFAULT '0',
  `is_ext_lhs` tinyint(1) NOT NULL DEFAULT '0',
  `has_legend_board` tinyint(1) NOT NULL DEFAULT '0',
  `has_calling_on` tinyint(1) NOT NULL DEFAULT '0',
  `has_shunt_signal` tinyint(1) NOT NULL DEFAULT '0',
  `ri_left_arms` tinyint NOT NULL DEFAULT '0',
  `ri_right_arms` tinyint NOT NULL DEFAULT '0',
  `book_description` text,
  `route_indicator_notes` text,
  `technical_remarks` text,
  `visibility_distance_m` int DEFAULT NULL,
  `sighting_remarks` text,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `seq_order` int DEFAULT NULL,
  `parallel_group_id` int DEFAULT NULL,
  `magnet_id` int DEFAULT NULL,
  -- ---- bookkeeping ----------------------------------------------------
  `old_signal_number` varchar(40) DEFAULT NULL COMMENT 'signal_number before the FIRST unsynced edit; drives alias re-creation on renumber',
  `change_kind` enum('updated','created') NOT NULL DEFAULT 'updated',
  `queued_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'time of the latest edit; set explicitly by the publish upsert, NOT on-update (mark-synced must not move it)',
  `queued_by_user_id` int DEFAULT NULL,
  `synced_at` timestamp NULL DEFAULT NULL COMMENT 'NULL = pending. Mark, never delete.',
  PRIMARY KEY (`signal_id`),
  KEY `idx_sync_pending` (`synced_at`, `queued_at`),
  CONSTRAINT `fk_sync_queue_signal` FOREIGN KEY (`signal_id`) REFERENCES `div_signals` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
