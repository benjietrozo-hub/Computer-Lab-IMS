import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { InventoryItem } from "../types";

interface InventoryViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem | null;
}

export function InventoryViewModal({ isOpen, onClose, item }: InventoryViewModalProps) {
  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Equipment Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">Name</Label>
              <p className="mt-1 text-sm text-gray-900">{item.name}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Category</Label>
              <p className="mt-1">
                <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  {item.category}
                </span>
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Date Added</Label>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(item.date).toLocaleDateString()}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Quantity</Label>
              <p className="mt-1 text-sm text-gray-900">{item.quantity}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Price</Label>
              <p className="mt-1 text-sm text-gray-900">
                ${typeof item.price === 'number' ? item.price.toFixed(2) : (parseFloat(item.price as string) || 0).toFixed(2)}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Condition</Label>
              <p className="mt-1 text-sm text-gray-900">{item.condition || "N/A"}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Assigned To</Label>
              <p className="mt-1 text-sm text-gray-900">{item.assigned_to || "Unassigned"}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Serial Number</Label>
              <p className="mt-1 text-sm text-gray-900 font-mono">
                {item.serial_number || "N/A"}
              </p>
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-700">Description</Label>
            <p className="mt-1 text-sm text-gray-900 whitespace-pre-line">
              {item.item_description}
            </p>
          </div>
          {item.purpose && (
            <div>
              <Label className="text-sm font-medium text-gray-700">Purpose</Label>
              <p className="mt-1 text-sm text-gray-900 whitespace-pre-line">
                {item.purpose}
              </p>
            </div>
          )}
          {item.date_returned && (
            <div>
              <Label className="text-sm font-medium text-gray-700">Date Returned</Label>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(item.date_returned).toLocaleDateString()}
              </p>
            </div>
          )}
          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
