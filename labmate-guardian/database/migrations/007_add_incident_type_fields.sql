-- Migration: Add type-specific fields for incident reports
-- Date: 2026-02-02
-- Purpose: Add conditional fields for software, network, security, and facility incident types

-- Add software-specific columns
ALTER TABLE incident_reports
ADD COLUMN software_type VARCHAR(100) NULL COMMENT 'Type of software (OS, application, browser, etc.)' AFTER hardware_damage,
ADD COLUMN software_issue VARCHAR(100) NULL COMMENT 'Type of software issue (crash, freeze, error, etc.)' AFTER software_type;

-- Add network-specific columns
ALTER TABLE incident_reports
ADD COLUMN network_type VARCHAR(100) NULL COMMENT 'Type of network (wifi, ethernet, internet, etc.)' AFTER software_issue,
ADD COLUMN network_issue VARCHAR(100) NULL COMMENT 'Type of network issue (no connection, slow speed, etc.)' AFTER network_type;

-- Add security-specific columns
ALTER TABLE incident_reports
ADD COLUMN security_type VARCHAR(100) NULL COMMENT 'Type of security incident (malware, phishing, breach, etc.)' AFTER network_issue,
ADD COLUMN security_details TEXT NULL COMMENT 'Security incident details' AFTER security_type;

-- Add facility-specific columns
ALTER TABLE incident_reports
ADD COLUMN facility_type VARCHAR(100) NULL COMMENT 'Type of facility issue (electrical, lighting, HVAC, etc.)' AFTER security_details,
ADD COLUMN facility_issue TEXT NULL COMMENT 'Facility issue description' AFTER facility_type;

-- Add indexes for better query performance
ALTER TABLE incident_reports
ADD INDEX idx_software_type (software_type),
ADD INDEX idx_network_type (network_type),
ADD INDEX idx_security_type (security_type),
ADD INDEX idx_facility_type (facility_type);

