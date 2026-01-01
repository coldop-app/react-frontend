import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface VarietyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingVariety: { commodityName: string; variety: string | null } | null;
  selectedCommodity: string;
  varietyName: string;
  onVarietyNameChange: (name: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function VarietyDialog({
  open,
  onOpenChange,
  editingVariety,
  selectedCommodity,
  varietyName,
  onVarietyNameChange,
  onSave,
  onCancel,
}: VarietyDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            {editingVariety ? 'Edit Variety' : 'Create New Variety'}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            {editingVariety
              ? `Edit the variety for ${selectedCommodity} commodity.`
              : `Add a new variety to ${selectedCommodity} commodity.`}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2 sm:py-4">
          <div className="space-y-2">
            <Label htmlFor="commodity" className="text-sm">
              Commodity
            </Label>
            <Input id="commodity" value={selectedCommodity} disabled className="bg-muted" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="variety" className="text-sm">
              Variety Name
            </Label>
            <Input
              id="variety"
              placeholder="Enter variety name"
              value={varietyName}
              onChange={(e) => onVarietyNameChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && varietyName.trim()) {
                  onSave();
                }
              }}
            />
          </div>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onCancel}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            Cancel
          </Button>
          <Button
            onClick={onSave}
            disabled={!varietyName.trim()}
            className="w-full sm:w-auto order-1 sm:order-2"
          >
            {editingVariety ? 'Save Changes' : 'Create Variety'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
