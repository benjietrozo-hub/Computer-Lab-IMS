# Design Document: Trash/Recycle Bin Feature

## Overview

The trash/recycle bin feature introduces a soft deletion mechanism across the LabMate Guardian system, replacing permanent deletion with a recoverable deletion workflow. The design implements a centralized trash management system that works consistently across all modules (Inventory, Users, Reservations, Borrow Requests, Incident Reports, Lost & Found, Visitor Logs).

The architecture follows a three-tier approach:
1. **Frontend Layer**: React + TypeScript UI components for trash management
2. **Backend Layer**: PHP API endpoints for trash operations
3. **Database Layer**: Schema modifications to support soft deletion and metadata tracking

Key design principles:
- **Non-destructive by default**: All deletions are soft deletes unless explicitly made permanent
- **Module-agnostic**: Trash operations work uniformly across all entity types
- **Audit-first**: Every operation is logged for accountability
- **Conflict-aware**: Restoration handles conflicts gracefully

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React + TS)                    │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Trash View   │  │ Module Views │  │ Confirmation │      │
│  │ Component    │  │ (Inventory,  │  │ Dialogs      │      │
│  │              │  │  Users, etc) │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                 │
│                   ┌────────▼────────┐                        │
│                   │  Trash Service  │                        │
│                   │  (API Client)   │                        │
│                   └────────┬────────┘                        │
└────────────────────────────┼─────────────────────────────────┘
                             │ HTTP/REST
┌────────────────────────────▼─────────────────────────────────┐
│                      Backend (PHP)                           │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Trash        │  │ Soft Delete  │  │ Audit        │      │
│  │ Controller   │  │ Middleware   │  │ Logger       │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                 │
│                   ┌────────▼────────┐                        │
│                   │  Trash Service  │                        │
│                   │  (Business Logic)│                       │
│                   └────────┬────────┘                        │
└────────────────────────────┼─────────────────────────────────┘
                             │ SQL
┌────────────────────────────▼─────────────────────────────────┐
│                      Database (MySQL)                        │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐   │
│  │  All Entity Tables (with soft delete columns)        │   │
│  │  - deleted_at (timestamp, nullable)                  │   │
│  │  - deleted_by (user_id, nullable)                    │   │
│  │  - original_module (varchar, nullable)               │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  trash_audit_log                                     │   │
│  │  - id, entity_type, entity_id, action, user_id,      │   │
│  │    timestamp, metadata                               │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

**Soft Delete Flow:**
1. User clicks delete in any module → Frontend sends DELETE request
2. Backend intercepts request → Soft Delete Middleware applies
3. Instead of DELETE SQL, UPDATE sets: `deleted_at = NOW(), deleted_by = user_id, original_module = 'inventory'`
4. Audit log entry created
5. Frontend receives success → Shows "Moved to trash" notification

**Restoration Flow:**
1. User selects item in Trash → Clicks "Restore"
2. Frontend sends POST /trash/restore/{id}
3. Backend validates: checks for conflicts (duplicate IDs, missing dependencies)
4. If valid: UPDATE sets `deleted_at = NULL, deleted_by = NULL, original_module = NULL`
5. Audit log entry created
6. Frontend receives success → Shows "Restored to {module}" notification

**Permanent Delete Flow:**
1. User selects item in Trash → Clicks "Permanently Delete" → Confirms
2. Frontend sends DELETE /trash/permanent/{id}
3. Backend checks permissions (Root Admin required)
4. Performs actual DELETE SQL with cascade rules
5. Audit log entry created
6. Frontend receives success → Removes item from trash view

## Components and Interfaces

### Frontend Components

