-- ============================================================================
-- Create token_call_history table if it doesn't exist
-- This table is required for the recall functionality
-- ============================================================================

CREATE TABLE IF NOT EXISTS `token_call_history` (
  `id` varchar(36) NOT NULL,
  `session_id` varchar(36) NOT NULL,
  `appointment_id` varchar(36) DEFAULT NULL,
  `appointment_date` varchar(10) NOT NULL,
  `token_number` int NOT NULL,
  `call_type` varchar(20) NOT NULL DEFAULT 'normal' COMMENT 'normal, recall, final_call',
  `is_recall` tinyint(1) DEFAULT '0',
  `recall_reason` varchar(50) DEFAULT NULL COMMENT 'no_show, interval_check, manual_recall',
  `called_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `called_by` varchar(36) DEFAULT NULL COMMENT 'Doctor/Admin ID who triggered the call',
  `patient_attended` tinyint(1) DEFAULT '0',
  `attended_at` timestamp NULL DEFAULT NULL,
  `skipped_reason` text,
  PRIMARY KEY (`id`),
  KEY `idx_session_date` (`session_id`,`appointment_date`),
  KEY `idx_appointment` (`appointment_id`),
  KEY `idx_call_type` (`call_type`),
  KEY `idx_recall` (`is_recall`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
COMMENT='Tracks all token calls including recalls for audit and analytics';

-- Add foreign key constraints only if they don't exist
-- Note: This might fail if the constraint already exists, so we ignore the error
ALTER TABLE `token_call_history`
  ADD CONSTRAINT `fk_token_call_session`
  FOREIGN KEY (`session_id`)
  REFERENCES `doctor_sessions` (`id`)
  ON DELETE CASCADE;

-- Note: Run this SQL after importing hospital.sql to ensure the table exists
-- If you get an error about duplicate constraint, you can ignore it

-- ============================================================================
-- USAGE INSTRUCTIONS
-- ============================================================================
-- 1. First import hospital.sql to create all base tables
-- 2. Then run this file to ensure token_call_history exists
-- 3. Then import dummy_data.sql to add test data
-- ============================================================================
