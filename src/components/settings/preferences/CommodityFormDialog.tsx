import { DndContext, closestCenter, type DragEndEvent, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
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
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2 } from 'lucide-react';
import { SortableItem } from '@/components/ui/sortable-item';

interface CommodityFormData {
  name: string;
  sizes: string[];
  varieties: string[];
}

interface CommodityFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingCommodity: CommodityFormData | null;
  commodityForm: CommodityFormData;
  onFormChange: (form: CommodityFormData) => void;
  bagSizeName: string;
  onBagSizeNameChange: (name: string) => void;
  varietyName: string;
  onVarietyNameChange: (name: string) => void;
  sensors: ReturnType<typeof useSensors>;
  onBagSizeDragEnd: (event: DragEndEvent) => void;
  onVarietyDragEnd: (event: DragEndEvent) => void;
  onAddBagSize: () => void;
  onEditBagSize: (oldSize: string, newSize: string) => void;
  onRemoveBagSize: (size: string) => void;
  onAddVariety: () => void;
  onEditVariety: (oldVariety: string, newVariety: string) => void;
  onRemoveVariety: (variety: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function CommodityFormDialog({
  open,
  onOpenChange,
  editingCommodity,
  commodityForm,
  onFormChange,
  bagSizeName,
  onBagSizeNameChange,
  varietyName,
  onVarietyNameChange,
  sensors,
  onBagSizeDragEnd,
  onVarietyDragEnd,
  onAddBagSize,
  onEditBagSize,
  onRemoveBagSize,
  onAddVariety,
  onEditVariety,
  onRemoveVariety,
  onSave,
  onCancel,
}: CommodityFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingCommodity ? 'Edit Commodity' : 'Create New Commodity'}</DialogTitle>
          <DialogDescription>
            {editingCommodity
              ? 'Edit the commodity details, bag sizes, and varieties.'
              : 'Create a new commodity with bag sizes and varieties.'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Commodity Name */}
          <div className="space-y-2">
            <Label htmlFor="commodity-name">Commodity Name</Label>
            <Input
              id="commodity-name"
              placeholder="Enter commodity name"
              value={commodityForm.name}
              onChange={(e) => onFormChange({ ...commodityForm, name: e.target.value })}
            />
          </div>

          <Separator />

          {/* Bag Sizes Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Bag Sizes</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter bag size"
                  value={bagSizeName}
                  onChange={(e) => onBagSizeNameChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && bagSizeName.trim()) {
                      onAddBagSize();
                    }
                  }}
                  className="w-40"
                />
                <Button onClick={onAddBagSize} size="sm" disabled={!bagSizeName.trim()}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {commodityForm.sizes.length > 0 ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={onBagSizeDragEnd}
              >
                <SortableContext items={commodityForm.sizes} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2 border rounded-md p-3">
                    {commodityForm.sizes.map((size) => (
                      <SortableItem key={size} id={size}>
                        <Input
                          value={size}
                          onChange={(e) => onEditBagSize(size, e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => onRemoveBagSize(size)}
                          className="h-7 w-7 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </SortableItem>
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            ) : (
              <div className="text-center py-4 text-sm text-muted-foreground border rounded-md">
                No bag sizes added yet.
              </div>
            )}
          </div>

          <Separator />

          {/* Varieties Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Varieties</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter variety name"
                  value={varietyName}
                  onChange={(e) => onVarietyNameChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && varietyName.trim()) {
                      onAddVariety();
                    }
                  }}
                  className="w-40"
                />
                <Button onClick={onAddVariety} size="sm" disabled={!varietyName.trim()}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {commodityForm.varieties.length > 0 ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={onVarietyDragEnd}
              >
                <SortableContext
                  items={commodityForm.varieties}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2 border rounded-md p-3">
                    {commodityForm.varieties.map((variety) => (
                      <SortableItem key={variety} id={variety}>
                        <Input
                          value={variety}
                          onChange={(e) => onEditVariety(variety, e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => onRemoveVariety(variety)}
                          className="h-7 w-7 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </SortableItem>
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            ) : (
              <div className="text-center py-4 text-sm text-muted-foreground border rounded-md">
                No varieties added yet.
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={!commodityForm.name.trim()}>
            {editingCommodity ? 'Save Changes' : 'Create Commodity'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