#### TrashView Component
```typescript
interface TrashViewProps {
  // No props needed - fetches data internally
}

interface TrashItem {
  id: string;
  entityType: 'inventory' | 'user' | 'reservation' | 'borrow_request' | 
              'incident_report' | 'lost_found' | 'visitor_log';
  entityName: string;
  entityIdentifier: string;
  deletedAt: Date;
  deletedBy: {
    id: string;
    name: string;
  };
  originalModule: string;
  metadata: Record<string, any>; // Entity-specific preview data
}

interface TrashViewState {
  items: TrashItem[];
  selectedIds: Set<string>;
  filters: TrashFilters;
  isLoading: boolean;
  error: string | null;
}

interface TrashFilters {
  entityType: string | null;
  dateRange: { start: Date | null; end: Date | null };
  deletedBy: string | null;
  searchQuery: string;
}
```

**Responsibilities:**
- Display paginated list of deleted items
- Handle selection (single and bulk)
- Apply filters and search
- Trigger restore/permanent delete actions
- Show confirmation dialogs

#### TrashService (API Client)
```typescript
class TrashService {
  async fetchTrashItems(
    page: number,
    pageSize: number,
    filters: TrashFilters
  ): Promise<{ items: TrashItem[]; total: number }>;
  
  async restoreItem(id: string): Promise<{ success: boolean; message: string }>;
  
  async restoreBulk(ids: string[]): Promise<{ 
    succeeded: string[]; 
    failed: Array<{ id: string; reason: string }> 
  }>;
  
  async permanentDelete(id: string): Promise<{ success: boolean; message: string }>;
  
  async permanentDeleteBulk(ids: string[]): Promise<{ 
    succeeded: string[]; 
    failed: Array<{ id: string; reason: string }> 
  }>;
  
  async getTrashCount(): Promise<number>;
}
```

#### Module Integration
Each module (Inventory, Users, etc.) needs minimal changes:
- Replace direct DELETE calls with soft delete API calls
- Update list queries to filter out soft-deleted items: `WHERE deleted_at IS NULL`
- Add "Moved to trash" notification after deletion

### Backend Components

#### TrashController (PHP)
```php
class TrashController {
  // GET /api/trash?page=1&pageSize=50&entityType=inventory&search=...
  public function index(Request $request): JsonResponse;
  
  // POST /api/trash/restore/{id}
  public function restore(string $id): JsonResponse;
  
  // POST /api/trash/restore-bulk
  public function restoreBulk(Request $request): JsonResponse;
  
  // DELETE /api/trash/permanent/{id}
  public function permanentDelete(string $id): JsonResponse;
  
  // DELETE /api/trash/permanent-bulk
  public function permanentDeleteBulk(Request $request): JsonResponse;
  
  // GET /api/trash/count
  public function count(): JsonResponse;
}
```

#### SoftDeleteMiddleware (PHP)
```php
class SoftDeleteMiddleware {
  /**
   * Intercepts DELETE requests to entity endpoints
   * Converts to UPDATE with soft delete columns
   */
  public function handle(Request $request, Closure $next): Response;
  
  /**
   * Determines if request should be soft deleted
   * Based on entity type and endpoint
   */
  private function shouldSoftDelete(Request $request): bool;
  
  /**
   * Performs soft delete operation
   */
  private function softDelete(string $table, string $id, array $metadata): bool;
}
```

#### TrashService (Business Logic - PHP)
```php
class TrashService {
  /**
   * Fetches trash items with filters and pagination
   */
  public function getTrashItems(
    int $page,
    int $pageSize,
    array $filters
  ): array;
  
  /**
   * Restores a soft-deleted item
   * Returns success or conflict details
   */
  public function restoreItem(string $entityType, string $id): array;
  
  /**
   * Checks for restoration conflicts
   */
  private function checkRestoreConflicts(
    string $entityType,
    string $id
  ): ?array;
  
  /**
   * Permanently deletes an item
   * Requires Root Admin permission
   */
  public function permanentDelete(
    string $entityType,
    string $id,
    User $user
  ): array;
  
  /**
   * Auto-cleanup job: removes items past retention period
   */
  public function autoCleanup(int $retentionDays): array;
}
```

