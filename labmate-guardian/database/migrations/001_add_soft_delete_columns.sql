-- Migration: Add soft delete columns to all entity tables
-- Task 1.1: Create migration to add soft delete columns

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
