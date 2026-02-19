import { Suspense, lazy } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

// Lazy load the components
const ReservationList = lazy(() => import("./ReservationList"));
const ReservationCalendarView = lazy(() => import("@/components/reservations/ReservationCalendar"));

const Reservations = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const view = searchParams.get("view") || "list";

  const handleTabChange = (value: string) => {
    setSearchParams({ view: value });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reservations</h1>
          <p className="text-muted-foreground">
            Manage equipment reservations and view availability
          </p>
        </div>
        <Button asChild>
          <Link to="/reservations/new">
            <Plus className="mr-2 h-4 w-4" /> New Reservation
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="px-6 pt-6 pb-2">
          <Tabs value={view} onValueChange={handleTabChange}>
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="list">List View</TabsTrigger>
                <TabsTrigger value="calendar">Calendar View</TabsTrigger>
              </TabsList>
            </div>
          </Tabs>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <Tabs value={view} className="w-full">
            <TabsContent value="list" className="mt-0">
              <Suspense fallback={<div>Loading reservations...</div>}>
                <ReservationList />
              </Suspense>
            </TabsContent>
            <TabsContent value="calendar" className="mt-0">
              <Suspense fallback={<div>Loading calendar...</div>}>
                <ReservationCalendarView />
              </Suspense>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reservations;
