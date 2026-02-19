import { Suspense, lazy } from "react";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AuthGuard } from "@/components/AuthGuard";
import { useMaintenanceMode } from "@/hooks/useMaintenanceMode";
import { useWebSocket } from "@/hooks/useWebSocket";
import AdminRoute from "@/components/AdminRoute";
import { Button } from "@/components/ui/button";
import MaintenanceBanner from "@/components/MaintenanceBanner";
import { Loader2 } from "lucide-react";

// Lazy load all page components
const Index = lazy(() => import("./pages/Index"));
const Login = lazy(() => import("./pages/Login"));
const IncidentReports = lazy(() => import("./pages/IncidentReports"));
const LostFound = lazy(() => import("./pages/LostFound"));
const Inventory = lazy(() => import("./pages/Inventory"));
const BorrowItems = lazy(() => import("./pages/BorrowItems"));
const VisitorLogs = lazy(() => import("./pages/VisitorLogs"));
const RepairMaintenance = lazy(() => import("./pages/RepairMaintenance"));
const Users = lazy(() => import("./pages/Users"));
const Profile = lazy(() => import("./pages/Profile"));
const NotFound = lazy(() => import("./pages/NotFound"));
const SystemSettings = lazy(() => import("./pages/SystemSettings"));
const Categories = lazy(() => import("./pages/settings/Categories"));
const StatusSettings = lazy(() => import("./pages/settings/StatusSettings"));
const MyBorrows = lazy(() => import("./pages/MyBorrows"));
const MyReturns = lazy(() => import("./pages/MyReturns"));
const MyRequests = lazy(() => import("./pages/MyRequests"));
const Reservations = lazy(() => import("./pages/Reservations"));
const Analytics = lazy(() => import("./pages/Analytics"));
const UserAnalytics = lazy(() => import("./pages/UserAnalytics"));
const TrashView = lazy(() => import("./pages/TrashView"));
const ActivityLogs = lazy(() => import("./pages/ActivityLogs"));

// Loading component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Loader2 className="h-8 w-8 animate-spin" />
  </div>
);

type Notification = {
  title: string;
  message: string;
  timestamp: string;
};

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  
  // Check maintenance mode
  const { maintenanceMode, maintenanceMessage } = useMaintenanceMode();

  const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const currentUser: { id: string; email: string; role?: string; avatar_url?: string } | null = storedUser
    ? JSON.parse(storedUser)
    : null;

  // Initialize WebSocket only if user is logged in
  const ws = currentUser ? useWebSocket(
    currentUser.id,
    currentUser.role || 'student'
  ) : null;

  const handleLogout = async () => {
    const storedUser = localStorage.getItem("user");
    const currentUser = storedUser ? JSON.parse(storedUser) : null;
    
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
    <AuthGuard>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <main className="flex-1">
            {/* Maintenance Mode Banner for Admin Users */}
            {maintenanceMode && currentUser?.role === 'admin' && (
              <MaintenanceBanner maintenanceMessage={maintenanceMessage} />
            )}
            {children}
          </main>
        </div>
      </SidebarProvider>
    </AuthGuard>
  );
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Create a wrapper component that includes Suspense
const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LoadingFallback />}>
    {children}
  </Suspense>
);

// Create a protected route wrapper with Suspense
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => (
  <ProtectedLayout>
    <SuspenseWrapper>
      {children}
    </SuspenseWrapper>
  </ProtectedLayout>
);

// Create an admin route wrapper with Suspense
const AdminProtectedRoute = ({ children }: { children: React.ReactNode }) => (
  <ProtectedLayout>
    <AdminRoute>
      <SuspenseWrapper>
        {children}
      </SuspenseWrapper>
    </AdminRoute>
  </ProtectedLayout>
);

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
            <Route path="/login" element={<SuspenseWrapper><Login /></SuspenseWrapper>} />
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/incidents" element={<ProtectedRoute><IncidentReports /></ProtectedRoute>} />
            <Route path="/lost-found" element={<ProtectedRoute><LostFound /></ProtectedRoute>} />
            <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
            <Route path="/borrow" element={<ProtectedRoute><BorrowItems /></ProtectedRoute>} />
            <Route path="/my-requests" element={<ProtectedRoute><MyRequests /></ProtectedRoute>} />
            <Route path="/my-borrows" element={<ProtectedRoute><MyBorrows /></ProtectedRoute>} />
            <Route path="/my-returns" element={<ProtectedRoute><MyReturns /></ProtectedRoute>} />
            <Route path="/visitors" element={<AdminProtectedRoute><VisitorLogs /></AdminProtectedRoute>} />
            <Route path="/repairs" element={<ProtectedRoute><RepairMaintenance /></ProtectedRoute>} />
            <Route path="/reservations" element={<ProtectedRoute><Reservations /></ProtectedRoute>} />
            <Route path="/analytics" element={<AdminProtectedRoute><Analytics /></AdminProtectedRoute>} />
            <Route path="/my-analytics" element={<ProtectedRoute><UserAnalytics /></ProtectedRoute>} />
            <Route path="/users" element={<AdminProtectedRoute><Users /></AdminProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/settings" element={<AdminProtectedRoute><SystemSettings /></AdminProtectedRoute>} />
            <Route path="/settings/categories" element={<AdminProtectedRoute><Categories /></AdminProtectedRoute>} />
            <Route path="/settings/status" element={<AdminProtectedRoute><StatusSettings /></AdminProtectedRoute>} />
            <Route path="/trash" element={<AdminProtectedRoute><TrashView /></AdminProtectedRoute>} />
            <Route path="/activity-logs" element={<AdminProtectedRoute><ActivityLogs /></AdminProtectedRoute>} />
            <Route path="*" element={<SuspenseWrapper><NotFound /></SuspenseWrapper>} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
