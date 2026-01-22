import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Settings, ListOrdered, ToggleLeft } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { 
  AlertCircle, 
  Package, 
  Boxes, 
  ClipboardList, 
  Users, 
  Wrench,
  Computer,
  Calendar,
  BarChart3,
  CheckCircle
} from "lucide-react";
import { useWebSocket } from "@/hooks/useWebSocket";

const items = [
  { title: "Incident Reports", url: "/incidents", icon: AlertCircle },
  { title: "Lost & Found", url: "/lost-found", icon: Package },
  { title: "Repair & Maintenance", url: "/repairs", icon: Wrench },
  { title: "Equipment Reservations", url: "/reservations", icon: Calendar },
];

const adminItems = [
  { title: "Borrow Requests", url: "/borrow-requests", icon: ClipboardList },
  { title: "Borrowed Items", url: "/borrow", icon: Package },
  { title: "Inventory Equipment", url: "/inventory", icon: Boxes },
  { title: "Visitor Logs", url: "/visitors", icon: Users },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
];

const teacherItems = [
  { title: "Inventory Equipment", url: "/inventory", icon: Boxes },
  { title: "My Borrowed Items", url: "/my-borrows", icon: ClipboardList },
  { title: "My Returns", url: "/my-returns", icon: CheckCircle },
  { title: "My Reservations", url: "/reservations", icon: Calendar },
  { title: "My Analytics", url: "/my-analytics", icon: BarChart3 },
];

const studentItems = [
  { title: "Inventory Equipment", url: "/inventory", icon: Boxes },
  { title: "My Borrowed Items", url: "/my-borrows", icon: ClipboardList },
  { title: "My Returns", url: "/my-returns", icon: CheckCircle },
  { title: "My Reservations", url: "/reservations", icon: Calendar },
  { title: "My Analytics", url: "/my-analytics", icon: BarChart3 },
];
const settings = [
  { title: "General Settings", url: "/settings", icon: Settings },
  { title: "Categories", url: "/settings/categories", icon: ListOrdered },
  { title: "Status Manager", url: "/settings/status", icon: ToggleLeft },
];


