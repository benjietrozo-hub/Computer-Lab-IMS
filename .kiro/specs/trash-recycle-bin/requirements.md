# Requirements Document: Trash/Recycle Bin Feature

## Introduction

The LabMate Guardian system currently performs permanent deletion of items across various modules (inventory, users, reservations, borrow requests, incident reports, lost & found items, visitor logs). This feature introduces a trash/recycle bin system that allows admin users (root admin and assigned admin) to soft delete items, view deleted items in a centralized location, restore items to their original location, and permanently delete items when needed. This provides a safety mechanism against accidental deletions and enables data recovery.

## Glossary

- **System**: The LabMate Guardian application (React + TypeScript frontend with PHP backend)
- **Admin_User**: A user with either root admin or assigned admin privileges
- **Root_Admin**: An administrator with full system privileges
- **Assigned_Admin**: An administrator with delegated privileges
- **Trash**: A centralized area where soft-deleted items are stored
- **Soft_Delete**: Marking an item as deleted without removing it from the database
- **Hard_Delete**: Permanently removing an item from the database
- **Entity**: Any deletable data object in the system (inventory, users, reservations, etc.)
- **Restoration**: The process of recovering a soft-deleted item to its original state and location
- **Deletion_Metadata**: Information about when, by whom, and from where an item was deleted
- **Original_Module**: The system module (inventory, users, etc.) from which an entity was deleted

## Requirements

### Requirement 1: Soft Delete Functionality

**User Story:** As an admin user, I want items to be soft deleted instead of permanently removed, so that I can recover them if deletion was accidental or premature.

#### Acceptance Criteria

1. WHEN an Admin_User deletes an Entity from any module, THE System SHALL mark the Entity as deleted without removing it from the database
2. WHEN an Entity is soft deleted, THE System SHALL record Deletion_Metadata including deletion timestamp, deleting user ID, and Original_Module
3. WHEN an Entity is soft deleted, THE System SHALL hide the Entity from normal views in its Original_Module
4. WHEN an Entity is soft deleted, THE System SHALL preserve all relationships and associated data for potential restoration
5. WHERE an Entity has dependent relationships, WHEN the Entity is soft deleted, THE System SHALL handle dependent entities according to cascade rules

### Requirement 2: Trash Viewing Interface

**User Story:** As an admin user, I want to view all deleted items in a centralized trash area, so that I can review what has been deleted and decide whether to restore or permanently delete items.

#### Acceptance Criteria

1. THE System SHALL provide a dedicated Trash interface accessible to Admin_Users
2. WHEN an Admin_User accesses the Trash interface, THE System SHALL display all soft-deleted Entities across all modules
3. WHEN displaying deleted Entities, THE System SHALL show the entity type, entity name or identifier, deletion date, deleting user, and Original_Module
4. THE System SHALL provide filtering capabilities by entity type, deletion date range, deleting user, and Original_Module
5. THE System SHALL provide search functionality to find specific deleted Entities by name or identifier
6. WHEN displaying the Trash, THE System SHALL sort items by deletion date in descending order by default
7. THE System SHALL provide pagination for the Trash view when more than 50 items are present

### Requirement 3: Item Restoration

**User Story:** As an admin user, I want to restore deleted items back to their original location, so that I can recover from accidental deletions or restore items that should not have been deleted.

#### Acceptance Criteria

1. WHEN an Admin_User selects a soft-deleted Entity and initiates restoration, THE System SHALL restore the Entity to its original state in its Original_Module
2. WHEN an Entity is restored, THE System SHALL remove the deleted flag and make the Entity visible in normal views
3. WHEN an Entity is restored, THE System SHALL preserve all original data, relationships, and metadata
4. WHEN an Entity is restored, THE System SHALL record restoration metadata including restoration timestamp and restoring user ID
5. IF restoration would create a conflict (e.g., duplicate identifier), THEN THE System SHALL notify the Admin_User and prevent restoration until the conflict is resolved
6. WHEN an Entity is successfully restored, THE System SHALL display a confirmation message indicating the Entity and its Original_Module

### Requirement 4: Permanent Deletion

**User Story:** As an admin user, I want to permanently delete items from the trash, so that I can free up storage space and remove items that are no longer needed.

#### Acceptance Criteria

1. WHEN an Admin_User selects a soft-deleted Entity and initiates permanent deletion, THE System SHALL prompt for confirmation before proceeding
2. WHEN permanent deletion is confirmed, THE System SHALL remove the Entity and all associated data from the database
3. WHEN an Entity is permanently deleted, THE System SHALL handle dependent relationships according to cascade deletion rules
4. THE System SHALL provide a bulk permanent deletion action for multiple selected Entities
5. WHEN bulk permanent deletion is initiated, THE System SHALL display the count of items to be deleted and require explicit confirmation

### Requirement 5: Permission Management

**User Story:** As a system administrator, I want to control which admin roles can perform trash operations, so that I can maintain appropriate access controls.

#### Acceptance Criteria

1. THE System SHALL allow both Root_Admin and Assigned_Admin to soft delete Entities
2. THE System SHALL allow both Root_Admin and Assigned_Admin to view the Trash interface
3. THE System SHALL allow both Root_Admin and Assigned_Admin to restore soft-deleted Entities
4. THE System SHALL allow Root_Admin to permanently delete Entities from the Trash
5. WHERE an Assigned_Admin attempts permanent deletion, THE System SHALL require Root_Admin approval or deny the action based on configuration

