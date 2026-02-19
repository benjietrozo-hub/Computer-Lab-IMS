-- Migration: Add soft delete columns to repair_maintenance and borrow_items tables
-- Date: 2026-01-31
-- Purpose: Enable trash/restore functionality for repair maintenance records and borrow items

-- Add soft delete columns to repair_maintenance table
ALTER TABLE repair_maintenance 
ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL,
ADD COLUMN deleted_by INT NULL DEFAULT NULL,
ADD COLUMN original_module VARCHAR(50) NULL DEFAULT NULL;

CREATE INDEX idx_repair_maintenance_deleted_at ON repair_maintenance(deleted_at);

ALTER TABLE repair_maintenance 
ADD CONSTRAINT fk_repair_maintenance_deleted_by 
FOREIGN KEY (deleted_by) REFERENCES users(id) ON DELETE SET NULL;

-- Add soft delete columns to borrow_items table
ALTER TABLE borrow_items 
ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL,
ADD COLUMN deleted_by INT NULL DEFAULT NULL,
ADD COLUMN original_module VARCHAR(50) NULL DEFAULT NULL;

CREATE INDEX idx_borrow_items_deleted_at ON borrow_items(deleted_at);

ALTER TABLE borrow_items 
ADD CONSTRAINT fk_borrow_items_deleted_by 
FOREIGN KEY (deleted_by) REFERENCES users(id) ON DELETE SET NULL;
