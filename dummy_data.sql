-- ============================================================================
-- DUMMY DATA FOR TESTING
-- Doctor: doc-027 (Dr. Dhanya SP)
-- Session: sess-027-2 (Wednesday 09:00-13:00, max 40 tokens)
-- Hospital: hosp-005
-- Date: 2025-10-08 (Wednesday - TODAY)
-- Password for all users: password123 (hashed: $2b$12$PvZDZ8adriyh4txwPaaYnOMlnmHK1uqu.wR7A4.dyUmSTemnKAAKm)
-- ============================================================================

-- Ensure the doctor session exists (Wednesday session for doc-027)
-- This checks if the session already exists, if not it will be created from the main hospital.sql
-- The session ID sess-027-2 should already exist in the database

-- Insert 20 test users
INSERT INTO `users` (`id`, `email`, `password_hash`, `first_name`, `last_name`, `phone`, `date_of_birth`, `gender`, `address`, `city`, `state`, `zip_code`, `blood_group`, `allergies`, `medical_history`, `emergency_contact`, `emergency_phone`, `terms_accepted`, `marketing_emails`, `profile_image`, `is_verified`, `created_at`, `updated_at`) VALUES
('test-user--001', 'patient001@tests.com', '$2b$12$PvZDZ8adriyh4txwPaaYnOMlnmHK1uqu.wR7A4.dyUmSTemnKAAKm', 'Rahul', 'Sharma', '9876543210', '1990-05-15', 'male', 'MG Road', 'Kottayam', 'Kerala', '686001', 'A+', 'None', 'Healthy', 'Mrs. Sharma', '9876543211', 1, 0, NULL, 1, NOW(), NOW()),
('test-user--002', 'patient002@tests.com', '$2b$12$PvZDZ8adriyh4txwPaaYnOMlnmHK1uqu.wR7A4.dyUmSTemnKAAKm', 'Priya', 'Nair', '9876543220', '1985-08-22', 'female', 'KK Road', 'Kottayam', 'Kerala', '686002', 'B+', 'Pollen', 'Asthma', 'Mr. Nair', '9876543221', 1, 0, NULL, 1, NOW(), NOW()),
('test-user--003', 'patient003@tests.com', '$2b$12$PvZDZ8adriyh4txwPaaYnOMlnmHK1uqu.wR7A4.dyUmSTemnKAAKm', 'Amit', 'Kumar', '9876543230', '1992-03-10', 'male', 'MC Road', 'Kottayam', 'Kerala', '686003', 'O+', 'None', 'Diabetes', 'Mrs. Kumar', '9876543231', 1, 0, NULL, 1, NOW(), NOW()),
('test-user--004', 'patient004@tests.com', '$2b$12$PvZDZ8adriyh4txwPaaYnOMlnmHK1uqu.wR7A4.dyUmSTemnKAAKm', 'Sneha', 'Menon', '9876543240', '1988-11-05', 'female', 'Gandhi Nagar', 'Kottayam', 'Kerala', '686004', 'AB+', 'Penicillin', 'Hypertension', 'Mr. Menon', '9876543241', 1, 0, NULL, 1, NOW(), NOW()),
('test-user--005', 'patient005@tests.com', '$2b$12$PvZDZ8adriyh4txwPaaYnOMlnmHK1uqu.wR7A4.dyUmSTemnKAAKm', 'Vijay', 'Krishnan', '9876543250', '1995-07-18', 'male', 'Collectorate Road', 'Kottayam', 'Kerala', '686005', 'A-', 'None', 'Healthy', 'Mrs. Krishnan', '9876543251', 1, 0, NULL, 1, NOW(), NOW()),
('test-user--006', 'patient006@tests.com', '$2b$12$PvZDZ8adriyh4txwPaaYnOMlnmHK1uqu.wR7A4.dyUmSTemnKAAKm', 'Anjali', 'Pillai', '9876543260', '1991-12-30', 'female', 'TB Road', 'Kottayam', 'Kerala', '686006', 'B-', 'None', 'Thyroid', 'Mr. Pillai', '9876543261', 1, 0, NULL, 1, NOW(), NOW()),
('test-user--007', 'patient007@tests.com', '$2b$12$PvZDZ8adriyh4txwPaaYnOMlnmHK1uqu.wR7A4.dyUmSTemnKAAKm', 'Arjun', 'Das', '9876543270', '1987-04-25', 'male', 'SH Road', 'Kottayam', 'Kerala', '686007', 'O-', 'Sulfa drugs', 'Healthy', 'Mrs. Das', '9876543271', 1, 0, NULL, 1, NOW(), NOW()),
('test-user--008', 'patient008@tests.com', '$2b$12$PvZDZ8adriyh4txwPaaYnOMlnmHK1uqu.wR7A4.dyUmSTemnKAAKm', 'Divya', 'Iyer', '9876543280', '1993-09-14', 'female', 'Baker Junction', 'Kottayam', 'Kerala', '686008', 'AB-', 'None', 'Migraine', 'Mr. Iyer', '9876543281', 1, 0, NULL, 1, NOW(), NOW()),
('test-user--009', 'patient009@tests.com', '$2b$12$PvZDZ8adriyh4txwPaaYnOMlnmHK1uqu.wR7A4.dyUmSTemnKAAKm', 'Kiran', 'Reddy', '9876543290', '1989-06-08', 'male', 'CMS College Road', 'Kottayam', 'Kerala', '686009', 'A+', 'None', 'Healthy', 'Mrs. Reddy', '9876543291', 1, 0, NULL, 1, NOW(), NOW()),
('test-user--010', 'patient010@tests.com', '$2b$12$PvZDZ8adriyh4txwPaaYnOMlnmHK1uqu.wR7A4.dyUmSTemnKAAKm', 'Lakshmi', 'Varma', '9876543300', '1994-02-20', 'female', 'Nagampadam', 'Kottayam', 'Kerala', '686010', 'B+', 'Aspirin', 'Arthritis', 'Mr. Varma', '9876543301', 1, 0, NULL, 1, NOW(), NOW()),
('test-user--011', 'patient011@tests.com', '$2b$12$PvZDZ8adriyh4txwPaaYnOMlnmHK1uqu.wR7A4.dyUmSTemnKAAKm', 'Manoj', 'Thomas', '9876543310', '1986-10-12', 'male', 'Ettumanoor Road', 'Kottayam', 'Kerala', '686011', 'O+', 'None', 'Cholesterol', 'Mrs. Thomas', '9876543311', 1, 0, NULL, 1, NOW(), NOW()),
('test-user--012', 'patient012@tests.com', '$2b$12$PvZDZ8adriyh4txwPaaYnOMlnmHK1uqu.wR7A4.dyUmSTemnKAAKm', 'Meera', 'Mohan', '9876543320', '1990-01-28', 'female', 'Puthuppally', 'Kottayam', 'Kerala', '686012', 'AB+', 'None', 'Healthy', 'Mr. Mohan', '9876543321', 1, 0, NULL, 1, NOW(), NOW()),
('test-user--013', 'patient013@tests.com', '$2b$12$PvZDZ8adriyh4txwPaaYnOMlnmHK1uqu.wR7A4.dyUmSTemnKAAKm', 'Nikhil', 'Raj', '9876543330', '1992-05-16', 'male', 'Thiruvanchoor', 'Kottayam', 'Kerala', '686013', 'A-', 'Latex', 'Healthy', 'Mrs. Raj', '9876543331', 1, 0, NULL, 1, NOW(), NOW()),
('test-user--014', 'patient014@tests.com', '$2b$12$PvZDZ8adriyh4txwPaaYnOMlnmHK1uqu.wR7A4.dyUmSTemnKAAKm', 'Pooja', 'Shetty', '9876543340', '1988-08-03', 'female', 'Kumarakom', 'Kottayam', 'Kerala', '686014', 'B-', 'None', 'PCOD', 'Mr. Shetty', '9876543341', 1, 0, NULL, 1, NOW(), NOW()),
('test-user--015', 'patient015@tests.com', '$2b$12$PvZDZ8adriyh4txwPaaYnOMlnmHK1uqu.wR7A4.dyUmSTemnKAAKm', 'Rajesh', 'Nambiar', '9876543350', '1991-11-19', 'male', 'Vaikom Road', 'Kottayam', 'Kerala', '686015', 'O-', 'None', 'Back Pain', 'Mrs. Nambiar', '9876543351', 1, 0, NULL, 1, NOW(), NOW()),
('test-user--016', 'patient016@tests.com', '$2b$12$PvZDZ8adriyh4txwPaaYnOMlnmHK1uqu.wR7A4.dyUmSTemnKAAKm', 'Riya', 'George', '9876543360', '1993-04-07', 'female', 'Pala Road', 'Kottayam', 'Kerala', '686016', 'AB-', 'Iodine', 'Healthy', 'Mr. George', '9876543361', 1, 0, NULL, 1, NOW(), NOW()),
('test-user--017', 'patient017@tests.com', '$2b$12$PvZDZ8adriyh4txwPaaYnOMlnmHK1uqu.wR7A4.dyUmSTemnKAAKm', 'Sandeep', 'Panicker', '9876543370', '1987-07-21', 'male', 'Changanassery Road', 'Kottayam', 'Kerala', '686017', 'A+', 'None', 'Gastritis', 'Mrs. Panicker', '9876543371', 1, 0, NULL, 1, NOW(), NOW()),
('test-user--018', 'patient018@tests.com', '$2b$12$PvZDZ8adriyh4txwPaaYnOMlnmHK1uqu.wR7A4.dyUmSTemnKAAKm', 'Sowmya', 'Suresh', '9876543380', '1989-12-09', 'female', 'Rubber Board', 'Kottayam', 'Kerala', '686018', 'B+', 'None', 'Anemia', 'Mr. Suresh', '9876543381', 1, 0, NULL, 1, NOW(), NOW()),
('test-user--019', 'patient019@tests.com', '$2b$12$PvZDZ8adriyh4txwPaaYnOMlnmHK1uqu.wR7A4.dyUmSTemnKAAKm', 'Vivek', 'Ramesh', '9876543390', '1990-03-26', 'male', 'Medical College', 'Kottayam', 'Kerala', '686019', 'O+', 'Nuts', 'Healthy', 'Mrs. Ramesh', '9876543391', 1, 0, NULL, 1, NOW(), NOW()),
('test-user--020', 'patient020@tests.com', '$2b$12$PvZDZ8adriyh4txwPaaYnOMlnmHK1uqu.wR7A4.dyUmSTemnKAAKm', 'Zara', 'Khan', '9876543400', '1992-09-11', 'female', 'Arpookara', 'Kottayam', 'Kerala', '686020', 'AB+', 'None', 'Healthy', 'Mr. Khan', '9876543401', 1, 0, NULL, 1, NOW(), NOW());

