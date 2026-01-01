import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Settings, CheckCircle2, XCircle } from 'lucide-react';
import type { PreferencesData } from '@/types/settings/preferences';

interface AdditionalSettingsProps {
  preferencesData: PreferencesData;
  showAdditionalSettings: boolean;
}

export function AdditionalSettings({
  preferencesData,
  showAdditionalSettings,
}: AdditionalSettingsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      {/* Incoming Settings */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            <CardTitle className="text-base sm:text-lg">Incoming Settings</CardTitle>
          </div>
          <CardDescription className="text-xs sm:text-sm">
            Configuration for incoming orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              <span className="text-xs sm:text-sm font-medium">Show Custom Marka</span>
              {preferencesData.incoming.showCustomMarka ? (
                <Badge variant="default" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Enabled
                </Badge>
              ) : (
                <Badge variant="outline" className="gap-1">
                  <XCircle className="h-3 w-3" />
                  Disabled
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Fields */}
      {showAdditionalSettings && (
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <CardTitle className="text-base sm:text-lg">Additional Fields</CardTitle>
            </div>
            <CardDescription className="text-xs sm:text-sm">
              Optional configuration fields
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
                <span className="text-xs sm:text-sm font-medium">Generation</span>
                <span className="text-xs sm:text-sm text-muted-foreground">
                  {preferencesData.generation || 'Not set'}
                </span>
              </div>
              <Separator />
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
                <span className="text-xs sm:text-sm font-medium">Rouging</span>
                <span className="text-xs sm:text-sm text-muted-foreground">
                  {preferencesData.rouging || 'Not set'}
                </span>
              </div>
              <Separator />
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
                <span className="text-xs sm:text-sm font-medium">Tuber Type</span>
                <span className="text-xs sm:text-sm text-muted-foreground">
                  {preferencesData.tuberType || 'Not set'}
                </span>
              </div>
              <Separator />
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
                <span className="text-xs sm:text-sm font-medium">Grader</span>
                <span className="text-xs sm:text-sm text-muted-foreground">
                  {preferencesData.grader || 'Not set'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
