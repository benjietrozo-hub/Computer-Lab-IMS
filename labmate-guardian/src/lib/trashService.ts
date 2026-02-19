// Task 9.1 & 9.2: Create TrashService class and TypeScript interfaces
// Frontend API client for trash/recycle bin operations

const API_BASE_URL = 'http://localhost/labmate/labmate-guardian/api';

// TypeScript interfaces for trash data
export interface TrashItem {
  entity_id: string;
  entity_type: 'inventory' | 'user' | 'reservation' | 'borrow_request' | 
                'incident_report' | 'lost_found' | 'visitor_log';
  entity_name: string;
  deleted_at: string;
  deleted_by: number;
  deleted_by_user?: {
    id: number;
    username: string;
    email: string;
  };
  original_module: string;
}

export interface TrashFilters {
  entity_type?: string;
  search?: string;
  deleted_by?: number;
  date_from?: string;
  date_to?: string;
}

export interface TrashResponse {
  items: TrashItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface RestoreResponse {
  success: boolean;
  message?: string;
  error?: string;
  conflicts?: any;
}

export interface BulkOperationResponse {
  succeeded: string[];
  failed: Array<{
    id: string;
    reason: string;
  }>;
}

export interface AuditLogEntry {
  id: number;
  entity_type: string;
  entity_id: string;
  action: 'soft_delete' | 'restore' | 'permanent_delete' | 'auto_cleanup';
  user_id: number;
  username: string;
  email: string;
  timestamp: string;
  metadata?: any;
}

export interface AuditTrailResponse {
  logs: AuditLogEntry[];
  total: number;
}

class TrashService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/trash.php`;
  }

  /**
   * Fetch trash items with pagination and filters
   */
  async fetchTrashItems(
    page: number = 1,
    pageSize: number = 50,
    filters: TrashFilters = {}
  ): Promise<TrashResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    if (filters.entity_type) params.append('entity_type', filters.entity_type);
    if (filters.search) params.append('search', filters.search);
    if (filters.deleted_by) params.append('deleted_by', filters.deleted_by.toString());
    if (filters.date_from) params.append('date_from', filters.date_from);
    if (filters.date_to) params.append('date_to', filters.date_to);

    const response = await fetch(`${this.baseUrl}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Add authorization header if needed
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to fetch trash items');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Get count of trash items
   */
  async getTrashCount(): Promise<number> {
    const response = await fetch(`${this.baseUrl}?count=true`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch trash count');
    }

    const result = await response.json();
    return result.count;
  }

  /**
   * Restore a single item
   */
  async restoreItem(entityType: string, entityId: string): Promise<RestoreResponse> {
    const response = await fetch(`${this.baseUrl}/restore/${entityId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ entity_type: entityType }),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error?.message || 'Failed to restore item',
        conflicts: result.error?.conflicts,
      };
    }

    return result;
  }

  /**
   * Restore multiple items
   */
  async restoreBulk(items: Array<{ entity_type: string; entity_id: string }>): Promise<BulkOperationResponse> {
    const response = await fetch(`${this.baseUrl}/restore-bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items }),
    });

    if (!response.ok) {
      throw new Error('Failed to restore items');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Permanently delete a single item
   */
  async permanentDelete(entityType: string, entityId: string): Promise<RestoreResponse> {
    const response = await fetch(`${this.baseUrl}/permanent/${entityId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ entity_type: entityType }),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error?.message || 'Failed to permanently delete item',
      };
    }

    return result;
  }

  /**
   * Permanently delete multiple items
   */
  async permanentDeleteBulk(items: Array<{ entity_type: string; entity_id: string }>): Promise<BulkOperationResponse> {
    const response = await fetch(`${this.baseUrl}/permanent-bulk`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items }),
    });

    if (!response.ok) {
      throw new Error('Failed to permanently delete items');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Get audit trail with filters
   */
  async getAuditTrail(filters: {
    entity_type?: string;
    action?: string;
    user_id?: number;
    date_from?: string;
    date_to?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<AuditTrailResponse> {
    const params = new URLSearchParams();

    if (filters.entity_type) params.append('entity_type', filters.entity_type);
    if (filters.action) params.append('action', filters.action);
    if (filters.user_id) params.append('user_id', filters.user_id.toString());
    if (filters.date_from) params.append('date_from', filters.date_from);
    if (filters.date_to) params.append('date_to', filters.date_to);
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.offset) params.append('offset', filters.offset.toString());

    const response = await fetch(`${this.baseUrl}/audit?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch audit trail');
    }

    const result = await response.json();
    return result.data;
  }
}

export default new TrashService();
