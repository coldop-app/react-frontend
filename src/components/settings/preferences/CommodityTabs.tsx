import { DndContext, closestCenter, type DragEndEvent, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Tabs, TabsList, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Plus } from 'lucide-react';
import type { PreferencesData } from '@/types/settings/preferences';
import { CommodityTabItem } from './CommodityTabItem';
import { BagSizesList } from './BagSizesList';
import { VarietiesTable } from './VarietiesTable';

interface CommodityTabsProps {
  commodities: PreferencesData['commodities'];
  sensors: ReturnType<typeof useSensors>;
  onCommodityDragEnd: (event: DragEndEvent) => void;
  onCommodityEdit: (commodity: PreferencesData['commodities'][0]) => void;
  onCommodityDelete: (commodityName: string) => void;
  onBagSizeAdd: (commodityName: string) => void;
  onBagSizeDragEnd: (event: DragEndEvent, commodityName: string) => void;
  onBagSizeEdit: (commodityName: string, size: string, index: number) => void;
  onBagSizeDelete: (commodityName: string, size: string) => void;
  onVarietyAdd: (commodityName: string) => void;
  onVarietyDragEnd: (event: DragEndEvent, commodityName: string) => void;
  onVarietyEdit: (commodityName: string, variety: string) => void;
  onVarietyDelete: (commodityName: string, variety: string) => void;
}

export function CommodityTabs({
  commodities,
  sensors,
  onCommodityDragEnd,
  onCommodityEdit,
  onCommodityDelete,
  onBagSizeAdd,
  onBagSizeDragEnd,
  onBagSizeEdit,
  onBagSizeDelete,
  onVarietyAdd,
  onVarietyDragEnd,
  onVarietyEdit,
  onVarietyDelete,
}: CommodityTabsProps) {
  if (commodities.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-muted-foreground">
        No commodities configured. Click "Add Commodity" to create one.
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onCommodityDragEnd}>
      <Tabs defaultValue={commodities[0]?.name} className="w-full">
        <TabsList className="mb-4 flex-wrap">
          <SortableContext
            items={commodities.map((c) => c.name)}
            strategy={verticalListSortingStrategy}
          >
            {commodities.map((commodity) => (
              <CommodityTabItem
                key={commodity.name}
                commodity={commodity}
                onEdit={() => onCommodityEdit(commodity)}
                onDelete={() => onCommodityDelete(commodity.name)}
              />
            ))}
          </SortableContext>
        </TabsList>
        {commodities.map((commodity) => (
          <TabsContent key={commodity.name} value={commodity.name} className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">{commodity.name}</h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>
                    {commodity.sizes.length} size{commodity.sizes.length !== 1 ? 's' : ''}
                  </span>
                  <span>•</span>
                  <span>
                    {commodity.varieties.length} variet
                    {commodity.varieties.length !== 1 ? 'ies' : 'y'}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => onBagSizeAdd(commodity.name)}
                  size="sm"
                  variant="outline"
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Bag Size
                </Button>
                <Button onClick={() => onVarietyAdd(commodity.name)} size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Variety
                </Button>
              </div>
            </div>

            {/* Sizes Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">Bag Sizes:</p>
              </div>
              <BagSizesList
                sizes={commodity.sizes}
                commodityName={commodity.name}
                sensors={sensors}
                onDragEnd={(e) => onBagSizeDragEnd(e, commodity.name)}
                onEdit={(size, index) => onBagSizeEdit(commodity.name, size, index)}
                onDelete={(size) => onBagSizeDelete(commodity.name, size)}
              />
            </div>

            <Separator />

            {/* Varieties Table */}
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Varieties:</p>
              <VarietiesTable
                varieties={commodity.varieties}
                commodityName={commodity.name}
                sensors={sensors}
                onDragEnd={(e) => onVarietyDragEnd(e, commodity.name)}
                onEdit={(variety) => onVarietyEdit(commodity.name, variety)}
                onDelete={(variety) => onVarietyDelete(commodity.name, variety)}
              />
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </DndContext>
  );
}
