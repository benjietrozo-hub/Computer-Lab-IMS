import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Calendar, Clock, User, CheckCircle, XCircle, AlertCircle, RefreshCw, Filter, Download, Printer, Eye, Edit, Trash2, Phone, Mail } from "lucide-react";
import { ReservationCalendar } from "@/components/ReservationCalendar";
import { WaitingListManager } from "@/components/WaitingListManager";
import NavHeader from "@/components/NavHeader";
import NotificationProfile from "@/components/NotificationProfile";
import { useWebSocket } from "@/hooks/useWebSocket";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";


import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Equipment {
  id: string;
  name: string;
  category: string;
  quantity: number;
  serial_number?: string;
}

interface Reservation {
  id: string;
  reservation_number?: string;
  equipment_id: string;
  user_id: number;
  reservation_date: string;
  start_time: string;
  end_time: string;
  quantity_reserved: number;
  purpose?: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';
  user_name?: string;
  equipment_name?: string;
  user_type?: 'student' | 'staff' | 'faculty' | 'visitor';
  contact_info?: string;
  penalty_amount?: number;
  penalty_paid?: boolean;
  created_at: string;
  approved_by?: string;
  approved_at?: string;
  notes?: string;
}

const mapRoleToUserType = (role: string): 'student' | 'staff' | 'faculty' | 'visitor' => {
  if (role === 'instructor' || role === 'teacher') return 'faculty';
  if (role === 'admin') return 'staff';
  return 'student';
};

