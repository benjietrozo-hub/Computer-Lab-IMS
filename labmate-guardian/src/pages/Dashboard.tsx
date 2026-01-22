import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Package, Boxes, ClipboardList, Users, Wrench, Settings, BarChart3, Shield, UserCheck } from "lucide-react";
import NavHeader from "@/components/NavHeader";
import NotificationProfile from "@/components/NotificationProfile";
import { useWebSocket } from "@/hooks/useWebSocket";

const commonModules = [
  {
    title: "Incident Reports",
    description: "Track equipment issues and incidents",
    icon: AlertCircle,
    url: "/incidents",
    color: "from-red-500 to-orange-500",
  },
  {
    title: "Lost & Found",
    description: "Manage found items and claims",
    icon: Package,
    url: "/lost-found",
    color: "from-yellow-500 to-amber-500",
  },
  {
    title: "Inventory Equipment",
    description: "Track lab equipment catalog",
    icon: Boxes,
    url: "/inventory",
    color: "from-blue-500 to-cyan-500",
  },
];

const adminModules = [
  {
    title: "Borrow Requests",
    description: "Manage equipment borrowing requests",
    icon: ClipboardList,
    url: "/borrow-requests",
    color: "from-green-500 to-emerald-500",
  },
  {
    title: "Visitor Logs",
    description: "Record visitor information",
    icon: Users,
    url: "/visitors",
    color: "from-purple-500 to-violet-500",
  },
  {
    title: "Repair & Maintenance",
    description: "Track repair requests and status",
    icon: Wrench,
    url: "/repairs",
    color: "from-pink-500 to-rose-500",
  },
  {
    title: "User Management",
    description: "Manage system users and roles",
    icon: UserCheck,
    url: "/users",
    color: "from-indigo-500 to-purple-500",
  },
  {
    title: "System Analytics",
    description: "View system statistics and reports",
    icon: BarChart3,
    url: "/analytics",
    color: "from-teal-500 to-green-500",
  },
  {
    title: "System Settings",
    description: "Configure system settings",
    icon: Settings,
    url: "/settings",
    color: "from-gray-500 to-slate-500",
  },
];

const instructorModules = [
  {
    title: "My Borrowed Items",
    description: "Manage your borrowed equipment",
    icon: ClipboardList,
    url: "/my-borrows",
    color: "from-green-500 to-emerald-500",
  },
  {
    title: "My Returns",
    description: "Track your equipment returns",
    icon: ClipboardList,
    url: "/my-returns",
    color: "from-blue-500 to-indigo-500",
  },
  {
    title: "Equipment Reservations",
    description: "Reserve lab equipment",
    icon: Settings,
    url: "/reservations",
    color: "from-purple-500 to-pink-500",
  },
];

const studentModules = [
  {
    title: "My Borrowed Items",
    description: "Manage your borrowed equipment",
    icon: ClipboardList,
    url: "/my-borrows",
    color: "from-green-500 to-emerald-500",
  },
  {
    title: "My Returns",
    description: "Track your equipment returns",
    icon: ClipboardList,
    url: "/my-returns",
    color: "from-blue-500 to-indigo-500",
  },
  {
    title: "Equipment Reservations",
    description: "Reserve lab equipment",
    icon: Settings,
    url: "/reservations",
    color: "from-purple-500 to-pink-500",
  },
];

const Dashboard = () => {
  const navigate = useNavigate();
  
  const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const currentUser = storedUser ? JSON.parse(storedUser) : null;
  const normalizedRole = currentUser?.role === "user" ? "student" : currentUser?.role;
  
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

  // Get modules based on user role
  const getModulesForRole = (role: string) => {
    let modules = [...commonModules];
    
    if (role === "admin") {
      modules = [...modules, ...adminModules];
    } else if (role === "instructor" || role === "teacher") {
      modules = [...modules, ...instructorModules];
    } else if (role === "student") {
      modules = [...modules, ...studentModules];
    }
    
    return modules;
  };

  const modules = getModulesForRole(normalizedRole || "student");

  const getWelcomeMessage = (role: string) => {
    switch (role) {
      case "admin":
        return "Admin Dashboard - Complete System Control";
      case "instructor":
      case "teacher":
        return "Instructor Dashboard - Lab Management";
      case "student":
        return "Student Dashboard - Lab Resources";
      default:
        return "Dashboard - Lab Management System";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="w-6 h-6 text-red-500" />;
      case "instructor":
      case "teacher":
        return <UserCheck className="w-6 h-6 text-blue-500" />;
      case "student":
        return <Users className="w-6 h-6 text-green-500" />;
      default:
        return <Settings className="w-6 h-6 text-gray-500" />;
    }
  };

  return (
    <div>
      <NavHeader 
        title="Dashboard" 
        subtitle={getWelcomeMessage(normalizedRole || "student")}
        showBackButton={false}
        showHomeButton={false}
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
        {/* Role-specific welcome card */}
        <Card className="mb-6 border-2 border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              {getRoleIcon(normalizedRole || "student")}
              <div>
                <CardTitle className="text-2xl capitalize">
                  {normalizedRole || "Student"} Dashboard
                </CardTitle>
                <CardDescription>
                  Welcome back! Here are your available modules and tools.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => (
            <Card
              key={module.title}
              className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1"
              onClick={() => navigate(module.url)}
            >
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${module.color} flex items-center justify-center mb-2`}>
                  <module.icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">{module.title}</CardTitle>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-primary font-medium">
                  View Details →
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
