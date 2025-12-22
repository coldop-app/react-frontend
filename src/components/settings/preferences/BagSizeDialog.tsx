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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingBagSize ? 'Edit Bag Size' : 'Create New Bag Size'}</DialogTitle>
          <DialogDescription>
            {editingBagSize
              ? `Edit the bag size for ${selectedCommodity} commodity.`
              : `Add a new bag size to ${selectedCommodity} commodity.`}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="commodity-bag">Commodity</Label>
            <Input id="commodity-bag" value={selectedCommodity} disabled className="bg-muted" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bag-size">Bag Size</Label>
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
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={!bagSizeName.trim()}>
            {editingBagSize ? 'Save Changes' : 'Create Bag Size'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
