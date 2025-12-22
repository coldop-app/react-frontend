import { useState, useMemo } from 'react';
import { useStore } from '@/stores/store';
import { usePreferences } from '@/services/base/settings/usePreferences';
import { useUpdatePreferences } from '@/services/base/settings/useUpdatePreferences';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { AlertCircle, RefreshCw, Layers, Plus } from 'lucide-react';
import type { PreferencesData } from '@/types/settings/preferences';
import { CommodityTabs } from './CommodityTabs';
import { AdditionalSettings } from './AdditionalSettings';
import { CommodityFormDialog } from './CommodityFormDialog';
import { VarietyDialog } from './VarietyDialog';
import { BagSizeDialog } from './BagSizeDialog';
import { DeleteConfirmations } from './DeleteConfirmations';

interface CommodityFormData {
  name: string;
  sizes: string[];
  varieties: string[];
}

export const PreferencesSettingsPage = () => {
  const { coldStorage } = useStore();
  const preferencesId = coldStorage?.preferences?.id;

  const { data, isLoading, isError, error, refetch } = usePreferences(
    preferencesId ? { preferencesId } : undefined
  );
  const updatePreferences = useUpdatePreferences();

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Dialog states
  const [isCommodityDialogOpen, setIsCommodityDialogOpen] = useState(false);
  const [isVarietyDialogOpen, setIsVarietyDialogOpen] = useState(false);
  const [isBagSizeDialogOpen, setIsBagSizeDialogOpen] = useState(false);
  const [editingCommodity, setEditingCommodity] = useState<CommodityFormData | null>(null);
  const [editingVariety, setEditingVariety] = useState<{
    commodityName: string;
    variety: string | null;
  } | null>(null);
  const [editingBagSize, setEditingBagSize] = useState<{
    commodityName: string;
    size: string | null;
    index: number;
  } | null>(null);
  const [varietyName, setVarietyName] = useState('');
  const [bagSizeName, setBagSizeName] = useState('');
  const [selectedCommodity, setSelectedCommodity] = useState<string>('');

  // Delete confirmation dialog states
  const [deleteCommodityConfirm, setDeleteCommodityConfirm] = useState<{
    open: boolean;
    commodityName: string;
  }>({ open: false, commodityName: '' });
  const [deleteBagSizeConfirm, setDeleteBagSizeConfirm] = useState<{
    open: boolean;
    commodityName: string;
    size: string;
  }>({ open: false, commodityName: '', size: '' });
  const [deleteVarietyConfirm, setDeleteVarietyConfirm] = useState<{
    open: boolean;
    commodityName: string;
    variety: string;
  }>({ open: false, commodityName: '', variety: '' });
  const [deleteBagSizeInFormConfirm, setDeleteBagSizeInFormConfirm] = useState<{
    open: boolean;
    size: string;
  }>({ open: false, size: '' });
  const [deleteVarietyInFormConfirm, setDeleteVarietyInFormConfirm] = useState<{
    open: boolean;
    variety: string;
  }>({ open: false, variety: '' });

  const showAdditionalSettings = useMemo<boolean>(() => {
    return (data?.data?.customFields?.showAdditionalOptions as boolean) ?? false;
  }, [data]);

  // Commodity form state
  const [commodityForm, setCommodityForm] = useState<CommodityFormData>({
    name: '',
    sizes: [],
    varieties: [],
  });

  // Handle commodity operations
  const handleOpenCreateCommodityDialog = () => {
    setCommodityForm({ name: '', sizes: [], varieties: [] });
    setEditingCommodity(null);
    setIsCommodityDialogOpen(true);
  };

  const handleOpenEditCommodityDialog = (commodity: PreferencesData['commodities'][0]) => {
    setCommodityForm({
      name: commodity.name,
      sizes: [...commodity.sizes],
      varieties: [...commodity.varieties],
    });
    setEditingCommodity(commodity);
    setIsCommodityDialogOpen(true);
  };

  const handleCloseCommodityDialog = () => {
    setIsCommodityDialogOpen(false);
    setCommodityForm({ name: '', sizes: [], varieties: [] });
    setEditingCommodity(null);
  };

  const handleSaveCommodity = () => {
    if (!preferencesId || !commodityForm.name.trim()) return;

    const currentData = data?.data;
    if (!currentData) return;

    let updatedCommodities: PreferencesData['commodities'];

    if (editingCommodity) {
      // Update existing commodity
      updatedCommodities = currentData.commodities.map((c) =>
        c.name === editingCommodity.name
          ? {
              name: commodityForm.name,
              sizes: commodityForm.sizes,
              varieties: commodityForm.varieties,
            }
          : c
      );
    } else {
      // Add new commodity
      updatedCommodities = [
        ...currentData.commodities,
        {
          name: commodityForm.name,
          sizes: commodityForm.sizes,
          varieties: commodityForm.varieties,
        },
      ];
    }

    updatePreferences.mutate(
      {
        preferencesId,
        data: {
          ...currentData,
          commodities: updatedCommodities,
        },
      },
      {
        onSuccess: () => {
          handleCloseCommodityDialog();
        },
      }
    );
  };

  // Handle bag size operations
  const handleAddBagSize = (commodityName: string) => {
    setSelectedCommodity(commodityName);
    setEditingBagSize(null);
    setBagSizeName('');
    setIsBagSizeDialogOpen(true);
  };

  const handleEditBagSize = (commodityName: string, size: string, index: number) => {
    setSelectedCommodity(commodityName);
    setEditingBagSize({ commodityName, size, index });
    setBagSizeName(size);
    setIsBagSizeDialogOpen(true);
  };

  const handleDeleteBagSizeClick = (commodityName: string, size: string) => {
    setDeleteBagSizeConfirm({ open: true, commodityName, size });
  };

  const handleDeleteBagSize = () => {
    if (!preferencesId) return;

    const currentData = data?.data;
    if (!currentData) return;

    const updatedCommodities = currentData.commodities.map((c) =>
      c.name === deleteBagSizeConfirm.commodityName
        ? {
            ...c,
            sizes: c.sizes.filter((s) => s !== deleteBagSizeConfirm.size),
          }
        : c
    );

    updatePreferences.mutate({
      preferencesId,
      data: {
        ...currentData,
        commodities: updatedCommodities,
      },
    });

    setDeleteBagSizeConfirm({ open: false, commodityName: '', size: '' });
  };

  const handleSaveBagSize = () => {
    if (!preferencesId || !bagSizeName.trim()) return;

    const currentData = data?.data;
    if (!currentData) return;

    const commodity = currentData.commodities.find((c) => c.name === selectedCommodity);
    if (!commodity) return;

    let updatedSizes: string[];

    if (editingBagSize) {
      // Update existing bag size
      updatedSizes = commodity.sizes.map((s, idx) =>
        idx === editingBagSize.index ? bagSizeName.trim() : s
      );
    } else {
      // Add new bag size
      if (commodity.sizes.includes(bagSizeName.trim())) {
        return; // Prevent duplicates
      }
      updatedSizes = [...commodity.sizes, bagSizeName.trim()];
    }

    const updatedCommodities = currentData.commodities.map((c) =>
      c.name === selectedCommodity ? { ...c, sizes: updatedSizes } : c
    );

    updatePreferences.mutate(
      {
        preferencesId,
        data: {
          ...currentData,
          commodities: updatedCommodities,
        },
      },
      {
        onSuccess: () => {
          setIsBagSizeDialogOpen(false);
          setEditingBagSize(null);
          setBagSizeName('');
          setSelectedCommodity('');
        },
      }
    );
  };

  // Handle variety operations
  const handleOpenCreateVarietyDialog = (commodityName: string) => {
    setSelectedCommodity(commodityName);
    setEditingVariety(null);
    setVarietyName('');
    setIsVarietyDialogOpen(true);
  };

  const handleOpenEditVarietyDialog = (commodityName: string, variety: string) => {
    setSelectedCommodity(commodityName);
    setEditingVariety({ commodityName, variety });
    setVarietyName(variety);
    setIsVarietyDialogOpen(true);
  };

  const handleDeleteVarietyClick = (commodityName: string, variety: string) => {
    setDeleteVarietyConfirm({ open: true, commodityName, variety });
  };

  const handleDeleteVariety = () => {
    if (!preferencesId) return;

    const currentData = data?.data;
    if (!currentData) return;

    const updatedCommodities = currentData.commodities.map((c) =>
      c.name === deleteVarietyConfirm.commodityName
        ? {
            ...c,
            varieties: c.varieties.filter((v) => v !== deleteVarietyConfirm.variety),
          }
        : c
    );

    updatePreferences.mutate({
      preferencesId,
      data: {
        ...currentData,
        commodities: updatedCommodities,
      },
    });

    setDeleteVarietyConfirm({ open: false, commodityName: '', variety: '' });
  };

  const handleSaveVariety = () => {
    if (!preferencesId || !varietyName.trim()) return;

    const currentData = data?.data;
    if (!currentData) return;

    const commodity = currentData.commodities.find((c) => c.name === selectedCommodity);
    if (!commodity) return;

    let updatedVarieties: string[];

    if (editingVariety) {
      // Update existing variety
      updatedVarieties = commodity.varieties.map((v) =>
        v === editingVariety.variety ? varietyName.trim() : v
      );
    } else {
      // Add new variety
      if (commodity.varieties.includes(varietyName.trim())) {
        return; // Prevent duplicates
      }
      updatedVarieties = [...commodity.varieties, varietyName.trim()];
    }

    const updatedCommodities = currentData.commodities.map((c) =>
      c.name === selectedCommodity ? { ...c, varieties: updatedVarieties } : c
    );

    updatePreferences.mutate(
      {
        preferencesId,
        data: {
          ...currentData,
          commodities: updatedCommodities,
        },
      },
      {
        onSuccess: () => {
          setIsVarietyDialogOpen(false);
          setEditingVariety(null);
          setVarietyName('');
          setSelectedCommodity('');
        },
      }
    );
  };

  // Handle commodity reordering
  const handleDragEndCommodities = (event: DragEndEvent) => {
    if (!preferencesId) return;

    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const currentData = data?.data;
    if (!currentData) return;

    const oldIndex = currentData.commodities.findIndex((c) => c.name === active.id);
    const newIndex = currentData.commodities.findIndex((c) => c.name === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newCommodities = arrayMove(currentData.commodities, oldIndex, newIndex);

      updatePreferences.mutate({
        preferencesId,
        data: {
          ...currentData,
          commodities: newCommodities,
        },
      });
    }
  };

  const handleDragEndBagSizes = (event: DragEndEvent, commodityName: string) => {
    if (!preferencesId) return;

    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const currentData = data?.data;
    if (!currentData) return;

    const commodity = currentData.commodities.find((c) => c.name === commodityName);
    if (!commodity) return;

    const oldIndex = commodity.sizes.findIndex((s) => s === active.id);
    const newIndex = commodity.sizes.findIndex((s) => s === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newSizes = arrayMove(commodity.sizes, oldIndex, newIndex);

      const updatedCommodities = currentData.commodities.map((c) =>
        c.name === commodityName ? { ...c, sizes: newSizes } : c
      );

      updatePreferences.mutate({
        preferencesId,
        data: {
          ...currentData,
          commodities: updatedCommodities,
        },
      });
    }
  };

  const handleDragEndVarieties = (event: DragEndEvent, commodityName: string) => {
    if (!preferencesId) return;

    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const currentData = data?.data;
    if (!currentData) return;

    const commodity = currentData.commodities.find((c) => c.name === commodityName);
    if (!commodity) return;

    const oldIndex = commodity.varieties.findIndex((v) => v === active.id);
    const newIndex = commodity.varieties.findIndex((v) => v === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newVarieties = arrayMove(commodity.varieties, oldIndex, newIndex);

      const updatedCommodities = currentData.commodities.map((c) =>
        c.name === commodityName ? { ...c, varieties: newVarieties } : c
      );

      updatePreferences.mutate({
        preferencesId,
        data: {
          ...currentData,
          commodities: updatedCommodities,
        },
      });
    }
  };

  const handleDeleteCommodityClick = (commodityName: string) => {
    setDeleteCommodityConfirm({ open: true, commodityName });
  };

  const handleDeleteCommodity = () => {
    if (!preferencesId) return;

    const currentData = data?.data;
    if (!currentData) return;

    const updatedCommodities = currentData.commodities.filter(
      (c) => c.name !== deleteCommodityConfirm.commodityName
    );

    updatePreferences.mutate({
      preferencesId,
      data: {
        ...currentData,
        commodities: updatedCommodities,
      },
    });

    setDeleteCommodityConfirm({ open: false, commodityName: '' });
  };

  // Bag size management in commodity form
  const handleAddBagSizeInForm = () => {
    if (bagSizeName.trim() && !commodityForm.sizes.includes(bagSizeName.trim())) {
      setCommodityForm((prev) => ({
        ...prev,
        sizes: [...prev.sizes, bagSizeName.trim()],
      }));
      setBagSizeName('');
    }
  };

  const handleRemoveBagSizeInFormClick = (size: string) => {
    setDeleteBagSizeInFormConfirm({ open: true, size });
  };

  const handleRemoveBagSizeInForm = () => {
    setCommodityForm((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((s) => s !== deleteBagSizeInFormConfirm.size),
    }));
    setDeleteBagSizeInFormConfirm({ open: false, size: '' });
  };

  const handleEditBagSizeInForm = (oldSize: string, newSize: string) => {
    if (newSize.trim() && !commodityForm.sizes.includes(newSize.trim())) {
      setCommodityForm((prev) => ({
        ...prev,
        sizes: prev.sizes.map((s) => (s === oldSize ? newSize.trim() : s)),
      }));
    }
  };

  const handleDragEndBagSizesInForm = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = commodityForm.sizes.findIndex((s) => s === active.id);
    const newIndex = commodityForm.sizes.findIndex((s) => s === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newSizes = arrayMove(commodityForm.sizes, oldIndex, newIndex);
      setCommodityForm((prev) => ({ ...prev, sizes: newSizes }));
    }
  };

  // Variety management in commodity form
  const handleAddVarietyInForm = () => {
    if (varietyName.trim() && !commodityForm.varieties.includes(varietyName.trim())) {
      setCommodityForm((prev) => ({
        ...prev,
        varieties: [...prev.varieties, varietyName.trim()],
      }));
      setVarietyName('');
    }
  };

  const handleRemoveVarietyInFormClick = (variety: string) => {
    setDeleteVarietyInFormConfirm({ open: true, variety });
  };

  const handleRemoveVarietyInForm = () => {
    setCommodityForm((prev) => ({
      ...prev,
      varieties: prev.varieties.filter((v) => v !== deleteVarietyInFormConfirm.variety),
    }));
    setDeleteVarietyInFormConfirm({ open: false, variety: '' });
  };

  const handleEditVarietyInForm = (oldVariety: string, newVariety: string) => {
    if (newVariety.trim() && !commodityForm.varieties.includes(newVariety.trim())) {
      setCommodityForm((prev) => ({
        ...prev,
        varieties: prev.varieties.map((v) => (v === oldVariety ? newVariety.trim() : v)),
      }));
    }
  };

  const handleDragEndVarietiesInForm = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = commodityForm.varieties.findIndex((v) => v === active.id);
    const newIndex = commodityForm.varieties.findIndex((v) => v === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newVarieties = arrayMove(commodityForm.varieties, oldIndex, newIndex);
      setCommodityForm((prev) => ({ ...prev, varieties: newVarieties }));
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="p-4 md:p-6 space-y-6 min-h-screen">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {[...Array(8)].map((_, i) => (
                  <Skeleton key={i} className="h-6 w-20 rounded-full" />
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Error state
  if (isError || !preferencesId) {
    return (
      <div className="p-4 md:p-6 min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center space-y-4">
            <div className="flex justify-center">
              <div className="rounded-full bg-destructive/10 p-3">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Failed to load preferences</h3>
              <p className="text-sm text-muted-foreground">
                {!preferencesId
                  ? 'Preferences ID not found. Please ensure you are logged in with a valid cold storage account.'
                  : error?.message || 'An unexpected error occurred while fetching preferences.'}
              </p>
            </div>
            {preferencesId && (
              <Button onClick={() => refetch()} variant="outline" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  const preferencesData = data?.data;

  if (!preferencesData) {
    return (
      <div className="p-4 md:p-6 min-h-screen flex items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Data</AlertTitle>
          <AlertDescription>Preferences data is not available.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Preferences</h1>
          <p className="text-muted-foreground">
            View and manage your cold storage preferences, varieties, and commodities.
          </p>
        </div>
        <Button onClick={handleOpenCreateCommodityDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Commodity
        </Button>
      </div>

      {/* Commodities with Tabs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              <CardTitle>Commodities & Varieties</CardTitle>
            </div>
            <CardDescription>
              {preferencesData.commodities.length} commodit
              {preferencesData.commodities.length !== 1 ? 'ies' : 'y'} configured
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <CommodityTabs
            commodities={preferencesData.commodities}
            sensors={sensors}
            onCommodityDragEnd={handleDragEndCommodities}
            onCommodityEdit={handleOpenEditCommodityDialog}
            onCommodityDelete={handleDeleteCommodityClick}
            onBagSizeAdd={handleAddBagSize}
            onBagSizeDragEnd={handleDragEndBagSizes}
            onBagSizeEdit={handleEditBagSize}
            onBagSizeDelete={handleDeleteBagSizeClick}
            onVarietyAdd={handleOpenCreateVarietyDialog}
            onVarietyDragEnd={handleDragEndVarieties}
            onVarietyEdit={handleOpenEditVarietyDialog}
            onVarietyDelete={handleDeleteVarietyClick}
          />
        </CardContent>
      </Card>

      {/* Additional Settings */}
      <AdditionalSettings
        preferencesData={preferencesData}
        showAdditionalSettings={showAdditionalSettings}
      />

      {/* Dialogs */}
      <CommodityFormDialog
        open={isCommodityDialogOpen}
        onOpenChange={setIsCommodityDialogOpen}
        editingCommodity={editingCommodity}
        commodityForm={commodityForm}
        onFormChange={setCommodityForm}
        bagSizeName={bagSizeName}
        onBagSizeNameChange={setBagSizeName}
        varietyName={varietyName}
        onVarietyNameChange={setVarietyName}
        sensors={sensors}
        onBagSizeDragEnd={handleDragEndBagSizesInForm}
        onVarietyDragEnd={handleDragEndVarietiesInForm}
        onAddBagSize={handleAddBagSizeInForm}
        onEditBagSize={handleEditBagSizeInForm}
        onRemoveBagSize={handleRemoveBagSizeInFormClick}
        onAddVariety={handleAddVarietyInForm}
        onEditVariety={handleEditVarietyInForm}
        onRemoveVariety={handleRemoveVarietyInFormClick}
        onSave={handleSaveCommodity}
        onCancel={handleCloseCommodityDialog}
      />

      <VarietyDialog
        open={isVarietyDialogOpen}
        onOpenChange={setIsVarietyDialogOpen}
        editingVariety={editingVariety}
        selectedCommodity={selectedCommodity}
        varietyName={varietyName}
        onVarietyNameChange={setVarietyName}
        onSave={handleSaveVariety}
        onCancel={() => {
          setIsVarietyDialogOpen(false);
          setEditingVariety(null);
          setVarietyName('');
          setSelectedCommodity('');
        }}
      />

      <BagSizeDialog
        open={isBagSizeDialogOpen}
        onOpenChange={setIsBagSizeDialogOpen}
        editingBagSize={editingBagSize}
        selectedCommodity={selectedCommodity}
        bagSizeName={bagSizeName}
        onBagSizeNameChange={setBagSizeName}
        onSave={handleSaveBagSize}
        onCancel={() => {
          setIsBagSizeDialogOpen(false);
          setEditingBagSize(null);
          setBagSizeName('');
          setSelectedCommodity('');
        }}
      />

      {/* Delete Confirmations */}
      <DeleteConfirmations
        deleteCommodityConfirm={deleteCommodityConfirm}
        onCommodityConfirmChange={(open) => setDeleteCommodityConfirm({ open, commodityName: '' })}
        onCommodityDelete={handleDeleteCommodity}
        deleteBagSizeConfirm={deleteBagSizeConfirm}
        onBagSizeConfirmChange={(open) =>
          setDeleteBagSizeConfirm({ open, commodityName: '', size: '' })
        }
        onBagSizeDelete={handleDeleteBagSize}
        deleteVarietyConfirm={deleteVarietyConfirm}
        onVarietyConfirmChange={(open) =>
          setDeleteVarietyConfirm({ open, commodityName: '', variety: '' })
        }
        onVarietyDelete={handleDeleteVariety}
        deleteBagSizeInFormConfirm={deleteBagSizeInFormConfirm}
        onBagSizeInFormConfirmChange={(open) => setDeleteBagSizeInFormConfirm({ open, size: '' })}
        onBagSizeInFormDelete={handleRemoveBagSizeInForm}
        deleteVarietyInFormConfirm={deleteVarietyInFormConfirm}
        onVarietyInFormConfirmChange={(open) =>
          setDeleteVarietyInFormConfirm({ open, variety: '' })
        }
        onVarietyInFormDelete={handleRemoveVarietyInForm}
      />
    </div>
  );
};
