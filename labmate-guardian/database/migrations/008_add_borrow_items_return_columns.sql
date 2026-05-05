-- Migration: Add return tracking columns to borrow_items table
-- Date: 2025-02-19
-- Description: Adds columns to track return condition, comments, and processing details

-- Check if columns exist before adding them
SET @dbname = DATABASE();
SET @tablename = 'borrow_items';

-- Add return_condition column if it doesn't exist
SET @column_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = @dbname 
    AND TABLE_NAME = @tablename 
    AND COLUMN_NAME = 'return_condition'
);

SET @sql = IF(@column_exists = 0,
    'ALTER TABLE borrow_items ADD COLUMN return_condition VARCHAR(50) DEFAULT NULL AFTER status',
    'SELECT "Column return_condition already exists" AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add return_comments column if it doesn't exist
SET @column_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = @dbname 
    AND TABLE_NAME = @tablename 
    AND COLUMN_NAME = 'return_comments'
);

SET @sql = IF(@column_exists = 0,
    'ALTER TABLE borrow_items ADD COLUMN return_comments TEXT DEFAULT NULL AFTER return_condition',
    'SELECT "Column return_comments already exists" AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add return_processed_by column if it doesn't exist
SET @column_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = @dbname 
    AND TABLE_NAME = @tablename 
    AND COLUMN_NAME = 'return_processed_by'
);

SET @sql = IF(@column_exists = 0,
    'ALTER TABLE borrow_items ADD COLUMN return_processed_by CHAR(36) DEFAULT NULL AFTER return_comments',
    'SELECT "Column return_processed_by already exists" AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add return_processed_at column if it doesn't exist
SET @column_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = @dbname 
    AND TABLE_NAME = @tablename 
    AND COLUMN_NAME = 'return_processed_at'
);

SET @sql = IF(@column_exists = 0,
    'ALTER TABLE borrow_items ADD COLUMN return_processed_at DATETIME DEFAULT NULL AFTER return_processed_by',
    'SELECT "Column return_processed_at already exists" AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add actual_return_date column if it doesn't exist (for tracking when item was actually returned)
SET @column_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = @dbname 
    AND TABLE_NAME = @tablename 
    AND COLUMN_NAME = 'actual_return_date'
);

SET @sql = IF(@column_exists = 0,
    'ALTER TABLE borrow_items ADD COLUMN actual_return_date DATE DEFAULT NULL AFTER return_date',
    'SELECT "Column actual_return_date already exists" AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add foreign key for return_processed_by if it doesn't exist
SET @fk_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
    WHERE TABLE_SCHEMA = @dbname 
    AND TABLE_NAME = @tablename 
    AND CONSTRAINT_NAME = 'fk_borrow_items_return_processed_by'
);

SET @sql = IF(@fk_exists = 0,
    'ALTER TABLE borrow_items ADD CONSTRAINT fk_borrow_items_return_processed_by FOREIGN KEY (return_processed_by) REFERENCES users(id) ON DELETE SET NULL',
    'SELECT "Foreign key fk_borrow_items_return_processed_by already exists" AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT 'Migration 008 completed successfully!' AS status;
