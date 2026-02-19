-- Rollback Migration: Remove soft delete columns from repair_maintenance and borrow_items tables
-- Date: 2026-01-31

-- Remove soft delete columns from repair_maintenance table
ALTER TABLE repair_maintenance 
DROP FOREIGN KEY IF EXISTS fk_repair_maintenance_deleted_by;

DROP INDEX IF EXISTS idx_repair_maintenance_deleted_at ON repair_maintenance;

ALTER TABLE repair_maintenance 
DROP COLUMN IF EXISTS deleted_at,
DROP COLUMN IF EXISTS deleted_by,
DROP COLUMN IF EXISTS original_module;

-- Remove soft delete columns from borrow_items table
ALTER TABLE borrow_items 
DROP FOREIGN KEY IF EXISTS fk_borrow_items_deleted_by;

DROP INDEX IF EXISTS idx_borrow_items_deleted_at ON borrow_items;

ALTER TABLE borrow_items 
DROP COLUMN IF EXISTS deleted_at,
DROP COLUMN IF EXISTS deleted_by,
DROP COLUMN IF EXISTS original_module;
