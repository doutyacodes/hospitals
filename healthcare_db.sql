-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Aug 19, 2025 at 12:38 AM
-- Server version: 9.1.0
-- PHP Version: 8.3.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `healthcare_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `appointments`
--

DROP TABLE IF EXISTS `appointments`;
CREATE TABLE IF NOT EXISTS `appointments` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `doctor_id` varchar(36) DEFAULT NULL,
  `hospital_id` varchar(36) DEFAULT NULL,
  `session_id` varchar(36) DEFAULT NULL,
  `appointment_date` varchar(10) NOT NULL,
  `token_number` int NOT NULL,
  `estimated_time` varchar(8) DEFAULT NULL,
  `actual_start_time` varchar(8) DEFAULT NULL,
  `actual_end_time` varchar(8) DEFAULT NULL,
  `status` varchar(20) NOT NULL,
  `booking_type` varchar(20) NOT NULL,
  `patient_complaints` text,
  `doctor_notes` text,
  `prescription` text,
  `consultation_fee` decimal(8,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_appointments_user` (`user_id`),
  KEY `idx_appointments_doctor` (`doctor_id`),
  KEY `idx_appointments_date` (`appointment_date`),
  KEY `idx_appointments_status` (`status`),
  KEY `appointments_hospital_id_hospitals_id_fk` (`hospital_id`),
  KEY `appointments_session_id_doctor_sessions_id_fk` (`session_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` varchar(36) NOT NULL,
  `entity_type` varchar(50) NOT NULL,
  `entity_id` varchar(36) NOT NULL,
  `action` varchar(50) NOT NULL,
  `user_type` varchar(20) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `old_values` json DEFAULT NULL,
  `new_values` json DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_audit_entity` (`entity_type`,`entity_id`),
  KEY `idx_audit_user` (`user_type`,`user_id`),
  KEY `idx_audit_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `doctors`
--

DROP TABLE IF EXISTS `doctors`;
CREATE TABLE IF NOT EXISTS `doctors` (
  `id` char(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(191) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `specialty_id` varchar(36) DEFAULT NULL,
  `qualification` varchar(500) NOT NULL,
  `experience` int NOT NULL,
  `bio` text NOT NULL,
  `image` varchar(500) DEFAULT NULL,
  `rating` decimal(3,2) DEFAULT '0.00',
  `total_reviews` int DEFAULT '0',
  `consultation_fee` decimal(8,2) NOT NULL,
  `is_available` tinyint(1) DEFAULT '1',
  `license_number` varchar(100) NOT NULL,
  `date_of_birth` varchar(10) DEFAULT NULL,
  `address` text,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `zip_code` varchar(10) DEFAULT NULL,
  `bank_account` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `license_number` (`license_number`),
  KEY `idx_doctors_email` (`email`),
  KEY `idx_doctors_specialty` (`specialty_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `doctor_admins`
--

DROP TABLE IF EXISTS `doctor_admins`;
CREATE TABLE IF NOT EXISTS `doctor_admins` (
  `id` varchar(36) NOT NULL,
  `doctor_id` varchar(36) NOT NULL,
  `email` varchar(191) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` varchar(50) NOT NULL DEFAULT 'doctor',
  `permissions` json DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `last_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `doctor_id` (`doctor_id`),
  KEY `idx_doctor_admins_doctor` (`doctor_id`),
  KEY `idx_doctor_admins_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `doctor_hospital_requests`
--

DROP TABLE IF EXISTS `doctor_hospital_requests`;
CREATE TABLE IF NOT EXISTS `doctor_hospital_requests` (
  `id` varchar(36) NOT NULL,
  `doctor_id` varchar(36) NOT NULL,
  `hospital_id` varchar(36) NOT NULL,
  `requested_by` varchar(20) NOT NULL,
  `requestor_id` varchar(36) DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'pending',
  `message` text,
  `response_message` text,
  `requested_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `responded_at` timestamp NULL DEFAULT NULL,
  `responded_by` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_pending_request` (`doctor_id`,`hospital_id`,`status`),
  KEY `idx_requests_doctor` (`doctor_id`),
  KEY `idx_requests_hospital` (`hospital_id`),
  KEY `idx_requests_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `doctor_sessions`
--

DROP TABLE IF EXISTS `doctor_sessions`;
CREATE TABLE IF NOT EXISTS `doctor_sessions` (
  `id` varchar(36) NOT NULL,
  `doctor_id` varchar(36) DEFAULT NULL,
  `hospital_id` varchar(36) DEFAULT NULL,
  `day_of_week` varchar(10) NOT NULL,
  `start_time` varchar(8) NOT NULL,
  `end_time` varchar(8) NOT NULL,
  `max_tokens` int NOT NULL,
  `avg_minutes_per_patient` int DEFAULT '15',
  `is_active` tinyint(1) DEFAULT '1',
  `approval_status` varchar(20) DEFAULT 'approved',
  `approved_by` varchar(36) DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `notes` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_doctor_sessions_doctor` (`doctor_id`),
  KEY `idx_doctor_sessions_hospital` (`hospital_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `doctor_session_requests`
--

DROP TABLE IF EXISTS `doctor_session_requests`;
CREATE TABLE IF NOT EXISTS `doctor_session_requests` (
  `id` varchar(36) NOT NULL,
  `doctor_id` varchar(36) NOT NULL,
  `hospital_id` varchar(36) NOT NULL,
  `requested_by` varchar(20) NOT NULL,
  `requestor_id` varchar(36) DEFAULT NULL,
  `day_of_week` varchar(10) NOT NULL,
  `start_time` varchar(8) NOT NULL,
  `end_time` varchar(8) NOT NULL,
  `max_tokens` int NOT NULL,
  `avg_minutes_per_patient` int DEFAULT '15',
  `special_notes` text,
  `status` varchar(20) NOT NULL DEFAULT 'pending',
  `response_message` text,
  `session_id` varchar(36) DEFAULT NULL,
  `requested_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `responded_at` timestamp NULL DEFAULT NULL,
  `responded_by` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_session_requests_doctor` (`doctor_id`),
  KEY `idx_session_requests_hospital` (`hospital_id`),
  KEY `idx_session_requests_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `emergency_contacts`
--

DROP TABLE IF EXISTS `emergency_contacts`;
CREATE TABLE IF NOT EXISTS `emergency_contacts` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `relationship` varchar(50) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `address` text,
  `is_primary` tinyint(1) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `emergency_contacts_user_id_users_id_fk` (`user_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `hospitals`
--

DROP TABLE IF EXISTS `hospitals`;
CREATE TABLE IF NOT EXISTS `hospitals` (
  `id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `address` text NOT NULL,
  `city` varchar(100) NOT NULL,
  `state` varchar(100) NOT NULL,
  `zip_code` varchar(10) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `email` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `image` varchar(500) DEFAULT NULL,
  `rating` decimal(3,2) DEFAULT '0.00',
  `total_reviews` int DEFAULT '0',
  `total_doctors` int DEFAULT '0',
  `established` int NOT NULL,
  `website` varchar(255) DEFAULT NULL,
  `license_number` varchar(100) DEFAULT NULL,
  `accreditation` varchar(255) DEFAULT NULL,
  `bed_count` int DEFAULT NULL,
  `emergency_services` tinyint(1) DEFAULT '0',
  `parking_available` tinyint(1) DEFAULT '0',
  `operating_hours` json DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_license_number` (`license_number`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `hospital_admins`
--

DROP TABLE IF EXISTS `hospital_admins`;
CREATE TABLE IF NOT EXISTS `hospital_admins` (
  `id` varchar(36) NOT NULL,
  `hospital_id` varchar(36) NOT NULL,
  `email` varchar(191) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `role` varchar(50) NOT NULL DEFAULT 'admin',
  `permissions` json DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `last_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_hospital_admins_hospital` (`hospital_id`),
  KEY `idx_hospital_admins_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `hospital_doctor_associations`
--

DROP TABLE IF EXISTS `hospital_doctor_associations`;
CREATE TABLE IF NOT EXISTS `hospital_doctor_associations` (
  `id` varchar(36) NOT NULL,
  `hospital_id` varchar(36) NOT NULL,
  `doctor_id` varchar(36) NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'active',
  `commission_rate` decimal(5,2) DEFAULT NULL,
  `special_terms` text,
  `approved_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `approved_by` varchar(36) NOT NULL,
  `deactivated_at` timestamp NULL DEFAULT NULL,
  `deactivated_by` varchar(36) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_hospital_doctor` (`hospital_id`,`doctor_id`),
  KEY `idx_associations_hospital` (`hospital_id`),
  KEY `idx_associations_doctor` (`doctor_id`),
  KEY `idx_associations_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `hospital_settings`
--

DROP TABLE IF EXISTS `hospital_settings`;
CREATE TABLE IF NOT EXISTS `hospital_settings` (
  `id` varchar(36) NOT NULL,
  `hospital_id` varchar(36) NOT NULL,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text NOT NULL,
  `setting_type` varchar(20) DEFAULT 'string',
  `description` text,
  `updated_by` varchar(36) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_hospital_setting` (`hospital_id`,`setting_key`),
  KEY `idx_hospital_settings_hospital` (`hospital_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `hospital_specialties`
--

DROP TABLE IF EXISTS `hospital_specialties`;
CREATE TABLE IF NOT EXISTS `hospital_specialties` (
  `hospital_id` varchar(36) NOT NULL,
  `specialty_id` varchar(36) NOT NULL,
  PRIMARY KEY (`hospital_id`,`specialty_id`),
  KEY `hospital_specialties_specialty_id_specialties_id_fk` (`specialty_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `insurance`
--

DROP TABLE IF EXISTS `insurance`;
CREATE TABLE IF NOT EXISTS `insurance` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `provider` varchar(255) NOT NULL,
  `policy_number` varchar(100) NOT NULL,
  `policy_holder_name` varchar(255) NOT NULL,
  `coverage_amount` decimal(10,2) DEFAULT NULL,
  `deductible` decimal(8,2) DEFAULT NULL,
  `expiry_date` varchar(10) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `documents` json DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `insurance_user_id_users_id_fk` (`user_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `medical_records`
--

DROP TABLE IF EXISTS `medical_records`;
CREATE TABLE IF NOT EXISTS `medical_records` (
  `id` varchar(36) NOT NULL,
  `appointment_id` varchar(36) DEFAULT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `doctor_id` varchar(36) DEFAULT NULL,
  `diagnosis` text,
  `symptoms` text,
  `treatment` text,
  `prescription` json DEFAULT NULL,
  `vitals` json DEFAULT NULL,
  `lab_reports` json DEFAULT NULL,
  `follow_up_date` varchar(10) DEFAULT NULL,
  `follow_up_instructions` text,
  `attachments` json DEFAULT NULL,
  `is_private` tinyint(1) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_medical_records_user` (`user_id`),
  KEY `medical_records_appointment_id_appointments_id_fk` (`appointment_id`),
  KEY `medical_records_doctor_id_doctors_id_fk` (`doctor_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `type` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `data` json DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `read_at` timestamp NULL DEFAULT NULL,
  `scheduled_for` timestamp NULL DEFAULT NULL,
  `sent_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_notifications_user` (`user_id`),
  KEY `idx_notifications_read` (`is_read`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
CREATE TABLE IF NOT EXISTS `payments` (
  `id` varchar(36) NOT NULL,
  `appointment_id` varchar(36) DEFAULT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `doctor_id` varchar(36) DEFAULT NULL,
  `payment_method_id` varchar(36) DEFAULT NULL,
  `amount` decimal(8,2) NOT NULL,
  `currency` varchar(3) DEFAULT 'INR',
  `status` varchar(20) NOT NULL,
  `transaction_id` varchar(100) DEFAULT NULL,
  `gateway_transaction_id` varchar(255) DEFAULT NULL,
  `gateway` varchar(50) DEFAULT NULL,
  `gateway_response` json DEFAULT NULL,
  `paid_at` timestamp NULL DEFAULT NULL,
  `failed_at` timestamp NULL DEFAULT NULL,
  `failure_reason` text,
  `refunded_at` timestamp NULL DEFAULT NULL,
  `refund_amount` decimal(8,2) DEFAULT NULL,
  `refund_reason` text,
  `platform_fee` decimal(8,2) DEFAULT '0.00',
  `doctor_earnings` decimal(8,2) DEFAULT NULL,
  `hospital_earnings` decimal(8,2) DEFAULT NULL,
  `hospital_commission_rate` decimal(5,2) DEFAULT NULL,
  `tax_amount` decimal(8,2) DEFAULT '0.00',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `transaction_id` (`transaction_id`),
  KEY `idx_payments_appointment` (`appointment_id`),
  KEY `idx_payments_user` (`user_id`),
  KEY `idx_payments_status` (`status`),
  KEY `payments_doctor_id_doctors_id_fk` (`doctor_id`),
  KEY `payments_payment_method_id_payment_methods_id_fk` (`payment_method_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payment_methods`
--

DROP TABLE IF EXISTS `payment_methods`;
CREATE TABLE IF NOT EXISTS `payment_methods` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `type` varchar(20) NOT NULL,
  `provider` varchar(50) DEFAULT NULL,
  `last_four_digits` varchar(4) DEFAULT NULL,
  `expiry_date` varchar(5) DEFAULT NULL,
  `holder_name` varchar(255) DEFAULT NULL,
  `is_default` tinyint(1) DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `payment_methods_user_id_users_id_fk` (`user_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payment_receipts`
--

DROP TABLE IF EXISTS `payment_receipts`;
CREATE TABLE IF NOT EXISTS `payment_receipts` (
  `id` varchar(36) NOT NULL,
  `payment_id` varchar(36) DEFAULT NULL,
  `receipt_number` varchar(100) NOT NULL,
  `receipt_data` json NOT NULL,
  `receipt_url` varchar(500) DEFAULT NULL,
  `email_sent` tinyint(1) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `receipt_number` (`receipt_number`),
  KEY `payment_receipts_payment_id_payments_id_fk` (`payment_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
CREATE TABLE IF NOT EXISTS `reviews` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `doctor_id` varchar(36) DEFAULT NULL,
  `hospital_id` varchar(36) DEFAULT NULL,
  `appointment_id` varchar(36) DEFAULT NULL,
  `rating` int NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `comment` text,
  `is_anonymous` tinyint(1) DEFAULT '0',
  `is_verified` tinyint(1) DEFAULT '0',
  `helpful_votes` int DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_reviews_doctor` (`doctor_id`),
  KEY `idx_reviews_hospital` (`hospital_id`),
  KEY `reviews_user_id_users_id_fk` (`user_id`),
  KEY `reviews_appointment_id_appointments_id_fk` (`appointment_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `specialties`
--

DROP TABLE IF EXISTS `specialties`;
CREATE TABLE IF NOT EXISTS `specialties` (
  `id` varchar(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text,
  `icon` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `system_settings`
--

DROP TABLE IF EXISTS `system_settings`;
CREATE TABLE IF NOT EXISTS `system_settings` (
  `key` varchar(100) NOT NULL,
  `value` text NOT NULL,
  `description` text,
  `type` varchar(20) DEFAULT 'string',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`key`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` char(36) NOT NULL,
  `email` varchar(191) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `date_of_birth` varchar(10) NOT NULL,
  `gender` varchar(10) NOT NULL,
  `address` text NOT NULL,
  `city` varchar(100) NOT NULL,
  `state` varchar(100) NOT NULL,
  `zip_code` varchar(10) NOT NULL,
  `blood_group` varchar(5) DEFAULT NULL,
  `allergies` text,
  `emergency_contact` varchar(100) DEFAULT NULL,
  `emergency_phone` varchar(20) DEFAULT NULL,
  `terms_accepted` tinyint(1) NOT NULL,
  `marketing_emails` tinyint(1) DEFAULT '0',
  `profile_image` varchar(500) DEFAULT NULL,
  `is_verified` tinyint(1) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `medical_history` varchar(150) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `doctor_admins`
--
ALTER TABLE `doctor_admins`
  ADD CONSTRAINT `doctor_admins_doctor_id_doctors_id_fk` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
