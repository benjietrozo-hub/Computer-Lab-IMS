export interface InventoryItem {
  id: string;
  date: string;
  name: string;
  category: string;
  item_description: string;
  serial_number: string;
  quantity: number | string;
  purpose: string;
  date_returned: string;
  condition: string;
  price: string | number;
  assigned_to: string;
  created_by?: string;
}

export interface InventoryFilters {
  search: string;
  category: string;
  assigned_to: string;
}

export interface InventoryFormData {
  date: string;
  name: string;
  category: string;
  item_description: string;
  serial_number: string;
  quantity: string;
  purpose: string;
  date_returned: string;
  condition: string;
  price: string;
  assigned_to: string;
}

export interface InventoryStats {
  totalItems: number;
  totalQuantity: number;
  borrowedCounts: Record<string, number>;
}
