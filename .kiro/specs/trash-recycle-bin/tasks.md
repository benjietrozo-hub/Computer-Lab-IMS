# Implementation Plan: Trash/Recycle Bin Feature

## Overview

This implementation plan breaks down the trash/recycle bin feature into incremental coding tasks. The approach follows a bottom-up strategy: database schema first, then backend API, then frontend components, with testing integrated throughout. Each task builds on previous work to ensure continuous integration and early validation.

## Tasks

- [ ] 1. Database schema modifications and migrations
  - [ ] 1.1 Create migration to add soft delete columns to all entity tables
    - Add `deleted_at`, `deleted_by`, `original_module` columns to: inventory, users, reservations, borrow_requests, incident_reports, lost_found_items, visitor_logs
    - Create indexes for performance (`idx_deleted_at`)
    - Add foreign key constraints for `deleted_by`
    - _Requirements: 1.1, 1.2_
  
  - [ ] 1.2 Create trash_audit_log table
    - Define schema with id, entity_type, entity_id, action, user_id, timestamp, metadata
    - Create indexes for efficient querying
    - Add foreign key constraints
    - _Requirements: 8.1, 8.2, 8.3_
  
  - [ ] 1.3 Create trash_config table for retention settings
    - Define schema with retention_days, auto_cleanup_enabled, updated_at, updated_by
    - Insert default configuration (30 days retention, auto-cleanup enabled)
    - _Requirements: 7.1, 7.4_
  
  - [ ] 1.4 Write database migration tests
    - Test migrations run successfully
    - Test rollback works correctly
    - Verify all indexes and constraints are created

- [ ] 2. Backend: Core trash service and utilities
  - [ ] 2.1 Create EntityTypeMapper utility class
    - Implement mapping between entity types and table configurations
    - Define ENTITY_TYPE_MAP with table names, ID columns, name columns, modules
    - Add helper methods: getTableName(), getIdColumn(), getNameColumn(), getModuleName()
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_
  
  - [ ] 2.2 Create AuditLogger service
    - Implement logTrashOperation() method
    - Implement getAuditTrail() method with filtering
    - Handle database transactions for audit logging
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  
  - [ ] 2.3 Write property test for audit logging
    - **Property 11: Trash Operations Create Audit Logs**
    - **Validates: Requirements 3.4, 8.1, 8.2, 8.3**
  
  - [ ] 2.4 Create TrashService class with core business logic
    - Implement getTrashItems() with pagination and filtering
    - Implement checkRestoreConflicts() for conflict detection
    - Implement getTrashCount() for item counting
    - _Requirements: 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_
  
  - [ ] 2.5 Write property tests for TrashService
    - **Property 4: Trash View Returns All Soft Deleted Items**
    - **Property 5: Trash Items Include Required Fields**
    - **Property 6: Trash Filtering Works Correctly**
    - **Property 7: Trash Search Finds Matching Items**
    - **Property 8: Trash Default Sort Order**
    - **Property 9: Trash Pagination Works Correctly**
    - **Validates: Requirements 2.2, 2.3, 2.4, 2.5, 2.6, 2.7**

- [ ] 3. Backend: Soft delete middleware
  - [ ] 3.1 Create SoftDeleteMiddleware class
    - Implement handle() method to intercept DELETE requests
    - Implement shouldSoftDelete() to determine if request should be soft deleted
    - Implement softDelete() to perform UPDATE instead of DELETE
    - Record deletion metadata (deleted_at, deleted_by, original_module)
    - _Requirements: 1.1, 1.2_
  
  - [ ] 3.2 Register middleware in application routing
    - Apply middleware to all entity DELETE endpoints
    - Configure entity type detection from routes
    - _Requirements: 1.1_
  
  - [ ] 3.3 Write property tests for soft delete
    - **Property 1: Soft Delete Preserves Data with Metadata**
    - **Property 2: Soft Deleted Items Hidden from Normal Views**
    - **Property 3: Soft Delete Preserves Relationships**
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.4**

- [ ] 4. Backend: Restoration functionality
  - [ ] 4.1 Implement restoreItem() in TrashService
    - Check for conflicts using checkRestoreConflicts()
    - Perform UPDATE to clear soft delete columns
    - Log restoration in audit trail
    - Return success or conflict details
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  
  - [ ] 4.2 Implement restoreBulk() in TrashService
    - Process multiple items with partial failure handling
    - Return lists of succeeded and failed items
    - Log all operations in audit trail
    - _Requirements: 10.3, 10.6_
  
  - [ ] 4.3 Write property test for restoration
    - **Property 10: Restoration Round Trip**
    - **Validates: Requirements 3.1, 3.2, 3.3**
  
  - [ ] 4.4 Write property test for bulk restore
    - **Property 23: Bulk Restore Processes All Items**
    - **Property 24: Bulk Operations Handle Partial Failures**
    - **Validates: Requirements 10.3, 10.6**
  
  - [ ] 4.5 Write unit tests for conflict scenarios
    - Test duplicate identifier conflict (Example 1)
    - Test missing parent entity conflict (Example 3)
    - Test missing module conflict (Example 2)
    - _Requirements: 3.5, 12.1, 12.2, 12.3_

