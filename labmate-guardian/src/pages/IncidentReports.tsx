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
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";



const IncidentReports = () => {
  const navigate = useNavigate();
  
  // Get user data first
  const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const currentUser = storedUser ? JSON.parse(storedUser) : null;
  
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<any>(null);
  const [viewingReport, setViewingReport] = useState<any>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [editingComment, setEditingComment] = useState<any>(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  
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
    name: "",
    description: "",
    incident_type: "",
    severity: "medium",
    location: "",
    reported_by: `${currentUser?.first_name || ""} ${currentUser?.last_name || ""} (${currentUser?.role === 'user' ? 'student' : currentUser?.role || 'user'})`.trim(),
    hardware_type: "",
    hardware_damage: "",
    software_type: "",
    software_issue: "",
    network_type: "",
    network_issue: "",
    security_type: "",
    security_details: "",
    facility_type: "",
    facility_issue: "",
    timestamp: new Date().toISOString()
  });

  useEffect(() => {
    // Try to fetch if we have user data (either from currentUser or localStorage)
    if (currentUser || getUserData()) {
      fetchReports();
    }
  }, [currentUser]);

  const fetchReports = async () => {
    try {
      const response = await fetch("http://localhost/labmate/labmate-guardian/api/incident_reports.php", {
        headers: getAuthHeaders()
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to fetch incident reports");
      }

      setReports(result.data || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch incident reports");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.description || !formData.incident_type || !formData.reported_by) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const url = editingReport 
        ? `http://localhost/labmate/labmate-guardian/api/incident_reports.php?id=${editingReport.id}`
        : "http://localhost/labmate/labmate-guardian/api/incident_reports.php";
      
      const method = editingReport ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to save incident report");
      }

      toast.success(`Incident report ${editingReport ? "updated" : "created"} successfully`);
      resetForm();
      setOpen(false);
      fetchReports();
    } catch (error: any) {
      toast.error(error.message || "Failed to save incident report");
    }
  };

  const handleDelete = (report: any) => {
    setItemToDelete(report);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      const response = await fetch(`http://localhost/labmate/labmate-guardian/api/incident_reports.php?id=${itemToDelete.id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete incident report");
      }

      toast.success("Incident report deleted successfully");
      fetchReports();
    } catch (error: any) {
      throw new Error(error.message || "Failed to delete incident report");
    }
  };

  const resetForm = () => {
    const user = getUserData();
    setFormData({
      name: "",
      description: "",
      incident_type: "",
      severity: "medium",
      location: "",
      reported_by: `${user?.first_name || ""} ${user?.last_name || ""} (${user?.role === 'user' ? 'student' : user?.role || 'user'})`.trim(),
      hardware_type: "",
      hardware_damage: "",
      software_type: "",
      software_issue: "",
      network_type: "",
      network_issue: "",
      security_type: "",
      security_details: "",
      facility_type: "",
      facility_issue: "",
      timestamp: new Date().toISOString()
    });
    setEditingReport(null);
  };

  const handleEdit = (report: any) => {
    setEditingReport(report);
    setFormData({
      name: report.name || report.title || "",
      description: report.description || "",
      incident_type: report.incident_type || "",
      severity: report.severity || "medium",
      location: report.location || "",
      reported_by: report.reported_by || "",
      hardware_type: report.hardware_type || "",
      hardware_damage: report.hardware_damage || "",
      software_type: report.software_type || "",
      software_issue: report.software_issue || "",
      network_type: report.network_type || "",
      network_issue: report.network_issue || "",
      security_type: report.security_type || "",
      security_details: report.security_details || "",
      facility_type: report.facility_type || "",
      facility_issue: report.facility_issue || "",
      timestamp: report.timestamp || new Date().toISOString()
    });
    setOpen(true);
  };

  const handleView = (report: any) => {
    setViewingReport(report);
    setViewOpen(true);
    fetchComments(report.id);
  };

  const canEditReport = (report: any) => {
    const user = getUserData();
    // Only users can edit their own reports (admins cannot edit)
    const reporterName = user?.first_name + " " + user?.last_name;
    return report.reported_by === reporterName || report.reported_by === user?.email;
  };

  const canDeleteReport = (report: any) => {
    const user = getUserData();
    // Admin can delete any report
    if (user?.role === 'admin') return true;
    
    // User can delete their own reports
    const reporterName = user?.first_name + " " + user?.last_name;
    return report.reported_by === reporterName || report.reported_by === user?.email;
  };

  const fetchComments = async (incidentId: string) => {
    setLoadingComments(true);
    try {
      const response = await fetch(`http://localhost/labmate/labmate-guardian/api/incident_comments.php?incident_id=${incidentId}`, {
        headers: getAuthHeaders()
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to fetch comments");
      }

      setComments(result.data || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch comments");
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    try {
      const response = await fetch("http://localhost/labmate/labmate-guardian/api/incident_comments.php", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          incident_id: viewingReport.id,
          message: newComment,
          update_type: "comment"
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to add comment");
      }

      toast.success("Comment added successfully");
      setNewComment("");
      fetchComments(viewingReport.id);
    } catch (error: any) {
      toast.error(error.message || "Failed to add comment");
    }
  };

  const isAdmin = () => {
    const user = getUserData();
    return user?.role === 'admin';
  };

  const canEditComment = (comment: any) => {
    const user = getUserData();
    return isAdmin() && comment.updated_by === user?.id;
  };

  const handleEditComment = (comment: any) => {
    setEditingComment(comment);
    setEditCommentText(comment.message);
  };

  const handleSaveEditComment = async () => {
    if (!editCommentText.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    try {
      const response = await fetch(`http://localhost/labmate/labmate-guardian/api/incident_comments.php?id=${editingComment.id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          message: editCommentText
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to update comment");
      }

      toast.success("Comment updated successfully");
      setEditingComment(null);
      setEditCommentText("");
      fetchComments(viewingReport.id);
    } catch (error: any) {
      toast.error(error.message || "Failed to update comment");
    }
  };

  const handleCancelEditComment = () => {
    setEditingComment(null);
    setEditCommentText("");
  };

  return (
    <div>
      <NavHeader 
        title="Incident Reports" 
        subtitle="Track and manage laboratory incidents"
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
                New Incident Report
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingReport ? "Edit" : "Create"} Incident Report</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Incident Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Broken Computer Monitor"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="incident_type">Incident Type *</Label>
                    <Select value={formData.incident_type} onValueChange={(value) => setFormData({ ...formData, incident_type: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select incident type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hardware">Hardware Issue</SelectItem>
                        <SelectItem value="software">Software Issue</SelectItem>
                        <SelectItem value="network">Network Issue</SelectItem>
                        <SelectItem value="security">Security Incident</SelectItem>
                        <SelectItem value="facility">Facility Issue</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Hardware-specific fields - only show when hardware is selected */}
                  {formData.incident_type === "hardware" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="hardware_type">Hardware Type *</Label>
                        <Select value={formData.hardware_type} onValueChange={(value) => setFormData({ ...formData, hardware_type: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select hardware type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="computer">Computer</SelectItem>
                            <SelectItem value="monitor">Monitor</SelectItem>
                            <SelectItem value="keyboard">Keyboard</SelectItem>
                            <SelectItem value="mouse">Mouse</SelectItem>
                            <SelectItem value="printer">Printer</SelectItem>
                            <SelectItem value="scanner">Scanner</SelectItem>
                            <SelectItem value="projector">Projector</SelectItem>
                            <SelectItem value="router">Router</SelectItem>
                            <SelectItem value="switch">Network Switch</SelectItem>
                            <SelectItem value="cable">Cable/Wiring</SelectItem>
                            <SelectItem value="other">Other Hardware</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="hardware_damage">Damage Description *</Label>
                        <Input
                          id="hardware_damage"
                          value={formData.hardware_damage}
                          onChange={(e) => setFormData({ ...formData, hardware_damage: e.target.value })}
                          placeholder="e.g. Screen cracked, Not powering on, Keys not working"
                          required={formData.incident_type === "hardware"}
                        />
                      </div>
                    </>
                  )}
                  
                  {/* Software-specific fields */}
                  {formData.incident_type === "software" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="software_type">Software Type *</Label>
                        <Select value={formData.software_type} onValueChange={(value) => setFormData({ ...formData, software_type: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select software type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="operating_system">Operating System</SelectItem>
                            <SelectItem value="application">Application Software</SelectItem>
                            <SelectItem value="browser">Web Browser</SelectItem>
                            <SelectItem value="antivirus">Antivirus/Security</SelectItem>
                            <SelectItem value="office">Office Suite</SelectItem>
                            <SelectItem value="database">Database</SelectItem>
                            <SelectItem value="development">Development Tools</SelectItem>
                            <SelectItem value="driver">Driver Issue</SelectItem>
                            <SelectItem value="update">Update/Patch Issue</SelectItem>
                            <SelectItem value="license">License/Activation</SelectItem>
                            <SelectItem value="other">Other Software</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="software_issue">Issue Type *</Label>
                        <Select value={formData.software_issue} onValueChange={(value) => setFormData({ ...formData, software_issue: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select issue type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="crash">Application Crash</SelectItem>
                            <SelectItem value="freeze">System Freeze</SelectItem>
                            <SelectItem value="slow">Slow Performance</SelectItem>
                            <SelectItem value="error">Error Message</SelectItem>
                            <SelectItem value="not_opening">Won't Open/Start</SelectItem>
                            <SelectItem value="compatibility">Compatibility Issue</SelectItem>
                            <SelectItem value="missing">Missing Features</SelectItem>
                            <SelectItem value="corrupted">Corrupted Files</SelectItem>
                            <SelectItem value="other">Other Issue</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                  
                  {/* Network-specific fields */}
                  {formData.incident_type === "network" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="network_type">Network Type *</Label>
                        <Select value={formData.network_type} onValueChange={(value) => setFormData({ ...formData, network_type: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select network type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="wifi">WiFi/Wireless</SelectItem>
                            <SelectItem value="ethernet">Ethernet/Wired</SelectItem>
                            <SelectItem value="internet">Internet Connection</SelectItem>
                            <SelectItem value="server">Server Connection</SelectItem>
                            <SelectItem value="vpn">VPN</SelectItem>
                            <SelectItem value="printer_network">Network Printer</SelectItem>
                            <SelectItem value="file_sharing">File Sharing</SelectItem>
                            <SelectItem value="other">Other Network</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="network_issue">Issue Type *</Label>
                        <Select value={formData.network_issue} onValueChange={(value) => setFormData({ ...formData, network_issue: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select issue type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="no_connection">No Connection</SelectItem>
                            <SelectItem value="slow_speed">Slow Speed</SelectItem>
                            <SelectItem value="intermittent">Intermittent Connection</SelectItem>
                            <SelectItem value="cant_connect">Can't Connect to Network</SelectItem>
                            <SelectItem value="limited_access">Limited Access</SelectItem>
                            <SelectItem value="dns_error">DNS Error</SelectItem>
                            <SelectItem value="timeout">Connection Timeout</SelectItem>
                            <SelectItem value="other">Other Issue</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                  
                  {/* Security-specific fields */}
                  {formData.incident_type === "security" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="security_type">Security Type *</Label>
                        <Select value={formData.security_type} onValueChange={(value) => setFormData({ ...formData, security_type: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select security type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="malware">Malware/Virus</SelectItem>
                            <SelectItem value="phishing">Phishing Attempt</SelectItem>
                            <SelectItem value="unauthorized_access">Unauthorized Access</SelectItem>
                            <SelectItem value="data_breach">Data Breach</SelectItem>
                            <SelectItem value="suspicious_activity">Suspicious Activity</SelectItem>
                            <SelectItem value="password_issue">Password/Account Issue</SelectItem>
                            <SelectItem value="physical_security">Physical Security</SelectItem>
                            <SelectItem value="policy_violation">Policy Violation</SelectItem>
                            <SelectItem value="other">Other Security</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="security_details">Security Details *</Label>
                        <Input
                          id="security_details"
                          value={formData.security_details}
                          onChange={(e) => setFormData({ ...formData, security_details: e.target.value })}
                          placeholder="e.g. Suspicious email received, Unknown login attempt"
                          required={formData.incident_type === "security"}
                        />
                      </div>
                    </>
                  )}
                  
                  {/* Facility-specific fields */}
                  {formData.incident_type === "facility" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="facility_type">Facility Type *</Label>
                        <Select value={formData.facility_type} onValueChange={(value) => setFormData({ ...formData, facility_type: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select facility type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="electrical">Electrical</SelectItem>
                            <SelectItem value="lighting">Lighting</SelectItem>
                            <SelectItem value="hvac">HVAC/Air Conditioning</SelectItem>
                            <SelectItem value="plumbing">Plumbing</SelectItem>
                            <SelectItem value="furniture">Furniture</SelectItem>
                            <SelectItem value="door_lock">Door/Lock</SelectItem>
                            <SelectItem value="window">Window</SelectItem>
                            <SelectItem value="floor">Floor/Ceiling</SelectItem>
                            <SelectItem value="cleanliness">Cleanliness</SelectItem>
                            <SelectItem value="safety">Safety Hazard</SelectItem>
                            <SelectItem value="other">Other Facility</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="facility_issue">Issue Description *</Label>
                        <Input
                          id="facility_issue"
                          value={formData.facility_issue}
                          onChange={(e) => setFormData({ ...formData, facility_issue: e.target.value })}
                          placeholder="e.g. Broken chair, Leaking pipe, No lights"
                          required={formData.incident_type === "facility"}
                        />
                      </div>
                    </>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="severity">Severity</Label>
                    <Select value={formData.severity} onValueChange={(value) => setFormData({ ...formData, severity: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select severity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <Select value={formData.location} onValueChange={(value) => setFormData({ ...formData, location: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select room location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="COMLAB 101">COMLAB 101</SelectItem>
                        <SelectItem value="COMLAB 102">COMLAB 102</SelectItem>
                        <SelectItem value="COMLAB 103">COMLAB 103</SelectItem>
                        <SelectItem value="COMLAB 104">COMLAB 104</SelectItem>
                        <SelectItem value="COMLAB 105">COMLAB 105</SelectItem>
                        <SelectItem value="COMLAB 106">COMLAB 106</SelectItem>
                      </SelectContent>
                    </Select>
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
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      placeholder="Provide detailed description of the incident..."
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingReport ? "Update" : "Create"} Report
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
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">{report.name || report.title}</TableCell>
                  <TableCell>{report.incident_type}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      report.severity === 'critical' ? 'bg-red-100 text-red-800' :
                      report.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                      report.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {report.severity}
                    </span>
                  </TableCell>
                  <TableCell>{report.location}</TableCell>
                  <TableCell>{new Date(report.timestamp || report.date_occurred || report.created_at).toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleView(report)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      {canEditReport(report) && (
                        <Button size="sm" variant="outline" onClick={() => handleEdit(report)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                      )}
                      {canDeleteReport(report) && (
                        <Button size="sm" variant="outline" onClick={() => handleDelete(report)}>
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

        {/* View Incident Dialog */}
        <Dialog open={viewOpen} onOpenChange={setViewOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Incident Report Details</DialogTitle>
            </DialogHeader>
            {viewingReport && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-semibold">Incident Name</Label>
                    <p className="mt-1">{viewingReport.name || viewingReport.title}</p>
                  </div>
                  <div>
                    <Label className="font-semibold">Incident Type</Label>
                    <p className="mt-1 capitalize">{viewingReport.incident_type}</p>
                  </div>
                  
                  {/* Hardware-specific details */}
                  {viewingReport.incident_type === "hardware" && (
                    <>
                      <div>
                        <Label className="font-semibold">Hardware Type</Label>
                        <p className="mt-1 capitalize">{viewingReport.hardware_type || 'Not specified'}</p>
                      </div>
                      <div>
                        <Label className="font-semibold">Damage Description</Label>
                        <p className="mt-1">{viewingReport.hardware_damage || 'Not specified'}</p>
                      </div>
                    </>
                  )}
                  
                  {/* Software-specific details */}
                  {viewingReport.incident_type === "software" && (
                    <>
                      <div>
                        <Label className="font-semibold">Software Type</Label>
                        <p className="mt-1 capitalize">{viewingReport.software_type?.replace('_', ' ') || 'Not specified'}</p>
                      </div>
                      <div>
                        <Label className="font-semibold">Issue Type</Label>
                        <p className="mt-1 capitalize">{viewingReport.software_issue?.replace('_', ' ') || 'Not specified'}</p>
                      </div>
                    </>
                  )}
                  
                  {/* Network-specific details */}
                  {viewingReport.incident_type === "network" && (
                    <>
                      <div>
                        <Label className="font-semibold">Network Type</Label>
                        <p className="mt-1 capitalize">{viewingReport.network_type?.replace('_', ' ') || 'Not specified'}</p>
                      </div>
                      <div>
                        <Label className="font-semibold">Issue Type</Label>
                        <p className="mt-1 capitalize">{viewingReport.network_issue?.replace('_', ' ') || 'Not specified'}</p>
                      </div>
                    </>
                  )}
                  
                  {/* Security-specific details */}
                  {viewingReport.incident_type === "security" && (
                    <>
                      <div>
                        <Label className="font-semibold">Security Type</Label>
                        <p className="mt-1 capitalize">{viewingReport.security_type?.replace('_', ' ') || 'Not specified'}</p>
                      </div>
                      <div>
                        <Label className="font-semibold">Security Details</Label>
                        <p className="mt-1">{viewingReport.security_details || 'Not specified'}</p>
                      </div>
                    </>
                  )}
                  
                  {/* Facility-specific details */}
                  {viewingReport.incident_type === "facility" && (
                    <>
                      <div>
                        <Label className="font-semibold">Facility Type</Label>
                        <p className="mt-1 capitalize">{viewingReport.facility_type?.replace('_', ' ') || 'Not specified'}</p>
                      </div>
                      <div>
                        <Label className="font-semibold">Issue Description</Label>
                        <p className="mt-1">{viewingReport.facility_issue || 'Not specified'}</p>
                      </div>
                    </>
                  )}
                  
                  <div>
                    <Label className="font-semibold">Severity</Label>
                    <p className="mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        viewingReport.severity === 'critical' ? 'bg-red-100 text-red-800' :
                        viewingReport.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                        viewingReport.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {viewingReport.severity}
                      </span>
                    </p>
                  </div>
                  <div>
                    <Label className="font-semibold">Location</Label>
                    <p className="mt-1">{viewingReport.location || 'Not specified'}</p>
                  </div>
                  <div>
                    <Label className="font-semibold">Reported By</Label>
                    <p className="mt-1">{viewingReport.reported_by}</p>
                  </div>
                  <div>
                    <Label className="font-semibold">Timestamp</Label>
                    <p className="mt-1">{new Date(viewingReport.timestamp || viewingReport.date_occurred || viewingReport.created_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="font-semibold">Reported Date</Label>
                    <p className="mt-1">{new Date(viewingReport.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div>
                  <Label className="font-semibold">Description</Label>
                  <p className="mt-1 whitespace-pre-wrap">{viewingReport.description}</p>
                </div>
                
                {/* Comments Section */}
                <div className="border-t pt-4">
                  <Label className="font-semibold text-lg">Admin Comments</Label>
                  
                  {/* Existing Comments */}
                  <div className="mt-4 space-y-3 max-h-60 overflow-y-auto">
                    {loadingComments ? (
                      <p className="text-gray-500">Loading comments...</p>
                    ) : comments.length === 0 ? (
                      <p className="text-gray-500">No comments yet</p>
                    ) : (
                      comments.map((comment) => (
                        <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-medium text-sm">{comment.updated_by_name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">
                                {new Date(comment.created_at).toLocaleDateString()} {new Date(comment.created_at).toLocaleTimeString()}
                              </span>
                              {canEditComment(comment) && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEditComment(comment)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Pencil className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                          {editingComment?.id === comment.id ? (
                            <div className="space-y-2">
                              <Textarea
                                value={editCommentText}
                                onChange={(e) => setEditCommentText(e.target.value)}
                                rows={3}
                                className="text-sm"
                              />
                              <div className="flex gap-2">
                                <Button size="sm" onClick={handleSaveEditComment}>
                                  Save
                                </Button>
                                <Button size="sm" variant="outline" onClick={handleCancelEditComment}>
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.message}</p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                  
                  {/* Add Comment Form (Admin Only) */}
                  {isAdmin() && (
                    <div className="mt-4 border-t pt-4">
                      <Label className="font-semibold">Add Comment</Label>
                      <div className="mt-2 space-y-2">
                        <Textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Enter your comment..."
                          rows={3}
                        />
                        <div className="flex justify-end">
                          <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                            Add Comment
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
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

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={confirmDelete}
          title="Confirm Deletion"
          description="This action requires admin password verification."
          itemName={itemToDelete?.name || itemToDelete?.title}
          requirePassword={currentUser?.role === 'admin'}
          currentUser={currentUser}
        />
      </div>
    </div>
  );
};

export default IncidentReports;
