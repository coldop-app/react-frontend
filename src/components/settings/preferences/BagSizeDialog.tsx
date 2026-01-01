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

interface BagSizeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingBagSize: { commodityName: string; size: string | null; index: number } | null;
  selectedCommodity: string;
  bagSizeName: string;
  onBagSizeNameChange: (name: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function BagSizeDialog({
  open,
  onOpenChange,
  editingBagSize,
  selectedCommodity,
  bagSizeName,
  onBagSizeNameChange,
  onSave,
  onCancel,
}: BagSizeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            {editingBagSize ? 'Edit Bag Size' : 'Create New Bag Size'}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            {editingBagSize
              ? `Edit the bag size for ${selectedCommodity} commodity.`
              : `Add a new bag size to ${selectedCommodity} commodity.`}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2 sm:py-4">
          <div className="space-y-2">
            <Label htmlFor="commodity-bag" className="text-sm">
              Commodity
            </Label>
            <Input id="commodity-bag" value={selectedCommodity} disabled className="bg-muted" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bag-size" className="text-sm">
              Bag Size
            </Label>
            <Input
              id="bag-size"
              placeholder="Enter bag size"
              value={bagSizeName}
              onChange={(e) => onBagSizeNameChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && bagSizeName.trim()) {
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
            disabled={!bagSizeName.trim()}
            className="w-full sm:w-auto order-1 sm:order-2"
          >
            {editingBagSize ? 'Save Changes' : 'Create Bag Size'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
