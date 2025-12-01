import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface QuantityDialogProps {
  open: boolean;
  quantityInput: string;
  quantityError: string;
  maxQuantity: number;
  selectedCardKey: string | null;
  quantities: Map<string, number>;
  onQuantityInputChange: (value: string) => void;
  onQuantitySubmit: () => void;
  onQuantityRemove: () => void;
  onClose: () => void;
}

export const QuantityDialog: React.FC<QuantityDialogProps> = ({
  open,
  quantityInput,
  quantityError,
  maxQuantity,
  selectedCardKey,
  quantities,
  onQuantityInputChange,
  onQuantitySubmit,
  onClose,
  onQuantityRemove,
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Enter quantity to remove</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground/80">
            Specify the amount you wish to remove from this item.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="quantity-input" className="text-sm font-medium text-foreground/90">
                Quantity
              </label>

              {maxQuantity > 0 && (
                <span className="text-xs text-muted-foreground/70">
                  Max: {maxQuantity.toFixed(1)}
                </span>
              )}
            </div>

            <Input
              id="quantity-input"
              type="number"
              placeholder="0.0"
              value={quantityInput}
              onChange={(e) => onQuantityInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (!quantityError) onQuantitySubmit();
                }
              }}
              autoFocus
              min="0"
              max={maxQuantity}
              step="0.1"
              className={cn(
                'text-base',
                quantityError && 'border-destructive focus-visible:ring-destructive/20'
              )}
            />

            {quantityError && <p className="text-xs text-destructive mt-1">{quantityError}</p>}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {selectedCardKey && quantities.has(selectedCardKey) && (
            <Button variant="destructive" onClick={onQuantityRemove} className="sm:min-w-[80px]">
              Remove
            </Button>
          )}

          <Button variant="outline" onClick={onClose} className="sm:min-w-[80px]">
            Cancel
          </Button>

          <Button
            onClick={onQuantitySubmit}
            className="sm:min-w-[80px]"
            disabled={!!quantityError || !quantityInput || parseFloat(quantityInput) <= 0}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
