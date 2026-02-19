import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InventoryFormData } from "../types";

interface InventoryFormProps {
  formData: InventoryFormData;
  isSubmitting: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange: (name: string, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export function InventoryForm({
  formData,
  isSubmitting,
  onInputChange,
  onSelectChange,
  onSubmit,
  onCancel,
}: InventoryFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date *</Label>
          <Input
            id="date"
            type="date"
            name="date"
            value={formData.date}
            onChange={onInputChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Recorded By *</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={onInputChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => onSelectChange("category", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="electronics">Electronics</SelectItem>
              <SelectItem value="furniture">Furniture</SelectItem>
              <SelectItem value="tools">Tools</SelectItem>
              <SelectItem value="supplies">Supplies</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="item_description">Item Description *</Label>
          <Textarea
            id="item_description"
            name="item_description"
            value={formData.item_description}
            onChange={onInputChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="serial_number">Serial Number</Label>
          <Input
            id="serial_number"
            name="serial_number"
            value={formData.serial_number}
            onChange={onInputChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity *</Label>
          <Input
            id="quantity"
            name="quantity"
            type="number"
            min="1"
            value={formData.quantity}
            onChange={onInputChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="purpose">Purpose</Label>
          <Textarea
            id="purpose"
            name="purpose"
            value={formData.purpose}
            onChange={onInputChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="date_returned">Date Returned</Label>
          <Input
            id="date_returned"
            name="date_returned"
            type="date"
            value={formData.date_returned}
            onChange={onInputChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="condition">Condition</Label>
          <Input
            id="condition"
            name="condition"
            value={formData.condition}
            onChange={onInputChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Price</Label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={onInputChange}
            placeholder="0.00"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="assigned_to">Assigned To</Label>
          <Input
            id="assigned_to"
            name="assigned_to"
            value={formData.assigned_to}
            onChange={onInputChange}
            placeholder="Person responsible for this item"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Equipment'}
        </Button>
      </div>
    </form>
  );
}