const Reservations = () => {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterEquipment, setFilterEquipment] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUserName, setSelectedUserName] = useState("");
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [viewPdfModalOpen, setViewPdfModalOpen] = useState(false);
  const [pdfPreview, setPdfPreview] = useState<string | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedReservationForView, setSelectedReservationForView] = useState<Reservation | null>(null);
  const [pdfOptions, setPdfOptions] = useState({
    dateRange: "all",
    startDate: "",
    endDate: "",
    status: "all",
    equipment: "all",
    includePenalties: true
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
    status: "",
    rejection_reason: "",
    notes: ""
  });

  const [createForm, setCreateForm] = useState({
    user_id: "",
    equipment_id: "",
    reservation_date: "",
    start_time: "09:00",
    end_time: "11:00",
    quantity: 1,
    purpose: ""
  });

  useEffect(() => {
    fetchData();
  }, [filterStatus, filterEquipment]);

  useEffect(() => {
    if (currentUser?.role === "admin") {
      fetchUsers();
    }
  }, [currentUser?.role]);

  const fetchData = async () => {
    try {
      const [reservationsResponse, equipmentResponse] = await Promise.all([
        fetch("http://localhost/labmate/labmate-guardian/api/reservations.php"),
        fetch("http://localhost/labmate/labmate-guardian/api/inventory_equipment.php")
      ]);

      const reservationsData = await reservationsResponse.json();
      const equipmentData = await equipmentResponse.json();

      setReservations(reservationsData.reservations || []);
      setEquipment(equipmentData.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost/labmate/labmate-guardian/api/users.php");
      const result = await response.json();
      if (result.success) {
        setUsers(result.data || []);
      } else {
        toast.error(result.error || "Failed to load users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    }
  };

  const handleUpdateReservation = async (reservationId: string, updates: any) => {
    try {
      const response = await fetch(`http://localhost/labmate/labmate-guardian/api/reservations.php?id=${reservationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates)
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success("Reservation updated successfully");
        fetchData();
        setOpen(false);
        setSelectedReservation(null);
      } else {
        toast.error(result.error || "Failed to update reservation");
      }
    } catch (error) {
      console.error('Error updating reservation:', error);
      toast.error("Failed to update reservation");
    }
  };

  const handleGeneratePDF = async (reservationId: string) => {
    try {
      const response = await fetch(`http://localhost/labmate/labmate-guardian/api/generate_reservation_pdf.php?id=${reservationId}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reservation_${reservationId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("PDF generated successfully");
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error("Failed to generate PDF");
    }
  };

  const handlePrintReservation = (reservation: Reservation) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Reservation ${reservation.reservation_number}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .section { margin-bottom: 20px; }
              .label { font-weight: bold; display: inline-block; width: 150px; }
              .value { margin-left: 10px; }
              .status { padding: 5px 10px; border-radius: 4px; color: white; }
              .status.approved { background-color: #22c55e; }
              .status.pending { background-color: #eab308; }
              .status.rejected { background-color: #ef4444; }
              .status.cancelled { background-color: #6b7280; }
              .status.completed { background-color: #3b82f6; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Equipment Reservation Record</h1>
            </div>
            
            <div class="section">
              <p><span class="label">Reservation Number:</span><span class="value">${reservation.reservation_number}</span></p>
              <p><span class="label">Status:</span><span class="status ${reservation.status}">${reservation.status.toUpperCase()}</span></p>
              <p><span class="label">Date Created:</span><span class="value">${new Date(reservation.created_at).toLocaleDateString()}</span></p>
            </div>
            
            <div class="section">
              <h3>User Information</h3>
              <p><span class="label">Name:</span><span class="value">${reservation.user_name}</span></p>
              <p><span class="label">User Type:</span><span class="value">${reservation.user_type || 'student'}</span></p>
              ${reservation.contact_info ? `<p><span class="label">Contact Info:</span><span class="value">${reservation.contact_info}</span></p>` : ''}
            </div>
            
            <div class="section">
              <h3>Equipment Details</h3>
              <p><span class="label">Equipment:</span><span class="value">${reservation.equipment_name}</span></p>
              <p><span class="label">Quantity:</span><span class="value">${reservation.quantity_reserved}</span></p>
              <p><span class="label">Date:</span><span class="value">${new Date(reservation.reservation_date).toLocaleDateString()}</span></p>
              <p><span class="label">Time:</span><span class="value">${reservation.start_time} - ${reservation.end_time}</span></p>
              ${reservation.purpose ? `<p><span class="label">Purpose:</span><span class="value">${reservation.purpose}</span></p>` : ''}
            </div>
            
            ${reservation.penalty_amount > 0 ? `
            <div class="section">
              <h3>Penalty Information</h3>
              <p><span class="label">Penalty Amount:</span><span class="value">$${reservation.penalty_amount.toFixed(2)}</span></p>
              <p><span class="label">Penalty Paid:</span><span class="value">${reservation.penalty_paid ? 'Yes' : 'No'}</span></p>
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

  const handleViewReservation = (reservation: Reservation) => {
    setSelectedReservationForView(reservation);
    setViewModalOpen(true);
  };

  const handleDeleteReservation = async (reservationId: string) => {
    if (!confirm("Are you sure you want to delete this reservation?")) {
      return;
    }

    try {
      const response = await fetch(`http://localhost/labmate/labmate-guardian/api/reservations.php?id=${reservationId}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success("Reservation deleted successfully");
        fetchData();
      } else {
        toast.error(result.error || "Failed to delete reservation");
      }
    } catch (error) {
      console.error('Error deleting reservation:', error);
      toast.error("Failed to delete reservation");
    }
  };

  const handlePrintAllReservations = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const currentDate = new Date().toLocaleDateString();
      printWindow.document.write(`
        <html>
          <head>
            <title>All Reservations Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .header h1 { color: #2563eb; margin-bottom: 10px; }
              .header p { color: #666; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f8f9fa; font-weight: bold; }
              .status { padding: 2px 6px; border-radius: 3px; font-size: 11px; }
              .status.approved { background-color: #d4edda; color: #155724; }
              .status.pending { background-color: #fff3cd; color: #856404; }
              .status.rejected { background-color: #f8d7da; color: #721c24; }
              .status.cancelled { background-color: #f8f9fa; color: #6c757d; }
              .status.completed { background-color: #d1ecf1; color: #0c5460; }
              .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
              @media print { body { margin: 10px; } }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>All Reservations Report</h1>
              <p>Generated on ${currentDate}</p>
              <p>Total Reservations: ${filteredReservations.length}</p>
            </div>
            
            <table>
              <thead>
                <tr>
                  <th>Reservation #</th>
                  <th>Equipment</th>
                  <th>User</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Quantity</th>
                  <th>Status</th>
                  <th>Purpose</th>
                  <th>Penalty</th>
                </tr>
              </thead>
              <tbody>
                ${filteredReservations.map(reservation => `
                  <tr>
                    <td>${reservation.reservation_number || 'N/A'}</td>
                    <td>${reservation.equipment_name}</td>
                    <td>${reservation.user_name}</td>
                    <td>${reservation.user_type || 'student'}</td>
                    <td>${format(new Date(reservation.reservation_date), 'MMM d, yyyy')}</td>
                    <td>${reservation.start_time} - ${reservation.end_time}</td>
                    <td>${reservation.quantity_reserved}</td>
                    <td><span class="status ${reservation.status}">${reservation.status}</span></td>
                    <td>${reservation.purpose || '-'}</td>
                    <td>${reservation.penalty_amount > 0 ? `$${reservation.penalty_amount.toFixed(2)}` : '-'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div class="footer">
              <p>LabMate Reservation Management System</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
      toast.success("Print dialog opened");
    }
  };

  const getFilteredReservationsForPdf = () => {
    let filtered = [...filteredReservations];
    
    if (pdfOptions.dateRange === "custom" && pdfOptions.startDate && pdfOptions.endDate) {
      filtered = filtered.filter(reservation => {
        const reservationDate = new Date(reservation.reservation_date);
        const start = new Date(pdfOptions.startDate);
        const end = new Date(pdfOptions.endDate);
        return reservationDate >= start && reservationDate <= end;
      });
    }
    
    if (pdfOptions.status !== "all") {
      filtered = filtered.filter(reservation => reservation.status === pdfOptions.status);
    }
    
    if (pdfOptions.equipment !== "all") {
      filtered = filtered.filter(reservation => reservation.equipment_id === pdfOptions.equipment);
    }
    
    return filtered;
  };

  const generateReservationPDF = async (previewOnly = false) => {
    try {
      const filteredReservations = getFilteredReservationsForPdf();
      
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
          <h1 style="font-size: 24px; margin-bottom: 10px;">Equipment Reservations Report</h1>
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
          ${pdfOptions.equipment !== "all" ? 
            `<p style="font-size: 12px; color: #666;">
              Equipment: ${equipment.find(e => e.id === pdfOptions.equipment)?.name || 'Unknown'}
            </p>` : ''}
        </div>
      `;
      
      // Add table
      let tableHTML = `
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #f5f5f5;">
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Reservation #</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Equipment</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">User</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Type</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Date</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Time</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Quantity</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Status</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Purpose</th>
              ${pdfOptions.includePenalties ? '<th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Penalty</th>' : ''}
            </tr>
          </thead>
          <tbody>
      `;
      
      filteredReservations.forEach(reservation => {
        tableHTML += `
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">${reservation.reservation_number || 'N/A'}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${reservation.equipment_name}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${reservation.user_name}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${reservation.user_type || 'student'}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${format(new Date(reservation.reservation_date), 'MMM d, yyyy')}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${reservation.start_time} - ${reservation.end_time}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${reservation.quantity_reserved}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${reservation.status}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${reservation.purpose || '-'}</td>
            ${pdfOptions.includePenalties ? `<td style="border: 1px solid #ddd; padding: 8px;">${reservation.penalty_amount > 0 ? `$${reservation.penalty_amount.toFixed(2)}` : '-'}</td>` : ''}
          </tr>
        `;
      });
      
      tableHTML += `
          </tbody>
        </table>
        <div style="margin-top: 30px; font-size: 12px; color: #666;">
          <p>Total Reservations: ${filteredReservations.length}</p>
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
        pdf.save(`reservations-${new Date().toISOString().split('T')[0]}.pdf`);
        toast.success("PDF generated successfully");
        setPdfModalOpen(false);
      }
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error("Failed to generate PDF");
    }
  };

  const handleCreateReservationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser || currentUser.role !== "admin") {
      toast.error("Only administrators can create reservations.");
      return;
    }

    if (!createForm.user_id || !createForm.equipment_id || !createForm.reservation_date) {
      toast.error("Please select user, equipment, and reservation date.");
      return;
    }

    const startDateTime = new Date(`${createForm.reservation_date}T${createForm.start_time}:00`);
    const endDateTime = new Date(`${createForm.reservation_date}T${createForm.end_time}:00`);

    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      toast.error("Invalid start or end time.");
      return;
    }

    if (endDateTime <= startDateTime) {
      toast.error("End time must be after start time.");
      return;
    }

    const now = new Date();
    if (startDateTime < now) {
      toast.error("You cannot create a reservation in the past.");
      return;
    }

    if (createForm.quantity <= 0) {
      toast.error("Quantity must be at least 1.");
      return;
    }

    const equipmentItem = equipment.find(e => e.id === createForm.equipment_id);
    if (equipmentItem && createForm.quantity > equipmentItem.quantity) {
      toast.error(`Requested quantity exceeds available units (${equipmentItem.quantity}).`);
      return;
    }

    try {
      setCreating(true);
      const selectedUser = users.find((u) => u.id === createForm.user_id);
      const role = selectedUser?.role || 'user';
      const userType = mapRoleToUserType(role);
      const payload = {
        equipment_id: createForm.equipment_id,
        user_id: createForm.user_id,
        reservation_date: createForm.reservation_date,
        start_time: createForm.start_time,
        end_time: createForm.end_time,
        quantity_reserved: createForm.quantity,
        purpose: createForm.purpose,
        user_type: userType
      };

      const response = await fetch("http://localhost/labmate/labmate-guardian/api/reservations.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const responseText = await response.text();
      let result: any;
      try {
        result = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.error("Failed to parse create reservation response:", responseText);
        toast.error("Server error while creating reservation.");
        return;
      }

      if (response.ok && result.success) {
        toast.success("Reservation created successfully.");
        setCreateOpen(false);
        setCreateForm({
          user_id: "",
          equipment_id: "",
          reservation_date: "",
          start_time: "09:00",
          end_time: "11:00",
          quantity: 1,
          purpose: ""
        });
        setSelectedUserName("");
        fetchData();
      } else {
        toast.error(result.error || "Failed to create reservation.");
      }
    } catch (error) {
      console.error("Error creating reservation:", error);
      toast.error("Failed to create reservation.");
    } finally {
      setCreating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const filteredReservations = reservations.filter(reservation => {
    const matchesStatus = filterStatus === "all" || reservation.status === filterStatus;
    const matchesEquipment = filterEquipment === "all" || reservation.equipment_id === filterEquipment;
    const matchesSearch = searchTerm === "" || 
      reservation.equipment_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.purpose?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesEquipment && matchesSearch;
  });

  const openUpdateDialog = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setFormData({
      status: reservation.status,
      rejection_reason: "",
      notes: ""
    });
    setOpen(true);
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReservation) return;

    const updates: any = {
      status: formData.status
    };

    if (formData.status === 'rejected' && formData.rejection_reason) {
      updates.rejection_reason = formData.rejection_reason;
    }

    if (formData.notes) {
      updates.notes = formData.notes;
    }

    if (formData.status === 'approved' && currentUser?.role === 'admin') {
      updates.approved_by = currentUser.id;
    }

    handleUpdateReservation(selectedReservation.id, updates);
  };

  return (
    <div>
      <NavHeader 
        title="Reservations" 
        subtitle="Manage equipment reservations and waiting lists"
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
        <div className="flex justify-between items-center mb-8">
          <div className="flex gap-2">
            {currentUser?.role === 'admin' && (
              <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogTrigger asChild>
                  <Button>
                    Create Reservation
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Reservation</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateReservationSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="userName">Name</Label>
                        <Input
                          id="userName"
                          placeholder="Selected user name"
                          value={selectedUserName}
                          readOnly
                        />
                        <div className="mt-2">
                          <Label htmlFor="userSelect">Account</Label>
                          <Select
                            value={createForm.user_id}
                            onValueChange={(value) => {
                              setCreateForm(prev => ({ ...prev, user_id: value }));
                              const user = users.find(u => u.id === value);
                              if (user) {
                                const fullName = user.first_name && user.last_name
                                  ? `${user.first_name} ${user.last_name}`
                                  : user.first_name || user.last_name || user.email;
                                setSelectedUserName(fullName);
                              } else {
                                setSelectedUserName("");
                              }
                            }}
                          >
                            <SelectTrigger id="userSelect">
                              <SelectValue placeholder="Select account" />
                            </SelectTrigger>
                            <SelectContent>
                              {users.map((user) => (
                                <SelectItem key={user.id} value={user.id}>
                                  {user.first_name && user.last_name
                                    ? `${user.first_name} ${user.last_name} (${user.email})`
                                    : user.email}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="equipmentSelect">Item</Label>
                        <Select
                          value={createForm.equipment_id}
                          onValueChange={(value) => setCreateForm(prev => ({ ...prev, equipment_id: value }))}
                        >
                          <SelectTrigger id="equipmentSelect">
                            <SelectValue placeholder="Select item" />
                          </SelectTrigger>
                          <SelectContent>
                            {equipment.map((item) => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.name} ({item.quantity} available)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="reservation_date">Date</Label>
                        <Input
                          id="reservation_date"
                          type="date"
                          value={createForm.reservation_date}
                          onChange={(e) => setCreateForm(prev => ({ ...prev, reservation_date: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="start_time">Start Time</Label>
                        <Input
                          id="start_time"
                          type="time"
                          value={createForm.start_time}
                          onChange={(e) => setCreateForm(prev => ({ ...prev, start_time: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="end_time">End Time</Label>
                        <Input
                          id="end_time"
                          type="time"
                          value={createForm.end_time}
                          onChange={(e) => setCreateForm(prev => ({ ...prev, end_time: e.target.value }))}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input
                          id="quantity"
                          type="number"
                          min={1}
                          value={createForm.quantity}
                          onChange={(e) =>
                            setCreateForm(prev => ({
                              ...prev,
                              quantity: parseInt(e.target.value, 10) || 1
                            }))
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="purpose">Purpose</Label>
                        <Textarea
                          id="purpose"
                          value={createForm.purpose}
                          onChange={(e) => setCreateForm(prev => ({ ...prev, purpose: e.target.value }))}
                          placeholder="Brief description of how this equipment will be used"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit" disabled={creating}>
                        Create
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              onClick={() => setViewMode("list")}
            >
              List View
            </Button>
            <Button
              variant={viewMode === "calendar" ? "default" : "outline"}
              onClick={() => setViewMode("calendar")}
            >
              Calendar View
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handlePrintAllReservations}
              disabled={loading || filteredReservations.length === 0}
            >
              <Printer className="w-4 h-4 mr-2" />
              Print All
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (filteredReservations.length > 0) {
                  setSelectedReservationForView(filteredReservations[0]);
                  setViewModalOpen(true);
                }
              }}
              disabled={loading || filteredReservations.length === 0}
            >
              <Eye className="w-4 h-4 mr-2" />
              View Sample
            </Button>
            <Button
              variant="outline"
              onClick={() => setPdfModalOpen(true)}
              disabled={loading || filteredReservations.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Generate PDF
            </Button>
          </div>
        </div>

        {viewMode === "calendar" ? (
          <ReservationCalendar 
            equipment={equipment}
            currentUserId={currentUser?.id}
            currentUserRole={currentUser?.role}
            onReservationCreate={fetchData}
          />
        ) : (
          <Tabs defaultValue="reservations" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="reservations">Reservations</TabsTrigger>
              <TabsTrigger value="waiting-list">Waiting List</TabsTrigger>
            </TabsList>

            <TabsContent value="reservations">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Reservation Management
              </CardTitle>
              
              <div className="flex flex-wrap gap-4 mt-4">
                <div className="flex-1 min-w-[200px]">
                  <Input
                    placeholder="Search reservations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={filterEquipment} onValueChange={setFilterEquipment}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Equipment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Equipment</SelectItem>
                    {equipment.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button onClick={fetchData} variant="outline" size="icon">
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading reservations...</div>
              ) : filteredReservations.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[120px]">Reservation #</TableHead>
                        <TableHead className="w-[200px]">Equipment</TableHead>
                        <TableHead className="w-[150px]">User</TableHead>
                        <TableHead className="w-[100px]">Type</TableHead>
                        <TableHead className="w-[120px]">Date</TableHead>
                        <TableHead className="w-[140px]">Time</TableHead>
                        <TableHead className="w-[80px]">Quantity</TableHead>
                        <TableHead className="w-[100px]">Status</TableHead>
                        <TableHead className="w-[200px]">Purpose</TableHead>
                        <TableHead className="w-[120px]">Penalty</TableHead>
                        <TableHead className="w-[150px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredReservations.map((reservation) => (
                        <TableRow key={reservation.id}>
                          <TableCell className="font-medium">
                            {reservation.reservation_number || 'N/A'}
                          </TableCell>
                          <TableCell className="font-medium">
                            {reservation.equipment_name}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              <div>
                                <div>{reservation.user_name}</div>
                                {reservation.contact_info && (
                                  <div className="text-xs text-gray-500 flex items-center gap-1">
                                    <Phone className="w-3 h-3" />
                                    {reservation.contact_info}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {reservation.user_type || 'student'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {format(new Date(reservation.reservation_date), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              {reservation.start_time} - {reservation.end_time}
                            </div>
                          </TableCell>
                          <TableCell>{reservation.quantity_reserved}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(reservation.status)}>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(reservation.status)}
                                {reservation.status}
                              </div>
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {reservation.purpose || '-'}
                          </TableCell>
                          <TableCell>
                            {reservation.penalty_amount > 0 ? (
                              <div className="text-red-600 font-medium">
                                ${reservation.penalty_amount.toFixed(2)}
                                {!reservation.penalty_paid && (
                                  <div className="text-xs">Unpaid</div>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewReservation(reservation)}
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handlePrintReservation(reservation)}
                                title="Print"
                              >
                                <Printer className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleGeneratePDF(reservation.id)}
                                title="Download PDF"
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                              {currentUser?.role === 'admin' && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => openUpdateDialog(reservation)}
                                    title="Update"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleDeleteReservation(reservation.id)}
                                    title="Delete"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No reservations found
                </div>
              )}
            </CardContent>
          </Card>
            </TabsContent>

            <TabsContent value="waiting-list">
              <WaitingListManager 
                currentUserId={currentUser?.id}
                onEntryCreate={fetchData}
              />
            </TabsContent>
          </Tabs>
        )}

        {/* Update Reservation Dialog */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Reservation</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.status === 'rejected' && (
                <div>
                  <Label htmlFor="rejection_reason">Rejection Reason</Label>
                  <Textarea
                    id="rejection_reason"
                    value={formData.rejection_reason}
                    onChange={(e) => setFormData(prev => ({ ...prev, rejection_reason: e.target.value }))}
                    placeholder="Reason for rejection..."
                    required
                  />
                </div>
              )}

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes..."
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit">Update</Button>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

      {/* PDF Generation Modal */}
      <Dialog open={pdfModalOpen} onOpenChange={setPdfModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Generate PDF Report</DialogTitle>
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
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Equipment</Label>
              <Select
                value={pdfOptions.equipment}
                onValueChange={(value) => setPdfOptions({ ...pdfOptions, equipment: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Equipment</SelectItem>
                  {equipment.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="includePenalties"
                checked={pdfOptions.includePenalties}
                onChange={(e) => setPdfOptions({ ...pdfOptions, includePenalties: e.target.checked })}
              />
              <Label htmlFor="includePenalties">Include Penalty Column</Label>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setPdfModalOpen(false)}>
                Cancel
              </Button>
              <Button type="button" variant="secondary" onClick={() => generateReservationPDF(true)}>
                <Eye className="w-4 h-4 mr-2" />
                View PDF
              </Button>
              <Button onClick={() => generateReservationPDF(false)}>
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
              <DialogTitle>PDF Preview</DialogTitle>
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setViewPdfModalOpen(false)}
                >
                  Close
                </Button>
                <Button onClick={() => generateReservationPDF(false)}>
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          </DialogHeader>
          {pdfPreview && (
            <div className="p-6 bg-gray-100">
              <div className="flex justify-center">
                <div 
                  className="bg-white shadow-2xl"
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

      {/* View Reservation Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle>Reservation Details</DialogTitle>
              <div className="flex gap-2">
                {selectedReservationForView && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePrintReservation(selectedReservationForView)}
                    >
                      <Printer className="w-4 h-4 mr-2" />
                      Print
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleGeneratePDF(selectedReservationForView.id)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      PDF
                    </Button>
                  </>
                )}
              </div>
            </div>
          </DialogHeader>
          
          {selectedReservationForView && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Reservation Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reservation #:</span>
                      <span className="font-medium">{selectedReservationForView.reservation_number || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <Badge className={getStatusColor(selectedReservationForView.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(selectedReservationForView.status)}
                          {selectedReservationForView.status}
                        </div>
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date Created:</span>
                      <span className="font-medium">{new Date(selectedReservationForView.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-2">User Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{selectedReservationForView.user_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">User Type:</span>
                      <Badge variant="outline">{selectedReservationForView.user_type || 'student'}</Badge>
                    </div>
                    {selectedReservationForView.contact_info && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Contact:</span>
                        <span className="font-medium flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {selectedReservationForView.contact_info}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">Equipment Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Equipment:</span>
                      <span className="font-medium">{selectedReservationForView.equipment_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Quantity:</span>
                      <span className="font-medium">{selectedReservationForView.quantity_reserved}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">{format(new Date(selectedReservationForView.reservation_date), 'MMM d, yyyy')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time:</span>
                      <span className="font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {selectedReservationForView.start_time} - {selectedReservationForView.end_time}
                      </span>
                    </div>
                  </div>
                </div>
                {selectedReservationForView.purpose && (
                  <div className="mt-4">
                    <span className="text-gray-600">Purpose:</span>
                    <p className="mt-1 p-3 bg-gray-50 rounded-md text-sm">
                      {selectedReservationForView.purpose}
                    </p>
                  </div>
                )}
              </div>
              
              {selectedReservationForView.penalty_amount > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-2">Penalty Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Penalty Amount:</span>
                      <span className="font-medium text-red-600">${selectedReservationForView.penalty_amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Penalty Paid:</span>
                      <Badge variant={selectedReservationForView.penalty_paid ? "default" : "destructive"}>
                        {selectedReservationForView.penalty_paid ? 'Paid' : 'Unpaid'}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
              
              {selectedReservationForView.notes && (
                <div>
                  <h3 className="font-semibold text-lg mb-2">Additional Notes</h3>
                  <p className="p-3 bg-gray-50 rounded-md text-sm">
                    {selectedReservationForView.notes}
                  </p>
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

export default Reservations;
