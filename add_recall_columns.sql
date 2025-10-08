-- Add columns for recall tracking and current token persistence
-- Run this migration to fix recall functionality

ALTER TABLE doctor_sessions
ADD COLUMN IF NOT EXISTS current_token INT DEFAULT 0 AFTER current_token_number,
ADD COLUMN IF NOT EXISTS last_recall_at INT DEFAULT 0 AFTER current_token;

-- Update existing sessions to have default values
UPDATE doctor_sessions
SET current_token = 0, last_recall_at = 0
WHERE current_token IS NULL OR last_recall_at IS NULL;