- [ ] 5. Backend: Permanent deletion functionality
  - [ ] 5.1 Implement permanentDelete() in TrashService
    - Check user permissions (Root Admin required)
    - Perform actual DELETE SQL with cascade handling
    - Log permanent deletion in audit trail
    - _Requirements: 4.2, 5.4_
  
  - [ ] 5.2 Implement permanentDeleteBulk() in TrashService
    - Process multiple items with permission checks
    - Handle partial failures
    - Log all operations
    - _Requirements: 4.4, 10.4_
  
  - [ ] 5.3 Write property tests for permanent deletion
    - **Property 12: Permanent Delete Removes Data**
    - **Property 13: Bulk Permanent Delete Processes All Items**
    - **Validates: Requirements 4.2, 4.4, 10.4**
  
  - [ ] 5.4 Write unit tests for permission checks
    - Test Root Admin can permanently delete (Property 17)
    - Test Assigned Admin cannot permanently delete (Example 4)
    - _Requirements: 5.4, 5.5_

- [ ] 6. Backend: Auto-cleanup functionality
  - [ ] 6.1 Implement autoCleanup() in TrashService
    - Query trash_config for retention period
    - Find items older than retention period
    - Permanently delete expired items
    - Log auto-cleanup operations
    - _Requirements: 7.1, 7.2, 7.3_
  
  - [ ] 6.2 Create scheduled job/cron task for auto-cleanup
    - Configure to run daily
    - Call TrashService.autoCleanup()
    - Handle errors and logging
    - _Requirements: 7.2_
  
  - [ ] 6.3 Write property tests for auto-cleanup
    - **Property 18: Retention Period Enforced**
    - **Property 19: Auto-Cleanup Removes Expired Items**
    - **Property 20: Auto-Cleanup Creates Audit Logs**
    - **Validates: Requirements 7.1, 7.2, 7.3**
  
  - [ ] 6.4 Write unit tests for retention configuration
    - Test configure retention period (Example 6)
    - Test zero retention disables auto-cleanup (Example 5)
    - _Requirements: 7.4, 7.5_

- [ ] 7. Backend: API endpoints and controllers
  - [ ] 7.1 Create TrashController with all endpoints
    - GET /api/trash - List trash items with pagination and filters
    - POST /api/trash/restore/{id} - Restore single item
    - POST /api/trash/restore-bulk - Restore multiple items
    - DELETE /api/trash/permanent/{id} - Permanently delete single item
    - DELETE /api/trash/permanent-bulk - Permanently delete multiple items
    - GET /api/trash/count - Get trash item count
    - GET /api/trash/audit - Get audit trail with filters
    - _Requirements: 2.2, 3.1, 4.2, 5.1, 5.2, 8.4_
  
  - [ ] 7.2 Add permission middleware to endpoints
    - Apply admin authentication to all trash endpoints
    - Apply Root Admin check to permanent delete endpoints
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [ ] 7.3 Implement error handling and response formatting
    - Return consistent error responses with codes
    - Handle database errors gracefully
    - Return user-friendly error messages
    - _Requirements: 3.5, 12.1, 12.2, 12.3_
  
  - [ ] 7.4 Write API integration tests
    - Test all endpoints with valid inputs
    - Test error responses
    - Test permission enforcement
    - Test pagination and filtering

- [ ] 8. Checkpoint - Backend complete, verify all tests pass
  - Ensure all backend tests pass
  - Verify API endpoints work with manual testing (Postman/curl)
  - Ask the user if questions arise

- [ ] 9. Frontend: Trash service (API client)
  - [ ] 9.1 Create TrashService class in TypeScript
    - Implement fetchTrashItems() with pagination and filters
    - Implement restoreItem() and restoreBulk()
    - Implement permanentDelete() and permanentDeleteBulk()
    - Implement getTrashCount()
    - Handle API errors and return typed responses
    - _Requirements: 2.2, 3.1, 4.2_
  
  - [ ] 9.2 Create TypeScript interfaces for trash data
    - Define TrashItem, TrashFilters, TrashViewState interfaces
    - Define API response types
    - Define error response types
    - _Requirements: 2.3_
  
  - [ ] 9.3 Write unit tests for TrashService
    - Mock API calls
    - Test error handling
    - Test response parsing

