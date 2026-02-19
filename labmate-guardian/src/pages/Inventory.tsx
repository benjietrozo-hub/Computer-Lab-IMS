import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Download, Printer, Filter, Eye } from "lucide-react";
import NavHeader from "@/components/NavHeader";
import NotificationProfile from "@/components/NotificationProfile";
import { useWebSocket } from "@/hooks/useWebSocket";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";

const Inventory = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [viewingItem, setViewingItem] = useState<any>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [borrowedCounts, setBorrowedCounts] = useState<Record<string, number>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  
  
  const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const currentUser = storedUser ? JSON.parse(storedUser) : null;
  const isAdmin = currentUser?.role === "admin";
  
  // Temporarily disable WebSocket to isolate the issue
  const notifications: any[] = [];
  const unreadCount = 0;
  const markAllAsRead = () => {};
  const loadMoreNotifications = () => {};
  const hasMoreNotifications = false;
  const totalNotifications = 0;
  const removeNotification = (id: string) => {};
  const clearAllNotifications = () => {};
  
  // const { notifications, unreadCount, markAllAsRead, loadMoreNotifications, hasMoreNotifications, totalNotifications, removeNotification, clearAllNotifications } = useWebSocket(
  //   currentUser?.id || "",
  //   currentUser?.role || ""
  // );
  const [formData, setFormData] = useState({
    date: "",
    name: "",
    category: "",
    item_description: "",
    serial_number: "",
    quantity: "",
    purpose: "",
    date_returned: "",
    condition: "",
    price: "",
    assigned_to: "",
  });

  const [filters, setFilters] = useState({
    search: "",
    category: "all",
    assigned_to: "",
  });

  useEffect(() => {
    console.log('Inventory component mounted, calling fetchItems');
    fetchItems();
  }, []); // Only run on mount
  
  useEffect(() => {
    console.log('Filters changed:', filters);
    if (filters.search || (filters.category && filters.category !== "all") || filters.assigned_to) {
      fetchItems();
    }
  }, [filters]); // Re-fetch when filters change

  // Add a timeout to show content after 3 seconds even if still loading
  const [showContent, setShowContent] = useState(false);
  
  // Redirect non-admin users away from Inventory (confidential)
  useEffect(() => {
    if (currentUser && !isAdmin) {
      navigate('/reservations');
    }
  }, [currentUser, isAdmin, navigate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        setShowContent(true);
      }
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [loading]);

  const fetchItems = async () => {
    console.log('Fetching inventory items...');
    setLoading(true);
    setShowContent(false); // Reset the fallback state
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.category && filters.category !== "all") params.append('category', filters.category);
      if (filters.assigned_to) params.append('assigned_to', filters.assigned_to);
      
      const url = `http://localhost/labmate/labmate-guardian/api/inventory_equipment.php?${params}`;
      console.log('Fetching from:', url);
      
      // Add timeout to prevent infinite loading
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('API response:', result);

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch inventory");
      }

      console.log('Setting items:', result.data || []);
      setItems(result.data || []);
      console.log('Items set successfully');
    } catch (error: any) {
      console.error('Fetch error:', error);
      if (error.name === 'AbortError') {
        setError('Request timeout - please try again');
        toast.error('Request timeout - please try again');
      } else {
        setError(error.message || "Failed to fetch inventory");
        toast.error("Failed to fetch inventory: " + error.message);
      }
      setItems([]); // Set empty array on error
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
      try {
        const resp = await fetch('http://localhost/labmate/labmate-guardian/api/borrow_items.php');
        const data = await resp.json();
        if (resp.ok && data.success) {
          const counts: Record<string, number> = {};
          (data.data || []).forEach((bi: any) => {
            if (bi.status === 'borrowed' && bi.item) {
              const key = String(bi.item);
              const qty = Number(bi.quantity) || 0;
              counts[key] = (counts[key] || 0) + qty;
            }
          });
          setBorrowedCounts(counts);
        }
      } catch {}
    }
  };

  // Computed totals
  const totalQuantity = Array.isArray(items)
    ? items.reduce((sum, it: any) => sum + (parseInt(it?.quantity) || 0), 0)
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const storedUser = localStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;
      
      const itemData = {
        ...formData,
        quantity: parseInt(formData.quantity),
        created_by: user?.id,
      };

      if (editingItem) {
        const response = await fetch(`http://localhost/labmate/labmate-guardian/api/inventory_equipment.php?id=${editingItem.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(itemData),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || "Failed to update equipment");
        }
        toast.success("Equipment updated successfully");
      } else {
        const response = await fetch("http://localhost/labmate/labmate-guardian/api/inventory_equipment.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(itemData),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || "Failed to add equipment");
        }
        toast.success("Equipment added successfully");
      }

      setOpen(false);
      resetForm();
      fetchItems();
    } catch (error: any) {
      toast.error(error.message || "Failed to save equipment");
    }
  };

  const handleDelete = (item: any) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      const response = await fetch(`http://localhost/labmate/labmate-guardian/api/inventory_equipment.php?id=${itemToDelete.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to delete equipment");
      }

      toast.success("Equipment deleted successfully");
      fetchItems();
    } catch (error: any) {
      throw new Error(error.message || "Failed to delete equipment");
    }
  };

  const handlePrintInventory = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const currentDate = new Date().toLocaleDateString();
      const totalQty = items.reduce((sum, it) => sum + (parseInt(it.quantity) || 0), 0);
      printWindow.document.write(`
        <html>
          <head>
            <title>Inventory Equipment Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .header h1 { color: #2563eb; margin-bottom: 10px; }
              .header p { color: #666; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f8f9fa; font-weight: bold; }
              .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
              @media print { body { margin: 10px; } }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Inventory Equipment Report</h1>
              <p>Generated on ${currentDate}</p>
              <p>Total Items: ${items.length}</p>
              <p>Total Quantity: ${totalQty}</p>
            </div>
            
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Serial Number</th>
                  <th>Quantity</th>
                  <th>Condition</th>
                  <th>Price</th>
                  <th>Assigned To</th>
                </tr>
              </thead>
              <tbody>
                ${items.map(item => `
                  <tr>
                    <td>${new Date(item.date).toLocaleDateString()}</td>
                    <td>${item.name}</td>
                    <td>${item.category}</td>
                    <td>${item.item_description || 'N/A'}</td>
                    <td>${item.serial_number || 'N/A'}</td>
                    <td>${item.quantity}</td>
                    <td>${item.condition || 'N/A'}</td>
                    <td>$${item.price ? parseFloat(item.price).toFixed(2) : '0.00'}</td>
                    <td>${item.assigned_to || 'Unassigned'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div class="footer">
              <p>LabMate Inventory Management System</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
      toast.success("Print dialog opened");
    }
  };

  const handleDownloadInventory = () => {
    const csvContent = [
      ['Date', 'Name', 'Category', 'Description', 'Serial Number', 'Quantity', 'Condition', 'Price', 'Assigned To'],
      ...items.map(item => [
        new Date(item.date).toLocaleDateString(),
        item.name,
        item.category,
        item.item_description || 'N/A',
        item.serial_number || 'N/A',
        item.quantity,
        item.condition || 'N/A',
        item.price ? parseFloat(item.price).toFixed(2) : '0.00',
        item.assigned_to || 'Unassigned'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    toast.success("Inventory data downloaded");
  };

  const resetForm = () => {
    setFormData({
      date: "",
      name: "",
      category: "",
      item_description: "",
      serial_number: "",
      quantity: "",
      purpose: "",
      date_returned: "",
      condition: "",
      price: "",
      assigned_to: "",
    });
    setEditingItem(null);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      date: item.date || "",
      name: item.name || "",
      category: item.category || "",
      item_description: item.item_description || "",
      serial_number: item.serial_number || "",
      quantity: item.quantity?.toString() || "",
      purpose: item.purpose || "",
      date_returned: item.date_returned || "",
      condition: item.condition || "",
      price: item.price?.toString() || "",
      assigned_to: item.assigned_to || "",
    });
    setOpen(true);
  };

  const handleView = (item: any) => {
    setViewingItem(item);
    setViewOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavHeader 
        title="Inventory" 
        subtitle="Manage equipment and supplies"
        showBackButton={true}
        showHomeButton={true}
      >
        <NotificationProfile 
          notifications={notifications}
          unreadCount={unreadCount}
          currentUser={currentUser}
          markAllAsRead={markAllAsRead}
          loadMoreNotifications={loadMoreNotifications}
          hasMoreNotifications={hasMoreNotifications}
          totalNotifications={totalNotifications}
          removeNotification={removeNotification}
          clearAllNotifications={clearAllNotifications}
        />
      </NavHeader>
      <div className="container mx-auto p-6 pt-20">
        {loading && items.length === 0 && !error && !showContent && (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading inventory...</p>
            </div>
          </div>
        )}
        
        {!loading && error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <div className="text-red-600">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-red-800 font-medium">Error loading inventory</h3>
                <p className="text-red-600 text-sm">{error}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchItems} 
                  className="mt-2 text-red-600 border-red-300 hover:bg-red-50"
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {(!loading || items.length > 0 || showContent) && !error && (
          <>
        {/* Filters Section */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search by name, description, or serial..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="filter-category">Category</Label>
              <Select
                value={filters.category}
                onValueChange={(value) => setFilters({ ...filters, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="furniture">Furniture</SelectItem>
                  <SelectItem value="tools">Tools</SelectItem>
                  <SelectItem value="supplies">Supplies</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="assigned-to">Assigned To</Label>
              <Input
                id="assigned-to"
                placeholder="Filter by assigned person..."
                value={filters.assigned_to}
                onChange={(e) => setFilters({ ...filters, assigned_to: e.target.value })}
              />
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => setFilters({ search: "", category: "all", assigned_to: "" })}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-2">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handlePrintInventory}
              disabled={loading || items.length === 0}
            >
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button
              variant="outline"
              onClick={handleDownloadInventory}
              disabled={loading || items.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Download CSV
            </Button>
          </div>
          {isAdmin && (
            <Dialog open={open} onOpenChange={(value) => { setOpen(value); if (!value) resetForm(); }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Inventory
               </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingItem ? "Edit" : "Add"} Equipment</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Recorded By *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="electronics">Electronics</SelectItem>
                        <SelectItem value="furniture">Furniture</SelectItem>
                        <SelectItem value="tools">Tools</SelectItem>
                        <SelectItem value="supplies">Supplies</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="item_description">Item Description *</Label>
                    <Textarea
                    id="item_description"
                    value={formData.item_description}
                    onChange={(e) => setFormData({ ...formData, item_description: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="serial_number">Serial Number</Label>
                  <Input
                    id="serial_number"
                    value={formData.serial_number}
                    onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purpose">Purpose</Label>
                  <Textarea
                    id="purpose"
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date_returned">Date Returned</Label>
                  <Input
                    id="date_returned"
                    type="date"
                    value={formData.date_returned}
                    onChange={(e) => setFormData({ ...formData, date_returned: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="condition">Condition</Label>
                  <Input
                    id="condition"
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assigned_to">Assigned To</Label>
                  <Input
                    id="assigned_to"
                    value={formData.assigned_to}
                    onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                    placeholder="Person responsible for this item"
                  />
                </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingItem ? "Update" : "Add"} Equipment
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          )}
      </div>
      <div className="flex justify-between items-center mb-4 text-sm text-muted-foreground">
        <span>Items: {items.length}</span>
        <span>Total Quantity: {totalQuantity}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="border rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-2 w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded mb-2 w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </div>
          ))
        ) : items.length === 0 ? (
          <div className="col-span-full">
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No equipment found</h3>
              <p className="text-gray-500 mb-4">Get started by adding your first piece of equipment to the inventory.</p>
              <Button onClick={() => setOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Equipment
              </Button>
            </div>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                  <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    {item.category}
                  </span>
                </div>
                <div className="flex space-x-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleView(item)}
                    className="h-8 w-8 p-0"
                  >
                    <Eye className="w-3 h-3" />
                  </Button>
                  {isAdmin && (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(item)}
                        className="h-8 w-8 p-0"
                      >
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(item)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="text-gray-600 line-clamp-2">
                  {item.item_description}
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="font-medium text-gray-700">Quantity:</span>
                    <span className="ml-1 text-gray-600">{item.quantity}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Borrowed:</span>
                    <span className="ml-1 text-gray-600">{borrowedCounts[item.name] || 0}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Price:</span>
                    <span className="ml-1 text-gray-600">${item.price ? parseFloat(item.price).toFixed(2) : "0.00"}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Condition:</span>
                    <span className="ml-1 text-gray-600">{item.condition || "N/A"}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Assigned:</span>
                    <span className="ml-1 text-gray-600">{item.assigned_to || "Unassigned"}</span>
                  </div>
                </div>
                
                {item.serial_number && (
                  <div className="text-xs">
                    <span className="font-medium text-gray-700">Serial:</span>
                    <span className="ml-1 text-gray-600 font-mono">{item.serial_number}</span>
                  </div>
                )}
                
                <div className="text-xs text-gray-500 pt-2 border-t">
                  Added: {new Date(item.date).toLocaleDateString()}
                </div>
                
              </div>
            </div>
          ))
        )}
      </div>
      
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Equipment Details</DialogTitle>
          </DialogHeader>
          {viewingItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Name</Label>
                  <p className="mt-1 text-sm text-gray-900">{viewingItem.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Category</Label>
                  <p className="mt-1">
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {viewingItem.category}
                    </span>
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Date Added</Label>
                  <p className="mt-1 text-sm text-gray-900">{new Date(viewingItem.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Quantity</Label>
                  <p className="mt-1 text-sm text-gray-900">{viewingItem.quantity}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Price</Label>
                  <p className="mt-1 text-sm text-gray-900">${viewingItem.price ? parseFloat(viewingItem.price).toFixed(2) : "0.00"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Condition</Label>
                  <p className="mt-1 text-sm text-gray-900">{viewingItem.condition || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Assigned To</Label>
                  <p className="mt-1 text-sm text-gray-900">{viewingItem.assigned_to || "Unassigned"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Serial Number</Label>
                  <p className="mt-1 text-sm text-gray-900 font-mono">{viewingItem.serial_number || "N/A"}</p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Description</Label>
                <p className="mt-1 text-sm text-gray-900">{viewingItem.item_description}</p>
              </div>
              {viewingItem.purpose && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Purpose</Label>
                  <p className="mt-1 text-sm text-gray-900">{viewingItem.purpose}</p>
                </div>
              )}
              {viewingItem.date_returned && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Date Returned</Label>
                  <p className="mt-1 text-sm text-gray-900">{new Date(viewingItem.date_returned).toLocaleDateString()}</p>
                </div>
              )}
              <div className="flex justify-end pt-4">
                <Button variant="outline" onClick={() => setViewOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        description="This action requires admin password verification."
        itemName={itemToDelete?.name}
        requirePassword={currentUser?.role === 'admin'}
        currentUser={currentUser}
      />
          </>
        )}
      </div>
    </div>
  );
};

export default Inventory;
