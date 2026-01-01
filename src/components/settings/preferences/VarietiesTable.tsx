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
      <div className="text-center py-6 sm:py-8 text-xs sm:text-sm text-muted-foreground border rounded-md">
        No varieties configured. Click "Add Variety" to create one.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <div className="inline-block min-w-full px-4 sm:px-0">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={varieties} strategy={verticalListSortingStrategy}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px] sm:w-[50px] text-xs sm:text-sm">#</TableHead>
                  <TableHead className="text-xs sm:text-sm">Variety Name</TableHead>
                  <TableHead className="text-right w-[120px] sm:w-[150px] text-xs sm:text-sm">
                    Actions
                  </TableHead>
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
      </div>
    </div>
  );
}