- [ ] 10. Frontend: Trash view component
  - [ ] 10.1 Create TrashView component structure
    - Set up component state management (useState/useReducer)
    - Implement data fetching with useEffect
    - Handle loading and error states
    - _Requirements: 2.1, 2.2_
  
  - [ ] 10.2 Implement trash item list display
    - Render table/list of trash items
    - Display all required fields (entity type, name, deletion date, deleted by, module)
    - Implement default sorting (most recent first)
    - _Requirements: 2.3, 2.6_
  
  - [ ] 10.3 Implement pagination controls
    - Add page navigation (previous, next, page numbers)
    - Handle page size selection
    - Update URL query params for bookmarking
    - _Requirements: 2.7_
  
  - [ ] 10.4 Implement selection functionality
    - Add checkboxes for individual items
    - Add "Select All" checkbox
    - Track selected items in state
    - _Requirements: 10.1, 10.2_
  
  - [ ] 10.5 Write unit tests for TrashView component
    - Test rendering with mock data
    - Test pagination controls
    - Test selection functionality
    - Test loading and error states

- [ ] 11. Frontend: Filtering and search
  - [ ] 11.1 Create filter controls component
    - Add entity type dropdown filter
    - Add date range picker for deletion date
    - Add deleted by user filter
    - Add original module filter
    - _Requirements: 2.4, 11.2, 11.3, 11.4_
  
  - [ ] 11.2 Create search input component
    - Add search input with debouncing
    - Trigger search on input change
    - Clear search functionality
    - _Requirements: 2.5, 11.1_
  
  - [ ] 11.3 Implement filter application logic
    - Combine multiple filters with AND logic
    - Update trash items when filters change
    - Display filtered result count
    - Clear all filters functionality
    - _Requirements: 11.5, 11.7_
  
  - [ ] 11.4 Write property test for filter result count
    - **Property 25: Filter Result Count Matches Actual Results**
    - **Validates: Requirements 11.7**

- [ ] 12. Frontend: Action buttons and dialogs
  - [ ] 12.1 Create restore action functionality
    - Add "Restore" button for single items
    - Add "Restore Selected" button for bulk
    - Call TrashService.restoreItem() or restoreBulk()
    - Show success/error notifications
    - Refresh trash view after restoration
    - _Requirements: 3.1, 3.6, 10.3_
  
  - [ ] 12.2 Create permanent delete confirmation dialog
    - Show confirmation dialog with item count
    - Require explicit confirmation
    - Display warning about permanent action
    - _Requirements: 4.1, 4.5_
  
  - [ ] 12.3 Create permanent delete action functionality
    - Add "Permanently Delete" button for single items
    - Add "Permanently Delete Selected" button for bulk
    - Show confirmation dialog before proceeding
    - Call TrashService.permanentDelete() or permanentDeleteBulk()
    - Show success/error notifications
    - Refresh trash view after deletion
    - _Requirements: 4.2, 4.4_
  
  - [ ] 12.4 Implement conflict error handling
    - Display conflict errors from API
    - Show resolution suggestions
    - Allow retry after conflict resolution
    - _Requirements: 3.5, 12.1, 12.2, 12.3, 12.4_
  
  - [ ] 12.5 Write unit tests for action handlers
    - Test restore action with success and error cases
    - Test permanent delete with confirmation
    - Test conflict error display
    - Test bulk action progress indicators

- [ ] 13. Frontend: Navigation and UI integration
  - [ ] 13.1 Add Trash navigation item to admin menu
    - Add "Trash" or "Recycle Bin" menu item
    - Add icon (trash can icon)
    - Display trash item count badge
    - Link to trash view route
    - _Requirements: 9.1, 9.7_
  
  - [ ] 13.2 Update module delete actions to show trash notifications
    - Modify delete handlers in all modules (Inventory, Users, etc.)
    - Show "Moved to trash" notification after deletion
    - Add visual feedback for soft delete
    - _Requirements: 9.2_
  
  - [ ] 13.3 Implement trash-specific UI styling
    - Add visual indicators for trash operations (icons, colors)
    - Style confirmation dialogs appropriately
    - Add loading states and progress indicators
    - Ensure responsive design
    - _Requirements: 9.3, 9.6, 10.5_
  
  - [ ] 13.4 Write UI integration tests
    - Test navigation to trash view
    - Test notifications appear correctly
    - Test responsive design

- [ ] 14. Frontend: Permission-based UI
  - [ ] 14.1 Implement permission checks in UI
    - Show/hide permanent delete buttons based on user role
    - Display permission error messages
    - Disable actions for unauthorized users
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [ ] 14.2 Write unit tests for permission-based rendering
    - Test Root Admin sees all actions
    - Test Assigned Admin doesn't see permanent delete
    - Test permission error messages

