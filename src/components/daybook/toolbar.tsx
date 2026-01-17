import { Card, CardContent } from '@/components/ui/card';
import SearchBar from './search-bar';
import FilterDropdowns from './filter-dropdown';
import ActionButtons from './action-buttons';
import type { ColdStoragePreferences } from '@/types/coldStorage';

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