export function AppSidebar() {
  const { open: sidebarOpen } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [normalizedRole, setNormalizedRole] = useState<string>("student");

  // Update user state when localStorage changes
  useEffect(() => {
    const updateUser = () => {
      const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
      const user = storedUser ? JSON.parse(storedUser) : null;
      
      // Only update if the user actually changed
      if (JSON.stringify(user) !== JSON.stringify(currentUser)) {
        setCurrentUser(user);
        setNormalizedRole(user?.role === "user" ? "student" : user?.role || "student");
        
        // Log the role change for debugging
        if (user && currentUser && user.role !== currentUser.role) {
          console.log(`Role changed from ${currentUser.role} to ${user.role}`);
        }
      }
    };

    updateUser();
    
    // Listen for storage changes (for role updates)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "user") {
        console.log('Storage change detected, updating user data');
        updateUser();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    
    // Also check for changes every 1 second (for same-tab updates)
    const interval = setInterval(() => {
      updateUser();
      
      // Additional check: if we have a current user, verify their role with the server periodically
      if (currentUser && currentUser.email) {
        verifyUserRole(currentUser.email).then(serverRole => {
          if (serverRole && serverRole !== normalizedRole) {
            console.log(`Role mismatch detected: local=${normalizedRole}, server=${serverRole}. Updating...`);
            const updatedUser = { ...currentUser, role: serverRole === 'student' ? 'user' : serverRole };
            localStorage.setItem("user", JSON.stringify(updatedUser));
            setNormalizedRole(serverRole === 'student' ? 'student' : serverRole);
            
            // Force reload if role changed
            setTimeout(() => window.location.reload(), 1000);
          }
        }).catch(err => {
          // Silently fail verification, don't spam console
        });
      }
    }, 1000);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [currentUser]);

  const { notifications } = useWebSocket(
    currentUser?.id || "",
    currentUser?.role || ""
  );

  const hasUnreadForUrl = (url: string) => {
    return notifications.some(
      (n) => !n.read && n.actionUrl === url
    );
  };

  // Function to verify user role with server
  const verifyUserRole = async (email: string): Promise<string | null> => {
    try {
      const response = await fetch(`http://localhost/labmate/labmate-guardian/api/users.php?email=${email}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data && result.data.length > 0) {
          const user = result.data[0];
          return user.role === 'user' ? 'student' : user.role;
        }
      }
    } catch (error) {
      // Silently fail
    }
    return null;
  };

  // Redirect user if they try to access a page they don't have permission for
  useEffect(() => {
    if (!currentUser) return;

    // Only admin-restricted paths
    const adminOnlyPaths = ["/users", "/borrow-requests", "/borrow", "/analytics", "/settings"];
    
    // Check if current path is admin-only and user is not admin
    if (adminOnlyPaths.some(path => currentPath.startsWith(path)) && normalizedRole !== "admin") {
      // Redirect to appropriate dashboard
      navigate("/");
    }
  }, [currentPath, normalizedRole, currentUser, navigate]);

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex flex-col gap-2">
            <div className="flex justify-end">
              <SidebarTrigger />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center shrink-0">
                <Computer className="w-5 h-5 text-white" />
              </div>
              {sidebarOpen && (
                <div className="flex-1 ml-3">
                  <h2 className="text-lg font-semibold">LabMate Guardian</h2>
                  <p className="text-xs text-muted-foreground">Lab Management System</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Modules</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={currentPath === item.url}>
                    <NavLink to={item.url} className="flex items-center gap-2">
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                      {hasUnreadForUrl(item.url) && (
                        <span className="ml-auto inline-flex h-2 w-2 rounded-full bg-red-500" />
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {(normalizedRole === "admin" || normalizedRole === "instructor" || normalizedRole === "teacher" || normalizedRole === "student") && (
                <SidebarGroup>
                  <SidebarGroupLabel>Borrow Management</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {normalizedRole === "admin" && (
                        <>
                          {adminItems.map((item) => (
                            <SidebarMenuItem key={item.title}>
                              <SidebarMenuButton asChild isActive={currentPath === item.url}>
                                <NavLink to={item.url} className="flex items-center gap-2">
                                  <item.icon className="w-4 h-4" />
                                  <span>{item.title}</span>
                                  {hasUnreadForUrl(item.url) && (
                                    <span className="ml-auto inline-flex h-2 w-2 rounded-full bg-red-500" />
                                  )}
                                </NavLink>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          ))}
                        </>
                      )}
                      {(normalizedRole === "instructor" || normalizedRole === "teacher") && (
                        <>
                          {teacherItems.map((item) => (
                            <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton asChild isActive={currentPath === item.url}>
                              <NavLink to={item.url} className="flex items-center gap-2">
                                <item.icon className="w-4 h-4" />
                                <span>{item.title}</span>
                                {hasUnreadForUrl(item.url) && (
                                  <span className="ml-auto inline-flex h-2 w-2 rounded-full bg-red-500" />
                                )}
                              </NavLink>
                            </SidebarMenuButton>
                            </SidebarMenuItem>
                          ))}
                        </>
                      )}
                      {normalizedRole === "student" && (
                        <>
                          {studentItems.map((item) => (
                            <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton asChild isActive={currentPath === item.url}>
                              <NavLink to={item.url} className="flex items-center gap-2">
                                <item.icon className="w-4 h-4" />
                                <span>{item.title}</span>
                                {hasUnreadForUrl(item.url) && (
                                  <span className="ml-auto inline-flex h-2 w-2 rounded-full bg-red-500" />
                                )}
                              </NavLink>
                            </SidebarMenuButton>
                            </SidebarMenuItem>
                          ))}
                        </>
                      )}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              )}
              {normalizedRole === "admin" && (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={currentPath === "/users"}>
                      <NavLink to="/users">
                        <Users className="w-4 h-4" />
                        <span>User Management</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>My Records</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {normalizedRole !== "admin" && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={currentPath === "/my-requests"}>
                    <NavLink to="/my-requests" className="flex items-center gap-2">
                      <ClipboardList className="w-4 h-4" />
                      <span>My Requests</span>
                      {hasUnreadForUrl("/my-requests") && (
                        <span className="ml-auto inline-flex h-2 w-2 rounded-full bg-red-500" />
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={currentPath === "/my-borrows"}>
                  <NavLink to="/my-borrows" className="flex items-center gap-2">
                    <ClipboardList className="w-4 h-4" />
                    <span>My Borrowed Items</span>
                    {hasUnreadForUrl("/my-borrows") && (
                      <span className="ml-auto inline-flex h-2 w-2 rounded-full bg-red-500" />
                    )}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {normalizedRole === "admin" && (
          <SidebarGroup>
            <SidebarGroupLabel>System Settings</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {settings.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={currentPath === item.url}>
                      <NavLink to={item.url} className="flex items-center gap-2">
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                        {hasUnreadForUrl(item.url) && (
                          <span className="ml-auto inline-flex h-2 w-2 rounded-full bg-red-500" />
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
