<?php
// Task 2.1: Create EntityTypeMapper utility class
// Maps entity types to their database table configurations

class EntityTypeMapper {
    private const ENTITY_TYPE_MAP = [
        'inventory' => [
            'table' => 'inventory_equipment',
            'idColumn' => 'id',
            'nameColumn' => 'name',
            'module' => 'Inventory'
        ],
        'user' => [
            'table' => 'users',
            'idColumn' => 'id',
            'nameColumn' => 'email',
            'module' => 'Users'
        ],
        'reservation' => [
            'table' => 'equipment_reservations',
            'idColumn' => 'id',
            'nameColumn' => 'reservation_number',
            'module' => 'Reservations'
        ],
        'borrow_request' => [
            'table' => 'borrow_requests',
            'idColumn' => 'id',
            'nameColumn' => 'borrower_name',
            'module' => 'Borrow Requests'
        ],
        'borrow_item' => [
            'table' => 'borrow_items',
            'idColumn' => 'id',
            'nameColumn' => 'borrower_name',
            'module' => 'Borrow Items'
        ],
        'repair_maintenance' => [
            'table' => 'repair_maintenance',
            'idColumn' => 'id',
            'nameColumn' => 'equipment',
            'module' => 'Repair & Maintenance'
        ],
        'incident_report' => [
            'table' => 'incident_reports',
            'idColumn' => 'id',
            'nameColumn' => 'title',
            'module' => 'Incident Reports'
        ],
        'lost_found' => [
            'table' => 'lost_found',
            'idColumn' => 'id',
            'nameColumn' => 'title',
            'module' => 'Lost & Found'
        ],
        'visitor_log' => [
            'table' => 'visitor_logs',
            'idColumn' => 'id',
            'nameColumn' => 'name',
            'module' => 'Visitor Logs'
        ]
    ];

    public static function getTableName(string $entityType): ?string {
        return self::ENTITY_TYPE_MAP[$entityType]['table'] ?? null;
    }

    public static function getIdColumn(string $entityType): ?string {
        return self::ENTITY_TYPE_MAP[$entityType]['idColumn'] ?? null;
    }

    public static function getNameColumn(string $entityType): ?string {
        return self::ENTITY_TYPE_MAP[$entityType]['nameColumn'] ?? null;
    }

    public static function getModuleName(string $entityType): ?string {
        return self::ENTITY_TYPE_MAP[$entityType]['module'] ?? null;
    }

    public static function isValidEntityType(string $entityType): bool {
        return isset(self::ENTITY_TYPE_MAP[$entityType]);
    }

    public static function getAllEntityTypes(): array {
        return array_keys(self::ENTITY_TYPE_MAP);
    }

    public static function getEntityConfig(string $entityType): ?array {
        return self::ENTITY_TYPE_MAP[$entityType] ?? null;
    }
}
