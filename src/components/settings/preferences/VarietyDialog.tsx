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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingVariety ? 'Edit Variety' : 'Create New Variety'}</DialogTitle>
          <DialogDescription>
            {editingVariety
              ? `Edit the variety for ${selectedCommodity} commodity.`
              : `Add a new variety to ${selectedCommodity} commodity.`}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="commodity">Commodity</Label>
            <Input id="commodity" value={selectedCommodity} disabled className="bg-muted" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="variety">Variety Name</Label>
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
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={!varietyName.trim()}>
            {editingVariety ? 'Save Changes' : 'Create Variety'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
