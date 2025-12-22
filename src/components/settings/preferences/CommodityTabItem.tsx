import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TabsTrigger } from '@/components/ui/tabs';
import type { PreferencesData } from '@/types/settings/preferences';

interface CommodityTabItemProps {
  commodity: PreferencesData['commodities'][0];
  onEdit: () => void;
  onDelete: () => void;
}

export function CommodityTabItem({ commodity, onEdit, onDelete }: CommodityTabItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: commodity.name,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-1">
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing touch-none">
        <GripVertical className="h-3 w-3 text-muted-foreground" />
      </div>
      <TabsTrigger value={commodity.name}>{commodity.name}</TabsTrigger>
      <div className="flex items-center gap-1 ml-1">
        <Button variant="ghost" size="icon-sm" onClick={onEdit} className="h-6 w-6">
          <Pencil className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onDelete}
          className="h-6 w-6 text-destructive hover:text-destructive"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
