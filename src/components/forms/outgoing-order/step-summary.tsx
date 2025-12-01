import React from 'react';

import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

interface StepSummaryProps {
  selectedFarmer: {
    name: string;
    mobileNumber: string;
    address?: string;
  } | null;
  selectedCommodity: string;
  selectedVariety: string;
  remarksRef: React.RefObject<HTMLTextAreaElement | null>;
  onSubmit: () => void;
}

export function StepSummary({
  selectedFarmer,
  selectedCommodity,
  selectedVariety,
  remarksRef,
  onSubmit,
}: StepSummaryProps) {
  return (
    <div className="space-y-8">
      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Order Summary</CardTitle>
          <CardDescription>Review the details before submitting</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Farmer */}
          {selectedFarmer && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Farmer</Label>

              <div className="flex flex-col gap-1">
                <p className="text-base font-semibold">{selectedFarmer.name}</p>

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span>📞 {selectedFarmer.mobileNumber}</span>
                  {selectedFarmer.address && (
                    <span className="truncate max-w-[300px]">📍 {selectedFarmer.address}</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Commodity */}
          {selectedCommodity && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Commodity</Label>
              <p className="text-base font-semibold">{selectedCommodity}</p>
            </div>
          )}

          {/* Variety */}
          {selectedVariety && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Variety</Label>
              <p className="text-base font-semibold">{selectedVariety}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Remarks */}
      <div className="space-y-3">
        <Label htmlFor="remarks" className="text-base font-medium">
          Add Remarks
        </Label>

        <Textarea
          ref={remarksRef}
          id="remarks"
          placeholder="Enter any additional remarks or notes..."
          className="min-h-[120px]"
          onKeyDown={(e) => {
            // Submit with Enter (without Shift/Ctrl/Meta)
            if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
              e.preventDefault();
              onSubmit();
            }
          }}
        />
      </div>
    </div>
  );
}
