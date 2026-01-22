import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, CheckCircle, XCircle, Package, Wrench, Cpu, Search, Eye, Printer, Download } from "lucide-react";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import NavHeader from "@/components/NavHeader";
import NotificationProfile from "@/components/NotificationProfile";
import { useWebSocket } from "@/hooks/useWebSocket";


const BorrowItems = () => {
  const navigate = useNavigate();
  
  // Get user data first
  const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const currentUser = storedUser ? JSON.parse(storedUser) : null;
  const isAdmin = currentUser?.role === "admin";
  
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
  
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [returnItem, setReturnItem] = useState<any>(null);
  const [returnCondition, setReturnCondition] = useState<string>("good");
  const [returnNotes, setReturnNotes] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [adminPassword, setAdminPassword] = useState<string>("");
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedItemForView, setSelectedItemForView] = useState<any>(null);

  useEffect(() => {
    console.log("Current user:", currentUser);
    console.log("Is admin:", isAdmin);
    fetchItems();
  }, [isAdmin, statusFilter, searchTerm]);

  const fetchItems = async () => {
    try {
      const response = await fetch("http://localhost/labmate/labmate-guardian/api/borrow_items.php");
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to fetch borrow records");
      }

      // For admins, show all items. For non-admins, show only their own items
      const allItems = result.data || [];
      console.log("Total items from API:", allItems.length);
      console.log("Current user email:", currentUser?.email);
      
      let filteredItems = isAdmin 
        ? allItems 
        : allItems.filter((item: any) => item.borrower_email === currentUser?.email);
      
      // Apply status filter for admins
      if (isAdmin && statusFilter !== "all") {
        filteredItems = filteredItems.filter((item: any) => item.status === statusFilter);
      }
      
      // Apply search filter
      if (searchTerm) {
        filteredItems = filteredItems.filter((item: any) => 
          item.borrower_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.item?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.borrower_email?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      console.log("Filtered items count:", filteredItems.length);
      setItems(filteredItems);
    } catch (error: any) {
      toast.error("Failed to fetch borrow records");
    } finally {
      setLoading(false);
    }
  };

  const openReturnModal = (item: any) => {
    setReturnItem(item);
    setReturnCondition("good");
    setReturnNotes("");
    setAdminPassword("");
    setReturnModalOpen(true);
  };

  const handleConfirmReturn = async () => {
    if (!returnItem) return;
    if (!adminPassword) {
      toast.error("Admin password is required to confirm return");
      return;
    }
    try {
      const response = await fetch(`http://localhost/labmate/labmate-guardian/api/borrow_items.php?id=${returnItem.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          status: "returned",
          return_condition: returnCondition,
          return_notes: returnNotes,
          admin_id: currentUser?.id,
          admin_password: adminPassword
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to update status");
      }
      toast.success(result.message || "Item returned successfully");
      setReturnModalOpen(false);
      setReturnItem(null);
      setAdminPassword("");
      fetchItems();
    } catch (error: any) {
      toast.error(error.message || "Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this record?")) return;

    try {
      const response = await fetch(`http://localhost/labmate/labmate-guardian/api/borrow_items.php?id=${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to delete record");
      }
      toast.success("Record deleted successfully");
      fetchItems();
    } catch (error: any) {
      toast.error("Failed to delete record");
    }
  };

  const handleViewItem = (item: any) => {
    setSelectedItemForView(item);
    setViewModalOpen(true);
  };

  const handlePrintItem = (item: any) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Borrow Record #${item.id}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .section { margin-bottom: 20px; }
              .label { font-weight: bold; display: inline-block; width: 150px; }
              .value { margin-left: 10px; }
              .status { padding: 5px 10px; border-radius: 4px; color: white; }
              .status.borrowed { background-color: #eab308; }
              .status.returned { background-color: #22c55e; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Equipment Borrow Record</h1>
            </div>
            
            <div class="section">
              <p><span class="label">Record ID:</span><span class="value">#${item.id}</span></p>
              <p><span class="label">Status:</span><span class="status ${item.status}">${item.status.toUpperCase()}</span></p>
              <p><span class="label">Borrow Date:</span><span class="value">${new Date(item.borrow_date).toLocaleDateString()}</span></p>
            </div>
            
            <div class="section">
              <h3>Borrower Information</h3>
              <p><span class="label">Name:</span><span class="value">${item.borrower_name}</span></p>
              <p><span class="label">Email:</span><span class="value">${item.borrower_email}</span></p>
            </div>
            
            <div class="section">
              <h3>Equipment Details</h3>
              <p><span class="label">Item:</span><span class="value">${item.item}</span></p>
              <p><span class="label">Quantity:</span><span class="value">${item.quantity}</span></p>
              <p><span class="label">Expected Return:</span><span class="value">${item.return_date ? new Date(item.return_date).toLocaleDateString() : 'N/A'}</span></p>
              ${item.actual_return_date ? `<p><span class="label">Actual Return:</span><span class="value">${new Date(item.actual_return_date).toLocaleDateString()}</span></p>` : ''}
            </div>
            
            ${item.return_condition ? `
            <div class="section">
              <h3>Return Information</h3>
              <p><span class="label">Condition:</span><span class="value">${item.return_condition}</span></p>
              ${item.return_notes ? `<p><span class="label">Notes:</span><span class="value">${item.return_notes}</span></p>` : ''}
            </div>
            ` : ''}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
      toast.success("Print dialog opened");
    }
  };

  const handleGeneratePDF = async (item: any) => {
    try {
      // Create a temporary div for the PDF content
      const pdfContent = document.createElement('div');
      pdfContent.style.width = '210mm'; // A4 width
      pdfContent.style.padding = '20mm';
      pdfContent.style.fontFamily = 'Arial, sans-serif';
      pdfContent.style.backgroundColor = 'white';
      pdfContent.style.boxSizing = 'border-box';
      
      // Add header
      pdfContent.innerHTML += `
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="font-size: 24px; margin-bottom: 10px;">Equipment Borrow Record</h1>
          <p style="font-size: 14px; color: #666;">
            Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
          </p>
          <p style="font-size: 12px; color: #666;">Record ID: #${item.id}</p>
        </div>
      `;
      
      // Add content sections
      let contentHTML = `
        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 16px; margin-bottom: 10px; color: #333;">Borrower Information</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold; width: 150px;">Name:</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${item.borrower_name}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Email:</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${item.borrower_email}</td>
            </tr>
          </table>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 16px; margin-bottom: 10px; color: #333;">Equipment Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold; width: 150px;">Item:</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${item.item}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Quantity:</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${item.quantity}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Borrow Date:</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${new Date(item.borrow_date).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Expected Return:</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${item.return_date ? new Date(item.return_date).toLocaleDateString() : 'N/A'}</td>
            </tr>
            ${item.actual_return_date ? `
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Actual Return:</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${new Date(item.actual_return_date).toLocaleDateString()}</td>
            </tr>
            ` : ''}
          </table>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 16px; margin-bottom: 10px; color: #333;">Status Information</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold; width: 150px;">Status:</td>
              <td style="border: 1px solid #ddd; padding: 8px;">
                <span style="padding: 4px 8px; border-radius: 3px; color: white; background-color: ${item.status === 'borrowed' ? '#eab308' : '#22c55e'};">
                  ${item.status.toUpperCase()}
                </span>
              </td>
            </tr>
            ${item.return_condition ? `
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Return Condition:</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${item.return_condition}</td>
            </tr>
            ` : ''}
            ${item.return_notes ? `
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Return Notes:</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${item.return_notes}</td>
            </tr>
            ` : ''}
          </table>
        </div>
      `;
      
      pdfContent.innerHTML += contentHTML;
      
      // Generate PDF using html2canvas
      document.body.appendChild(pdfContent);
      
      const canvas = await html2canvas(pdfContent, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // Clean up
      document.body.removeChild(pdfContent);
      
      // Download PDF
      pdf.save(`borrow-record-${item.id}.pdf`);
      toast.success("PDF generated successfully");
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error("Failed to generate PDF");
    }
  };

  return (
    <div>
      <NavHeader 
        title={isAdmin ? "Borrow Items Management" : "Borrow Items"} 
        subtitle={isAdmin ? "Manage borrowed items and returns" : "View your borrowed items and returns"}
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
        {isAdmin ? (
          <div className="space-y-8">
            {/* Admin Management Section */}
            <div className="space-y-4 border-t pt-8">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">Manage Borrowed Items</h2>
                <div className="flex gap-4 items-center">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search by name, item, or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64 pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="borrowed">Borrowed</SelectItem>
                      <SelectItem value="returned">Returned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-4 text-sm text-muted-foreground mb-4">
                <span>Total: {items.length} items</span>
                {isAdmin && (
                  <>
                    <span>Borrowed: {items.filter(i => i.status === 'borrowed').length}</span>
                    <span>Returned: {items.filter(i => i.status === 'returned').length}</span>
                  </>
                )}
              </div>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Borrower</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Borrow Date</TableHead>
                      <TableHead>Expected Return</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center">Loading...</TableCell>
                      </TableRow>
                    ) : items.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                          No borrowed items found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.borrower_name}</TableCell>
                          <TableCell>{item.item}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{new Date(item.borrow_date).toLocaleDateString()}</TableCell>
                          <TableCell>{item.return_date ? new Date(item.return_date).toLocaleDateString() : "N/A"}</TableCell>
                          <TableCell>
                            {item.status === "borrowed" && (
                              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                                Borrowed
                              </Badge>
                            )}
                            {item.status === "returned" && (
                              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                                Returned
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewItem(item)}
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePrintItem(item)}
                              title="Print"
                            >
                              <Printer className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleGeneratePDF(item)}
                              title="Download PDF"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            {item.status === "borrowed" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => openReturnModal(item)}
                                title="Mark as returned"
                              >
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(item.id)}
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-12">
            <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Borrowing Management</h3>
            <p className="mb-4">Equipment browsing has been moved to the Inventory page.</p>
            <Button onClick={() => navigate("/inventory")}>
              Go to Inventory Equipment
            </Button>
          </div>
        )}

        {/* Return Modal */}
        <Dialog
          open={returnModalOpen}
          onOpenChange={(open) => {
            setReturnModalOpen(open);
            if (!open) {
              setReturnItem(null);
              setAdminPassword("");
            }
          }}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Mark Item as Returned</DialogTitle>
            </DialogHeader>
            {returnItem && (
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleConfirmReturn();
                }}
                autoComplete="off"
              >
                <div className="p-3 bg-muted rounded-lg">
                  <h4 className="font-medium">{returnItem.item}</h4>
                  <p className="text-sm text-muted-foreground">Borrower: {returnItem.borrower_name}</p>
                  <p className="text-sm text-muted-foreground">Quantity: {returnItem.quantity}</p>
                  <p className="text-sm text-muted-foreground">Borrowed: {new Date(returnItem.borrow_date).toLocaleDateString()}</p>
                  <p className="text-sm text-muted-foreground">Due Date: {returnItem.return_date ? new Date(returnItem.return_date).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="condition">Return Condition</Label>
                  <select id="condition" className="w-full border rounded p-2" value={returnCondition} onChange={(e) => setReturnCondition(e.target.value)}>
                    <option value="good">Good</option>
                    <option value="damaged">Damaged</option>
                    <option value="needs_repair">Needs Repair</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Condition Remarks</Label>
                  <Textarea id="notes" placeholder="Add notes about the returned item..." value={returnNotes} onChange={(e) => setReturnNotes(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-return-password">Admin Password</Label>
                  <Input
                    id="admin-return-password"
                    type="password"
                    autoComplete="new-password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setReturnModalOpen(false);
                      setReturnItem(null);
                      setAdminPassword("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    Confirm Return
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* View Item Modal */}
        <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <div className="flex justify-between items-center">
                <DialogTitle>Borrow Record Details</DialogTitle>
                <div className="flex gap-2">
                  {selectedItemForView && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePrintItem(selectedItemForView)}
                      >
                        <Printer className="w-4 h-4 mr-2" />
                        Print
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleGeneratePDF(selectedItemForView)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        PDF
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </DialogHeader>
            
            {selectedItemForView && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Record Information</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Record ID:</span>
                        <span className="font-medium">#{selectedItemForView.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <Badge variant="outline" className={selectedItemForView.status === 'borrowed' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 'bg-green-100 text-green-800 border-green-200'}>
                          {selectedItemForView.status === 'borrowed' ? (
                            <><div className="w-2 h-2 bg-yellow-600 rounded-full mr-1"></div>Borrowed</>
                          ) : (
                            <><div className="w-2 h-2 bg-green-600 rounded-full mr-1"></div>Returned</>
                          )}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Borrow Date:</span>
                        <span className="font-medium">{new Date(selectedItemForView.borrow_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Borrower Information</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Name:</span>
                        <span className="font-medium">{selectedItemForView.borrower_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium text-sm">{selectedItemForView.borrower_email}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-2">Equipment Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Item:</span>
                        <span className="font-medium">{selectedItemForView.item}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Quantity:</span>
                        <span className="font-medium">{selectedItemForView.quantity}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Expected Return:</span>
                        <span className="font-medium">{selectedItemForView.return_date ? new Date(selectedItemForView.return_date).toLocaleDateString() : 'N/A'}</span>
                      </div>
                      {selectedItemForView.actual_return_date && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Actual Return:</span>
                          <span className="font-medium">{new Date(selectedItemForView.actual_return_date).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {selectedItemForView.return_condition && (
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Return Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Condition:</span>
                        <Badge variant="outline" className={
                          selectedItemForView.return_condition === 'good' ? 'bg-green-100 text-green-800 border-green-200' :
                          selectedItemForView.return_condition === 'damaged' ? 'bg-red-100 text-red-800 border-red-200' :
                          'bg-orange-100 text-orange-800 border-orange-200'
                        }>
                          {selectedItemForView.return_condition}
                        </Badge>
                      </div>
                    </div>
                    {selectedItemForView.return_notes && (
                      <div className="mt-4">
                        <span className="text-gray-600">Return Notes:</span>
                        <p className="mt-1 p-3 bg-gray-50 rounded-md text-sm">
                          {selectedItemForView.return_notes}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default BorrowItems;
