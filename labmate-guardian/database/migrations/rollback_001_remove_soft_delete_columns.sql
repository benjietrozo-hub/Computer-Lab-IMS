-- Rollback Migration: Remove soft delete columns from all entity tables

-- Remove from inventory_equipment
ALTER TABLE inventory_equipment DROP FOREIGN KEY fk_inventory_deleted_by;
DROP INDEX idx_inventory_deleted_at ON inventory_equipment;
ALTER TABLE inventory_equipment 
DROP COLUMN deleted_at,
DROP COLUMN deleted_by,
DROP COLUMN original_module;

-- Remove from users
ALTER TABLE users DROP FOREIGN KEY fk_users_deleted_by;
DROP INDEX idx_users_deleted_at ON users;
ALTER TABLE users 
DROP COLUMN deleted_at,
DROP COLUMN deleted_by,
DROP COLUMN original_module;

-- Remove from equipment_reservations
ALTER TABLE equipment_reservations DROP FOREIGN KEY fk_reservations_deleted_by;
DROP INDEX idx_reservations_deleted_at ON equipment_reservations;
ALTER TABLE equipment_reservations 
DROP COLUMN deleted_at,
DROP COLUMN deleted_by,
DROP COLUMN original_module;

-- Remove from borrow_requests
ALTER TABLE borrow_requests DROP FOREIGN KEY fk_borrow_requests_deleted_by;
DROP INDEX idx_borrow_requests_deleted_at ON borrow_requests;
ALTER TABLE borrow_requests 
DROP COLUMN deleted_at,
DROP COLUMN deleted_by,
DROP COLUMN original_module;

-- Remove from incident_reports
ALTER TABLE incident_reports DROP FOREIGN KEY fk_incident_reports_deleted_by;
DROP INDEX idx_incident_reports_deleted_at ON incident_reports;
ALTER TABLE incident_reports 
DROP COLUMN deleted_at,
DROP COLUMN deleted_by,
DROP COLUMN original_module;

-- Remove from lost_found
ALTER TABLE lost_found DROP FOREIGN KEY fk_lost_found_deleted_by;
DROP INDEX idx_lost_found_deleted_at ON lost_found;
ALTER TABLE lost_found 
DROP COLUMN deleted_at,
DROP COLUMN deleted_by,
DROP COLUMN original_module;

-- Remove from visitor_logs
ALTER TABLE visitor_logs DROP FOREIGN KEY fk_visitor_logs_deleted_by;
DROP INDEX idx_visitor_logs_deleted_at ON visitor_logs;
ALTER TABLE visitor_logs 
DROP COLUMN deleted_at,
DROP COLUMN deleted_by,
DROP COLUMN original_module;
