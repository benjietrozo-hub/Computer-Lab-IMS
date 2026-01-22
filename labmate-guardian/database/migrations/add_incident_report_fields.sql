-- Add new columns to incident_reports table for enhanced hardware incident tracking
-- Migration script: 2024-12-23_add_incident_report_fields.sql

ALTER TABLE incident_reports 
ADD COLUMN name VARCHAR(255) AFTER id,
ADD COLUMN hardware_type VARCHAR(100) AFTER location,
ADD COLUMN hardware_damage TEXT AFTER hardware_type,
ADD COLUMN timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER hardware_damage;

-- Update existing records to copy title to name for backward compatibility
UPDATE incident_reports SET name = title WHERE name IS NULL AND title IS NOT NULL;

-- Update existing records to copy date_occurred to timestamp for backward compatibility
UPDATE incident_reports SET timestamp = CONCAT(date_occurred, ' ', TIME('12:00:00')) WHERE timestamp IS NULL AND date_occurred IS NOT NULL;