#### AuditLogger (PHP)
```php
class AuditLogger {
  /**
   * Logs trash operations to audit table
   */
  public function logTrashOperation(
    string $action, // 'soft_delete', 'restore', 'permanent_delete'
    string $entityType,
    string $entityId,
    string $userId,
    array $metadata = []
  ): void;
  
  /**
   * Retrieves audit trail with filters
   */
  public function getAuditTrail(array $filters): array;
}
```

## Data Models

### Database Schema Modifications

#### Soft Delete Columns (Added to All Entity Tables)
```sql
-- Add to: inventory, users, reservations, borrow_requests, 
--         incident_reports, lost_found_items, visitor_logs

ALTER TABLE {table_name} ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL;
ALTER TABLE {table_name} ADD COLUMN deleted_by INT NULL DEFAULT NULL;
ALTER TABLE {table_name} ADD COLUMN original_module VARCHAR(50) NULL DEFAULT NULL;

-- Index for performance
CREATE INDEX idx_deleted_at ON {table_name}(deleted_at);

-- Foreign key for deleted_by
ALTER TABLE {table_name} 
  ADD CONSTRAINT fk_{table_name}_deleted_by 
  FOREIGN KEY (deleted_by) REFERENCES users(id) ON DELETE SET NULL;
```

#### Trash Audit Log Table
```sql
CREATE TABLE trash_audit_log (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  entity_type VARCHAR(50) NOT NULL,
  entity_id VARCHAR(255) NOT NULL,
  action ENUM('soft_delete', 'restore', 'permanent_delete') NOT NULL,
  user_id INT NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSON NULL,
  
  INDEX idx_entity (entity_type, entity_id),
  INDEX idx_user (user_id),
  INDEX idx_timestamp (timestamp),
  INDEX idx_action (action),
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### System Configuration Table (Optional)
```sql
CREATE TABLE trash_config (
  id INT AUTO_INCREMENT PRIMARY KEY,
  retention_days INT NOT NULL DEFAULT 30,
  auto_cleanup_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by INT NOT NULL,
  
  FOREIGN KEY (updated_by) REFERENCES users(id)
);
```

### Entity Type Mapping
```typescript
const ENTITY_TYPE_MAP = {
  'inventory': {
    table: 'inventory',
    idColumn: 'id',
    nameColumn: 'item_name',
    module: 'Inventory'
  },
  'user': {
    table: 'users',
    idColumn: 'id',
    nameColumn: 'username',
    module: 'Users'
  },
  'reservation': {
    table: 'reservations',
    idColumn: 'id',
    nameColumn: 'reservation_code',
    module: 'Reservations'
  },
  'borrow_request': {
    table: 'borrow_requests',
    idColumn: 'id',
    nameColumn: 'request_code',
    module: 'Borrow Requests'
  },
  'incident_report': {
    table: 'incident_reports',
    idColumn: 'id',
    nameColumn: 'report_code',
    module: 'Incident Reports'
  },
  'lost_found': {
    table: 'lost_found_items',
    idColumn: 'id',
    nameColumn: 'item_name',
    module: 'Lost & Found'
  },
  'visitor_log': {
    table: 'visitor_logs',
    idColumn: 'id',
    nameColumn: 'visitor_name',
    module: 'Visitor Logs'
  }
};
```

### Query Patterns

**Fetch Trash Items:**
```sql
SELECT 
  '{entity_type}' as entity_type,
  id as entity_id,
  {nameColumn} as entity_name,
  deleted_at,
  deleted_by,
  original_module
FROM {table}
WHERE deleted_at IS NOT NULL
ORDER BY deleted_at DESC
LIMIT {pageSize} OFFSET {offset};
```

**Soft Delete:**
```sql
UPDATE {table}
SET 
  deleted_at = NOW(),
  deleted_by = :userId,
  original_module = :moduleName
