import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Activity, Download, Filter, RefreshCw, Search, TrendingUp, Users, AlertTriangle, Shield, Monitor, Smartphone, Tablet, Bot } from "lucide-react";
import NavHeader from "@/components/NavHeader";
import NotificationProfile from "@/components/NotificationProfile";
import { useWebSocket } from "@/hooks/useWebSocket";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const ActivityLogs = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    action: "all",
    module: "all",
    severity: "all",
    device_type: "all",
    start_date: "",
    end_date: "",
    search: ""
  });
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  
  const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const currentUser = storedUser ? JSON.parse(storedUser) : null;
  const isAdmin = currentUser?.role === "admin";
  const isRootAdmin = currentUser?.id === 6717 || currentUser?.email === 'benjie.trozo@csucc.edu.ph';
  
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

  // WebSocket connection for real-time activity logs
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');

  // Setup WebSocket for real-time logs
  useEffect(() => {
    // Only setup WebSocket for admin users
    if (!isAdmin && !isRootAdmin) {
      console.log('Not an admin user, skipping WebSocket setup');
      return;
    }
    
    if (!isRealTimeEnabled) {
      console.log('Real-time disabled, skipping WebSocket setup');
      return;
    }
    
    // Wait for currentUser to be available
    if (!currentUser?.id) {
      console.log('Current user not available yet, skipping WebSocket setup');
      return;
    }
    
    // Prevent multiple connections
    if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
      console.log('WebSocket already connected or connecting, skipping...');
      return;
    }

    console.log('Setting up WebSocket connection for admin user:', currentUser.id, currentUser.role);
    setConnectionStatus('connecting');
    
    const websocket = new WebSocket('ws://localhost:8082');
    
    websocket.onopen = () => {
      console.log('✅ Activity Logs WebSocket connected');
      setConnectionStatus('connected');
      
      // Identify as admin to receive activity logs
      const identifyMessage = {
        type: 'identify',
        userId: currentUser.id,
        role: currentUser.role
      };
      console.log('Sending identify message:', identifyMessage);
      websocket.send(JSON.stringify(identifyMessage));
    };

    websocket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('📨 Received WebSocket message:', message.type);
        
        // Handle identification confirmation
        if (message.type === 'identified') {
          console.log('✅ Server confirmed identification:', message);
        }
        
        // Handle real-time activity log updates
        if (message.type === 'activity_log') {
          const newLog = message.payload;
          console.log('📨 Received real-time activity log:', newLog);
          
          // Add new log to the top of the list
          setLogs(prevLogs => [newLog, ...prevLogs]);
          
          // Update stats
          setStats((prevStats: any) => ({
            ...prevStats,
            total_logs: (prevStats?.total_logs || 0) + 1,
            unique_users: prevStats?.unique_users || 0,
            error_count: prevStats?.error_count || 0,
            warning_count: newLog.severity === 'warning' ? (prevStats?.warning_count || 0) + 1 : prevStats?.warning_count || 0,
            critical_count: newLog.severity === 'critical' ? (prevStats?.critical_count || 0) + 1 : prevStats?.critical_count || 0,
            login_count: newLog.action === 'login' ? (prevStats?.login_count || 0) + 1 : prevStats?.login_count || 0,
            delete_count: newLog.action === 'delete' ? (prevStats?.delete_count || 0) + 1 : prevStats?.delete_count || 0
          }));
          
          // Show toast notification for important actions
          if (newLog.severity === 'critical' || newLog.severity === 'error') {
            toast.error(`${newLog.user_name}: ${newLog.description}`, {
              duration: 5000
            });
          } else if (newLog.severity === 'warning') {
            toast.warning(`${newLog.user_name}: ${newLog.description}`, {
              duration: 3000
            });
          }
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    websocket.onerror = (error) => {
      console.error('❌ Activity Logs WebSocket error:', error);
      setConnectionStatus('disconnected');
    };

    websocket.onclose = () => {
      console.log('🔌 Activity Logs WebSocket disconnected');
      setConnectionStatus('disconnected');
    };

    setWs(websocket);

    return () => {
      console.log('🧹 Cleaning up WebSocket connection...');
      if (websocket.readyState === WebSocket.OPEN || websocket.readyState === WebSocket.CONNECTING) {
        websocket.close();
      }
      setConnectionStatus('disconnected');
    };
  }, [isRealTimeEnabled, isAdmin, isRootAdmin, currentUser?.id, currentUser?.role]); // Depend on all relevant state

  useEffect(() => {
    if (!isAdmin) {
      toast.error("Access denied. Admin privileges required.");
      navigate("/");
      return;
    }
    fetchLogs();
    fetchStats();
  }, [isAdmin, navigate]);


  const getAuthHeaders = () => {
    return {
      'X-User-ID': currentUser?.id || '',
      'X-User-Role': currentUser?.role || '',
      'Content-Type': 'application/json'
    };
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      if (filters.action !== "all") queryParams.append("action", filters.action);
      if (filters.module !== "all") queryParams.append("module", filters.module);
      if (filters.severity !== "all") queryParams.append("severity", filters.severity);
      if (filters.device_type !== "all") queryParams.append("device_type", filters.device_type);
      if (filters.start_date) queryParams.append("start_date", filters.start_date);
      if (filters.end_date) queryParams.append("end_date", filters.end_date);
      if (filters.search) queryParams.append("search", filters.search);
      
      const response = await fetch(
        `http://localhost/labmate/labmate-guardian/api/activity_logs.php?${queryParams.toString()}`,
        { headers: getAuthHeaders() }
      );
      
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to fetch activity logs");
      }
      
      setLogs(result.data || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch activity logs");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const queryParams = new URLSearchParams({ stats: "true" });
      if (filters.start_date) queryParams.append("start_date", filters.start_date);
      if (filters.end_date) queryParams.append("end_date", filters.end_date);
      
      const response = await fetch(
        `http://localhost/labmate/labmate-guardian/api/activity_logs.php?${queryParams.toString()}`,
        { headers: getAuthHeaders() }
      );
      
      const result = await response.json();
      
      if (result.success) {
        setStats(result.data);
      }
    } catch (error: any) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    fetchLogs();
    fetchStats();
  };

  const handleReset = () => {
    setFilters({
      action: "all",
      module: "all",
      severity: "all",
      device_type: "all",
      start_date: "",
      end_date: "",
      search: ""
    });
    setTimeout(() => {
      fetchLogs();
      fetchStats();
    }, 100);
  };

  const handleViewDetails = (log: any) => {
    setSelectedLog(log);
    setDetailsOpen(true);
  };

  const handleExportCSV = () => {
    const headers = ["Date/Time", "User", "Action", "Module", "Device", "Browser", "OS", "Description", "IP Address", "Severity"];
    const rows = logs.map(log => [
      new Date(log.created_at).toLocaleString(),
      log.user_name || "System",
      log.action,
      log.module,
      log.device_type || "unknown",
      log.browser || "Unknown",
      log.os || "Unknown",
      log.description,
      log.ip_address || "-",
      log.severity
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `activity-logs-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success("Activity logs exported successfully");
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-100 text-red-800 border-red-200";
      case "error": return "bg-orange-100 text-orange-800 border-orange-200";
      case "warning": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default: return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "delete": return "text-red-600";
      case "create": return "text-green-600";
      case "update": return "text-blue-600";
      case "login": return "text-purple-600";
      case "logout": return "text-gray-600";
      default: return "text-gray-800";
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType?.toLowerCase()) {
      case "mobile": return <Smartphone className="w-4 h-4 text-blue-600" />;
      case "tablet": return <Tablet className="w-4 h-4 text-purple-600" />;
      case "desktop": return <Monitor className="w-4 h-4 text-gray-600" />;
      case "bot": return <Bot className="w-4 h-4 text-orange-600" />;
      default: return <Monitor className="w-4 h-4 text-gray-400" />;
    }
  };

  const getBrowserIcon = (browser: string) => {
    const browserLower = browser?.toLowerCase() || "";
    if (browserLower.includes("chrome")) return "🌐";
    if (browserLower.includes("firefox")) return "🦊";
    if (browserLower.includes("safari")) return "🧭";
    if (browserLower.includes("edge")) return "🌊";
    if (browserLower.includes("opera")) return "🎭";
    if (browserLower.includes("ie")) return "💾";
    return "❓";
  };

  return (
    <div>
      <NavHeader 
        title="Activity Logs" 
        subtitle={isRootAdmin ? "Root Admin - Full System Activity Monitoring" : "Admin - System Activity Monitoring"}
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

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_logs || 0}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.unique_users || 0}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Warnings/Errors</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(parseInt(stats.warning_count) + parseInt(stats.error_count) + parseInt(stats.critical_count)) || 0}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Delete Operations</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.delete_count || 0}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
              <div className="space-y-2">
                <Label>Action</Label>
                <Select value={filters.action} onValueChange={(value) => handleFilterChange("action", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="login">Login</SelectItem>
                    <SelectItem value="logout">Logout</SelectItem>
                    <SelectItem value="create">Create</SelectItem>
                    <SelectItem value="update">Update</SelectItem>
                    <SelectItem value="delete">Delete</SelectItem>
                    <SelectItem value="restore">Restore</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Module</Label>
                <Select value={filters.module} onValueChange={(value) => handleFilterChange("module", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Modules</SelectItem>
                    <SelectItem value="authentication">Authentication</SelectItem>
                    <SelectItem value="inventory">Inventory</SelectItem>
                    <SelectItem value="reservations">Reservations</SelectItem>
                    <SelectItem value="borrow">Borrow</SelectItem>
                    <SelectItem value="users">Users</SelectItem>
                    <SelectItem value="repair">Repair</SelectItem>
                    <SelectItem value="incidents">Incidents</SelectItem>
                    <SelectItem value="lost_found">Lost & Found</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Severity</Label>
                <Select value={filters.severity} onValueChange={(value) => handleFilterChange("severity", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Device</Label>
                <Select value={filters.device_type} onValueChange={(value) => handleFilterChange("device_type", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Devices</SelectItem>
                    <SelectItem value="desktop">Desktop</SelectItem>
                    <SelectItem value="mobile">Mobile</SelectItem>
                    <SelectItem value="tablet">Tablet</SelectItem>
                    <SelectItem value="bot">Bot/Crawler</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={filters.start_date}
                  onChange={(e) => handleFilterChange("start_date", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={filters.end_date}
                  onChange={(e) => handleFilterChange("end_date", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Search</Label>
                <Input
                  placeholder="Search logs..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleApplyFilters()}
                />
              </div>
            </div>
            
            <div className="flex gap-2 mt-4">
              <Button onClick={handleApplyFilters}>
                <Search className="w-4 h-4 mr-2" />
                Apply Filters
              </Button>
              <Button variant="outline" onClick={handleReset}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button variant="outline" onClick={handleExportCSV}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <div className="flex-1" />
              <Button 
                variant={isRealTimeEnabled ? "default" : "outline"}
                onClick={() => setIsRealTimeEnabled(!isRealTimeEnabled)}
                className="relative"
                title={connectionStatus === 'connected' ? 'Real-time connected' : connectionStatus === 'connecting' ? 'Connecting...' : 'Real-time disconnected'}
              >
                {isRealTimeEnabled && connectionStatus === 'connected' && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                )}
                {isRealTimeEnabled && connectionStatus === 'connecting' && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-spin absolute inline-flex h-full w-full rounded-full border-2 border-yellow-400 border-t-transparent"></span>
                  </span>
                )}
                <Activity className="w-4 h-4 mr-2" />
                {isRealTimeEnabled 
                  ? connectionStatus === 'connected' 
                    ? "Real-Time ON" 
                    : connectionStatus === 'connecting'
                    ? "Connecting..."
                    : "Real-Time (Disconnected)"
                  : "Real-Time OFF"
                }
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Logs ({logs.length})</CardTitle>
            <CardDescription>
              {isRootAdmin ? "Full system activity monitoring with all admin actions" : "System activity monitoring"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[140px]">Date/Time</TableHead>
                    <TableHead className="w-[150px]">User</TableHead>
                    <TableHead className="w-[90px]">Action</TableHead>
                    <TableHead className="w-[100px]">Module</TableHead>
                    <TableHead className="w-[80px]">Device</TableHead>
                    <TableHead className="w-[140px]">Browser/OS</TableHead>
                    <TableHead className="w-[120px]">IP Address</TableHead>
                    <TableHead className="w-[120px]">Description</TableHead>
                    <TableHead className="w-[80px]">Severity</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center">Loading...</TableCell>
                    </TableRow>
                  ) : logs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center text-muted-foreground">
                        No activity logs found
                      </TableCell>
                    </TableRow>
                  ) : (
                    logs.map((log) => (
                      <TableRow key={log.id} className={log.is_bot ? "bg-orange-50" : ""}>
                        <TableCell className="text-xs whitespace-nowrap">
                          <div>{new Date(log.created_at).toLocaleDateString()}</div>
                          <div className="text-muted-foreground">{new Date(log.created_at).toLocaleTimeString()}</div>
                        </TableCell>
                        <TableCell className="max-w-[150px]">
                          <div className="text-xs truncate">
                            <div className="font-medium truncate">{log.user_name || "System"}</div>
                            {log.user_email && (
                              <div className="text-muted-foreground truncate">{log.user_email}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`text-xs font-medium capitalize ${getActionColor(log.action)}`}>
                            {log.action}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs capitalize">{log.module}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1" title={log.device_type || "unknown"}>
                            {getDeviceIcon(log.device_type)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs">
                            <div className="flex items-center gap-1 truncate" title={log.browser || "Unknown"}>
                              <span>{getBrowserIcon(log.browser)}</span>
                              <span className="font-medium truncate">{log.browser?.split(' ')[0] || "Unknown"}</span>
                            </div>
                            <div className="text-muted-foreground truncate" title={log.os || "Unknown"}>
                              {log.os?.split(' ').slice(0, 2).join(' ') || "Unknown"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs font-mono">
                          {log.ip_address || "-"}
                        </TableCell>
                        <TableCell className="max-w-[120px]">
                          <div className="text-xs truncate" title={log.description}>
                            {log.description}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-xs ${getSeverityColor(log.severity)}`}>
                            {log.severity}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleViewDetails(log)}
                            className="h-7 px-2 text-xs"
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Details Dialog */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>Activity Log Details</DialogTitle>
            </DialogHeader>
            {selectedLog && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-semibold">Date/Time</Label>
                    <p className="mt-1">{new Date(selectedLog.created_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="font-semibold">User</Label>
                    <p className="mt-1">{selectedLog.user_name || "System"}</p>
                    {selectedLog.user_email && (
                      <p className="text-sm text-muted-foreground">{selectedLog.user_email}</p>
                    )}
                  </div>
                  <div>
                    <Label className="font-semibold">Action</Label>
                    <p className="mt-1 capitalize">{selectedLog.action}</p>
                  </div>
                  <div>
                    <Label className="font-semibold">Module</Label>
                    <p className="mt-1 capitalize">{selectedLog.module}</p>
                  </div>
                  <div>
                    <Label className="font-semibold">Entity Type</Label>
                    <p className="mt-1">{selectedLog.entity_type || "-"}</p>
                  </div>
                  <div>
                    <Label className="font-semibold">Entity Name</Label>
                    <p className="mt-1">{selectedLog.entity_name || "-"}</p>
                  </div>
                  <div>
                    <Label className="font-semibold">Entity ID</Label>
                    <p className="mt-1">{selectedLog.entity_id || "-"}</p>
                  </div>
                  <div>
                    <Label className="font-semibold">Severity</Label>
                    <Badge variant="outline" className={getSeverityColor(selectedLog.severity)}>
                      {selectedLog.severity}
                    </Badge>
                  </div>
                </div>
                
                {/* Device/Browser/OS Information */}
                <div className="border-t pt-4">
                  <Label className="font-semibold text-base mb-3 block">Device & Browser Information</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="font-semibold">Device Type</Label>
                      <div className="flex items-center gap-2 mt-1">
                        {getDeviceIcon(selectedLog.device_type)}
                        <span className="capitalize">{selectedLog.device_type || "unknown"}</span>
                        {selectedLog.is_bot && (
                          <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">
                            Bot
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label className="font-semibold">Browser</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <span>{getBrowserIcon(selectedLog.browser)}</span>
                        <span>{selectedLog.browser || "Unknown"}</span>
                      </div>
                    </div>
                    <div>
                      <Label className="font-semibold">Operating System</Label>
                      <p className="mt-1">{selectedLog.os || "Unknown"}</p>
                    </div>
                    <div>
                      <Label className="font-semibold">IP Address</Label>
                      <p className="mt-1 font-mono text-sm">{selectedLog.ip_address || "-"}</p>
                      {selectedLog.real_ip && selectedLog.real_ip !== selectedLog.ip_address && (
                        <p className="text-xs text-muted-foreground">Real IP: {selectedLog.real_ip}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label className="font-semibold">Description</Label>
                  <p className="mt-1">{selectedLog.description}</p>
                </div>
                
                {selectedLog.old_values && (
                  <div>
                    <Label className="font-semibold">Old Values</Label>
                    <pre className="mt-1 p-3 bg-gray-50 rounded text-xs overflow-auto max-h-60">
                      {JSON.stringify(JSON.parse(selectedLog.old_values), null, 2)}
                    </pre>
                  </div>
                )}
                
                {selectedLog.new_values && (
                  <div>
                    <Label className="font-semibold">New Values</Label>
                    <pre className="mt-1 p-3 bg-gray-50 rounded text-xs overflow-auto max-h-60">
                      {JSON.stringify(JSON.parse(selectedLog.new_values), null, 2)}
                    </pre>
                  </div>
                )}
                
                {selectedLog.user_agent && (
                  <div>
                    <Label className="font-semibold">User Agent (Full)</Label>
                    <p className="mt-1 text-xs text-muted-foreground font-mono break-all bg-gray-50 p-2 rounded">{selectedLog.user_agent}</p>
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

export default ActivityLogs;
