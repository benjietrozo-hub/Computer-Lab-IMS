-- Migration: Create trash_config table
-- Task 1.3: Create trash_config table for retention settings

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
