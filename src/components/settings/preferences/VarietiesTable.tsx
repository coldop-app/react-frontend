import { DndContext, closestCenter, type DragEndEvent, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SortableTableRow } from './SortableTableRow';

interface VarietiesTableProps {
  varieties: string[];
  commodityName: string;
  sensors: ReturnType<typeof useSensors>;
  onDragEnd: (event: DragEndEvent) => void;
  onEdit: (variety: string) => void;
  onDelete: (variety: string) => void;
}

export function VarietiesTable({
  varieties,
  commodityName: _commodityName,
  sensors,
  onDragEnd,
  onEdit,
  onDelete,
}: VarietiesTableProps) {
  if (varieties.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-muted-foreground border rounded-md">
        No varieties configured. Click "Add Variety" to create one.
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={varieties} strategy={verticalListSortingStrategy}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">#</TableHead>
              <TableHead>Variety Name</TableHead>
              <TableHead className="text-right w-[150px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {varieties.map((variety, index) => (
              <SortableTableRow
                key={variety}
                id={variety}
                index={index}
                variety={variety}
                onEdit={() => onEdit(variety)}
                onDelete={() => onDelete(variety)}
              />
            ))}
          </TableBody>
        </Table>
      </SortableContext>
    </DndContext>
  );
}
