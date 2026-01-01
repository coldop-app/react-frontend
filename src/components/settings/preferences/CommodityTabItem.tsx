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
    <div ref={setNodeRef} style={style} className="flex items-center gap-1 min-w-0">
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing touch-none flex-shrink-0"
      >
        <GripVertical className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
      </div>
      <TabsTrigger
        value={commodity.name}
        className="text-xs sm:text-sm px-2 sm:px-3 truncate max-w-[120px] sm:max-w-none"
      >
        {commodity.name}
      </TabsTrigger>
      <div className="flex items-center gap-0.5 sm:gap-1 ml-0.5 sm:ml-1 flex-shrink-0">
        <Button variant="ghost" size="icon-sm" onClick={onEdit} className="h-6 w-6 sm:h-7 sm:w-7">
          <Pencil className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onDelete}
          className="h-6 w-6 sm:h-7 sm:w-7 text-destructive hover:text-destructive"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
