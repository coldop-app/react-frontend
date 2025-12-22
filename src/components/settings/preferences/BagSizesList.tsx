import { DndContext, closestCenter, type DragEndEvent, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { SortableItem } from '@/components/ui/sortable-item';

interface BagSizesListProps {
  sizes: string[];
  commodityName: string;
  sensors: ReturnType<typeof useSensors>;
  onDragEnd: (event: DragEndEvent) => void;
  onEdit: (size: string, index: number) => void;
  onDelete: (size: string) => void;
}

export function BagSizesList({
  sizes,
  commodityName: _commodityName,
  sensors,
  onDragEnd,
  onEdit,
  onDelete,
}: BagSizesListProps) {
  if (sizes.length === 0) {
    return (
      <div className="text-center py-4 text-sm text-muted-foreground border rounded-md">
        No bag sizes configured. Click "Add Bag Size" to create one.
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={sizes} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {sizes.map((size, index) => (
            <SortableItem key={size} id={size}>
              <div className="flex items-center gap-2 p-2 border rounded-md hover:bg-accent/50 flex-1">
                <Badge variant="outline" className="flex-1 text-xs justify-start">
                  {size}
                </Badge>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onEdit(size, index)}
                    className="h-7 w-7"
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onDelete(size)}
                    className="h-7 w-7 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
