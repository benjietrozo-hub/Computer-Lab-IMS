import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import NavHeader from "@/components/NavHeader";
import NotificationProfile from "@/components/NotificationProfile";
import { useWebSocket } from "@/hooks/useWebSocket";



const LostFound = () => {
  const navigate = useNavigate();
  
  // Get user data first
  const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const currentUser = storedUser ? JSON.parse(storedUser) : null;
  
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [viewingItem, setViewingItem] = useState<any>(null);
  const [viewOpen, setViewOpen] = useState(false);
  
  // WebSocket notifications
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    loadMoreNotifications, 
    hasMoreNotifications, 
    totalNotifications,
    removeNotification,
    clearAllNotifications
  } = useWebSocket(
    currentUser?.id || "",
    currentUser?.role || ""
  );
  
  // Helper function to get user data
  const getUserData = () => {
    const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    return storedUser ? JSON.parse(storedUser) : currentUser;
  };
  
  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const user = getUserData();
    return {
      'X-User-ID': user?.id || '',
      'X-User-Role': user?.role || '',
      'Content-Type': 'application/json'
    };
  };
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    item_type: "",
    status: "lost",
    location: "",
    reported_by: `${currentUser?.first_name || ""} ${currentUser?.last_name || ""} (${currentUser?.role === 'user' ? 'student' : currentUser?.role || 'user'})`.trim(),
    contact_info: "",
    timestamp: new Date().toISOString().slice(0, 16), // Format for datetime-local input
    date_claimed: ""
  });

  useEffect(() => {
    // Try to fetch if we have user data (either from currentUser or localStorage)
    if (currentUser || getUserData()) {
      fetchItems();
    }
  }, [currentUser]);

  const fetchItems = async () => {
    try {
      const response = await fetch("http://localhost/labmate/labmate-guardian/api/lost_found.php", {
        headers: getAuthHeaders()
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to fetch lost and found items");
      }

      setItems(result.data || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch lost and found items");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.item_type || !formData.reported_by || !formData.timestamp) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      // Convert datetime-local format to ISO format for API
      const submissionData = {
        ...formData,
        timestamp: new Date(formData.timestamp).toISOString()
      };

      const url = editingItem 
        ? `http://localhost/labmate/labmate-guardian/api/lost_found.php?id=${editingItem.id}`
        : "http://localhost/labmate/labmate-guardian/api/lost_found.php";
      
      const method = editingItem ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(submissionData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to save lost and found item");
      }

      toast.success(`Lost & Found item ${editingItem ? "updated" : "created"} successfully`);
      resetForm();
      setOpen(false);
      fetchItems();
    } catch (error: any) {
      toast.error(error.message || "Failed to save lost and found item");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      const response = await fetch(`http://localhost/labmate/labmate-guardian/api/lost_found.php?id=${id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete lost and found item");
      }

      toast.success("Lost & Found item deleted successfully");
      fetchItems();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete lost and found item");
    }
  };

  const resetForm = () => {
    const user = getUserData();
    setFormData({
      title: "",
      description: "",
      item_type: "",
      status: "lost",
      location: "",
      reported_by: `${user?.first_name || ""} ${user?.last_name || ""} (${user?.role === 'user' ? 'student' : user?.role || 'user'})`.trim(),
      contact_info: "",
      timestamp: new Date().toISOString().slice(0, 16), // Format for datetime-local input
      date_claimed: ""
    });
    setEditingItem(null);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    
    // Get the timestamp and format it for datetime-local input
    let timestamp = item.timestamp || item.date_occurred || new Date().toISOString();
    // Ensure it's a valid date and format as YYYY-MM-DDTHH:MM
    const formattedTimestamp = timestamp ? new Date(timestamp).toISOString().slice(0, 16) : '';
    
    setFormData({
      title: item.title || "",
      description: item.description || "",
      item_type: item.item_type || "",
      status: item.status || "lost",
      location: item.location || "",
      reported_by: item.reported_by || "",
      contact_info: item.contact_info || "",
      timestamp: timestamp,
      date_claimed: item.date_claimed || ""
    });
    setOpen(true);
  };

  const handleView = (item: any) => {
    setViewingItem(item);
    setViewOpen(true);
  };

  const canEditItem = (item: any) => {
    const user = getUserData();
    // Admin can edit any item
    if (user?.role === 'admin') return true;
    
    // User can edit their own items
    const reporterName = user?.first_name + " " + user?.last_name;
    return item.reported_by === reporterName || item.reported_by === user?.email;
  };

  const canDeleteItem = (item: any) => {
    const user = getUserData();
    // Admin can delete any item
    if (user?.role === 'admin') return true;
    
    // User can delete their own items
    const reporterName = user?.first_name + " " + user?.last_name;
    return item.reported_by === reporterName || item.reported_by === user?.email;
  };

  return (
    <div>
      <NavHeader 
        title="Lost & Found" 
        subtitle="Track and manage lost and found items"
        showBackButton={true}
        showHomeButton={true}
      >
        <NotificationProfile 
          notifications={notifications}
          unreadCount={unreadCount}
          currentUser={currentUser}
          markAsRead={markAsRead}
          markAllAsRead={markAllAsRead}
          loadMoreNotifications={loadMoreNotifications}
          hasMoreNotifications={hasMoreNotifications}
          totalNotifications={totalNotifications}
          removeNotification={removeNotification}
          clearAllNotifications={clearAllNotifications}
        />
      </NavHeader>
      
      <div className="container mx-auto p-6 pt-20">
        <div className="flex justify-end mb-6">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                New Lost & Found Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingItem ? "Edit" : "Create"} Lost & Found Item</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="item_type">Item Type *</Label>
                    <Select value={formData.item_type} onValueChange={(value) => setFormData({ ...formData, item_type: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select item type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gadgets">Gadgets</SelectItem>
                        <SelectItem value="jewelry">Jewelry</SelectItem>
                        <SelectItem value="clothing">Clothing</SelectItem>
                        <SelectItem value="documents">Documents</SelectItem>
                        <SelectItem value="keys">Keys</SelectItem>
                        <SelectItem value="wallet">Wallet/Purse</SelectItem>
                        <SelectItem value="books">Books</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lost">Lost</SelectItem>
                        <SelectItem value="found">Found</SelectItem>
                        <SelectItem value="claimed">Claimed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g., Lab A, Library, Cafeteria"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timestamp">Date & Time *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="timestamp"
                        type="datetime-local"
                        value={formData.timestamp}
                        onChange={(e) => setFormData({ ...formData, timestamp: e.target.value })}
                        required
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setFormData({ ...formData, timestamp: new Date().toISOString().slice(0, 16) })}
                        className="whitespace-nowrap"
                      >
                        Today
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reported_by">Reported By *</Label>
                    <Input
                      id="reported_by"
                      value={formData.reported_by}
                      readOnly
                      className="bg-gray-100 cursor-not-allowed"
                      title="This field is automatically filled with your account information"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact_info">Contact Info</Label>
                    <Input
                      id="contact_info"
                      value={formData.contact_info}
                      onChange={(e) => setFormData({ ...formData, contact_info: e.target.value })}
                      placeholder="Phone number or email"
                    />
                  </div>
                  {formData.status === 'claimed' && (
                    <div className="space-y-2">
                      <Label htmlFor="date_claimed">Date Claimed</Label>
                      <Input
                        id="date_claimed"
                        type="date"
                        value={formData.date_claimed}
                        onChange={(e) => setFormData({ ...formData, date_claimed: e.target.value })}
                      />
                    </div>
                  )}
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingItem ? "Update" : "Create"} Item
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Reported By</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell className="capitalize">{item.item_type}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      item.status === 'lost' ? 'bg-red-100 text-red-800' :
                      item.status === 'found' ? 'bg-blue-100 text-blue-800' :
                      item.status === 'claimed' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {item.status}
                    </span>
                  </TableCell>
                  <TableCell>{item.location || 'Not specified'}</TableCell>
                  <TableCell>{item.reported_by}</TableCell>
                  <TableCell>{new Date(item.timestamp || item.date_occurred).toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleView(item)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      {canEditItem(item) && (
                        <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                      )}
                      {canDeleteItem(item) && (
                        <Button size="sm" variant="outline" onClick={() => handleDelete(item.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* View Item Dialog */}
        <Dialog open={viewOpen} onOpenChange={setViewOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Lost & Found Item Details</DialogTitle>
            </DialogHeader>
            {viewingItem && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-semibold">Title</Label>
                    <p className="mt-1">{viewingItem.title}</p>
                  </div>
                  <div>
                    <Label className="font-semibold">Item Type</Label>
                    <p className="mt-1 capitalize">{viewingItem.item_type}</p>
                  </div>
                  <div>
                    <Label className="font-semibold">Status</Label>
                    <p className="mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        viewingItem.status === 'lost' ? 'bg-red-100 text-red-800' :
                        viewingItem.status === 'found' ? 'bg-blue-100 text-blue-800' :
                        viewingItem.status === 'claimed' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {viewingItem.status}
                      </span>
                    </p>
                  </div>
                  <div>
                    <Label className="font-semibold">Location</Label>
                    <p className="mt-1">{viewingItem.location || 'Not specified'}</p>
                  </div>
                  <div>
                    <Label className="font-semibold">Date & Time</Label>
                    <p className="mt-1">{new Date(viewingItem.timestamp || viewingItem.date_occurred).toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="font-semibold">Reported By</Label>
                    <p className="mt-1">{viewingItem.reported_by}</p>
                  </div>
                  <div>
                    <Label className="font-semibold">Contact Info</Label>
                    <p className="mt-1">{viewingItem.contact_info || 'Not provided'}</p>
                  </div>
                  <div>
                    <Label className="font-semibold">Reported Date</Label>
                    <p className="mt-1">{new Date(viewingItem.created_at).toLocaleDateString()}</p>
                  </div>
                  {viewingItem.date_claimed && (
                    <div>
                      <Label className="font-semibold">Date Claimed</Label>
                      <p className="mt-1">{new Date(viewingItem.date_claimed).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
                <div>
                  <Label className="font-semibold">Description</Label>
                  <p className="mt-1 whitespace-pre-wrap">{viewingItem.description}</p>
                </div>
              </div>
            )}
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setViewOpen(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default LostFound;
