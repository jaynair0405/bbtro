-- Prod: create the two editor workflow tables missed in the book-table deploy.
-- div_signal_section_drafts (draft edits) + div_signal_history (publish audit). Both empty.
-- FKs target div_signal_book_sections / div_signals (already on prod).

-- MySQL dump 10.13  Distrib 8.1.0, for macos13 (x86_64)
--
-- Host: localhost    Database: bbtro
-- ------------------------------------------------------
-- Server version	8.1.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `div_signal_section_drafts`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `div_signal_section_drafts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `section_id` int NOT NULL,
  `draft_json` longtext COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Full editable snapshot of the section: { signals: [...], rows: [...] }',
  `base_loaded_at` timestamp NULL DEFAULT NULL COMMENT 'Live-table state timestamp the draft was seeded from (stale-edit detection)',
  `updated_by` int DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_draft_section` (`section_id`),
  KEY `idx_draft_updated` (`updated_at`),
  CONSTRAINT `fk_draft_section` FOREIGN KEY (`section_id`) REFERENCES `div_signal_book_sections` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `div_signal_history`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `div_signal_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `signal_id` int NOT NULL,
  `change_type` enum('Created','Renumbered','Relocated','Decommissioned','Reactivated','Type Changed','Placement Changed','Location Changed','Description Changed','Other') NOT NULL,
  `old_value` text,
  `new_value` text,
  `change_date` date DEFAULT NULL,
  `changed_by_user_id` int DEFAULT NULL,
  `remarks` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_signal_id` (`signal_id`),
  KEY `idx_change_type` (`change_type`),
  KEY `idx_change_date` (`change_date`),
  CONSTRAINT `fk_signal_history_signal` FOREIGN KEY (`signal_id`) REFERENCES `div_signals` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-12 16:12:09

SELECT table_name FROM information_schema.tables
WHERE table_schema=DATABASE() AND table_name IN ('div_signal_section_drafts','div_signal_history');
