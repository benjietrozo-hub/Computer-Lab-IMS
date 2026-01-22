import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Printer, Download, Eye } from "lucide-react";
import NavHeader from "@/components/NavHeader";
import NotificationProfile from "@/components/NotificationProfile";
import { useWebSocket } from "@/hooks/useWebSocket";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";



const VisitorLogs = () => {
  const navigate = useNavigate();
  const [visitors, setVisitors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingVisitor, setEditingVisitor] = useState<any>(null);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [viewPdfModalOpen, setViewPdfModalOpen] = useState(false);
  const [pdfPreview, setPdfPreview] = useState<string | null>(null);
  const [printOptions, setPrintOptions] = useState({
    dateRange: "all",
    startDate: "",
    endDate: "",
    visitorType: "all",
    includeTimeOut: true
  });
  
  const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const currentUser = storedUser ? JSON.parse(storedUser) : null;
  
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
  
  const [formData, setFormData] = useState({
    name: "",
    visitor_type: "",
    purpose: "",
    date: "",
    time_in: "",
    time_out: "",
  });

  useEffect(() => {
    fetchVisitors();
  }, []);

  const fetchVisitors = async () => {
    try {
      const response = await fetch("http://localhost/labmate/labmate-guardian/api/visitor_logs.php");
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to fetch visitor logs");
      }

      setVisitors(result.data || []);
    } catch (error: any) {
      toast.error("Failed to fetch visitor logs");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost/labmate/labmate-guardian/api/visitor_logs.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to create visitor log");
      }
      toast.success("Visitor log created successfully");
      setOpen(false);
      resetForm();
      fetchVisitors();
    } catch (error: any) {
      toast.error(error.message || "Failed to save visitor log");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this visitor log?")) return;

    try {
      const response = await fetch(`http://localhost/labmate/labmate-guardian/api/visitor_logs.php?id=${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to delete visitor log");
      }
      toast.success("Visitor log deleted successfully");
      fetchVisitors();
    } catch (error: any) {
      toast.error("Failed to delete visitor log");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      visitor_type: "",
      purpose: "",
      date: "",
      time_in: "",
      time_out: "",
    });
    setEditingVisitor(null);
  };

  const handleEdit = (visitor: any) => {
    setEditingVisitor(visitor);
    setFormData({
      name: visitor.name || "",
      visitor_type: visitor.visitor_type || "",
      purpose: visitor.purpose || "",
      date: visitor.date || "",
      time_in: visitor.time_in || "",
      time_out: visitor.time_out || "",
    });
    setOpen(true);
  };

  const getFilteredVisitors = () => {
    let filtered = [...visitors];
    
    if (printOptions.dateRange === "custom" && printOptions.startDate && printOptions.endDate) {
      filtered = filtered.filter(visitor => {
        const visitorDate = new Date(visitor.date);
        const start = new Date(printOptions.startDate);
        const end = new Date(printOptions.endDate);
        return visitorDate >= start && visitorDate <= end;
      });
    }
    
    if (printOptions.visitorType !== "all") {
      filtered = filtered.filter(visitor => visitor.visitor_type === printOptions.visitorType);
    }
    
    return filtered;
  };

  const generatePDF = async (previewOnly = false) => {
    try {
      const filteredVisitors = getFilteredVisitors();
      
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
          <h1 style="font-size: 24px; margin-bottom: 10px;">Visitor Logs Report</h1>
          <p style="font-size: 14px; color: #666;">
            Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
          </p>
          ${printOptions.dateRange === "custom" && printOptions.startDate && printOptions.endDate ? 
            `<p style="font-size: 12px; color: #666;">
              Date Range: ${new Date(printOptions.startDate).toLocaleDateString()} - ${new Date(printOptions.endDate).toLocaleDateString()}
            </p>` : ''}
          ${printOptions.visitorType !== "all" ? 
            `<p style="font-size: 12px; color: #666;">
              Visitor Type: ${printOptions.visitorType}
            </p>` : ''}
        </div>
      `;
      
      // Add table
      let tableHTML = `
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #f5f5f5;">
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Name</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Type</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Purpose</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Date</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Time In</th>
              ${printOptions.includeTimeOut ? '<th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Time Out</th>' : ''}
            </tr>
          </thead>
          <tbody>
      `;
      
      filteredVisitors.forEach(visitor => {
        tableHTML += `
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">${visitor.name}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${visitor.visitor_type || 'Unknown'}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${visitor.purpose}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${new Date(visitor.date).toLocaleDateString()}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${visitor.time_in}</td>
            ${printOptions.includeTimeOut ? `<td style="border: 1px solid #ddd; padding: 8px;">${visitor.time_out || 'Still in'}</td>` : ''}
          </tr>
        `;
      });
      
      tableHTML += `
          </tbody>
        </table>
        <div style="margin-top: 30px; font-size: 12px; color: #666;">
          <p>Total Visitors: ${filteredVisitors.length}</p>
        </div>
      `;
      
      pdfContent.innerHTML += tableHTML;
      
      if (previewOnly) {
        // For preview, store the full PDF content as HTML and show modal
        const pdfHtmlContent = pdfContent.outerHTML;
        setPdfPreview(pdfHtmlContent);
        setViewPdfModalOpen(true);
      } else {
        // For download, create PDF using html2canvas
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
        pdf.save(`visitor-logs-${new Date().toISOString().split('T')[0]}.pdf`);
        toast.success("PDF generated successfully");
        setPrintModalOpen(false);
      }
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error("Failed to generate PDF");
    }
  };

  return (
    <div>
      <NavHeader 
        title="Visitor Logs" 
        subtitle="Track and manage visitor entries"
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
        <div className="flex justify-end gap-2">
          <Dialog open={printModalOpen} onOpenChange={setPrintModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Printer className="w-4 h-4 mr-2" />
                Print PDF
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Generate PDF Report</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Date Range</Label>
                  <Select
                    value={printOptions.dateRange}
                    onValueChange={(value) => setPrintOptions({ ...printOptions, dateRange: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Dates</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {printOptions.dateRange === "custom" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={printOptions.startDate}
                        onChange={(e) => setPrintOptions({ ...printOptions, startDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={printOptions.endDate}
                        onChange={(e) => setPrintOptions({ ...printOptions, endDate: e.target.value })}
                      />
                    </div>
                  </>
                )}
                
                <div className="space-y-2">
                  <Label>Visitor Type</Label>
                  <Select
                    value={printOptions.visitorType}
                    onValueChange={(value) => setPrintOptions({ ...printOptions, visitorType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="faculty">Faculty</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="outsider">Outsider</SelectItem>
                      <SelectItem value="technician">Technician</SelectItem>
                      <SelectItem value="instructor">Instructor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="includeTimeOut"
                    checked={printOptions.includeTimeOut}
                    onChange={(e) => setPrintOptions({ ...printOptions, includeTimeOut: e.target.checked })}
                  />
                  <Label htmlFor="includeTimeOut">Include Time Out Column</Label>
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setPrintModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => generatePDF(true)}>
                    <Eye className="w-4 h-4 mr-2" />
                    View PDF
                  </Button>
                  <Button onClick={() => generatePDF(false)}>
                    <Download className="w-4 h-4 mr-2" />
                    Generate PDF
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={open} onOpenChange={(value) => { setOpen(value); if (!value) resetForm(); }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Visitor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingVisitor ? "Edit" : "New"} Visitor Log</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="name">Visitor Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="visitor_type">Visitor Type *</Label>
                    <Select
                      value={formData.visitor_type}
                      onValueChange={(value) => setFormData({ ...formData, visitor_type: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select visitor type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="faculty">Faculty</SelectItem>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="outsider">Outsider</SelectItem>
                        <SelectItem value="technician">Technician</SelectItem>
                        <SelectItem value="instructor">Instructor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="purpose">Purpose *</Label>
                    <Textarea
                      id="purpose"
                      value={formData.purpose}
                      onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                      required
                    />
                  </div>
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
                    <Label htmlFor="time_in">Time In *</Label>
                    <Input
                      id="time_in"
                      type="time"
                      value={formData.time_in}
                      onChange={(e) => setFormData({ ...formData, time_in: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="time_out">Time Out</Label>
                    <Input
                      id="time_out"
                      type="time"
                      value={formData.time_out}
                      onChange={(e) => setFormData({ ...formData, time_out: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingVisitor ? "Update" : "Add"} Visitor
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
            <TableHead>Visitor Name</TableHead>
            <TableHead>Visitor Type</TableHead>
            <TableHead>Purpose</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Time In</TableHead>
            <TableHead>Time Out</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center">Loading...</TableCell>
            </TableRow>
            ) : visitors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No visitor logs found. Create one to get started.
                </TableCell>
              </TableRow>
            ) : (
              visitors.map((visitor) => (
                <TableRow key={visitor.id}>
                  <TableCell className="font-medium">{visitor.name}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {visitor.visitor_type || 'Unknown'}
                    </span>
                  </TableCell>
                  <TableCell>{visitor.purpose}</TableCell>
                  <TableCell>{new Date(visitor.date).toLocaleDateString()}</TableCell>
                  <TableCell>{visitor.time_in}</TableCell>
                  <TableCell>{visitor.time_out || "Still in"}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(visitor)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(visitor.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* View PDF Modal */}
      <Dialog open={viewPdfModalOpen} onOpenChange={setViewPdfModalOpen}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-auto p-0">
          <DialogHeader className="sticky top-0 bg-white z-10 p-6 border-b">
            <div className="flex justify-between items-center">
              <DialogTitle>PDF Preview</DialogTitle>
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setViewPdfModalOpen(false)}
                >
                  Close
                </Button>
                <Button onClick={() => generatePDF(false)}>
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          </DialogHeader>
          {pdfPreview && (
            <div className="p-6">
              <div 
                className="bg-white shadow-lg"
                style={{ 
                  width: '210mm',
                  minHeight: '297mm',
                  padding: '20mm',
                  boxSizing: 'border-box',
                  margin: '0 auto'
                }}
                dangerouslySetInnerHTML={{ __html: pdfPreview }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      </div>
    </div>
  );
};

export default VisitorLogs;
