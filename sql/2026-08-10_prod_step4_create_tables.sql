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
-- Table structure for table `div_psr`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `div_psr` (
  `id` int NOT NULL AUTO_INCREMENT,
  `psr_code` varchar(40) DEFAULT NULL,
  `section` varchar(40) NOT NULL,
  `line` varchar(40) NOT NULL,
  `direction` enum('UP','DN','BOTH','UNKNOWN') NOT NULL DEFAULT 'UNKNOWN',
  `start_km_text` varchar(30) NOT NULL,
  `end_km_text` varchar(30) NOT NULL,
  `start_km_decimal` decimal(8,3) DEFAULT NULL,
  `end_km_decimal` decimal(8,3) DEFAULT NULL,
  `speed_kmph` int NOT NULL,
  `start_latitude` decimal(10,7) DEFAULT NULL,
  `start_longitude` decimal(10,7) DEFAULT NULL,
  `end_latitude` decimal(10,7) DEFAULT NULL,
  `end_longitude` decimal(10,7) DEFAULT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `remarks` text,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `effective_from` date DEFAULT NULL,
  `effective_to` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_section_line_direction` (`section`,`line`,`direction`),
  KEY `idx_speed` (`speed_kmph`),
  KEY `idx_active` (`is_active`),
  KEY `idx_effective_dates` (`effective_from`,`effective_to`)
) ENGINE=InnoDB AUTO_INCREMENT=328 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `div_ohe_neutral_sections`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `div_ohe_neutral_sections` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ns_code` varchar(40) DEFAULT NULL,
  `section` varchar(40) NOT NULL,
  `line` varchar(40) NOT NULL,
  `direction` enum('UP','DN','BOTH','UNKNOWN') NOT NULL DEFAULT 'UNKNOWN',
  `location_text` varchar(40) NOT NULL,
  `km_decimal` decimal(8,3) DEFAULT NULL,
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  `remarks` text,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `effective_from` date DEFAULT NULL,
  `effective_to` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_section_line_direction` (`section`,`line`,`direction`),
  KEY `idx_location_text` (`location_text`),
  KEY `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `div_signal_beats`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `div_signal_beats` (
  `id` int NOT NULL AUTO_INCREMENT,
  `beat_code` varchar(30) NOT NULL,
  `beat_name` varchar(80) NOT NULL,
  `office_code` varchar(10) DEFAULT NULL,
  `beat_category` enum('SUB','GOODS','HB','ML','KR','MMR','OTHER') DEFAULT 'OTHER',
  `description` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_beat_code` (`beat_code`),
  KEY `idx_office_code` (`office_code`),
  KEY `idx_active` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `div_signal_book_sections`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `div_signal_book_sections` (
  `id` int NOT NULL AUTO_INCREMENT,
  `section_title` varchar(120) NOT NULL,
  `section_code` varchar(50) NOT NULL,
  `direction` enum('UP','DN','BOTH','NA') NOT NULL DEFAULT 'NA',
  `line` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `edit_source` enum('import','ui') NOT NULL DEFAULT 'import' COMMENT 'import = spreadsheet-owned (re-import overwrites freely); ui = edited in editor, importer must pass --force',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_section_code` (`section_code`)
) ENGINE=InnoDB AUTO_INCREMENT=96 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `div_signal_beat_sections`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `div_signal_beat_sections` (
  `id` int NOT NULL AUTO_INCREMENT,
  `beat_id` int NOT NULL,
  `section_id` int NOT NULL,
  `display_order` int NOT NULL,
  `display_group` varchar(80) DEFAULT NULL,
  `lead_in_note` varchar(160) DEFAULT NULL,
  `start_page_no` int DEFAULT NULL,
  `end_page_no` int DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_beat_section` (`beat_id`,`section_id`),
  UNIQUE KEY `uk_beat_display_order` (`beat_id`,`display_order`),
  KEY `idx_section_id` (`section_id`),
  CONSTRAINT `fk_beat_sections_beat` FOREIGN KEY (`beat_id`) REFERENCES `div_signal_beats` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_beat_sections_section` FOREIGN KEY (`section_id`) REFERENCES `div_signal_book_sections` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=194 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `div_signal_book_rows`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `div_signal_book_rows` (
  `id` int NOT NULL AUTO_INCREMENT,
  `book_section_id` int NOT NULL,
  `row_order` int NOT NULL,
  `row_type` enum('SIGNAL','STATION_HEADER','PSR','NEUTRAL_SECTION','BOARD','TEXT_NOTE','SECTION_HEADER','RHS_SUMMARY','SIDING_DIAGRAM','BLANK') NOT NULL,
  `row_source` enum('manual','generated','import','ui') NOT NULL DEFAULT 'manual',
  `signal_id` int DEFAULT NULL,
  `psr_id` int DEFAULT NULL,
  `neutral_section_id` int DEFAULT NULL,
  `display_signal_no` varchar(80) DEFAULT NULL,
  `display_location` varchar(100) DEFAULT NULL,
  `display_description` text,
  `speed_kmph` int DEFAULT NULL,
  `km_range_text` varchar(80) DEFAULT NULL,
  `station_code` varchar(10) DEFAULT NULL,
  `station_name` varchar(80) DEFAULT NULL,
  `station_km_text` varchar(30) DEFAULT NULL,
  `page_no` int DEFAULT NULL,
  `column_no` tinyint DEFAULT NULL,
  `highlight_color` enum('NONE','BLUE','YELLOW','PURPLE','GREY','GREEN') NOT NULL DEFAULT 'NONE',
  `text_color` enum('BLACK','RED','BLUE') NOT NULL DEFAULT 'BLACK',
  `icon_type` enum('NONE','PSR','NEUTRAL_SECTION','LEGEND_BOARD','GRADIENT','CURVE_LEFT','CURVE_RIGHT','GATE','IBS') NOT NULL DEFAULT 'NONE',
  `remarks` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_section_row_order` (`book_section_id`,`row_order`),
  KEY `idx_book_section_id` (`book_section_id`),
  KEY `idx_signal_id` (`signal_id`),
  KEY `idx_psr_id` (`psr_id`),
  KEY `idx_neutral_section_id` (`neutral_section_id`),
  KEY `idx_row_type` (`row_type`),
  KEY `idx_page_col` (`page_no`,`column_no`),
  CONSTRAINT `fk_signal_book_rows_neutral_section` FOREIGN KEY (`neutral_section_id`) REFERENCES `div_ohe_neutral_sections` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_signal_book_rows_psr` FOREIGN KEY (`psr_id`) REFERENCES `div_psr` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_signal_book_rows_section` FOREIGN KEY (`book_section_id`) REFERENCES `div_signal_book_sections` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_signal_book_rows_signal` FOREIGN KEY (`signal_id`) REFERENCES `div_signals` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5189 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-10 15:32:14

-- verify: all 6 tables now present, empty
SELECT table_name, table_rows FROM information_schema.tables
WHERE table_schema=DATABASE()
  AND table_name IN ('div_psr','div_ohe_neutral_sections','div_signal_beats',
                     'div_signal_book_sections','div_signal_beat_sections','div_signal_book_rows')
ORDER BY table_name;