WHERE id = :entityId;
```

**Restore:**
```sql
UPDATE {table}
SET 
  deleted_at = NULL,
  deleted_by = NULL,
  original_module = NULL
WHERE id = :entityId;
```

**Permanent Delete:**
```sql
DELETE FROM {table}
WHERE id = :entityId AND deleted_at IS NOT NULL;
```

**Auto-Cleanup:**
```sql
DELETE FROM {table}
WHERE deleted_at IS NOT NULL 
  AND deleted_at < DATE_SUB(NOW(), INTERVAL :retentionDays DAY);
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Soft Delete Preserves Data with Metadata

*For any* entity across any module, when soft deleted by an admin user, the entity should remain in the database with `deleted_at` timestamp set, `deleted_by` set to the deleting user's ID, and `original_module` set to the source module name.

**Validates: Requirements 1.1, 1.2**

### Property 2: Soft Deleted Items Hidden from Normal Views

*For any* entity that has been soft deleted, querying the entity's original module with standard filters (WHERE deleted_at IS NULL) should not return that entity.

**Validates: Requirements 1.3**

### Property 3: Soft Delete Preserves Relationships

*For any* entity with associated relationships (foreign keys, related records), soft deleting the entity should leave all relationship data intact and queryable.

**Validates: Requirements 1.4**

### Property 4: Trash View Returns All Soft Deleted Items

*For any* set of soft-deleted entities across different modules, querying the trash view should return all entities where `deleted_at IS NOT NULL`.

**Validates: Requirements 2.2**

### Property 5: Trash Items Include Required Fields

*For any* item returned from the trash view, the response should include entity_type, entity_name, entity_id, deleted_at, deleted_by (with user details), and original_module.

**Validates: Requirements 2.3, 6.8**

### Property 6: Trash Filtering Works Correctly

*For any* combination of filters (entity type, date range, deleting user, original module), the trash view should return only items matching all applied filter criteria (AND logic).

**Validates: Requirements 2.4, 11.2, 11.3, 11.4, 11.5**

### Property 7: Trash Search Finds Matching Items

*For any* search query, the trash view should return only items where the entity name or identifier contains the search string (case-insensitive).

**Validates: Requirements 2.5, 11.1**

### Property 8: Trash Default Sort Order

*For any* trash view query without explicit sorting, items should be returned ordered by `deleted_at` in descending order (most recently deleted first).

**Validates: Requirements 2.6**

### Property 9: Trash Pagination Works Correctly

*For any* trash view with more than 50 items, requesting page N with page size P should return items from offset (N-1)*P to N*P, and the total count should match the actual number of soft-deleted items.

**Validates: Requirements 2.7**

### Property 10: Restoration Round Trip

*For any* entity, soft deleting it and then restoring it should return the entity to its original state with all data, relationships, and metadata preserved, and the entity should be visible in normal module views.

**Validates: Requirements 3.1, 3.2, 3.3**

### Property 11: Trash Operations Create Audit Logs

*For any* trash operation (soft delete, restore, permanent delete), an audit log entry should be created with timestamp, user_id, entity_type, entity_id, action type, and optional metadata.

**Validates: Requirements 3.4, 8.1, 8.2, 8.3**

### Property 12: Permanent Delete Removes Data

*For any* soft-deleted entity, performing permanent deletion should remove the entity from the database such that subsequent queries return no results for that entity ID.

**Validates: Requirements 4.2**

### Property 13: Bulk Permanent Delete Processes All Items

*For any* set of selected soft-deleted entities, initiating bulk permanent deletion should remove all entities from the database.

**Validates: Requirements 4.4, 10.4**

### Property 14: Admin Roles Can Soft Delete

*For any* admin user (Root_Admin or Assigned_Admin), attempting to soft delete an entity should succeed and mark the entity as deleted.

**Validates: Requirements 5.1**

