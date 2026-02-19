-- ========================================
-- ALL TRASH/RECYCLE BIN MIGRATIONS
-- Combined file for easy execution
-- ========================================

-- Migration 001: Add soft delete columns to all entity tables
-- ========================================

-- Add soft delete columns to inventory_equipment table
ALTER TABLE inventory_equipment 
ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL,
ADD COLUMN deleted_by INT NULL DEFAULT NULL,
ADD COLUMN original_module VARCHAR(50) NULL DEFAULT NULL;

CREATE INDEX idx_inventory_deleted_at ON inventory_equipment(deleted_at);

ALTER TABLE inventory_equipment 
ADD CONSTRAINT fk_inventory_deleted_by 
FOREIGN KEY (deleted_by) REFERENCES users(id) ON DELETE SET NULL;

-- Add soft delete columns to users table
ALTER TABLE users 
ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL,
ADD COLUMN deleted_by INT NULL DEFAULT NULL,
ADD COLUMN original_module VARCHAR(50) NULL DEFAULT NULL;

CREATE INDEX idx_users_deleted_at ON users(deleted_at);

ALTER TABLE users 
ADD CONSTRAINT fk_users_deleted_by 
FOREIGN KEY (deleted_by) REFERENCES users(id) ON DELETE SET NULL;

-- Add soft delete columns to equipment_reservations table
ALTER TABLE equipment_reservations 
ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL,
ADD COLUMN deleted_by INT NULL DEFAULT NULL,
ADD COLUMN original_module VARCHAR(50) NULL DEFAULT NULL;

CREATE INDEX idx_reservations_deleted_at ON equipment_reservations(deleted_at);

ALTER TABLE equipment_reservations 
ADD CONSTRAINT fk_reservations_deleted_by 
FOREIGN KEY (deleted_by) REFERENCES users(id) ON DELETE SET NULL;

-- Add soft delete columns to borrow_requests table
ALTER TABLE borrow_requests 
ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL,
ADD COLUMN deleted_by INT NULL DEFAULT NULL,
ADD COLUMN original_module VARCHAR(50) NULL DEFAULT NULL;

CREATE INDEX idx_borrow_requests_deleted_at ON borrow_requests(deleted_at);

ALTER TABLE borrow_requests 
ADD CONSTRAINT fk_borrow_requests_deleted_by 
FOREIGN KEY (deleted_by) REFERENCES users(id) ON DELETE SET NULL;

-- Add soft delete columns to incident_reports table
ALTER TABLE incident_reports 
ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL,
ADD COLUMN deleted_by INT NULL DEFAULT NULL,
ADD COLUMN original_module VARCHAR(50) NULL DEFAULT NULL;

CREATE INDEX idx_incident_reports_deleted_at ON incident_reports(deleted_at);

ALTER TABLE incident_reports 
ADD CONSTRAINT fk_incident_reports_deleted_by 
FOREIGN KEY (deleted_by) REFERENCES users(id) ON DELETE SET NULL;

-- Add soft delete columns to lost_found table
ALTER TABLE lost_found 
ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL,
ADD COLUMN deleted_by INT NULL DEFAULT NULL,
ADD COLUMN original_module VARCHAR(50) NULL DEFAULT NULL;

CREATE INDEX idx_lost_found_deleted_at ON lost_found(deleted_at);

ALTER TABLE lost_found 
ADD CONSTRAINT fk_lost_found_deleted_by 
FOREIGN KEY (deleted_by) REFERENCES users(id) ON DELETE SET NULL;

-- Add soft delete columns to visitor_logs table
ALTER TABLE visitor_logs 
ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL,
ADD COLUMN deleted_by INT NULL DEFAULT NULL,
ADD COLUMN original_module VARCHAR(50) NULL DEFAULT NULL;

CREATE INDEX idx_visitor_logs_deleted_at ON visitor_logs(deleted_at);

ALTER TABLE visitor_logs 
ADD CONSTRAINT fk_visitor_logs_deleted_by 
FOREIGN KEY (deleted_by) REFERENCES users(id) ON DELETE SET NULL;

-- Migration 002: Create trash_audit_log table
-- ========================================

CREATE TABLE trash_audit_log (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  entity_type VARCHAR(50) NOT NULL,
  entity_id VARCHAR(255) NOT NULL,
  action ENUM('soft_delete', 'restore', 'permanent_delete', 'auto_cleanup') NOT NULL,
  user_id INT NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSON NULL,
  
  INDEX idx_entity (entity_type, entity_id),
  INDEX idx_user (user_id),
  INDEX idx_timestamp (timestamp),
  INDEX idx_action (action),
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Migration 003: Create trash_config table
-- ========================================

CREATE TABLE trash_config (
  id INT AUTO_INCREMENT PRIMARY KEY,
  retention_days INT NOT NULL DEFAULT 30,
  auto_cleanup_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by INT NOT NULL,
  
  FOREIGN KEY (updated_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default configuration (30 days retention, auto-cleanup enabled)
-- Using a default admin user ID of 1 (should be updated to actual root admin)
INSERT INTO trash_config (retention_days, auto_cleanup_enabled, updated_by) 
VALUES (30, TRUE, 1);

-- ========================================
-- MIGRATIONS COMPLETE!
-- ========================================