- [ ] 15. Module integration: Update all entity modules
  - [ ] 15.1 Update Inventory module queries to filter soft-deleted items
    - Add WHERE deleted_at IS NULL to all list queries
    - Update delete handler to use soft delete API
    - _Requirements: 1.3, 6.1_
  
  - [ ] 15.2 Update Users module queries to filter soft-deleted items
    - Add WHERE deleted_at IS NULL to all list queries
    - Update delete handler to use soft delete API
    - _Requirements: 1.3, 6.2_
  
  - [ ] 15.3 Update Reservations module queries to filter soft-deleted items
    - Add WHERE deleted_at IS NULL to all list queries
    - Update delete handler to use soft delete API
    - _Requirements: 1.3, 6.3_
  
  - [ ] 15.4 Update Borrow Requests module queries to filter soft-deleted items
    - Add WHERE deleted_at IS NULL to all list queries
    - Update delete handler to use soft delete API
    - _Requirements: 1.3, 6.4_
  
  - [ ] 15.5 Update Incident Reports module queries to filter soft-deleted items
    - Add WHERE deleted_at IS NULL to all list queries
    - Update delete handler to use soft delete API
    - _Requirements: 1.3, 6.5_
  
  - [ ] 15.6 Update Lost & Found module queries to filter soft-deleted items
    - Add WHERE deleted_at IS NULL to all list queries
    - Update delete handler to use soft delete API
    - _Requirements: 1.3, 6.6_
  
  - [ ] 15.7 Update Visitor Logs module queries to filter soft-deleted items
    - Add WHERE deleted_at IS NULL to all list queries
    - Update delete handler to use soft delete API
    - _Requirements: 1.3, 6.7_
  
  - [ ] 15.8 Write property test for module filtering
    - **Property 2: Soft Deleted Items Hidden from Normal Views**
    - **Validates: Requirements 1.3**

- [ ] 16. Configuration interface for retention settings
  - [ ] 16.1 Create retention configuration UI (admin settings page)
    - Add form to update retention period
    - Add toggle for auto-cleanup enabled/disabled
    - Show current configuration
    - Restrict to Root Admin only
    - _Requirements: 7.4, 7.5_
  
  - [ ] 16.2 Create API endpoint for configuration management
    - GET /api/trash/config - Get current configuration
    - PUT /api/trash/config - Update configuration (Root Admin only)
    - _Requirements: 7.4_
  
  - [ ] 16.3 Write unit tests for configuration
    - Test configuration update (Example 6)
    - Test zero retention behavior (Example 5)
    - _Requirements: 7.4, 7.5_

- [ ] 17. Audit trail viewer
  - [ ] 17.1 Create audit trail view component
    - Display audit log entries in table format
    - Show timestamp, user, entity type, entity ID, action
    - Implement pagination
    - _Requirements: 8.4_
  
  - [ ] 17.2 Implement audit trail filtering
    - Add filters for date range, user, entity type, action type
    - Apply filters to audit trail query
    - _Requirements: 8.5_
  
  - [ ] 17.3 Write property tests for audit trail
    - **Property 21: Audit Trail Is Complete**
    - **Property 22: Audit Trail Filtering Works**
    - **Validates: Requirements 8.4, 8.5**

- [ ] 18. Final checkpoint - Integration testing
  - [ ] 18.1 Run end-to-end integration tests
    - Test complete soft delete → view → restore flow
    - Test complete soft delete → permanent delete flow
    - Test bulk operations across multiple entity types
    - Test auto-cleanup with old items
    - Test audit trail completeness
    - _Requirements: All_
  
  - [ ] 18.2 Write property tests for permission checks
    - **Property 14: Admin Roles Can Soft Delete**
    - **Property 15: Admin Roles Can View Trash**
    - **Property 16: Admin Roles Can Restore Items**
    - **Property 17: Root Admin Can Permanently Delete**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4**
  
  - [ ] 18.3 Perform manual testing across all modules
    - Test in each module: Inventory, Users, Reservations, Borrow Requests, Incident Reports, Lost & Found, Visitor Logs
    - Verify soft delete works consistently
    - Verify restoration returns items to correct modules
    - Test with both Root Admin and Assigned Admin accounts
  
  - [ ] 18.4 Final checkpoint - Ensure all tests pass
    - Run full test suite (unit + property + integration)
    - Verify no regressions in existing functionality
    - Ask the user if questions arise

## Notes

- All tasks are required for comprehensive implementation with full test coverage
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties across random inputs
- Unit tests validate specific examples, edge cases, and error conditions
- The implementation follows a bottom-up approach: database → backend → frontend
- Module integration happens near the end to avoid disrupting existing functionality during development
- Auto-cleanup is implemented but can be disabled via configuration if needed
