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
-- Table structure for table `cancelled_trains`
--

DROP TABLE IF EXISTS `cancelled_trains`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cancelled_trains` (
  `id` int NOT NULL AUTO_INCREMENT,
  `train_number` varchar(20) NOT NULL,
  `date` date NOT NULL,
  `cancelled_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `reason` varchar(255) DEFAULT NULL,
  `notes` text,
  `office` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_cancelled` (`train_number`,`date`)
) ENGINE=InnoDB AUTO_INCREMENT=5246 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `details`
--

DROP TABLE IF EXISTS `details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `details` (
  `detail_id` varchar(50) NOT NULL,
  `detail_number` varchar(20) DEFAULT NULL,
  `line` varchar(20) DEFAULT NULL,
  `sign_on_time` time DEFAULT NULL,
  `sign_on_place` varchar(50) DEFAULT NULL,
  `sign_off_time` time DEFAULT NULL,
  `sign_off_place` varchar(50) DEFAULT NULL,
  `total_duty_hours` varchar(10) DEFAULT NULL,
  `total_wheel_movement` varchar(10) DEFAULT NULL,
  `total_piloting` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`detail_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `duty_roster`
--

DROP TABLE IF EXISTS `duty_roster`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `duty_roster` (
  `id` int NOT NULL AUTO_INCREMENT,
  `detail_number` varchar(20) NOT NULL,
  `motorman_name` varchar(100) DEFAULT NULL,
  `motorman_id` varchar(20) DEFAULT NULL,
  `office` varchar(10) NOT NULL,
  `date` date NOT NULL,
  `uploaded_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=61760 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `duty_roster_history`
--

DROP TABLE IF EXISTS `duty_roster_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `duty_roster_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `detail_number` varchar(20) NOT NULL,
  `original_motorman_name` varchar(100) DEFAULT NULL,
  `current_motorman_name` varchar(100) DEFAULT NULL,
  `total_reassignments` int DEFAULT '0',
  `is_fully_assigned` tinyint(1) DEFAULT '1',
  `has_special_trains` tinyint(1) DEFAULT '0',
  `office` varchar(10) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_detail_date` (`date`,`detail_number`),
  KEY `idx_date_office` (`date`,`office`),
  KEY `idx_detail_date` (`detail_number`,`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `holidays_list`
--

DROP TABLE IF EXISTS `holidays_list`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `holidays_list` (
  `id` int NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `holiday` varchar(100) NOT NULL,
  `day` varchar(20) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `date` (`date`),
  KEY `idx_date` (`date`),
  KEY `idx_holiday` (`holiday`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `memu_day_patterns`
--

DROP TABLE IF EXISTS `memu_day_patterns`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `memu_day_patterns` (
  `id` int NOT NULL AUTO_INCREMENT,
  `detail_number` varchar(10) DEFAULT NULL,
  `pattern_name` varchar(50) DEFAULT NULL,
  `day_type` enum('monday_friday','monday_thursday','friday','saturday','sunday','saturday_sunday','monday_saturday') NOT NULL,
  `day_description` text,
  `sign_on_time` time NOT NULL,
  `sign_on_place` varchar(10) DEFAULT NULL,
  `sign_off_time` time NOT NULL,
  `sign_off_place` varchar(10) DEFAULT NULL,
  `total_duty_hours` varchar(10) DEFAULT NULL,
  `crosses_midnight` tinyint(1) DEFAULT '0',
  `calculated_wheel_movement` varchar(10) DEFAULT NULL,
  `calculated_piloting` varchar(10) DEFAULT NULL,
  `working_train_count` int DEFAULT '0',
  `piloting_train_count` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_detail_day` (`detail_number`,`day_type`),
  KEY `idx_active` (`is_active`),
  CONSTRAINT `memu_day_patterns_ibfk_1` FOREIGN KEY (`detail_number`) REFERENCES `memu_details` (`detail_number`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary view structure for view `memu_detail_check`
--

DROP TABLE IF EXISTS `memu_detail_check`;
/*!50001 DROP VIEW IF EXISTS `memu_detail_check`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `memu_detail_check` AS SELECT 
 1 AS `detail_number`,
 1 AS `description`,
 1 AS `is_active`,
 1 AS `pattern_count`,
 1 AS `available_patterns`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `memu_details`
--

DROP TABLE IF EXISTS `memu_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `memu_details` (
  `id` int NOT NULL AUTO_INCREMENT,
  `detail_number` varchar(10) NOT NULL,
  `description` varchar(200) DEFAULT NULL,
  `line` enum('mainline','harbour') NOT NULL DEFAULT 'mainline',
  `base_office` varchar(10) DEFAULT 'KYN',
  `is_active` tinyint(1) DEFAULT '1',
  `implementation_date` date DEFAULT NULL,
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `detail_number` (`detail_number`),
  KEY `idx_detail_number` (`detail_number`),
  KEY `idx_active` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary view structure for view `memu_pattern_summary`
--

DROP TABLE IF EXISTS `memu_pattern_summary`;
/*!50001 DROP VIEW IF EXISTS `memu_pattern_summary`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `memu_pattern_summary` AS SELECT 
 1 AS `detail_number`,
 1 AS `description`,
 1 AS `pattern_name`,
 1 AS `day_type`,
 1 AS `day_description`,
 1 AS `sign_on_time`,
 1 AS `sign_off_time`,
 1 AS `total_duty_hours`,
 1 AS `crosses_midnight`,
 1 AS `calculated_wheel_movement`,
 1 AS `working_train_count`,
 1 AS `piloting_train_count`,
 1 AS `actual_train_count`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `memu_trains`
--

DROP TABLE IF EXISTS `memu_trains`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `memu_trains` (
  `id` int NOT NULL AUTO_INCREMENT,
  `detail_number` varchar(10) DEFAULT NULL,
  `pattern_id` int DEFAULT NULL,
  `train_number` varchar(50) NOT NULL,
  `train_type` enum('working','piloting') NOT NULL,
  `start_station` varchar(10) DEFAULT NULL,
  `start_time` time DEFAULT NULL,
  `end_station` varchar(10) DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `duration` varchar(10) DEFAULT NULL,
  `is_working` tinyint(1) DEFAULT '0',
  `is_cross_midnight` tinyint(1) DEFAULT '0',
  `next_day` tinyint(1) DEFAULT '0',
  `notes` varchar(200) DEFAULT NULL,
  `sequence_order` int DEFAULT '1',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `pattern_id` (`pattern_id`),
  KEY `idx_detail_pattern` (`detail_number`,`pattern_id`),
  KEY `idx_train_type` (`train_type`),
  KEY `idx_working` (`is_working`),
  CONSTRAINT `memu_trains_ibfk_1` FOREIGN KEY (`detail_number`) REFERENCES `memu_details` (`detail_number`) ON DELETE CASCADE,
  CONSTRAINT `memu_trains_ibfk_2` FOREIGN KEY (`pattern_id`) REFERENCES `memu_day_patterns` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=96 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `motormen`
--

DROP TABLE IF EXISTS `motormen`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `motormen` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cmsid` varchar(20) NOT NULL,
  `motorman_name` varchar(100) NOT NULL,
  `mobile_number` varchar(15) DEFAULT NULL,
  `pf_number` varchar(20) DEFAULT NULL,
  `hrms_id` varchar(20) DEFAULT NULL,
  `office` enum('CSMT','KYN','PNVL') DEFAULT 'CSMT',
  `status` enum('active','inactive','transferred') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cmsid` (`cmsid`),
  KEY `idx_cmsid` (`cmsid`),
  KEY `idx_motorman_name` (`motorman_name`),
  KEY `idx_office` (`office`),
  KEY `idx_status` (`status`),
  KEY `idx_mobile` (`mobile_number`)
) ENGINE=InnoDB AUTO_INCREMENT=755 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `reassignment_history`
--

DROP TABLE IF EXISTS `reassignment_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reassignment_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `detail_number` varchar(50) NOT NULL,
  `original_motorman` varchar(255) DEFAULT NULL,
  `original_motorman_cmsid` varchar(20) DEFAULT NULL,
  `new_motorman` varchar(255) NOT NULL,
  `new_motorman_cmsid` varchar(20) DEFAULT NULL,
  `reassignment_type` varchar(50) DEFAULT NULL,
  `reason` varchar(255) NOT NULL,
  `notes` text,
  `selected_trains` json DEFAULT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_date_detail` (`date`,`detail_number`)
) ENGINE=InnoDB AUTO_INCREMENT=963 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `reassignments`
--

DROP TABLE IF EXISTS `reassignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reassignments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `original_motorman_name` varchar(100) DEFAULT NULL,
  `original_detail_id` varchar(20) DEFAULT NULL,
  `new_motorman_name` varchar(100) DEFAULT NULL,
  `new_detail_id` varchar(20) DEFAULT NULL,
  `reassignment_type` enum('motorman_to_detail','detail_to_motorman','waiting_to_vacant','waiting_to_occupied','additional_assignment','partial_vacation','special_train_assignment','motorman_swap','detail_split','detail_merge') NOT NULL,
  `assignment_scope` enum('full','partial') DEFAULT 'full',
  `displaced_action` enum('mark_waiting','assign_to_relief','assign_to_other','cancel_trains') DEFAULT NULL,
  `displaced_motorman` varchar(100) DEFAULT NULL,
  `reason` varchar(500) NOT NULL,
  `notes` text,
  `created_by` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `office` varchar(10) NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `idx_date_office` (`date`,`office`),
  KEY `idx_original_motorman` (`original_motorman_name`,`date`),
  KEY `idx_new_motorman` (`new_motorman_name`,`date`),
  KEY `idx_type_date` (`reassignment_type`,`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `special_trains`
--

DROP TABLE IF EXISTS `special_trains`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `special_trains` (
  `id` int NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `train_number` varchar(50) NOT NULL,
  `train_name` varchar(100) DEFAULT NULL,
  `train_type_operation` enum('working','piloting') DEFAULT 'working',
  `sign_on_time` time NOT NULL,
  `sign_off_time` time NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `start_station` varchar(50) NOT NULL,
  `end_station` varchar(100) NOT NULL,
  `assigned_motorman` varchar(100) DEFAULT NULL,
  `office` varchar(10) NOT NULL,
  `duty_hours` decimal(4,2) NOT NULL,
  `wheel_movement_hours` decimal(4,2) NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `remarks` text,
  `created_by` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_special_train` (`date`,`train_number`),
  KEY `idx_date_office` (`date`,`office`),
  KEY `idx_motorman_date` (`assigned_motorman`,`date`),
  KEY `idx_train_number_date` (`train_number`,`date`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `test_users`
--

DROP TABLE IF EXISTS `test_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `test_users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `train_assignments`
--

DROP TABLE IF EXISTS `train_assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `train_assignments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `detail_id` varchar(20) DEFAULT NULL,
  `train_number` varchar(50) DEFAULT NULL,
  `assigned_motorman` varchar(100) DEFAULT NULL,
  `is_original_assignment` tinyint(1) DEFAULT '1',
  `train_source` enum('regular','special') DEFAULT 'regular',
  `source_train_id` int DEFAULT NULL,
  `reassignment_id` int DEFAULT NULL,
  `assigned_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `assigned_by` varchar(100) DEFAULT NULL,
  `train_status` enum('active','cancelled','vacated','completed') DEFAULT 'active',
  `requires_assignment` tinyint(1) DEFAULT '1',
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `start_station` varchar(50) DEFAULT NULL,
  `end_station` varchar(50) DEFAULT NULL,
  `duty_hours` decimal(4,2) DEFAULT NULL,
  `wheel_movement_hours` decimal(4,2) DEFAULT NULL,
  `notes` text,
  `office` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_train_date` (`date`,`train_number`,`train_source`),
  KEY `reassignment_id` (`reassignment_id`),
  KEY `idx_date_detail` (`date`,`detail_id`),
  KEY `idx_date_train` (`date`,`train_number`),
  KEY `idx_motorman_date` (`assigned_motorman`,`date`),
  CONSTRAINT `train_assignments_ibfk_1` FOREIGN KEY (`reassignment_id`) REFERENCES `reassignments` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `trains`
--

DROP TABLE IF EXISTS `trains`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trains` (
  `id` int NOT NULL AUTO_INCREMENT,
  `detail_id` varchar(50) DEFAULT NULL,
  `line` varchar(20) DEFAULT NULL,
  `train_number` varchar(20) DEFAULT NULL,
  `start_station` varchar(50) DEFAULT NULL,
  `start_time` time DEFAULT NULL,
  `end_station` varchar(50) DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `status` varchar(20) DEFAULT NULL,
  `remarks` text,
  `train_type` enum('working','piloting','waiting','special') DEFAULT 'working',
  PRIMARY KEY (`id`),
  KEY `idx_detail_train_type` (`detail_id`,`train_type`),
  CONSTRAINT `trains_ibfk_1` FOREIGN KEY (`detail_id`) REFERENCES `details` (`detail_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2647 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','supervisor','user') DEFAULT 'user',
  `full_name` varchar(100) DEFAULT NULL,
  `office` enum('CSMT','KYN','PNVL','HQ') DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `waiting_details`
--

DROP TABLE IF EXISTS `waiting_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `waiting_details` (
  `id` int NOT NULL AUTO_INCREMENT,
  `detail_number` varchar(10) NOT NULL,
  `sign_on_time` time NOT NULL,
  `sign_off_time` time NOT NULL,
  `total_duty_hours` varchar(10) NOT NULL,
  `office` enum('CSMT','KYN','PNVL') NOT NULL,
  `line` enum('mainline','harbour') DEFAULT 'mainline',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_waiting_detail` (`detail_number`,`office`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Final view structure for view `memu_detail_check`
--

/*!50001 DROP VIEW IF EXISTS `memu_detail_check`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`jay`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `memu_detail_check` AS select `md`.`detail_number` AS `detail_number`,`md`.`description` AS `description`,`md`.`is_active` AS `is_active`,count(`mdp`.`id`) AS `pattern_count`,group_concat(`mdp`.`day_type` order by `mdp`.`day_type` ASC separator ',') AS `available_patterns` from (`memu_details` `md` left join `memu_day_patterns` `mdp` on(((`md`.`detail_number` = `mdp`.`detail_number`) and (`mdp`.`is_active` = true)))) where (`md`.`is_active` = true) group by `md`.`detail_number`,`md`.`description`,`md`.`is_active` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `memu_pattern_summary`
--

/*!50001 DROP VIEW IF EXISTS `memu_pattern_summary`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`jay`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `memu_pattern_summary` AS select `md`.`detail_number` AS `detail_number`,`md`.`description` AS `description`,`mdp`.`pattern_name` AS `pattern_name`,`mdp`.`day_type` AS `day_type`,`mdp`.`day_description` AS `day_description`,`mdp`.`sign_on_time` AS `sign_on_time`,`mdp`.`sign_off_time` AS `sign_off_time`,`mdp`.`total_duty_hours` AS `total_duty_hours`,`mdp`.`crosses_midnight` AS `crosses_midnight`,`mdp`.`calculated_wheel_movement` AS `calculated_wheel_movement`,`mdp`.`working_train_count` AS `working_train_count`,`mdp`.`piloting_train_count` AS `piloting_train_count`,count(`mt`.`id`) AS `actual_train_count` from ((`memu_details` `md` join `memu_day_patterns` `mdp` on((`md`.`detail_number` = `mdp`.`detail_number`))) left join `memu_trains` `mt` on(((`mdp`.`id` = `mt`.`pattern_id`) and (`mt`.`is_active` = true)))) where ((`md`.`is_active` = true) and (`mdp`.`is_active` = true)) group by `md`.`detail_number`,`mdp`.`id` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-09-18 12:01:46
