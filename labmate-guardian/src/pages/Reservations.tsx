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
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
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
  
  // Admin borrow requests management state
  const [borrowRequests, setBorrowRequests] = useState<any[]>([]);
  const [borrowRequestsLoading, setBorrowRequestsLoading] = useState(true);
  const [selectedBorrowRequest, setSelectedBorrowRequest] = useState<any>(null);
  const [borrowRequestViewOpen, setBorrowRequestViewOpen] = useState(false);
  const [myBorrowRequests, setMyBorrowRequests] = useState<any[]>([]);
  const [myBorrowRequestsLoading, setMyBorrowRequestsLoading] = useState(true);
  const [userBorrowRequestViewOpen, setUserBorrowRequestViewOpen] = useState(false);
  
  // Borrow dialog state for Available Inventory tab
  const [borrowDialogOpen, setBorrowDialogOpen] = useState(false);
  const [borrowItem, setBorrowItem] = useState<any>(null);
  const [borrowForm, setBorrowForm] = useState({
    quantity: 1,
    return_date: "",
    message: "",
  });
  
  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [deleteType, setDeleteType] = useState<'reservation' | 'borrowRequest'>('reservation');
  
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
    start_time: "00:00",
    end_time: "23:59",
    quantity: 1,
    purpose: "",
    return_date: ""
  });
  const [createAvailability, setCreateAvailability] = useState<number | null>(null);
  const [createFullyCommitted, setCreateFullyCommitted] = useState(false);

  useEffect(() => {
    fetchData();
  }, [filterStatus, filterEquipment]);

  useEffect(() => {
    if (currentUser?.role === "admin") {
      fetchUsers();
    }
  }, [currentUser?.role]);

  // Load borrow requests for admins
  useEffect(() => {
    fetchBorrowRequests();
  }, [currentUser?.role]);

  // Load my borrow requests for regular users
  useEffect(() => {
    if (currentUser?.role && currentUser.role !== 'admin') {
      fetchMyBorrowRequests();
    }
  }, [currentUser?.role, currentUser?.id]);

  const fetchBorrowRequests = async () => {
    try {
      setBorrowRequestsLoading(true);
      const response = await fetch("http://localhost/labmate/labmate-guardian/api/borrow_requests.php");
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to fetch borrow requests");
      }
      setBorrowRequests((result.data || []).filter((r: any) => r.status !== 'approved'));
    } catch (err) {
      toast.error("Failed to fetch borrow requests");
    } finally {
      setBorrowRequestsLoading(false);
    }
  };

  const handlePrintAllBorrowRequestsAdmin = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const currentDate = new Date().toLocaleDateString();
      const rows = borrowRequests.map((r: any) => `
        <tr>
          <td>${r.borrower_name || '-'}</td>
          <td>${r.borrower_email || '-'}</td>
          <td>${r.item || '-'}</td>
          <td>${r.quantity ?? '-'}</td>
          <td>${r.request_date ? new Date(r.request_date).toLocaleDateString() : '-'}</td>
          <td>${r.return_date ? new Date(r.return_date).toLocaleDateString() : '-'}</td>
          <td>${(r.message || '').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>
          <td>${r.status}</td>
        </tr>
      `).join('');
      printWindow.document.write(`
        <html>
          <head>
            <title>Borrow Requests</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background: #f8f9fa; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Borrow Requests</h1>
              <p>Generated on ${currentDate}</p>
              <p>Total: ${borrowRequests.length}</p>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Borrower</th>
                  <th>Email</th>
                  <th>Item</th>
                  <th>Quantity</th>
                  <th>Request Date</th>
                  <th>Expected Return</th>
                  <th>Message</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
              </tbody>
            </table>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
      toast.success('Print dialog opened');
    }
  };

  const handleGenerateBorrowRequestsPDFAdmin = async () => {
    try {
      const el = document.createElement('div');
      el.style.width = '210mm';
      el.style.padding = '20mm';
      el.style.fontFamily = 'Arial, sans-serif';
      el.style.backgroundColor = 'white';
      el.style.boxSizing = 'border-box';
      let html = `
        <h2 style="text-align:center; margin-bottom: 16px;">Borrow Requests</h2>
        <table style="width:100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="border:1px solid #ddd; padding:8px; text-align:left;">Borrower</th>
              <th style="border:1px solid #ddd; padding:8px; text-align:left;">Email</th>
              <th style="border:1px solid #ddd; padding:8px; text-align:left;">Item</th>
              <th style="border:1px solid #ddd; padding:8px; text-align:left;">Qty</th>
              <th style="border:1px solid #ddd; padding:8px; text-align:left;">Request Date</th>
              <th style="border:1px solid #ddd; padding:8px; text-align:left;">Expected Return</th>
              <th style="border:1px solid #ddd; padding:8px; text-align:left;">Status</th>
            </tr>
          </thead>
          <tbody>
      `;
      borrowRequests.forEach((r: any) => {
        html += `
          <tr>
            <td style="border:1px solid #ddd; padding:8px;">${r.borrower_name || '-'}</td>
            <td style="border:1px solid #ddd; padding:8px;">${r.borrower_email || '-'}</td>
            <td style="border:1px solid #ddd; padding:8px;">${r.item || '-'}</td>
            <td style="border:1px solid #ddd; padding:8px;">${r.quantity ?? '-'}</td>
            <td style="border:1px solid #ddd; padding:8px;">${r.request_date ? new Date(r.request_date).toLocaleDateString() : '-'}</td>
            <td style="border:1px solid #ddd; padding:8px;">${r.return_date ? new Date(r.return_date).toLocaleDateString() : '-'}</td>
            <td style="border:1px solid #ddd; padding:8px;">${r.status}</td>
          </tr>
        `;
      });
      html += `</tbody></table>`;
      el.innerHTML = html;
      document.body.appendChild(el);
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, allowTaint: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let position = 0;
      let heightLeft = imgHeight;
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      document.body.removeChild(el);
      pdf.save(`borrow-requests-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('PDF generated successfully');
    } catch (e) {
      toast.error('Failed to generate PDF');
    }
  };

  const fetchMyBorrowRequests = async () => {
    try {
      setMyBorrowRequestsLoading(true);
      const response = await fetch("http://localhost/labmate/labmate-guardian/api/borrow_requests.php");
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to fetch borrow requests");
      }
      const uid = String(currentUser?.id || "");
      setMyBorrowRequests((result.data || []).filter((r: any) => String(r.created_by) === uid));
    } catch (err) {
      toast.error("Failed to fetch your borrow requests");
    } finally {
      setMyBorrowRequestsLoading(false);
    }
  };

  const handleApproveBorrowRequest = async (id: string) => {
    if (!confirm("Approve this borrow request?")) return;
    const original = [...borrowRequests];
    setBorrowRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' } : r));
    try {
      const body = { status: 'approved', approved_by: currentUser?.id, approved_at: new Date().toISOString() };
      const response = await fetch(`http://localhost/labmate/labmate-guardian/api/borrow_requests.php?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        setBorrowRequests(original);
        throw new Error(result.error || 'Failed to approve request');
      }
      toast.success('Borrow request approved successfully');
      fetchBorrowRequests();
    } catch (e: any) {
      setBorrowRequests(original);
      toast.error(e.message || 'Failed to approve request');
    }
  };

  const handleRejectBorrowRequest = async (id: string) => {
    const reason = prompt("Enter rejection reason (optional):") || "";
    try {
      const response = await fetch(`http://localhost/labmate/labmate-guardian/api/borrow_requests.php?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected', approved_by: currentUser?.id, approved_at: new Date().toISOString(), rejection_reason: reason })
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || 'Failed to reject request');
      toast.success('Borrow request rejected');
      fetchBorrowRequests();
    } catch (e: any) {
      toast.error(e.message || 'Failed to reject request');
    }
  };

  const handleDeleteBorrowRequest = (request: any) => {
    setItemToDelete(request);
    setDeleteType('borrowRequest');
    setDeleteDialogOpen(true);
  };

  const handleDeleteReservation = (reservation: any) => {
    setItemToDelete(reservation);
    setDeleteType('reservation');
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      if (deleteType === 'borrowRequest') {
        const response = await fetch(`http://localhost/labmate/labmate-guardian/api/borrow_requests.php?id=${itemToDelete.id}`, {
          method: 'DELETE'
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Failed to delete request');
        }

        toast.success('Request deleted successfully');
        fetchBorrowRequests();
      } else {
        const response = await fetch(`http://localhost/labmate/labmate-guardian/api/reservations.php?id=${itemToDelete.id}`, {
          method: 'DELETE'
        });

        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || "Failed to delete reservation");
        }

        toast.success("Reservation deleted successfully");
        fetchData();
      }
    } catch (error: any) {
      throw new Error(error.message || `Failed to delete ${deleteType === 'borrowRequest' ? 'request' : 'reservation'}`);
    }
  };

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

  const handlePrintAllBorrowRequests = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const currentDate = new Date().toLocaleDateString();
      const rows = filteredMyBorrowRequests.map((r: any) => `
        <tr>
          <td>${r.item || '-'}</td>
          <td>${r.quantity ?? '-'}</td>
          <td>${r.request_date ? new Date(r.request_date).toLocaleDateString() : '-'}</td>
          <td>${r.return_date ? new Date(r.return_date).toLocaleDateString() : '-'}</td>
          <td>${(r.message || '').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>
          <td>${r.status}</td>
        </tr>
      `).join('');
      printWindow.document.write(`
        <html>
          <head>
            <title>My Borrow Requests</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background: #f8f9fa; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>My Borrow Requests</h1>
              <p>Generated on ${currentDate}</p>
              <p>Total: ${filteredMyBorrowRequests.length}</p>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Quantity</th>
                  <th>Request Date</th>
                  <th>Expected Return</th>
                  <th>Message</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
              </tbody>
            </table>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
      toast.success('Print dialog opened');
    }
  };

  const handlePrintBorrowRequest = (request: any) => {
    const w = window.open('', '_blank');
    if (w) {
      w.document.write(`
        <html>
          <head>
            <title>Borrow Request ${request.id}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .section { margin-bottom: 12px; }
              .label { font-weight: bold; display: inline-block; width: 160px; }
            </style>
          </head>
          <body>
            <h2>Borrow Request Details</h2>
            <div class="section"><span class="label">Item:</span> ${request.item}</div>
            <div class="section"><span class="label">Quantity:</span> ${request.quantity}</div>
            <div class="section"><span class="label">Request Date:</span> ${request.request_date ? new Date(request.request_date).toLocaleDateString() : '-'}</div>
            <div class="section"><span class="label">Expected Return:</span> ${request.return_date ? new Date(request.return_date).toLocaleDateString() : '-'}</div>
            <div class="section"><span class="label">Status:</span> ${request.status}</div>
            <div class="section"><span class="label">Message:</span> ${(request.message || '-')}
            </div>
          </body>
        </html>
      `);
      w.document.close();
      w.print();
    }
  };

  const handleDownloadBorrowRequestPDF = async (request: any) => {
    try {
      const el = document.createElement('div');
      el.style.width = '210mm';
      el.style.padding = '20mm';
      el.style.fontFamily = 'Arial, sans-serif';
      el.style.backgroundColor = 'white';
      el.style.boxSizing = 'border-box';
      el.innerHTML = `
        <h2 style="text-align:center; margin-bottom: 16px;">Borrow Request</h2>
        <div style="margin-bottom: 8px;"><b>Item:</b> ${request.item}</div>
        <div style="margin-bottom: 8px;"><b>Quantity:</b> ${request.quantity}</div>
        <div style="margin-bottom: 8px;"><b>Request Date:</b> ${request.request_date ? new Date(request.request_date).toLocaleDateString() : '-'}</div>
        <div style="margin-bottom: 8px;"><b>Expected Return:</b> ${request.return_date ? new Date(request.return_date).toLocaleDateString() : '-'}</div>
        <div style="margin-bottom: 8px;"><b>Status:</b> ${request.status}</div>
        <div style="margin-bottom: 8px;"><b>Message:</b> ${(request.message || '-')}
        </div>
      `;
      document.body.appendChild(el);
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, allowTaint: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      document.body.removeChild(el);
      pdf.save(`borrow-request-${request.id}.pdf`);
      toast.success('PDF downloaded');
    } catch (e) {
      toast.error('Failed to generate PDF');
    }
  };

  const handleGenerateBorrowRequestsPDF = async () => {
    try {
      const el = document.createElement('div');
      el.style.width = '210mm';
      el.style.padding = '20mm';
      el.style.fontFamily = 'Arial, sans-serif';
      el.style.backgroundColor = 'white';
      el.style.boxSizing = 'border-box';
      let html = `
        <h2 style="text-align:center; margin-bottom: 16px;">My Borrow Requests</h2>
        <table style="width:100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="border:1px solid #ddd; padding:8px; text-align:left;">Item</th>
              <th style="border:1px solid #ddd; padding:8px; text-align:left;">Qty</th>
              <th style="border:1px solid #ddd; padding:8px; text-align:left;">Request Date</th>
              <th style="border:1px solid #ddd; padding:8px; text-align:left;">Expected Return</th>
              <th style="border:1px solid #ddd; padding:8px; text-align:left;">Status</th>
            </tr>
          </thead>
          <tbody>
      `;
      filteredMyBorrowRequests.forEach((r: any) => {
        html += `
          <tr>
            <td style="border:1px solid #ddd; padding:8px;">${r.item || '-'}</td>
            <td style="border:1px solid #ddd; padding:8px;">${r.quantity ?? '-'}</td>
            <td style="border:1px solid #ddd; padding:8px;">${r.request_date ? new Date(r.request_date).toLocaleDateString() : '-'}</td>
            <td style="border:1px solid #ddd; padding:8px;">${r.return_date ? new Date(r.return_date).toLocaleDateString() : '-'}</td>
            <td style="border:1px solid #ddd; padding:8px;">${r.status}</td>
          </tr>
        `;
      });
      html += `</tbody></table>`;
      el.innerHTML = html;
      document.body.appendChild(el);
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, allowTaint: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let position = 0;
      let heightLeft = imgHeight;
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      document.body.removeChild(el);
      pdf.save(`my-borrow-requests-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('PDF generated successfully');
    } catch (e) {
      toast.error('Failed to generate PDF');
    }
  };

  const handleViewReservation = (reservation: Reservation) => {
    setSelectedReservationForView(reservation);
    setViewModalOpen(true);
  };

  // Open borrow dialog for an equipment item
  const handleBorrowClick = (item: any) => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    const effective = getEffectiveAvailability(item);
    if (effective <= 0) {
      toast.error("This item is fully committed today");
      return;
    }
    setBorrowItem(item);
    setBorrowForm({ quantity: 1, return_date: "", message: "" });
    setBorrowDialogOpen(true);
  };

  // Submit borrow request
  const handleBorrowSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !borrowItem) {
      toast.error("User information not found");
      return;
    }
    const quantity = parseInt(String(borrowForm.quantity), 10);
    if (!quantity || quantity <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }
    const effective = getEffectiveAvailability(borrowItem);
    if (effective <= 0 || quantity > effective) {
      toast.error("Insufficient availability for this item");
      return;
    }
    const borrowerName = `${currentUser.first_name || ""} ${currentUser.last_name || ""}`.trim() || currentUser.email;
    const payload = {
      borrower_name: borrowerName,
      borrower_email: currentUser.email,
      item: borrowItem.name,
      quantity,
      request_date: new Date().toISOString().split("T")[0],
      return_date: borrowForm.return_date || null,
      message: borrowForm.message,
      created_by: currentUser.id,
    };
    try {
      const response = await fetch("http://localhost/labmate/labmate-guardian/api/borrow_requests.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to submit borrow request");
      }
      if (result.status === "waiting") {
        toast.success("Added to waiting list due to limited inventory");
      } else {
        toast.success("Borrow request submitted successfully");
      }

      // Auto-create a reservation to hold items for this account (same-day hold)
      try {
        const reservationPayload = {
          equipment_id: borrowItem.id,
          user_id: currentUser.id,
          reservation_date: new Date().toISOString().split("T")[0],
          start_time: "00:00",
          end_time: "23:59",
          quantity_reserved: quantity,
          purpose: borrowForm.message || `Auto-reserved for borrow request of ${borrowItem.name}`,
          user_type: mapRoleToUserType(currentUser.role || 'student')
        } as any;

        const reserveResp = await fetch("http://localhost/labmate/labmate-guardian/api/reservations.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reservationPayload)
        });
        const reserveResult = await reserveResp.json();
        if (!reserveResp.ok || !reserveResult.success) {
          console.warn("Auto-reservation failed:", reserveResult);
          // Non-blocking; user already has a request recorded
        } else {
          toast.success("Item reserved for your account while pending");
        }
      } catch (autoResErr) {
        console.warn("Auto-reservation error:", autoResErr);
      }
      setBorrowDialogOpen(false);
      setBorrowItem(null);
      setBorrowForm({ quantity: 1, return_date: "", message: "" });
      // Refresh my borrow requests list for the user
      try { await fetchMyBorrowRequests(); } catch {}
    } catch (error: any) {
      toast.error(error.message || "Failed to submit borrow request");
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

    const todayMidnight = new Date();
    todayMidnight.setHours(0, 0, 0, 0);
    const selectedMidnight = new Date(`${createForm.reservation_date}T00:00:00`);
    if (selectedMidnight < todayMidnight) {
      toast.error("You cannot create a reservation in the past.");
      return;
    }

    if (createForm.quantity <= 0) {
      toast.error("Quantity must be at least 1.");
      return;
    }

    const effAvail = computeAvailabilityForEquipment(createForm.equipment_id);
    if (effAvail <= 0 || createForm.quantity > effAvail) {
      toast.error(`Selected item is fully committed for the chosen time or exceeds availability (${Math.max(0, effAvail)}).`);
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
        const equipmentItemForBorrow = equipment.find((it) => String(it.id) === String(createForm.equipment_id));
        const selectedUserForBorrow = users.find((u) => String(u.id) === String(createForm.user_id));
        if (equipmentItemForBorrow && selectedUserForBorrow?.email) {
          const fullName = (selectedUserForBorrow.first_name && selectedUserForBorrow.last_name)
            ? `${selectedUserForBorrow.first_name} ${selectedUserForBorrow.last_name}`
            : (selectedUserForBorrow.first_name || selectedUserForBorrow.last_name || selectedUserForBorrow.email);
          const borrowPayload = {
            borrower_name: fullName,
            borrower_email: selectedUserForBorrow.email,
            item: equipmentItemForBorrow.name,
            quantity: createForm.quantity,
            request_date: createForm.reservation_date,
            return_date: createForm.return_date || null,
            message: createForm.purpose || `Reservation created by admin`,
            created_by: selectedUserForBorrow.id,
          } as any;
          try {
            const brResp = await fetch("http://localhost/labmate/labmate-guardian/api/borrow_requests.php", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(borrowPayload)
            });
            const brResult = await brResp.json();
            if (!brResp.ok || !brResult.success) {
              toast.error("Borrow request creation failed for the selected user");
            } else {
              toast.success("Borrow request recorded for selected user");
            }
          } catch (e) {
            toast.error("Borrow request creation failed for the selected user");
          }
        }
        setCreateOpen(false);
        setCreateForm({
          user_id: "",
          equipment_id: "",
          reservation_date: "",
          start_time: "00:00",
          end_time: "23:59",
          quantity: 1,
          purpose: "",
          return_date: ""
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

  const todayStr = new Date().toISOString().split('T')[0];
  const getEffectiveAvailability = (item: any) => {
    const stock = Number(item?.quantity ?? 0);
    const pendingBorrow = (borrowRequests || [])
      .filter((r: any) => r.status === 'pending' && r.item === item.name)
      .reduce((sum: number, r: any) => sum + (Number(r.quantity) || 0), 0);
    const todaysReserved = (reservations || [])
      .filter((r: any) => r.status === 'approved' && String(r.equipment_id) === String(item.id) && r.reservation_date === todayStr)
      .reduce((sum: number, r: any) => sum + (Number(r.quantity_reserved) || 0), 0);
    return stock - pendingBorrow - todaysReserved;
  };

  const timesOverlap = (aStart: string, aEnd: string, bStart: string, bEnd: string) => {
    return aStart < bEnd && aEnd > bStart;
  };

  const computeAvailabilityForEquipment = (equipmentId: string) => {
    const eq = equipment.find((e) => String(e.id) === String(equipmentId));
    if (!eq) return 0;
    const stock = Number(eq.quantity) || 0;
    const pendingBorrow = (borrowRequests || [])
      .filter((r: any) => r.status === 'pending' && r.item === eq.name)
      .reduce((sum: number, r: any) => sum + (Number(r.quantity) || 0), 0);
    const reservedSlot = (reservations || [])
      .filter((r: any) =>
        r.status === 'approved' &&
        String(r.equipment_id) === String(eq.id) &&
        r.reservation_date === createForm.reservation_date &&
        timesOverlap(r.start_time, r.end_time, createForm.start_time, createForm.end_time)
      )
      .reduce((sum: number, r: any) => sum + (Number(r.quantity_reserved) || 0), 0);
    return stock - pendingBorrow - reservedSlot;
  };

  useEffect(() => {
    if (!createForm.equipment_id || !createForm.reservation_date) {
      setCreateAvailability(null);
      setCreateFullyCommitted(false);
      return;
    }
    const eff = computeAvailabilityForEquipment(createForm.equipment_id);
    setCreateAvailability(eff);
    setCreateFullyCommitted(eff <= 0);
  }, [createForm.equipment_id, createForm.reservation_date, createForm.start_time, createForm.end_time, borrowRequests, reservations]);

  const filteredReservations = reservations.filter(reservation => {
    const isAdmin = currentUser?.role === 'admin';
    const matchesUser = isAdmin || String(reservation.user_id) === String(currentUser?.id);
    const matchesStatus = filterStatus === "all" || reservation.status === filterStatus;
    const matchesEquipment = filterEquipment === "all" || String(reservation.equipment_id) === String(filterEquipment);
    const matchesSearch = searchTerm === "" || 
      reservation.equipment_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.purpose?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (reservation.reservation_number && reservation.reservation_number.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesUser && matchesStatus && matchesEquipment && matchesSearch;
  }).sort((a, b) => {
    // Sort by date (newest first) and then by time
    const dateA = new Date(`${a.reservation_date}T${a.start_time}`);
    const dateB = new Date(`${b.reservation_date}T${b.start_time}`);
    return dateB.getTime() - dateA.getTime();
  });
  // Apply the same filters to the user's borrow requests list shown in "My Reservation"
  const filteredMyBorrowRequests = myBorrowRequests.filter((request: any) => {
    const matchesStatus = filterStatus === "all" || request.status === filterStatus;
    const matchesEquipment = (() => {
      if (filterEquipment === "all") return true;
      const eq = equipment.find((e) => String(e.id) === String(filterEquipment));
      // borrow requests store item name (string), match by name
      return eq ? request.item === eq.name : true;
    })();
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch = term === "" || [
      request.item,
      request.borrower_name,
      request.borrower_email,
      request.message,
    ].some((v: any) => v?.toString().toLowerCase().includes(term));
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
                          onValueChange={(value) => {
                            setCreateForm(prev => ({ ...prev, equipment_id: value }));
                            const eff = computeAvailabilityForEquipment(value);
                            setCreateAvailability(eff);
                            setCreateFullyCommitted(eff <= 0);
                            if (eff <= 0) {
                              toast.error("Selected item is fully committed for the chosen time");
                            }
                          }}
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
                        {createAvailability !== null && (
                          <div className="mt-1 text-xs">
                            {createAvailability <= 0 ? (
                              <span className="text-red-600">Fully committed for selected date/time</span>
                            ) : (
                              <span className="text-gray-500">Available in selected slot: {createAvailability}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label htmlFor="return_date">Expected Return Date</Label>
                        <Input
                          id="return_date"
                          type="date"
                          value={createForm.return_date}
                          onChange={(e) => setCreateForm(prev => ({ ...prev, return_date: e.target.value }))}
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
                          max={createAvailability && createAvailability > 0 ? createAvailability : undefined}
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
                      <Button type="submit" disabled={creating || (createAvailability !== null && (createAvailability <= 0 || createForm.quantity > createAvailability))}>
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
        </div>

        {viewMode === "calendar" ? (
          <ReservationCalendar 
            equipment={equipment}
            currentUserId={currentUser?.id}
            currentUserRole={currentUser?.role}
            onReservationCreate={fetchData}
          />
        ) : (
          <Tabs defaultValue={currentUser?.role === 'admin' ? 'reservations' : 'available-inventory'} className="space-y-6">
            <TabsList className={`grid w-full grid-cols-3`}>
              <TabsTrigger value="available-inventory">Available Inventory</TabsTrigger>
              <TabsTrigger value="reservations">Reservations</TabsTrigger>
              <TabsTrigger value="waiting-list">Waiting List</TabsTrigger>
            </TabsList>

            <TabsContent value="available-inventory">
          <Card>
                  <CardHeader>
                    <CardTitle>Available Inventory</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {equipment.filter((e) => (e?.quantity ?? 0) > 0).length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {equipment
                          .filter((e) => (e?.quantity ?? 0) > 0)
                          .map((item) => (
                            <div key={item.id} className={`border rounded-lg p-4 hover:shadow-md transition-shadow bg-white ${getEffectiveAvailability(item) <= 0 ? 'border-red-300 bg-red-50' : ''}`}>
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex-1">
                                  <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                                  <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                    {item.category}
                                  </span>
                                </div>
                                <div className="pl-2 pt-1">
                                  {getEffectiveAvailability(item) <= 0 && (
                                    <Badge variant="destructive">Fully committed</Badge>
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
                                    <span className="font-medium text-gray-700">Price:</span>
                                    <span className="ml-1 text-gray-600">${item.price ? (typeof item.price === 'number' ? item.price.toFixed(2) : parseFloat(item.price).toFixed(2)) : '0.00'}</span>
                                  </div>
                                  <div>
                                    <span className="font-medium text-gray-700">Condition:</span>
                                    <span className="ml-1 text-gray-600">{item.condition || 'N/A'}</span>
                                  </div>
                                  <div>
                                    <span className="font-medium text-gray-700">Assigned:</span>
                                    <span className="ml-1 text-gray-600">{item.assigned_to || 'Unassigned'}</span>
                                  </div>
                                </div>
                                {item.serial_number && (
                                  <div className="text-xs">
                                    <span className="font-medium text-gray-700">Serial:</span>
                                    <span className="ml-1 text-gray-600 font-mono">{item.serial_number}</span>
                                  </div>
                                )}
                                <div className="text-xs text-gray-500 pt-2 border-t">
                                  Added: {item.date ? new Date(item.date).toLocaleDateString() : ''}
                                </div>
                                <div className="mt-3 flex justify-end">
                                  {getEffectiveAvailability(item) <= 0 ? (
                                    <Button size="sm" variant="destructive" disabled>
                                      Fully committed
                                    </Button>
                                  ) : (
                                    <Button size="sm" onClick={() => handleBorrowClick(item)}>
                                      Borrow
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">No available inventory</div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

            <TabsContent value="reservations">
          {currentUser?.role !== 'admin' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                My Reservation
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
            
            <CardContent></CardContent>
          </Card>
          )}
          {currentUser?.role !== 'admin' && (
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {myBorrowRequestsLoading && <span className="text-xs text-muted-foreground">Loading...</span>}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handlePrintAllBorrowRequests}
                      disabled={myBorrowRequestsLoading || filteredMyBorrowRequests.length === 0}
                    >
                      <Printer className="w-4 h-4 mr-2" />
                      Print All
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setUserBorrowRequestViewOpen(true)}
                      disabled={myBorrowRequestsLoading || filteredMyBorrowRequests.length === 0}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View All
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleGenerateBorrowRequestsPDF}
                      disabled={myBorrowRequestsLoading || filteredMyBorrowRequests.length === 0}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Generate PDF
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Request Date</TableHead>
                        <TableHead>Expected Return</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {myBorrowRequestsLoading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center">Loading...</TableCell>
                        </TableRow>
                      ) : filteredMyBorrowRequests.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground">You have no borrow requests.</TableCell>
                        </TableRow>
                      ) : (
                        filteredMyBorrowRequests.map((request) => (
                          <TableRow key={request.id}>
                            <TableCell className="font-medium">{request.item}</TableCell>
                            <TableCell>{request.quantity}</TableCell>
                            <TableCell>{new Date(request.request_date).toLocaleDateString()}</TableCell>
                            <TableCell>{request.return_date ? new Date(request.return_date).toLocaleDateString() : 'N/A'}</TableCell>
                            <TableCell>
                              <div className="max-w-xs truncate" title={request.message || 'No message provided'}>
                                {request.message || 'No message'}
                              </div>
                            </TableCell>
                            <TableCell>
                              {request.status === 'pending' && (
                                <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">Pending Approval</Badge>
                              )}
                              {request.status === 'approved' && (
                                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Approved</Badge>
                              )}
                              {request.status === 'rejected' && (
                                <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right space-x-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => { setSelectedBorrowRequest(request); setUserBorrowRequestViewOpen(true); }}
                                title="View details"
                              >
                                <Eye className="w-4 h-4 text-blue-600" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handlePrintBorrowRequest(request)}
                                title="Print"
                              >
                                <Printer className="w-4 h-4 text-gray-700" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDownloadBorrowRequestPDF(request)}
                                title="Download PDF"
                              >
                                <Download className="w-4 h-4 text-gray-700" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* User View Details Modal */}
                <Dialog open={userBorrowRequestViewOpen} onOpenChange={setUserBorrowRequestViewOpen}>
                  <DialogContent className="max-w-6xl">
                    <DialogHeader>
                      <DialogTitle>All My Borrow Requests</DialogTitle>
                    </DialogHeader>
                    <div className="border rounded-lg overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Item</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Request Date</TableHead>
                            <TableHead>Expected Return</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredMyBorrowRequests.map((request) => (
                            <TableRow key={request.id}>
                              <TableCell className="font-medium">{request.item}</TableCell>
                              <TableCell>{request.quantity}</TableCell>
                              <TableCell>{new Date(request.request_date).toLocaleDateString()}</TableCell>
                              <TableCell>{request.return_date ? new Date(request.return_date).toLocaleDateString() : 'N/A'}</TableCell>
                              <TableCell>
                                {request.status === 'pending' && (
                                  <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">Pending</Badge>
                                )}
                                {request.status === 'approved' && (
                                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Approved</Badge>
                                )}
                                {request.status === 'rejected' && (
                                  <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-right space-x-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setSelectedBorrowRequest(request);
                                    setUserBorrowRequestViewOpen(false);
                                    setTimeout(() => setUserBorrowRequestViewOpen(true), 100);
                                  }}
                                  title="View details"
                                >
                                  <Eye className="w-4 h-4 text-blue-600" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handlePrintBorrowRequest(request)}
                                  title="Print"
                                >
                                  <Printer className="w-4 h-4 text-gray-700" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDownloadBorrowRequestPDF(request)}
                                  title="Download PDF"
                                >
                                  <Download className="w-4 h-4 text-gray-700" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    {selectedBorrowRequest && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-semibold text-sm text-muted-foreground">Borrower Information</h4>
                            <div className="mt-2 space-y-1">
                              <p><span className="font-medium">Name:</span> {selectedBorrowRequest.borrower_name || currentUser?.first_name}</p>
                              <p><span className="font-medium">Email:</span> {selectedBorrowRequest.borrower_email || currentUser?.email}</p>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm text-muted-foreground">Request Status</h4>
                            <div className="mt-2">
                              {selectedBorrowRequest.status === 'pending' && (
                                <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">Pending Approval</Badge>
                              )}
                              {selectedBorrowRequest.status === 'approved' && (
                                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Approved</Badge>
                              )}
                              {selectedBorrowRequest.status === 'rejected' && (
                                <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-sm text-muted-foreground">Item Details</h4>
                          <div className="mt-2 grid grid-cols-3 gap-4">
                            <div>
                              <p><span className="font-medium">Item:</span> {selectedBorrowRequest.item}</p>
                            </div>
                            <div>
                              <p><span className="font-medium">Quantity:</span> {selectedBorrowRequest.quantity}</p>
                            </div>
                            <div>
                              <p><span className="font-medium">Request Date:</span> {selectedBorrowRequest.request_date ? new Date(selectedBorrowRequest.request_date).toLocaleDateString() : 'N/A'}</p>
                            </div>
                          </div>
                        </div>

                        {selectedBorrowRequest.return_date && (
                          <div>
                            <h4 className="font-semibold text-sm text-muted-foreground">Expected Return</h4>
                            <p className="mt-1">{new Date(selectedBorrowRequest.return_date).toLocaleDateString()}</p>
                          </div>
                        )}

                        <div>
                          <h4 className="font-semibold text-sm text-muted-foreground">Purpose / Message</h4>
                          <div className="mt-2 p-3 bg-muted rounded-lg">
                            <p className="whitespace-pre-wrap">{selectedBorrowRequest.message || 'No message provided'}</p>
                          </div>
                        </div>

                        <div className="flex justify-between pt-4 border-t">
                          <div className="text-sm text-muted-foreground">
                            <p>Request ID: {selectedBorrowRequest.id}</p>
                            <p>Created: {selectedBorrowRequest.created_at ? new Date(selectedBorrowRequest.created_at).toLocaleString() : 'N/A'}</p>
                          </div>
                          <div className="space-x-2">
                            <Button size="sm" variant="outline" onClick={() => handlePrintBorrowRequest(selectedBorrowRequest)}>
                              <Printer className="w-4 h-4 mr-2" />
                              Print
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDownloadBorrowRequestPDF(selectedBorrowRequest)}>
                              <Download className="w-4 h-4 mr-2" />
                              PDF
                            </Button>
                            <Button size="sm" variant="default" onClick={() => setUserBorrowRequestViewOpen(false)}>
                              Close
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          )}

          {currentUser?.role === 'admin' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Reservation Management
                </CardTitle>
              </div>
              
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
                <div>
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
                                    onClick={() => handleDeleteReservation(reservation)}
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
                </div>
              ) : null}
            </CardContent>
          </Card>
          )}

          {currentUser?.role === 'admin' && (
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    Reservations
                    {borrowRequestsLoading && <span className="text-xs text-muted-foreground">Loading...</span>}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handlePrintAllBorrowRequestsAdmin}
                      disabled={borrowRequestsLoading || borrowRequests.length === 0}
                    >
                      <Printer className="w-4 h-4 mr-2" />
                      Print All
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setBorrowRequestViewOpen(true)}
                      disabled={borrowRequestsLoading || borrowRequests.length === 0}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View All
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleGenerateBorrowRequestsPDFAdmin}
                      disabled={borrowRequestsLoading || borrowRequests.length === 0}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Generate PDF
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Borrower</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Request Date</TableHead>
                        <TableHead>Expected Return</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {borrowRequestsLoading ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center">Loading...</TableCell>
                        </TableRow>
                      ) : borrowRequests.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center text-muted-foreground">No borrow requests found.</TableCell>
                        </TableRow>
                      ) : (
                        borrowRequests.map((request) => (
                          <TableRow key={request.id}>
                            <TableCell className="font-medium">{request.borrower_name}</TableCell>
                            <TableCell>{request.borrower_email}</TableCell>
                            <TableCell>{request.item}</TableCell>
                            <TableCell>{request.quantity}</TableCell>
                            <TableCell>{new Date(request.request_date).toLocaleDateString()}</TableCell>
                            <TableCell>{request.return_date ? new Date(request.return_date).toLocaleDateString() : 'N/A'}</TableCell>
                            <TableCell>
                              <div className="max-w-xs truncate" title={request.message || 'No message provided'}>
                                {request.message || 'No message'}
                              </div>
                            </TableCell>
                            <TableCell>
                              {request.status === 'pending' && (
                                <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">Pending Approval</Badge>
                              )}
                              {request.status === 'approved' && (
                                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Approved</Badge>
                              )}
                              {request.status === 'rejected' && (
                                <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                              <Button size="sm" variant="ghost" onClick={() => { setSelectedBorrowRequest(request); setBorrowRequestViewOpen(true); }} title="View details">
                                <Eye className="w-4 h-4 text-blue-600" />
                              </Button>
                              {request.status === 'pending' && (
                                <>
                                  <Button size="sm" variant="ghost" onClick={() => handleApproveBorrowRequest(request.id)} title="Approve request">
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                  </Button>
                                  <Button size="sm" variant="ghost" onClick={() => handleRejectBorrowRequest(request.id)} title="Reject request">
                                    <XCircle className="w-4 h-4 text-red-600" />
                                  </Button>
                                </>
                              )}
                              <Button size="sm" variant="ghost" onClick={() => handleDeleteBorrowRequest(request)} title="Delete request">
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* View Details Modal */}
                <Dialog open={borrowRequestViewOpen} onOpenChange={setBorrowRequestViewOpen}>
                  <DialogContent className="max-w-6xl max-h-[80vh] flex flex-col">
                    <DialogHeader>
                      <DialogTitle>All Borrow Requests</DialogTitle>
                      <p className="text-sm text-muted-foreground">
                        View and manage all equipment borrow requests. You can approve, reject, or view details of each request.
                      </p>
                    </DialogHeader>
                    <div className="border rounded-lg overflow-hidden flex-1 flex flex-col">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Borrower</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Item</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Request Date</TableHead>
                            <TableHead>Expected Return</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {borrowRequests.map((request) => (
                            <TableRow key={request.id}>
                              <TableCell className="font-medium">{request.borrower_name || 'N/A'}</TableCell>
                              <TableCell>{request.borrower_email || 'N/A'}</TableCell>
                              <TableCell>{request.item}</TableCell>
                              <TableCell>{request.quantity}</TableCell>
                              <TableCell>{new Date(request.request_date).toLocaleDateString()}</TableCell>
                              <TableCell>{request.return_date ? new Date(request.return_date).toLocaleDateString() : 'N/A'}</TableCell>
                              <TableCell>
                                {request.status === 'pending' && (
                                  <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">Pending</Badge>
                                )}
                                {request.status === 'approved' && (
                                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Approved</Badge>
                                )}
                                {request.status === 'rejected' && (
                                  <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-right space-x-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setSelectedBorrowRequest(request);
                                    setBorrowRequestViewOpen(false);
                                    setTimeout(() => setBorrowRequestViewOpen(true), 100);
                                  }}
                                  title="View details"
                                >
                                  <Eye className="w-4 h-4 text-blue-600" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handlePrintBorrowRequest(request)}
                                  title="Print"
                                >
                                  <Printer className="w-4 h-4 text-gray-700" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDownloadBorrowRequestPDF(request)}
                                  title="Download PDF"
                                >
                                  <Download className="w-4 h-4 text-gray-700" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    {selectedBorrowRequest && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-semibold text-sm text-muted-foreground">Borrower Information</h4>
                            <div className="mt-2 space-y-1">
                              <p><span className="font-medium">Name:</span> {selectedBorrowRequest.borrower_name}</p>
                              <p><span className="font-medium">Email:</span> {selectedBorrowRequest.borrower_email}</p>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm text-muted-foreground">Request Status</h4>
                            <div className="mt-2">
                              {selectedBorrowRequest.status === 'pending' && (
                                <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">Pending Approval</Badge>
                              )}
                              {selectedBorrowRequest.status === 'approved' && (
                                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Approved</Badge>
                              )}
                              {selectedBorrowRequest.status === 'rejected' && (
                                <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-sm text-muted-foreground">Item Details</h4>
                          <div className="mt-2 grid grid-cols-3 gap-4">
                            <div>
                              <p><span className="font-medium">Item:</span> {selectedBorrowRequest.item}</p>
                            </div>
                            <div>
                              <p><span className="font-medium">Quantity:</span> {selectedBorrowRequest.quantity}</p>
                            </div>
                            <div>
                              <p><span className="font-medium">Request Date:</span> {new Date(selectedBorrowRequest.request_date).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>

                        {selectedBorrowRequest.return_date && (
                          <div>
                            <h4 className="font-semibold text-sm text-muted-foreground">Expected Return</h4>
                            <p className="mt-1">{new Date(selectedBorrowRequest.return_date).toLocaleDateString()}</p>
                          </div>
                        )}

                        <div>
                          <h4 className="font-semibold text-sm text-muted-foreground">Purpose / Message</h4>
                          <div className="mt-2 p-3 bg-muted rounded-lg">
                            <p className="whitespace-pre-wrap">{selectedBorrowRequest.message || 'No message provided'}</p>
                          </div>
                        </div>

                        {selectedBorrowRequest.rejection_reason && (
                          <div>
                            <h4 className="font-semibold text-sm text-muted-foreground">Rejection Reason</h4>
                            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                              <p className="text-red-800">{selectedBorrowRequest.rejection_reason}</p>
                            </div>
                          </div>
                        )}

                        <div className="flex justify-between pt-4 border-t">
                          <div className="text-sm text-muted-foreground">
                            <p>Request ID: {selectedBorrowRequest.id}</p>
                            <p>Created: {selectedBorrowRequest.created_at ? new Date(selectedBorrowRequest.created_at).toLocaleString() : 'N/A'}</p>
                          </div>
                          <div className="space-x-2">
                            {selectedBorrowRequest.status === 'pending' && (
                              <>
                                <Button size="sm" onClick={() => { handleApproveBorrowRequest(selectedBorrowRequest.id); setBorrowRequestViewOpen(false); }} className="bg-green-600 hover:bg-green-700">
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Approve
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => { handleRejectBorrowRequest(selectedBorrowRequest.id); setBorrowRequestViewOpen(false); }}>
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Reject
                                </Button>
                              </>
                            )}
                            <Button size="sm" variant="outline" onClick={() => setBorrowRequestViewOpen(false)}>Close</Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          )}
          
            </TabsContent>

            <TabsContent value="waiting-list">
              <WaitingListManager 
                currentUserId={currentUser?.id}
                onEntryCreate={fetchData}
              />
            </TabsContent>
          </Tabs>
        )}

        <Dialog open={borrowDialogOpen} onOpenChange={setBorrowDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Borrow Item</DialogTitle>
            </DialogHeader>
            {borrowItem && (
              <form onSubmit={handleBorrowSubmit} className="space-y-4">
                <div>
                  <div className="font-medium">{borrowItem.name}</div>
                  <div className="text-sm text-muted-foreground">
                    Available today: {getEffectiveAvailability(borrowItem)}
                  </div>
                </div>

                <div>
                  <Label htmlFor="borrow_quantity">Quantity</Label>
                  <Input
                    id="borrow_quantity"
                    type="number"
                    min={1}
                    max={Math.max(1, getEffectiveAvailability(borrowItem))}
                    value={borrowForm.quantity}
                    onChange={(e) =>
                      setBorrowForm({
                        ...borrowForm,
                        quantity: parseInt(e.target.value || '1', 10),
                      })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="borrow_return_date">Expected Return Date</Label>
                  <Input
                    id="borrow_return_date"
                    type="date"
                    value={borrowForm.return_date}
                    onChange={(e) => setBorrowForm({ ...borrowForm, return_date: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="borrow_message">Message / Purpose</Label>
                  <Textarea
                    id="borrow_message"
                    value={borrowForm.message}
                    onChange={(e) => setBorrowForm({ ...borrowForm, message: e.target.value })}
                    placeholder={`Why do you need ${borrowItem.name}?`}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setBorrowDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Submit Request</Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>

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

      {/* Borrow Dialog for Available Inventory */}
      <Dialog open={borrowDialogOpen} onOpenChange={setBorrowDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Borrow Equipment</DialogTitle>
          </DialogHeader>
          {borrowItem && (
            <form onSubmit={handleBorrowSubmit} className="space-y-4">
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-700">Item</Label>
                <p className="text-sm text-gray-900">{borrowItem.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="borrow-quantity">Quantity</Label>
                  <Input
                    id="borrow-quantity"
                    type="number"
                    min={1}
                    value={borrowForm.quantity}
                    onChange={(e) => setBorrowForm({ ...borrowForm, quantity: Number(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="borrow-return-date">Expected Return Date</Label>
                  <Input
                    id="borrow-return-date"
                    type="date"
                    value={borrowForm.return_date}
                    onChange={(e) => setBorrowForm({ ...borrowForm, return_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="borrow-message">Purpose / Message</Label>
                <Textarea
                  id="borrow-message"
                  value={borrowForm.message}
                  onChange={(e) => setBorrowForm({ ...borrowForm, message: e.target.value })}
                  placeholder="Describe how you will use this equipment"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setBorrowDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Submit Request</Button>
              </div>
            </form>
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
        itemName={
          deleteType === 'borrowRequest' 
            ? itemToDelete?.item 
            : itemToDelete?.equipment_name || itemToDelete?.reservation_number
        }
        requirePassword={currentUser?.role === 'admin'}
        currentUser={currentUser}
      />

      </div>
    </div>
  );
};

export default Reservations;
