-- Migration: Add device, browser, and OS tracking columns
-- Date: 2026-02-02
-- Purpose: Enhanced activity logging with device/browser/OS information for security and debugging

-- Add new columns to activity_logs table
ALTER TABLE activity_logs
ADD COLUMN device_type VARCHAR(50) NULL COMMENT 'mobile, desktop, tablet, bot, unknown' AFTER user_agent,
ADD COLUMN browser VARCHAR(100) NULL COMMENT 'Browser name and version' AFTER device_type,
ADD COLUMN os VARCHAR(100) NULL COMMENT 'Operating system' AFTER browser,
ADD COLUMN is_bot BOOLEAN DEFAULT FALSE COMMENT 'Whether request is from a bot/crawler' AFTER os,
ADD COLUMN real_ip VARCHAR(45) NULL COMMENT 'Real IP from X-Forwarded-For if behind proxy' AFTER ip_address,
ADD INDEX idx_device_type (device_type),
ADD INDEX idx_browser (browser),
ADD INDEX idx_is_bot (is_bot);

-- Update existing records to mark unknown device types
UPDATE activity_logs 
SET device_type = 'unknown' 
WHERE device_type IS NULL;

