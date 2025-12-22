import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface DeleteConfirmationsProps {
  deleteCommodityConfirm: { open: boolean; commodityName: string };
  onCommodityConfirmChange: (open: boolean) => void;
  onCommodityDelete: () => void;
  deleteBagSizeConfirm: { open: boolean; commodityName: string; size: string };
  onBagSizeConfirmChange: (open: boolean) => void;
  onBagSizeDelete: () => void;
  deleteVarietyConfirm: { open: boolean; commodityName: string; variety: string };
  onVarietyConfirmChange: (open: boolean) => void;
  onVarietyDelete: () => void;
  deleteBagSizeInFormConfirm: { open: boolean; size: string };
  onBagSizeInFormConfirmChange: (open: boolean) => void;
  onBagSizeInFormDelete: () => void;
  deleteVarietyInFormConfirm: { open: boolean; variety: string };
  onVarietyInFormConfirmChange: (open: boolean) => void;
  onVarietyInFormDelete: () => void;
}

export function DeleteConfirmations({
  deleteCommodityConfirm,
  onCommodityConfirmChange,
  onCommodityDelete,
  deleteBagSizeConfirm,
  onBagSizeConfirmChange,
  onBagSizeDelete,
  deleteVarietyConfirm,
  onVarietyConfirmChange,
  onVarietyDelete,
  deleteBagSizeInFormConfirm,
  onBagSizeInFormConfirmChange,
  onBagSizeInFormDelete,
  deleteVarietyInFormConfirm,
  onVarietyInFormConfirmChange,
  onVarietyInFormDelete,
}: DeleteConfirmationsProps) {
  return (
    <>
      {/* Delete Commodity Confirmation */}
      <AlertDialog open={deleteCommodityConfirm.open} onOpenChange={onCommodityConfirmChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Commodity</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the commodity "{deleteCommodityConfirm.commodityName}
              "? This action cannot be undone and will also remove all associated bag sizes and
              varieties.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onCommodityDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Bag Size Confirmation */}
      <AlertDialog open={deleteBagSizeConfirm.open} onOpenChange={onBagSizeConfirmChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Bag Size</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the bag size "{deleteBagSizeConfirm.size}" from "
              {deleteBagSizeConfirm.commodityName}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onBagSizeDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Variety Confirmation */}
      <AlertDialog open={deleteVarietyConfirm.open} onOpenChange={onVarietyConfirmChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Variety</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the variety "{deleteVarietyConfirm.variety}" from "
              {deleteVarietyConfirm.commodityName}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onVarietyDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Bag Size in Form Confirmation */}
      <AlertDialog
        open={deleteBagSizeInFormConfirm.open}
        onOpenChange={onBagSizeInFormConfirmChange}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Bag Size</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove the bag size "{deleteBagSizeInFormConfirm.size}"? This
              will only remove it from the form and won't be saved until you save the commodity.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onBagSizeInFormDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Variety in Form Confirmation */}
      <AlertDialog
        open={deleteVarietyInFormConfirm.open}
        onOpenChange={onVarietyInFormConfirmChange}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Variety</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove the variety "{deleteVarietyInFormConfirm.variety}"?
              This will only remove it from the form and won't be saved until you save the
              commodity.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onVarietyInFormDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