### Property 15: Admin Roles Can View Trash

*For any* admin user (Root_Admin or Assigned_Admin), accessing the trash view should return the list of soft-deleted items without permission errors.

**Validates: Requirements 5.2**

### Property 16: Admin Roles Can Restore Items

*For any* admin user (Root_Admin or Assigned_Admin), attempting to restore a soft-deleted entity should succeed and make the entity visible in its original module.

**Validates: Requirements 5.3**

### Property 17: Root Admin Can Permanently Delete

*For any* Root_Admin user, attempting to permanently delete a soft-deleted entity should succeed and remove the entity from the database.

**Validates: Requirements 5.4**

### Property 18: Retention Period Enforced

*For any* soft-deleted entity with `deleted_at` timestamp within the configured retention period, the entity should remain in the trash and not be auto-deleted.

**Validates: Requirements 7.1**

### Property 19: Auto-Cleanup Removes Expired Items

*For any* soft-deleted entity with `deleted_at` timestamp older than the configured retention period, running the auto-cleanup job should permanently delete the entity.

**Validates: Requirements 7.2**

### Property 20: Auto-Cleanup Creates Audit Logs

*For any* entity permanently deleted by auto-cleanup, an audit log entry should be created with action type 'auto_cleanup' and the system user as the actor.

**Validates: Requirements 7.3**

### Property 21: Audit Trail Is Complete

*For any* sequence of trash operations performed, querying the audit trail should return entries for all operations in chronological order.

**Validates: Requirements 8.4**

### Property 22: Audit Trail Filtering Works

*For any* combination of audit trail filters (date range, user, entity type, action type), the results should include only entries matching all filter criteria.

**Validates: Requirements 8.5**

### Property 23: Bulk Restore Processes All Items

*For any* set of selected soft-deleted entities, initiating bulk restore should restore all entities to their original modules and make them visible in normal views.

**Validates: Requirements 10.3**

### Property 24: Bulk Operations Handle Partial Failures

*For any* bulk operation (restore or permanent delete) where some items fail due to conflicts or errors, the operation should continue processing remaining items and return a list of succeeded and failed items with failure reasons.

**Validates: Requirements 10.6**

### Property 25: Filter Result Count Matches Actual Results

*For any* trash view query with filters applied, the returned count should equal the number of items in the results array.

**Validates: Requirements 11.7**

### Edge Cases and Examples

The following scenarios should be tested with specific examples rather than property-based tests:

**Example 1: Duplicate Identifier Conflict**
- Soft delete an entity with identifier "INV-001"
- Create a new entity with identifier "INV-001"
- Attempt to restore the soft-deleted entity
- Expected: Restoration fails with conflict error message
- **Validates: Requirements 3.5, 12.1**

**Example 2: Missing Original Module**
- Soft delete an entity from module "CustomModule"
- Remove or rename "CustomModule" from the system
- Attempt to restore the entity
- Expected: System notifies user and offers alternative restoration locations
- **Validates: Requirements 12.2**

**Example 3: Missing Parent Entity**
- Create entity A with child entity B (foreign key relationship)
- Soft delete both A and B
- Permanently delete A
- Attempt to restore B
- Expected: Restoration fails with dependency error explaining parent is missing
- **Validates: Requirements 12.3**

**Example 4: Assigned Admin Permanent Delete Denied**
- Log in as Assigned_Admin
- Attempt to permanently delete a soft-deleted entity
- Expected: Operation denied with permission error (or requires Root_Admin approval based on config)
- **Validates: Requirements 5.5**

**Example 5: Zero Retention Period Disables Auto-Cleanup**
- Set retention period to 0 days
- Create soft-deleted entities with old timestamps
- Run auto-cleanup job
- Expected: No entities are deleted, all remain in trash
- **Validates: Requirements 7.5**