-- Insert 20 appointments for Wednesday, 2025-10-08 (TODAY)
-- Session: sess-027-2 (Wednesday 09:00-13:00, 15 min per patient, 40 max tokens)
INSERT INTO `appointments` (`id`, `user_id`, `doctor_id`, `hospital_id`, `session_id`, `appointment_date`, `token_number`, `token_locked_at`, `token_lock_expires_at`, `token_status`, `missed_appointment`, `no_show_reason`, `token_changed_count`, `original_token_number`, `last_token_change_at`, `estimated_time`, `actual_start_time`, `actual_end_time`, `consultation_started_at`, `consultation_ended_at`, `status`, `booking_type`, `patient_complaints`, `doctor_notes`, `prescription`, `consultation_fee`, `created_at`, `updated_at`, `is_recalled`, `recall_count`, `last_recalled_at`, `attended_after_recall`) VALUES
('appt-tests-001', 'test-user--001', 'doc-027', 'hosp-005', 'sess-027-2', '2025-10-08', 1, NULL, NULL, 'pending', 0, NULL, 0, NULL, NULL, '09:00', NULL, NULL, NULL, NULL, 'confirmed', 'grid', 'Headache and fever', NULL, NULL, 500.00, NOW(), NOW(), 0, 0, NULL, 0),
('appt-tests-002', 'test-user--002', 'doc-027', 'hosp-005', 'sess-027-2', '2025-10-08', 2, NULL, NULL, 'pending', 0, NULL, 0, NULL, NULL, '09:15', NULL, NULL, NULL, NULL, 'confirmed', 'grid', 'Breathing difficulty', NULL, NULL, 500.00, NOW(), NOW(), 0, 0, NULL, 0),
('appt-tests-003', 'test-user--003', 'doc-027', 'hosp-005', 'sess-027-2', '2025-10-08', 3, NULL, NULL, 'pending', 0, NULL, 0, NULL, NULL, '09:30', NULL, NULL, NULL, NULL, 'confirmed', 'grid', 'Blood sugar check', NULL, NULL, 500.00, NOW(), NOW(), 0, 0, NULL, 0),
('appt-tests-004', 'test-user--004', 'doc-027', 'hosp-005', 'sess-027-2', '2025-10-08', 4, NULL, NULL, 'pending', 0, NULL, 0, NULL, NULL, '09:45', NULL, NULL, NULL, NULL, 'confirmed', 'grid', 'High BP consultation', NULL, NULL, 500.00, NOW(), NOW(), 0, 0, NULL, 0),
('appt-tests-005', 'test-user--005', 'doc-027', 'hosp-005', 'sess-027-2', '2025-10-08', 5, NULL, NULL, 'pending', 0, NULL, 0, NULL, NULL, '10:00', NULL, NULL, NULL, NULL, 'confirmed', 'grid', 'General checkup', NULL, NULL, 500.00, NOW(), NOW(), 0, 0, NULL, 0),
('appt-tests-006', 'test-user--006', 'doc-027', 'hosp-005', 'sess-027-2', '2025-10-08', 6, NULL, NULL, 'pending', 0, NULL, 0, NULL, NULL, '10:15', NULL, NULL, NULL, NULL, 'confirmed', 'grid', 'Thyroid follow-up', NULL, NULL, 500.00, NOW(), NOW(), 0, 0, NULL, 0),
('appt-tests-007', 'test-user--007', 'doc-027', 'hosp-005', 'sess-027-2', '2025-10-08', 7, NULL, NULL, 'pending', 0, NULL, 0, NULL, NULL, '10:30', NULL, NULL, NULL, NULL, 'confirmed', 'grid', 'Stomach pain', NULL, NULL, 500.00, NOW(), NOW(), 0, 0, NULL, 0),
('appt-tests-008', 'test-user--008', 'doc-027', 'hosp-005', 'sess-027-2', '2025-10-08', 8, NULL, NULL, 'pending', 0, NULL, 0, NULL, NULL, '10:45', NULL, NULL, NULL, NULL, 'confirmed', 'grid', 'Severe migraine', NULL, NULL, 500.00, NOW(), NOW(), 0, 0, NULL, 0),
('appt-tests-009', 'test-user--009', 'doc-027', 'hosp-005', 'sess-027-2', '2025-10-08', 9, NULL, NULL, 'pending', 0, NULL, 0, NULL, NULL, '11:00', NULL, NULL, NULL, NULL, 'confirmed', 'grid', 'Routine checkup', NULL, NULL, 500.00, NOW(), NOW(), 0, 0, NULL, 0),
('appt-tests-010', 'test-user--010', 'doc-027', 'hosp-005', 'sess-027-2', '2025-10-08', 10, NULL, NULL, 'pending', 0, NULL, 0, NULL, NULL, '11:15', NULL, NULL, NULL, NULL, 'confirmed', 'grid', 'Joint pain', NULL, NULL, 500.00, NOW(), NOW(), 0, 0, NULL, 0),
('appt-tests-011', 'test-user--011', 'doc-027', 'hosp-005', 'sess-027-2', '2025-10-08', 11, NULL, NULL, 'pending', 0, NULL, 0, NULL, NULL, '11:30', NULL, NULL, NULL, NULL, 'confirmed', 'grid', 'Cholesterol review', NULL, NULL, 500.00, NOW(), NOW(), 0, 0, NULL, 0),
('appt-tests-012', 'test-user--012', 'doc-027', 'hosp-005', 'sess-027-2', '2025-10-08', 12, NULL, NULL, 'pending', 0, NULL, 0, NULL, NULL, '11:45', NULL, NULL, NULL, NULL, 'confirmed', 'grid', 'Health checkup', NULL, NULL, 500.00, NOW(), NOW(), 0, 0, NULL, 0),
('appt-tests-013', 'test-user--013', 'doc-027', 'hosp-005', 'sess-027-2', '2025-10-08', 13, NULL, NULL, 'pending', 0, NULL, 0, NULL, NULL, '12:00', NULL, NULL, NULL, NULL, 'confirmed', 'grid', 'Skin rash', NULL, NULL, 500.00, NOW(), NOW(), 0, 0, NULL, 0),
('appt-tests-014', 'test-user--014', 'doc-027', 'hosp-005', 'sess-027-2', '2025-10-08', 14, NULL, NULL, 'pending', 0, NULL, 0, NULL, NULL, '12:15', NULL, NULL, NULL, NULL, 'confirmed', 'grid', 'PCOD consultation', NULL, NULL, 500.00, NOW(), NOW(), 0, 0, NULL, 0),
('appt-tests-015', 'test-user--015', 'doc-027', 'hosp-005', 'sess-027-2', '2025-10-08', 15, NULL, NULL, 'pending', 0, NULL, 0, NULL, NULL, '12:30', NULL, NULL, NULL, NULL, 'confirmed', 'grid', 'Lower back pain', NULL, NULL, 500.00, NOW(), NOW(), 0, 0, NULL, 0),
('appt-tests-017', 'test-user--017', 'doc-027', 'hosp-005', 'sess-027-2', '2025-10-08', 17, NULL, NULL, 'pending', 0, NULL, 0, NULL, NULL, '13:00', NULL, NULL, NULL, NULL, 'confirmed', 'grid', 'Acid reflux', NULL, NULL, 500.00, NOW(), NOW(), 0, 0, NULL, 0),
('appt-tests-018', 'test-user--018', 'doc-027', 'hosp-005', 'sess-027-2', '2025-10-08', 18, NULL, NULL, 'pending', 0, NULL, 0, NULL, NULL, '13:15', NULL, NULL, NULL, NULL, 'confirmed', 'grid', 'Low hemoglobin', NULL, NULL, 500.00, NOW(), NOW(), 0, 0, NULL, 0),
('appt-tests-019', 'test-user--019', 'doc-027', 'hosp-005', 'sess-027-2', '2025-10-08', 19, NULL, NULL, 'pending', 0, NULL, 0, NULL, NULL, '13:30', NULL, NULL, NULL, NULL, 'confirmed', 'grid', 'Allergy checkup', NULL, NULL, 500.00, NOW(), NOW(), 0, 0, NULL, 0),
('appt-tests-020', 'test-user--020', 'doc-027', 'hosp-005', 'sess-027-2', '2025-10-08', 20, NULL, NULL, 'pending', 0, NULL, 0, NULL, NULL, '13:45', NULL, NULL, NULL, NULL, 'confirmed', 'grid', 'Routine wellness check', NULL, NULL, 500.00, NOW(), NOW(), 0, 0, NULL, 0);

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- 20 users created with IDs: test-user-001 to test-user-020
-- 20 appointments created for Wednesday, October 8, 2025 (TODAY)
-- Doctor: Dr. Dhanya SP (doc-027)
-- Session: Wednesday 09:00-13:00 (sess-027-2)
-- Token Numbers: 1 to 20
-- All appointments are in 'confirmed' status
-- Password for all test users: password123
-- ============================================================================