### Requirement 6: Multi-Module Support

**User Story:** As an admin user, I want the trash feature to work consistently across all system modules, so that I have a unified experience regardless of what type of item I'm managing.

#### Acceptance Criteria

1. THE System SHALL support soft deletion for Inventory and Equipment entities
2. THE System SHALL support soft deletion for User entities
3. THE System SHALL support soft deletion for Reservation entities
4. THE System SHALL support soft deletion for Borrow Request entities
5. THE System SHALL support soft deletion for Incident Report entities
6. THE System SHALL support soft deletion for Lost and Found Item entities
7. THE System SHALL support soft deletion for Visitor Log entities
8. WHEN displaying Entities in the Trash, THE System SHALL clearly indicate the entity type and Original_Module for each item

### Requirement 7: Data Retention and Auto-Cleanup

**User Story:** As a system administrator, I want deleted items to be automatically removed after a retention period, so that the trash doesn't grow indefinitely and storage is managed efficiently.

#### Acceptance Criteria

1. THE System SHALL maintain soft-deleted Entities in the Trash for a configurable retention period (default 30 days)
2. WHEN a soft-deleted Entity exceeds the retention period, THE System SHALL automatically perform permanent deletion
3. THE System SHALL provide a notification or log entry when automatic permanent deletion occurs
4. THE System SHALL allow Root_Admin to configure the retention period
5. WHERE the retention period is set to zero, THE System SHALL disable automatic cleanup and retain items indefinitely

### Requirement 8: Audit Trail

**User Story:** As a system administrator, I want to track all trash operations, so that I can maintain accountability and investigate issues if they arise.

#### Acceptance Criteria

1. WHEN an Entity is soft deleted, THE System SHALL create an audit log entry with timestamp, user ID, entity type, entity ID, and action type
2. WHEN an Entity is restored, THE System SHALL create an audit log entry with timestamp, user ID, entity type, entity ID, and action type
3. WHEN an Entity is permanently deleted, THE System SHALL create an audit log entry with timestamp, user ID, entity type, entity ID, and action type
4. THE System SHALL allow Root_Admin to view the complete audit trail for trash operations
5. THE System SHALL provide filtering capabilities for the audit trail by date range, user, entity type, and action type

### Requirement 9: User Interface Requirements

**User Story:** As an admin user, I want an intuitive and consistent interface for managing the trash, so that I can efficiently perform trash operations without confusion.

#### Acceptance Criteria

1. THE System SHALL provide a "Trash" or "Recycle Bin" navigation item in the admin interface
2. WHEN an Admin_User deletes an Entity, THE System SHALL display a notification indicating the item was moved to trash
3. THE System SHALL provide visual indicators (icons, badges) to distinguish trash operations from normal operations
4. WHEN viewing the Trash interface, THE System SHALL provide clear action buttons for "Restore" and "Permanently Delete"
5. THE System SHALL use confirmation dialogs for destructive actions (permanent deletion)
6. THE System SHALL provide visual feedback (loading states, success messages, error messages) for all trash operations
7. THE System SHALL display the count of items currently in the Trash in the navigation interface

### Requirement 10: Bulk Operations

**User Story:** As an admin user, I want to perform operations on multiple trash items at once, so that I can efficiently manage large numbers of deleted items.

#### Acceptance Criteria

1. THE System SHALL provide checkbox selection for multiple Entities in the Trash view
2. THE System SHALL provide a "Select All" option to select all visible Entities on the current page
3. WHEN multiple Entities are selected, THE System SHALL enable bulk restore action
4. WHEN multiple Entities are selected, THE System SHALL enable bulk permanent deletion action
5. WHEN bulk operations are initiated, THE System SHALL display progress indicators for long-running operations
6. IF any item in a bulk operation fails, THEN THE System SHALL continue processing remaining items and report which items failed

### Requirement 11: Search and Filter Capabilities

**User Story:** As an admin user, I want to search and filter deleted items, so that I can quickly find specific items in a large trash collection.

#### Acceptance Criteria

1. THE System SHALL provide a search input that filters Entities by name, identifier, or description
2. THE System SHALL provide dropdown filters for entity type (Inventory, Users, Reservations, etc.)
3. THE System SHALL provide date range filters for deletion date
4. THE System SHALL provide a filter for deleting user
5. WHEN multiple filters are applied, THE System SHALL combine them with AND logic
6. THE System SHALL update the Trash view in real-time as filters are applied
7. THE System SHALL display the count of filtered results

### Requirement 12: Conflict Resolution

**User Story:** As an admin user, I want to be notified of conflicts when restoring items, so that I can resolve issues and successfully restore items without data corruption.

#### Acceptance Criteria

1. IF restoring an Entity would create a duplicate identifier, THEN THE System SHALL prevent restoration and display an error message
2. IF the Original_Module no longer exists, THEN THE System SHALL notify the Admin_User and offer alternative restoration locations
3. IF required parent entities have been permanently deleted, THEN THE System SHALL prevent restoration and explain the dependency issue
4. THE System SHALL provide suggestions for resolving conflicts when possible
5. WHEN a conflict is resolved, THE System SHALL allow the Admin_User to retry restoration
