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
import { Plus, Pencil, Trash2, CheckCircle, Eye, Lock, Printer, Download } from "lucide-react";
import NavHeader from "@/components/NavHeader";
import NotificationProfile from "@/components/NotificationProfile";
import { useWebSocket } from "@/hooks/useWebSocket";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { format } from "date-fns";



const RepairMaintenance = () => {
  const navigate = useNavigate();
  
  // Get user data first
  const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const currentUser = storedUser ? JSON.parse(storedUser) : null;
  
  const [repairs, setRepairs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingRepair, setEditingRepair] = useState<any>(null);
  const [viewingRepair, setViewingRepair] = useState<any>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [viewPdfModalOpen, setViewPdfModalOpen] = useState(false);
  const [pdfPreview, setPdfPreview] = useState<string | null>(null);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [printOptions, setPrintOptions] = useState({
    dateRange: "all",
    startDate: "",
    endDate: "",
    status: "all",
    includeCompleted: true,
    layout: "table"
  });
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [selectedRepairId, setSelectedRepairId] = useState<string>("");
  const [adminPassword, setAdminPassword] = useState("");
  
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
  
  const [formData, setFormData] = useState({
    date: "",
    equipment_name: "",
    serial_number: "",
    issue_description: "",
    action_taken: "",
    technician_name: "",
    status: "Pending",
  });

  useEffect(() => {
    fetchRepairs();
  }, []);

  const fetchRepairs = async () => {
    try {
      const response = await fetch("http://localhost/labmate/labmate-guardian/api/repair_maintenance.php", {
        headers: getAuthHeaders()
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to fetch repair records");
      }

      setRepairs(result.data || []);
    } catch (error: any) {
      toast.error("Failed to fetch repair records");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const storedUser = localStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;
      
      const repairData = {
        ...formData,
        created_by: user?.id,
      };

      if (editingRepair) {
        const response = await fetch(`http://localhost/labmate/labmate-guardian/api/repair_maintenance.php?id=${editingRepair.id}`, {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify(repairData),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || "Failed to update repair record");
        }
        toast.success("Repair record updated successfully");
      } else {
        const response = await fetch("http://localhost/labmate/labmate-guardian/api/repair_maintenance.php", {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(repairData),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || "Failed to create repair record");
        }
        toast.success("Repair record created successfully");
      }

      setOpen(false);
      resetForm();
      fetchRepairs();
    } catch (error: any) {
      toast.error(error.message || "Failed to save repair record");
    }
  };

  const handleComplete = async (id: string) => {
    const repair = repairs.find((r) => r.id === id);
    if (!repair) {
      toast.error("Repair record not found");
      return;
    }

    // Show password confirmation dialog
    setSelectedRepairId(id);
    setPasswordDialogOpen(true);
    setAdminPassword("");
  };

  const getUserData = () => {
    const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    return storedUser ? JSON.parse(storedUser) : currentUser;
  };

  const getAuthHeaders = () => {
    const user = getUserData();
    return {
      'X-User-ID': user?.id || '',
      'X-User-Role': user?.role || '',
      'Content-Type': 'application/json'
    };
  };

  const canCompleteRepair = () => {
    const user = getUserData();
    return user?.role === 'admin' || user?.role === 'maintenance';
  };

  const handleCompleteWithPassword = async () => {
    if (!adminPassword.trim()) {
      toast.error("Please enter your password");
      return;
    }

    try {
      const repair = repairs.find((r) => r.id === selectedRepairId);
      if (!repair) {
        throw new Error("Repair record not found");
      }

      const updateData = {
        date: repair.date,
        equipment_name: repair.equipment_name,
        serial_number: repair.serial_number,
        issue_description: repair.issue_description,
        action_taken: repair.action_taken,
        technician_name: repair.technician_name,
        status: "Completed",
        admin_password: adminPassword,
        admin_id: currentUser?.id,
      };

      // Add timestamp to prevent caching
      const timestamp = Date.now();
      const response = await fetch(`http://localhost/labmate/labmate-guardian/api/repair_maintenance.php?id=${selectedRepairId}&_t=${timestamp}`, {
        method: "PUT",
        headers: {
          ...getAuthHeaders(),
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to update status");
      }

      toast.success("Repair marked as completed");
      setPasswordDialogOpen(false);
      setAdminPassword("");
      setSelectedRepairId("");
      fetchRepairs();
    } catch (error: any) {
      toast.error(error.message || "Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this repair record?")) return;

    try {
      const response = await fetch(`http://localhost/labmate/labmate-guardian/api/repair_maintenance.php?id=${id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to delete repair record");
      }
      toast.success("Repair record deleted successfully");
      fetchRepairs();
    } catch (error: any) {
      toast.error("Failed to delete repair record");
    }
  };

  const handlePrintRepair = (repair: any) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Repair Record - ${repair.equipment_name}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .section { margin-bottom: 20px; }
              .label { font-weight: bold; display: inline-block; width: 150px; }
              .value { margin-left: 10px; }
              .status { padding: 5px 10px; border-radius: 4px; color: white; }
              .status.Completed { background-color: #22c55e; }
              .status.Pending { background-color: #eab308; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Equipment Repair Record</h1>
            </div>
            
            <div class="section">
              <h3>Repair Information</h3>
              <p><span class="label">Date:</span><span class="value">${new Date(repair.date).toLocaleDateString()}</span></p>
              <p><span class="label">Status:</span><span class="status ${repair.status}">${repair.status.toUpperCase()}</span></p>
              <p><span class="label">Reported Date:</span><span class="value">${new Date(repair.created_at).toLocaleDateString()}</span></p>
            </div>
            
            <div class="section">
              <h3>Equipment Details</h3>
              <p><span class="label">Equipment:</span><span class="value">${repair.equipment_name}</span></p>
              <p><span class="label">Serial Number:</span><span class="value">${repair.serial_number || 'Not provided'}</span></p>
            </div>
            
            <div class="section">
              <h3>Repair Details</h3>
              <p><span class="label">Technician:</span><span class="value">${repair.technician_name || 'Not assigned'}</span></p>
              <div style="margin-top: 10px;">
                <p><span class="label">Issue Description:</span></p>
                <p style="margin-left: 160px; white-space: pre-wrap;">${repair.issue_description}</p>
              </div>
              <div style="margin-top: 10px;">
                <p><span class="label">Action Taken:</span></p>
                <p style="margin-left: 160px; white-space: pre-wrap;">${repair.action_taken || 'No action taken yet'}</p>
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
      toast.success("Print dialog opened");
    }
  };

  const handlePrintAll = () => {
    setPrintModalOpen(true);
  };

  const getFilteredRepairsForPrint = () => {
    let filtered = [...repairs];
    
    if (printOptions.dateRange === "custom" && printOptions.startDate && printOptions.endDate) {
      filtered = filtered.filter(repair => {
        const repairDate = new Date(repair.date);
        const start = new Date(printOptions.startDate);
        const end = new Date(printOptions.endDate);
        return repairDate >= start && repairDate <= end;
      });
    }
    
    if (printOptions.status !== "all") {
      filtered = filtered.filter(repair => repair.status === printOptions.status);
    }
    
    if (!printOptions.includeCompleted) {
      filtered = filtered.filter(repair => repair.status !== 'Completed');
    }
    
    return filtered;
  };

  const handlePrintAllRepairs = () => {
    const filteredRepairs = getFilteredRepairsForPrint();
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const currentDate = new Date().toLocaleDateString();
      
      if (printOptions.layout === "table") {
        // Table layout
        printWindow.document.write(`
          <html>
            <head>
              <title>All Repair Records</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .header h1 { color: #2563eb; margin-bottom: 10px; }
                .header p { color: #666; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f8f9fa; font-weight: bold; }
                .status { padding: 2px 6px; border-radius: 3px; font-size: 11px; }
                .status.Completed { background-color: #d4edda; color: #155724; }
                .status.Pending { background-color: #fff3cd; color: #856404; }
                .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
                @media print { body { margin: 10px; }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>All Repair Records Report</h1>
                <p>Generated on ${currentDate}</p>
                <p>Total Records: ${filteredRepairs.length}</p>
                ${printOptions.dateRange === "custom" && printOptions.startDate && printOptions.endDate ? 
                  `<p>Date Range: ${new Date(printOptions.startDate).toLocaleDateString()} - ${new Date(printOptions.endDate).toLocaleDateString()}</p>` : ''}
                ${printOptions.status !== "all" ? `<p>Status: ${printOptions.status}</p>` : ''}
              </div>
              
              <table>
                <thead>
                  <tr>
                    <th>Equipment</th>
                    <th>Serial Number</th>
                    <th>Issue</th>
                    <th>Technician</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${filteredRepairs.map(repair => `
                    <tr>
                      <td>${repair.equipment_name}</td>
                      <td>${repair.serial_number || 'N/A'}</td>
                      <td>${repair.issue_description.substring(0, 50)}${repair.issue_description.length > 50 ? '...' : ''}</td>
                      <td>${repair.technician_name || 'Unassigned'}</td>
                      <td>${new Date(repair.date).toLocaleDateString()}</td>
                      <td><span class="status ${repair.status}">${repair.status}</span></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              
              <div class="footer">
                <p>LabMate Repair & Maintenance Management System</p>
              </div>
            </body>
          </html>
        `);
      } else {
        // Card layout
        printWindow.document.write(`
          <html>
            <head>
              <title>All Repair Records</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .header h1 { color: #2563eb; margin-bottom: 10px; }
                .header p { color: #666; }
                .cards-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 20px; }
                .card { border: 1px solid #ddd; border-radius: 8px; padding: 16px; break-inside: avoid; }
                .card-header { font-weight: bold; font-size: 16px; margin-bottom: 8px; color: #333; }
                .card-field { margin-bottom: 4px; font-size: 12px; }
                .card-label { font-weight: bold; color: #666; }
                .status { padding: 2px 6px; border-radius: 3px; font-size: 10px; font-weight: bold; }
                .status.Completed { background-color: #d4edda; color: #155724; }
                .status.Pending { background-color: #fff3cd; color: #856404; }
                .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
                @media print { body { margin: 10px; }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>All Repair Records Report</h1>
                <p>Generated on ${currentDate}</p>
                <p>Total Records: ${filteredRepairs.length}</p>
                ${printOptions.dateRange === "custom" && printOptions.startDate && printOptions.endDate ? 
                  `<p>Date Range: ${new Date(printOptions.startDate).toLocaleDateString()} - ${new Date(printOptions.endDate).toLocaleDateString()}</p>` : ''}
                ${printOptions.status !== "all" ? `<p>Status: ${printOptions.status}</p>` : ''}
              </div>
              
              <div class="cards-grid">
                ${filteredRepairs.map(repair => `
                  <div class="card">
                    <div class="card-header">${repair.equipment_name}</div>
                    <div class="card-field"><span class="card-label">Serial:</span> ${repair.serial_number || 'N/A'}</div>
                    <div class="card-field"><span class="card-label">Date:</span> ${new Date(repair.date).toLocaleDateString()}</div>
                    <div class="card-field"><span class="card-label">Technician:</span> ${repair.technician_name || 'Unassigned'}</div>
                    <div class="card-field"><span class="card-label">Status:</span> <span class="status ${repair.status}">${repair.status}</span></div>
                    <div class="card-field"><span class="card-label">Issue:</span> ${repair.issue_description.substring(0, 100)}${repair.issue_description.length > 100 ? '...' : ''}</div>
                    ${repair.action_taken ? `<div class="card-field"><span class="card-label">Action:</span> ${repair.action_taken.substring(0, 100)}${repair.action_taken.length > 100 ? '...' : ''}</div>` : ''}
                  </div>
                `).join('')}
              </div>
              
              <div class="footer">
                <p>LabMate Repair & Maintenance Management System</p>
              </div>
            </body>
          </html>
        `);
      }
      
      printWindow.document.close();
      printWindow.print();
      toast.success("Print dialog opened");
      setPrintModalOpen(false);
    }
  };

  const getFilteredRepairsForPdf = () => {
    let filtered = [...repairs];
    
    if (pdfOptions.dateRange === "custom" && pdfOptions.startDate && pdfOptions.endDate) {
      filtered = filtered.filter(repair => {
        const repairDate = new Date(repair.date);
        const start = new Date(pdfOptions.startDate);
        const end = new Date(pdfOptions.endDate);
        return repairDate >= start && repairDate <= end;
      });
    }
    
    if (pdfOptions.status !== "all") {
      filtered = filtered.filter(repair => repair.status === pdfOptions.status);
    }
    
    if (!pdfOptions.includeCompleted) {
      filtered = filtered.filter(repair => repair.status !== 'Completed');
    }
    
    return filtered;
  };

  const generateRepairPDF = async (previewOnly = false) => {
    try {
      const filteredRepairs = getFilteredRepairsForPdf();
      
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
          <h1 style="font-size: 24px; margin-bottom: 10px; color: #333;">Equipment Repair & Maintenance Report</h1>
          <p style="font-size: 14px; color: #666;">
            Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
          </p>
          ${pdfOptions.dateRange === "custom" && pdfOptions.startDate && pdfOptions.endDate ? 
            `<p style="font-size: 12px; color: #666;">
              Date Range: ${new Date(pdfOptions.startDate).toLocaleDateString()} - ${new Date(pdfOptions.endDate).toLocaleDateString()}
            </p>` : ''}
          ${pdfOptions.status !== "all" ? 
            `<p style="font-size: 12px; color: #666;">
              Status: ${pdfOptions.status}
            </p>` : ''}
        </div>
      `;
      
      // Add table
      let tableHTML = `
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #f8f9fa;">
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left; font-weight: bold;">Equipment</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left; font-weight: bold;">Serial Number</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left; font-weight: bold;">Date</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left; font-weight: bold;">Technician</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left; font-weight: bold;">Status</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left; font-weight: bold;">Issue</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left; font-weight: bold;">Action Taken</th>
            </tr>
          </thead>
          <tbody>
      `;
      
      filteredRepairs.forEach(repair => {
        tableHTML += `
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">${repair.equipment_name}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${repair.serial_number || 'N/A'}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${format(new Date(repair.date), 'MMM d, yyyy')}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${repair.technician_name || 'Unassigned'}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${repair.status}</td>
            <td style="border: 1px solid #ddd; padding: 8px; max-width: 200px; word-wrap: break-word;">${repair.issue_description}</td>
            <td style="border: 1px solid #ddd; padding: 8px; max-width: 200px; word-wrap: break-word;">${repair.action_taken || 'No action taken'}</td>
          </tr>
        `;
      });
      
      tableHTML += `
          </tbody>
        </table>
        <div style="margin-top: 30px; font-size: 12px; color: #666;">
          <p>Total Repair Records: ${filteredRepairs.length}</p>
        </div>
      `;
      
      pdfContent.innerHTML += tableHTML;
      
      if (previewOnly) {
        // For preview, store only the inner HTML content (without the outer wrapper)
        const pdfHtmlContent = pdfContent.innerHTML;
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
        pdf.save(`repair-maintenance-${new Date().toISOString().split('T')[0]}.pdf`);
        toast.success("PDF generated successfully");
        setPdfModalOpen(false);
      }
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error("Failed to generate PDF");
    }
  };

  const [pdfOptions, setPdfOptions] = useState({
    dateRange: "all",
    startDate: "",
    endDate: "",
    status: "all",
    includeCompleted: true
  });

  const handleViewAll = () => {
    setPdfModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      date: "",
      equipment_name: "",
      serial_number: "",
      issue_description: "",
      action_taken: "",
      technician_name: "",
      status: "Pending",
    });
    setEditingRepair(null);
  };

  const handleView = (repair: any) => {
    setViewingRepair(repair);
    setViewOpen(true);
  };

  const canEditRepair = (repair: any) => {
    const user = getUserData();
    // Admin can edit any repair
    if (user?.role === 'admin') return true;
    
    // User can edit their own repairs
    return repair.created_by === user?.id;
  };

  const canDeleteRepair = (repair: any) => {
    const user = getUserData();
    // Admin can delete any repair
    if (user?.role === 'admin') return true;
    
    // User can delete their own repairs
    return repair.created_by === user?.id;
  };

  const handleEdit = (repair: any) => {
    setEditingRepair(repair);
    setFormData({
      date: repair.date || "",
      equipment_name: repair.equipment_name || "",
      serial_number: repair.serial_number || "",
      issue_description: repair.issue_description || "",
      action_taken: repair.action_taken || "",
      technician_name: repair.technician_name || "",
      status: repair.status || "Pending",
    });
    setOpen(true);
  };

  return (
    <div>
      <NavHeader 
        title="Repair & Maintenance" 
        subtitle="Track and manage equipment repairs"
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
      <div className="container mx-auto p-6 pt-20" style={{ transform: 'scale(1.0)', transformOrigin: 'top left', width: '125%' }}>
        <div className="flex justify-between items-center mb-8">
          <div className="flex gap-2">
            <Dialog open={open} onOpenChange={(value) => { setOpen(value); if (!value) resetForm(); }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Repair
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingRepair ? "Edit" : "New"} Repair Record</DialogTitle>
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
                      <Label htmlFor="equipment_name">Equipment Name *</Label>
                      <Input
                        id="equipment_name"
                        value={formData.equipment_name}
                        onChange={(e) => setFormData({ ...formData, equipment_name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="serial_number">Serial Number</Label>
                      <Input
                        id="serial_number"
                        value={formData.serial_number}
                        onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="issue_description">Issue Description *</Label>
                      <Textarea
                        id="issue_description"
                        value={formData.issue_description}
                        onChange={(e) => setFormData({ ...formData, issue_description: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="action_taken">Action Taken</Label>
                      <Textarea
                        id="action_taken"
                        value={formData.action_taken}
                        onChange={(e) => setFormData({ ...formData, action_taken: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="technician_name">Technician Name</Label>
                      <Input
                        id="technician_name"
                        value={formData.technician_name}
                        onChange={(e) => setFormData({ ...formData, technician_name: e.target.value })}
                      />
                    </div>
                  </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => { setOpen(false); resetForm(); }}>
                    Cancel
                  </Button>
                  <Button type="submit">{editingRepair ? "Update" : "Create"}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handlePrintAll}
              disabled={loading || repairs.length === 0}
            >
              <Printer className="w-4 h-4 mr-2" />
              Print All
            </Button>
            <Button
              variant="outline"
              onClick={handleViewAll}
              disabled={loading || repairs.length === 0}
            >
              <Eye className="w-4 h-4 mr-2" />
              View All
            </Button>
          </div>
        </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Equipment</TableHead>
              <TableHead>Serial Number</TableHead>
              <TableHead>Issue</TableHead>
              <TableHead>Technician</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">Loading...</TableCell>
              </TableRow>
            ) : repairs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No repair records found. Create one to get started.
                </TableCell>
              </TableRow>
            ) : (
              repairs.map((repair) => (
                <TableRow key={repair.id}>
                  <TableCell className="font-medium">{repair.equipment_name}</TableCell>
                  <TableCell>{repair.serial_number || "N/A"}</TableCell>
                  <TableCell className="max-w-xs truncate">{repair.issue_description}</TableCell>
                  <TableCell>{repair.technician_name || "Unassigned"}</TableCell>
                  <TableCell>{new Date(repair.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {repair.status === "Completed" ? (
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                        Completed
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                        Pending
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      size="sm"
                     意思 variant="ghost"
                      onClick={() => handleView(repair)}
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handlePrintRepair(repair)}
                      title="Print record"
                    >
                      <Printer className="w-4 h-4" />
                    </Button>
                    {repair.status === "Pending" && canCompleteRepair() && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleComplete(repair.id)}
                        title="Mark as completed"
                      >
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </Button>
                    )}
                    {canEditRepair(repair) && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(repair)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    )}
                    {canDeleteRepair(repair) && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(repair.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* View Repair Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle>Repair Record Details</DialogTitle>
              <div className="flex gap-2">
                {viewingRepair && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePrintRepair(viewingRepair)}
                    >
                      <Printer className="w-4 h-4 mr-2" />
                      Print
                    </Button>
                  </>
                )}
              </div>
            </div>
          </DialogHeader>
          {viewingRepair && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Date</Label>
                  <p className="mt-1">{new Date(viewingRepair.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="font-semibold">Equipment Name</Label>
                  <p className="mt-1">{viewingRepair.equipment_name}</p>
                </div>
                <div>
                  <Label className="font-semibold">Serial Number</Label>
                  <p className="mt-1">{viewingRepair.serial_number || 'Not provided'}</p>
                </div>
                <div>
                  <Label className="font-semibold">Technician Name</Label>
                  <p className="mt-1">{viewingRepair.technician_name || 'Not assigned'}</p>
                </div>
                <div>
                  <Label className="font-semibold">Status</Label>
                  <p className="mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      viewingRepair.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {viewingRepair.status}
                    </span>
                  </p>
                </div>
                <div>
                  <Label className="font-semibold">Reported Date</Label>
                  <p className="mt-1">{new Date(viewingRepair.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div>
                <Label className="font-semibold">Issue Description</Label>
                <p className="mt-1 whitespace-pre-wrap">{viewingRepair.issue_description}</p>
              </div>
              <div>
                <Label className="font-semibold">Action Taken</Label>
                <p className="mt-1 whitespace-pre-wrap">{viewingRepair.action_taken || 'No action taken yet'}</p>
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

      {/* Print Options Modal */}
      <Dialog open={printModalOpen} onOpenChange={setPrintModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Print Repair Records</DialogTitle>
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
                  <Label htmlFor="printStartDate">Start Date</Label>
                  <Input
                    id="printStartDate"
                    type="date"
                    value={printOptions.startDate}
                    onChange={(e) => setPrintOptions({ ...printOptions, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="printEndDate">End Date</Label>
                  <Input
                    id="printEndDate"
                    type="date"
                    value={printOptions.endDate}
                    onChange={(e) => setPrintOptions({ ...printOptions, endDate: e.target.value })}
                  />
                </div>
              </>
            )}
            
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={printOptions.status}
                onValueChange={(value) => setPrintOptions({ ...printOptions, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Layout</Label>
              <Select
                value={printOptions.layout}
                onValueChange={(value) => setPrintOptions({ ...printOptions, layout: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="table">Table Layout</SelectItem>
                  <SelectItem value="cards">Card Layout</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="printIncludeCompleted"
                checked={printOptions.includeCompleted}
                onChange={(e) => setPrintOptions({ ...printOptions, includeCompleted: e.target.checked })}
              />
              <Label htmlFor="printIncludeCompleted">Include Completed Repairs</Label>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setPrintModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handlePrintAllRepairs}>
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* PDF Generation Modal */}
      <Dialog open={pdfModalOpen} onOpenChange={setPdfModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Repair Report</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Date Range</Label>
              <Select
                value={pdfOptions.dateRange}
                onValueChange={(value) => setPdfOptions({ ...pdfOptions, dateRange: value })}
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
            
            {pdfOptions.dateRange === "custom" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={pdfOptions.startDate}
                    onChange={(e) => setPdfOptions({ ...pdfOptions, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={pdfOptions.endDate}
                    onChange={(e) => setPdfOptions({ ...pdfOptions, endDate: e.target.value })}
                  />
                </div>
              </>
            )}
            
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={pdfOptions.status}
                onValueChange={(value) => setPdfOptions({ ...pdfOptions, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="includeCompleted"
                checked={pdfOptions.includeCompleted}
                onChange={(e) => setPdfOptions({ ...pdfOptions, includeCompleted: e.target.checked })}
              />
              <Label htmlFor="includeCompleted">Include Completed Repairs</Label>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setPdfModalOpen(false)}>
                Cancel
              </Button>
              <Button type="button" variant="secondary" onClick={() => generateRepairPDF(true)}>
                <Eye className="w-4 h-4 mr-2" />
                View PDF
              </Button>
              <Button onClick={() => generateRepairPDF(false)}>
                <Download className="w-4 h-4 mr-2" />
                Generate PDF
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View PDF Modal */}
      <Dialog open={viewPdfModalOpen} onOpenChange={setViewPdfModalOpen}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-auto p-0">
          <DialogHeader className="sticky top-0 bg-white z-10 p-6 border-b">
            <div className="flex justify-between items-center">
              <DialogTitle>Repair Report Preview</DialogTitle>
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setViewPdfModalOpen(false)}
                >
                  Close
                </Button>
                <Button onClick={() => generateRepairPDF(false)}>
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          </DialogHeader>
          {pdfPreview && (
            <div className="p-6">
              <div className="flex justify-center">
                <div 
                  className="bg-white shadow-lg"
                  style={{ 
                    width: '210mm',
                    minHeight: '297mm',
                    padding: '20mm',
                    boxSizing: 'border-box',
                    fontSize: '12px',
                    fontFamily: 'Arial, sans-serif'
                  }}
                >
                  <div dangerouslySetInnerHTML={{ __html: pdfPreview }} />
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Password Confirmation Dialog */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Admin Password Required
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Please enter your admin password to confirm marking this repair as completed.
            </p>
            <div className="space-y-2">
              <Label htmlFor="admin-password">Admin Password</Label>
              <Input
                id="admin-password"
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Enter your password"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleCompleteWithPassword();
                  }
                }}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setPasswordDialogOpen(false);
                  setAdminPassword("");
                  setSelectedRepairId("");
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleCompleteWithPassword}>
                Confirm Completion
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
};

export default RepairMaintenance;
