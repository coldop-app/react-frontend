'use client';

import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface FilterDropdownsProps {
  orderFilter: string;
  sortFilter: string;
  commodityFilter: string;
  commodities: { name: string; sizes: string[] }[];
  onOrderFilterChange: (filter: string) => void;
  onSortFilterChange: (filter: string) => void;
  onCommodityFilterChange: (filter: string) => void;
}

export default function FilterDropdowns({
  orderFilter,
  sortFilter,
  commodityFilter,
  commodities,
  onOrderFilterChange,
  onSortFilterChange,
  onCommodityFilterChange,
}: FilterDropdownsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <span className="truncate">{orderFilter}</span>
            <ChevronDown className="h-4 w-4 flex-shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-full sm:w-auto">
          <DropdownMenuItem onClick={() => onOrderFilterChange('All Orders')}>
            All Orders
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onOrderFilterChange('Incoming')}>
            Incoming
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onOrderFilterChange('Outgoing')}>
            Outgoing
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <span className="truncate">{commodityFilter}</span>
            <ChevronDown className="h-4 w-4 flex-shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-full sm:w-auto">
          <DropdownMenuItem onClick={() => onCommodityFilterChange('All Commodities')}>
            All Commodities
          </DropdownMenuItem>
          {commodities.map((commodity) => (
            <DropdownMenuItem
              key={commodity.name}
              onClick={() => onCommodityFilterChange(commodity.name)}
            >
              {commodity.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <span className="truncate">{sortFilter}</span>
            <ChevronDown className="h-4 w-4 flex-shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-full sm:w-auto">
          <DropdownMenuItem onClick={() => onSortFilterChange('Latest First')}>
            Latest First
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSortFilterChange('Oldest First')}>
            Oldest First
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSortFilterChange('Receipt Number')}>
            Receipt Number
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
