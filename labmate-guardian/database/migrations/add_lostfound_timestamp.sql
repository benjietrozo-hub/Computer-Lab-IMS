-- Add timestamp column to lost_found table for enhanced date/time tracking
-- Migration script: 2024-12-23_add_lostfound_timestamp.sql

ALTER TABLE lost_found 
ADD COLUMN timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER contact_info;

-- Update existing records to copy date_occurred to timestamp for backward compatibility
UPDATE lost_found SET timestamp = CONCAT(date_occurred, ' ', TIME('12:00:00')) WHERE timestamp IS NULL AND date_occurred IS NOT NULL;