**Example 6: Configure Retention Period**
- Log in as Root_Admin
- Update retention period from 30 to 60 days
- Query configuration
- Expected: Retention period is persisted and returned as 60 days
- **Validates: Requirements 7.4**

## Error Handling

### Conflict Detection

**Restoration Conflicts:**
1. **Duplicate Identifier**: Check if an active entity with the same unique identifier exists
   - Query: `SELECT COUNT(*) FROM {table} WHERE {unique_column} = :value AND deleted_at IS NULL`
   - If count > 0, return conflict error with details

2. **Missing Parent Entity**: Check if required parent entities exist
   - For each foreign key relationship, verify parent exists and is not deleted
   - Query: `SELECT COUNT(*) FROM {parent_table} WHERE id = :parent_id AND deleted_at IS NULL`
   - If count = 0, return dependency error

3. **Missing Module**: Verify the original module still exists in the system
   - Check against ENTITY_TYPE_MAP
   - If module not found, offer alternative modules or manual selection

**Permission Errors:**
- Verify user role before permanent deletion
- Return 403 Forbidden if Assigned_Admin attempts permanent delete without approval
- Log permission denial in audit trail

### Database Errors

**Transaction Handling:**
- Wrap all trash operations in database transactions
- On failure, rollback changes and return error details
- Ensure audit logs are created even on failure (separate transaction)

**Cascade Handling:**
- Respect foreign key constraints during permanent deletion
- Use ON DELETE CASCADE where appropriate
- Catch constraint violation errors and return user-friendly messages

### API Error Responses

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string; // 'CONFLICT', 'PERMISSION_DENIED', 'NOT_FOUND', 'DATABASE_ERROR'
    message: string; // User-friendly error message
    details?: any; // Additional context (e.g., conflicting entity ID)
  };
}
```

**Common Error Codes:**
- `CONFLICT_DUPLICATE`: Restoration would create duplicate identifier
- `CONFLICT_MISSING_PARENT`: Required parent entity is missing
- `CONFLICT_MISSING_MODULE`: Original module no longer exists
- `PERMISSION_DENIED`: User lacks permission for operation
- `NOT_FOUND`: Entity not found in trash
- `DATABASE_ERROR`: Unexpected database error
- `VALIDATION_ERROR`: Invalid input parameters

## Testing Strategy

### Dual Testing Approach

The trash/recycle bin feature requires both **unit tests** and **property-based tests** for comprehensive coverage:

**Unit Tests** focus on:
- Specific edge cases (duplicate identifiers, missing parents, missing modules)
- Permission checks for different admin roles
- Error handling scenarios
- API endpoint responses
- UI component rendering and interactions
- Configuration management

**Property-Based Tests** focus on:
- Universal properties that hold for all entities and modules
- Data integrity through soft delete/restore cycles
- Filtering and search correctness across random inputs
- Audit logging completeness
- Bulk operation correctness
- Pagination accuracy

### Property-Based Testing Configuration

**Library Selection:**
- **Frontend (TypeScript)**: Use `fast-check` library
- **Backend (PHP)**: Use `eris` library for property-based testing

**Test Configuration:**
- Minimum **100 iterations** per property test (due to randomization)
- Each property test must reference its design document property
- Tag format: `Feature: trash-recycle-bin, Property {number}: {property_text}`

**Example Property Test Structure (TypeScript with fast-check):**
```typescript
import fc from 'fast-check';

