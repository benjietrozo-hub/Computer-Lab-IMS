import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Calendar, Package, CheckCircle } from "lucide-react";
import NavHeader from "@/components/NavHeader";
import NotificationProfile from "@/components/NotificationProfile";
import { useWebSocket } from "@/hooks/useWebSocket";



interface ReturnRecord {
  id: string;
  borrower_name: string;
  borrower_email?: string;
  item: string;
  quantity: number;
  borrow_date: string;
  return_date: string | null;
  status: "returned";
  return_condition?: string;
  return_comments?: string;
  return_processed_at?: string;
  request_date?: string;
}

const MyReturns = () => {
  const navigate = useNavigate();
  
  // Get user data first
  const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const currentUser = storedUser ? JSON.parse(storedUser) : null;
  const userRole = currentUser?.role || "student";
  
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
  
  const [records, setRecords] = useState<ReturnRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReturnRecords();
  }, []);

  const fetchReturnRecords = async () => {
    try {
      const storedUser = localStorage.getItem("user");
      const currentUser = storedUser ? JSON.parse(storedUser) : null;
      
      if (!currentUser) {
        navigate("/login");
        return;
      }

      const response = await fetch("http://localhost/labmate/labmate-guardian/api/borrow_items.php");
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to fetch return records");
      }

      // Filter only returned records for current user
      const userReturns = (result.data || []).filter(
        (record: ReturnRecord) => record.borrower_email === currentUser.email && record.status === "returned"
      );
      
      console.log(`Found ${userReturns.length} returned items for ${currentUser.email} (Role: ${currentUser.role || 'student'})`);
      setRecords(userReturns);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch your return records");
    } finally {
      setLoading(false);
    }
  };

  const getConditionColor = (condition?: string) => {
    switch (condition) {
      case 'good':
        return 'text-green-600';
      case 'damaged':
        return 'text-red-600';
      case 'needs_repair':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const getConditionText = (condition?: string) => {
    switch (condition) {
      case 'good':
        return 'Good';
      case 'damaged':
        return 'Damaged';
      case 'needs_repair':
        return 'Needs Repair';
      default:
        return 'Not specified';
    }
  };

  return (
    <div>
      <NavHeader 
        title="My Returned Items" 
        subtitle={`View your returned equipment history (${userRole === 'instructor' || userRole === 'teacher' ? 'Instructor Account' : 'Student Account'})`}
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
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : records.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No returned items</h3>
            <p>You haven't returned any items yet. Your returned items will appear here.</p>
            <Button 
              className="mt-4" 
              onClick={() => navigate("/my-borrows")}
            >
              View Current Borrowed Items
            </Button>
          </div>
        ) : (
          records.map((record) => (
            <Card key={record.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{record.item}</CardTitle>
                    <CardDescription className="text-sm">
                      Quantity: {record.quantity}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge 
                      variant="outline" 
                      className="bg-green-100 text-green-800 border-green-200"
                    >
                      Returned
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <span className="font-medium">Borrowed:</span>
                      <p className="text-muted-foreground">
                        {new Date(record.borrow_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <span className="font-medium">Returned:</span>
                      <p className="text-muted-foreground">
                        {record.return_processed_at 
                          ? new Date(record.return_processed_at).toLocaleDateString()
                          : record.return_date 
                            ? new Date(record.return_date).toLocaleDateString()
                            : "No return date"
                        }
                      </p>
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Condition:</span>
                    <p className={getConditionColor(record.return_condition)}>
                      {getConditionText(record.return_condition)}
                    </p>
                  </div>
                </div>
                {record.return_comments && (
                  <div className="pt-2 border-t">
                    <span className="font-medium text-sm">Return Notes:</span>
                    <p className="text-sm text-muted-foreground mt-1">{record.return_comments}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default MyReturns;
