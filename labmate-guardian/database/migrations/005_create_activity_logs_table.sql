-- Migration: Create comprehensive activity logs table
-- Date: 2026-01-31
-- Purpose: Track all system activities for admin monitoring

-- Drop existing table if it exists
DROP TABLE IF EXISTS activity_logs;

CREATE TABLE activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    user_name VARCHAR(255) NULL,
    user_email VARCHAR(255) NULL,
    user_role VARCHAR(50) NULL,
    action VARCHAR(100) NOT NULL,
    module VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NULL,
    entity_id VARCHAR(100) NULL,
    entity_name VARCHAR(255) NULL,
    description TEXT NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    old_values JSON NULL,
    new_values JSON NULL,
    metadata JSON NULL,
    severity ENUM('info', 'warning', 'error', 'critical') DEFAULT 'info',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_module (module),
    INDEX idx_entity_type (entity_type),
    INDEX idx_created_at (created_at),
    INDEX idx_severity (severity),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add some initial system log
INSERT INTO activity_logs (
    user_id, 
    user_name, 
    action, 
    module, 
    description, 
    severity
) VALUES (
    NULL,
    'System',
    'system_init',
    'system',
    'Activity logging system initialized',
    'info'
);
