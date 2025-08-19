-- Fix data type mismatch between doctors.id and doctor_admins.doctor_id
-- This script updates the doctors table id column from char(36) to varchar(36)
-- to match the doctor_admins.doctor_id column type

USE healthcare_db;

-- First, disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- Update the doctors table id column type
ALTER TABLE doctors MODIFY COLUMN id varchar(36) NOT NULL;

-- Update users table id column type for consistency
ALTER TABLE users MODIFY COLUMN id varchar(36) NOT NULL;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Verify the changes
DESCRIBE doctors;
DESCRIBE doctor_admins;
DESCRIBE users;