-- Migration: Create trash_audit_log table
-- Task 1.2: Create trash_audit_log table for tracking all trash operations

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
