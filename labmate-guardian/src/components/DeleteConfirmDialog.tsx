import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  title?: string;
  description?: string;
  itemName?: string;
  requirePassword?: boolean;
  currentUser?: any;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title = "Confirm Deletion",
  description = "This action requires admin password verification.",
  itemName,
  requirePassword = true,
  currentUser,
}: DeleteConfirmDialogProps) {
  const [adminPassword, setAdminPassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    if (requirePassword && !adminPassword) {
      toast.error("Please enter admin password");
      return;
    }

    setIsDeleting(true);

    try {
      if (requirePassword) {
        // Verify admin credentials
        const verifyResponse = await fetch(
          "http://localhost/labmate/labmate-guardian/api/auth_login.php",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: currentUser?.email,
              password: adminPassword,
            }),
          }
        );

        const verifyResult = await verifyResponse.json();

        if (!verifyResult.success) {
          toast.error("Invalid admin password");
          setIsDeleting(false);
          return;
        }
      }

      // Proceed with deletion
      await onConfirm();
      
      // Close dialog and reset
      onOpenChange(false);
      setAdminPassword("");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete item");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      onOpenChange(false);
      setAdminPassword("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {itemName && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                You are about to delete: <strong>{itemName}</strong>
              </p>
              <p className="text-xs text-red-600 mt-1">
                This will move the item to trash. You can restore it later from
                the Trash page.
              </p>
            </div>
          )}
          {requirePassword && (
            <div className="space-y-2">
              <Label htmlFor="admin-password">Admin Password *</Label>
              <Input
                id="admin-password"
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Enter your admin password"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isDeleting) {
                    handleConfirm();
                  }
                }}
                disabled={isDeleting}
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting || (requirePassword && !adminPassword)}
          >
            {isDeleting ? "Deleting..." : "Delete Item"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
