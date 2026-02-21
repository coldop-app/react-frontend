import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import SearchBar from './search-bar';
import FilterDropdowns from './filter-dropdown';
import ActionButtons from './action-buttons';
import type { ColdStoragePreferences } from '@/types/coldStorage';
import { Filter, X } from 'lucide-react';

interface ToolbarProps {
  total: number | null;
  searchQuery: string;
  orderFilter: string;
  sortFilter: string;
  commodityFilter: string;
  preferences?: ColdStoragePreferences;
  preferencesId: string;
  onSearchChange: (query: string) => void;
  onOrderFilterChange: (filter: string) => void;
  onSortFilterChange: (filter: string) => void;
  onCommodityFilterChange: (filter: string) => void;
  onAddPayment?: () => void;
  dateFromInput: string;
  dateToInput: string;
  onDateFromInputChange: (value: string) => void;
  onDateToInputChange: (value: string) => void;
  onApplyDateRange: () => void;
  onClearDateRange: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  total,
  searchQuery,
  orderFilter,
  sortFilter,
  commodityFilter,
  preferences,
  preferencesId,
  onSearchChange,
  onOrderFilterChange,
  onSortFilterChange,
  onCommodityFilterChange,
  onAddPayment,
  dateFromInput,
  dateToInput,
  onDateFromInputChange,
  onDateToInputChange,
  onApplyDateRange,
  onClearDateRange,
}) => {
  return (
    <div className="pb-8 space-y-4">
      <Card className="w-full">
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-10 items-center justify-center rounded-lg bg-muted">
              <div className="h-4 w-4 rounded-sm bg-primary"></div>
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-bold text-foreground">{total}</span>
              <span className="ml-2 text-sm sm:text-base text-foreground">orders</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Actions */}
      <Card>
        <CardContent>
          <div className="space-y-4 sm:space-y-6">
            {/* Search Bar */}
            <SearchBar searchQuery={searchQuery} onSearchChange={onSearchChange} />

            {/* Date range filter — same layout as analytics */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm font-medium text-muted-foreground">
                  Show by date range
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-1 min-w-0">
                <div className="space-y-2">
                  <Label htmlFor="daybook-date-from" className="text-sm font-medium">
                    Date from
                  </Label>
                  <Input
                    id="daybook-date-from"
                    type="date"
                    value={dateFromInput}
                    onChange={(e) => onDateFromInputChange(e.target.value)}
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="daybook-date-to" className="text-sm font-medium">
                    Date to
                  </Label>
                  <Input
                    id="daybook-date-to"
                    type="date"
                    value={dateToInput}
                    onChange={(e) => onDateToInputChange(e.target.value)}
                    className="h-10"
                  />
                </div>
                <div className="flex items-end gap-2 flex-wrap">
                  <Button
                    type="button"
                    variant="default"
                    size="default"
                    className="h-10 px-4 gap-2"
                    onClick={onApplyDateRange}
                  >
                    <Filter className="h-4 w-4" />
                    Apply
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="default"
                    className="h-10 px-4 gap-2"
                    onClick={onClearDateRange}
                  >
                    <X className="h-4 w-4" />
                    Clear
                  </Button>
                </div>
              </div>
            </div>

            {/* Filters and Actions */}
            <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-center lg:justify-between">
              {/* Filter Dropdowns */}
              <div className="flex flex-col sm:flex-row gap-3">
                <FilterDropdowns
                  orderFilter={orderFilter}
                  sortFilter={sortFilter}
                  commodityFilter={commodityFilter}
                  commodities={preferences?.commodities || []}
                  onOrderFilterChange={onOrderFilterChange}
                  onSortFilterChange={onSortFilterChange}
                  onCommodityFilterChange={onCommodityFilterChange}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <ActionButtons preferencesId={preferencesId} onAddPayment={onAddPayment} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Toolbar;
