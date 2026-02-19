import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { User as UserIcon, Bell, X, MessageSquare, AlertTriangle, CheckCircle, Clock, Shield, Wrench, Package, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Notification {
  title: string;
  message: string;
  timestamp: string;
  actionUrl?: string;
  read?: boolean;
  id: string;
  type?: string;
}

interface NotificationProfileProps {
  notifications: Notification[];
  unreadCount: number;
  currentUser: any;
  markAsRead?: (id: string) => void;
  markAllAsRead: () => void;
  loadMoreNotifications?: () => void;
  hasMoreNotifications?: boolean;
  totalNotifications?: number;
  removeNotification?: (id: string) => void;
  clearAllNotifications?: () => void;
}

const NotificationProfile = ({ 
  notifications, 
  unreadCount, 
  currentUser, 
  markAsRead,
  markAllAsRead,
  loadMoreNotifications,
  hasMoreNotifications = false,
  totalNotifications = 0,
  removeNotification,
  clearAllNotifications
}: NotificationProfileProps) => {
  const navigate = useNavigate();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_incident_report':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'incident_report_submitted':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'role_change':
        return <Shield className="w-4 h-4 text-purple-500" />;
      case 'new_borrow_request':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'borrow_request_submitted':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'borrow_status_update':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'borrow_return_processed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'repair_needed':
        return <Wrench className="w-4 h-4 text-orange-500" />;
      case 'new_lostfound_item':
        return <Package className="w-4 h-4 text-purple-500" />;
      case 'lostfound_item_submitted':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getNotificationColor = (type?: string) => {
    switch (type) {
      case 'new_incident_report':
        return 'border-l-red-500 bg-red-50';
      case 'incident_report_submitted':
        return 'border-l-green-500 bg-green-50';
      case 'role_change':
        return 'border-l-purple-500 bg-purple-50';
      case 'new_borrow_request':
        return 'border-l-blue-500 bg-blue-50';
      case 'borrow_request_submitted':
        return 'border-l-green-500 bg-green-50';
      case 'borrow_status_update':
        return 'border-l-orange-500 bg-orange-50';
      case 'borrow_return_processed':
        return 'border-l-green-500 bg-green-50';
      case 'repair_needed':
        return 'border-l-orange-500 bg-orange-50';
      case 'new_lostfound_item':
        return 'border-l-purple-500 bg-purple-50';
      case 'lostfound_item_submitted':
        return 'border-l-green-500 bg-green-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-500 text-white';
      case 'instructor':
        return 'bg-blue-500 text-white';
      case 'teacher':
        return 'bg-blue-500 text-white';
      case 'student':
      case 'user':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getRoleDisplay = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'instructor':
        return 'Instructor';
      case 'teacher':
        return 'Instructor';
      case 'student':
      case 'user':
        return 'Student';
      default:
        return 'User';
    }
  };

  const handleLogout = async () => {
    try {
      // Call logout endpoint to log the action
      await fetch('http://localhost/labmate/labmate-guardian/api/auth_logout.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: currentUser?.id,
          user_email: currentUser?.email
        })
      });
    } catch (error) {
      console.error('Error logging logout:', error);
      // Continue with logout even if logging fails
    }
    
    // Clear local storage and redirect
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="flex items-center gap-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="relative">
            <Bell className="w-4 h-4 text-black" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 inline-flex items-center justify-center rounded-full bg-red-500 text-[10px] text-white px-1 min-w-[16px]">
                {unreadCount}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="bottom" align="end" className="w-72 max-h-80 overflow-auto" sideOffset={8} collisionPadding={8}>
          <DropdownMenuLabel className="flex justify-between items-center">
            <span>Notifications</span>
            {totalNotifications > 0 && (
              <span className="text-xs text-muted-foreground">
                {totalNotifications} total
              </span>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {notifications.length > 0 && clearAllNotifications && (
            <DropdownMenuItem
              className="justify-center text-xs text-red-600 cursor-pointer hover:bg-red-50"
              onClick={() => {
                if (clearAllNotifications) {
                  clearAllNotifications();
                }
              }}
            >
              Clear All Notifications
            </DropdownMenuItem>
          )}
          {notifications.length > 0 && <DropdownMenuSeparator />}
          {notifications.length === 0 ? (
            <DropdownMenuItem className="text-xs text-muted-foreground">
              No notifications yet.
            </DropdownMenuItem>
          ) : (
            <>
              {notifications.map((n, idx) => (
                <div key={idx} className="relative group">
                  <DropdownMenuItem 
                    className={`flex items-start gap-3 text-xs cursor-pointer hover:bg-accent pr-8 border-l-4 ${getNotificationColor(n.type)} ${!n.read ? 'font-semibold' : ''}`}
                    onClick={() => {
                      if (markAsRead) {
                        markAsRead(n.id);
                      }
                      if (n.actionUrl) {
                        const target = n.actionUrl.startsWith('/borrow-requests') ? '/reservations' : n.actionUrl;
                        navigate(target);
                      }
                    }}
                  >
                    <div className="mt-0.5">
                      {getNotificationIcon(n.type)}
                    </div>
                    <div className="flex-1">
                      <span className="font-medium">{n.title}</span>
                      {n.message && (
                        <span className="text-muted-foreground block mt-1">{n.message}</span>
                      )}
                      <span className="text-[10px] text-muted-foreground mt-1 block">
                        {new Date(n.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </DropdownMenuItem>
                  {removeNotification && (
                    <button
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 rounded"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (removeNotification) {
                          removeNotification(n.id);
                        }
                      }}
                      title="Remove notification"
                    >
                      <X className="w-3 h-3 text-red-500" />
                    </button>
                  )}
                </div>
              ))}
              {hasMoreNotifications && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="justify-center text-xs text-blue-600 cursor-pointer hover:bg-blue-50"
                    onClick={() => {
                      if (loadMoreNotifications) {
                        loadMoreNotifications();
                      }
                    }}
                  >
                    View More Notifications
                  </DropdownMenuItem>
                </>
              )}
              {notifications.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="justify-center text-xs text-blue-600 cursor-pointer"
                    onClick={() => markAllAsRead()}
                  >
                    Mark all as read
                  </DropdownMenuItem>
                </>
              )}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center overflow-hidden">
              {currentUser?.avatar_url ? (
                <img
                  src={`http://localhost/labmate/labmate-guardian/${currentUser.avatar_url}`}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to user icon if image fails to load
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <UserIcon className={`w-4 h-4 text-muted-foreground ${currentUser?.avatar_url ? 'hidden' : ''}`} />
            </div>
            <span className="text-xs text-black text-left max-w-[160px] truncate">
              {currentUser?.email || "Unknown user"}
            </span>
            <span className={`text-[10px] uppercase px-2 py-1 rounded-full ${getRoleBadgeColor(currentUser?.role)}`}>
              {getRoleDisplay(currentUser?.role)}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="bottom" align="end" className="w-56" sideOffset={8} collisionPadding={8}>
          <DropdownMenuLabel>Profile</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="flex flex-col items-start text-xs">
            <span className="font-medium">{currentUser?.email || "Unknown"}</span>
            <span className="text-muted-foreground capitalize">
              Role: {getRoleDisplay(currentUser?.role)}
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/profile")}>
            View Profile
          </DropdownMenuItem>
          {currentUser?.role === "admin" && (
            <DropdownMenuItem onClick={() => navigate("/users")}>
              Manage Users
            </DropdownMenuItem>
          )}
          {(
            (currentUser?.role === "student" || currentUser?.role === "user") ||
            currentUser?.role === "instructor" ||
            currentUser?.role === "teacher"
          ) && (
            <DropdownMenuItem onClick={() => navigate("/my-borrows")}>
              My Borrowed Items
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default NotificationProfile;
