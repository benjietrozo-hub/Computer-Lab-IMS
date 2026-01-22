import { AlertTriangle } from "lucide-react";

interface MaintenanceBannerProps {
  maintenanceMessage?: string;
  showForAdmin?: boolean;
  compact?: boolean;
}

const MaintenanceBanner = ({ 
  maintenanceMessage, 
  showForAdmin = true, 
  compact = false 
}: MaintenanceBannerProps) => {
  if (!maintenanceMessage && !showForAdmin) return null;

  const paddingClass = compact ? "p-2" : "p-4";
  const marginClass = compact ? "mb-2" : "mb-4";
  const iconSize = compact ? "w-4 h-4" : "w-5 h-5";
  const textSize = compact ? "text-xs" : "text-sm";

  return (
    <div className={`${marginClass} ${paddingClass} bg-orange-50 border border-orange-200 rounded-lg`}>
      <div className="flex items-start gap-3">
        <AlertTriangle className={`${iconSize} text-orange-600 mt-0.5`} />
        <div>
          <p className={`${textSize} font-medium text-orange-800`}>
            Maintenance Mode Active
          </p>
          <p className={`${textSize} text-orange-700`}>
            System is currently under maintenance. Regular user access is restricted.
          </p>
          {maintenanceMessage && (
            <p className={`${textSize} text-orange-600 mt-2 font-medium`}>
              {maintenanceMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MaintenanceBanner;