describe('Feature: trash-recycle-bin, Property 10: Restoration Round Trip', () => {
  it('should preserve entity state through soft delete and restore cycle', async () => {
    await fc.assert(
      fc.asyncProperty(
        entityArbitrary(), // Generates random entities
        async (entity) => {
          // Create entity
          const created = await createEntity(entity);
          
          // Soft delete
          await softDelete(created.id);
          
          // Restore
          await restore(created.id);
          
          // Verify entity matches original
          const restored = await getEntity(created.id);
          expect(restored).toEqual(created);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

**Example Property Test Structure (PHP with eris):**
```php
use Eris\Generator;
use Eris\TestTrait;

class TrashPropertyTest extends TestCase {
    use TestTrait;
    
    /**
     * Feature: trash-recycle-bin, Property 10: Restoration Round Trip
     */
    public function testRestorationRoundTrip() {
        $this->forAll(
            Generator\associative([
                'type' => Generator\elements(['inventory', 'user', 'reservation']),
                'name' => Generator\string(),
                'data' => Generator\associative([])
            ])
        )
        ->then(function ($entity) {
            // Create entity
            $created = $this->createEntity($entity);
            
            // Soft delete
            $this->softDelete($created['id']);
            
            // Restore
            $this->restore($created['id']);
            
            // Verify entity matches original
            $restored = $this->getEntity($created['id']);
            $this->assertEquals($created, $restored);
        })
        ->withMaxSize(100);
    }
}
```

### Unit Test Coverage

**Critical Unit Tests:**

1. **Conflict Handling**:
   - Test duplicate identifier conflict (Example 1)
   - Test missing parent entity conflict (Example 3)
   - Test missing module conflict (Example 2)

2. **Permission Tests**:
   - Root Admin can perform all operations
   - Assigned Admin can soft delete, view, restore
   - Assigned Admin cannot permanently delete (Example 4)

3. **Configuration Tests**:
   - Update retention period (Example 6)
   - Zero retention disables auto-cleanup (Example 5)

4. **API Endpoint Tests**:
   - GET /api/trash returns correct structure
   - POST /api/trash/restore/{id} handles success and errors
   - DELETE /api/trash/permanent/{id} requires Root Admin
   - Bulk endpoints handle partial failures

5. **UI Component Tests**:
   - TrashView renders item list correctly
   - Filters update results
   - Confirmation dialogs appear for destructive actions
   - Selection and bulk actions work

### Integration Tests

**End-to-End Scenarios:**
1. Create entity → Soft delete → View in trash → Restore → Verify in original module
2. Create entity → Soft delete → Permanently delete → Verify removed from database
3. Create multiple entities → Soft delete all → Bulk restore → Verify all restored
4. Create old entities → Run auto-cleanup → Verify expired items removed
5. Perform various operations → Check audit trail → Verify all logged

### Test Data Generators

**Entity Generators** (for property-based tests):
```typescript
// TypeScript with fast-check
const entityTypeArbitrary = () => 
  fc.constantFrom('inventory', 'user', 'reservation', 'borrow_request', 
                  'incident_report', 'lost_found', 'visitor_log');

const entityArbitrary = () => 
  fc.record({
    type: entityTypeArbitrary(),
    name: fc.string({ minLength: 1, maxLength: 100 }),
    identifier: fc.string({ minLength: 1, maxLength: 50 }),
    data: fc.dictionary(fc.string(), fc.anything())
  });

const adminUserArbitrary = () =>
  fc.record({
    id: fc.integer({ min: 1 }),
    role: fc.constantFrom('root_admin', 'assigned_admin'),
    username: fc.string({ minLength: 3 })
  });
```

### Performance Testing

**Load Tests:**
- Trash view with 10,000+ soft-deleted items
- Bulk operations on 1,000+ items
- Auto-cleanup with 50,000+ expired items
- Concurrent soft delete/restore operations

**Performance Targets:**
- Trash view query: < 500ms for 10,000 items
- Single restore: < 200ms
- Bulk restore (100 items): < 5 seconds
- Auto-cleanup: < 30 seconds for 50,000 items

### Test Execution Strategy

1. **Development**: Run unit tests and fast property tests (10 iterations) on every commit
2. **CI Pipeline**: Run full unit tests and property tests (100 iterations) on every PR
3. **Nightly**: Run extended property tests (1000 iterations) and integration tests
4. **Pre-Release**: Run full test suite including performance and load tests
