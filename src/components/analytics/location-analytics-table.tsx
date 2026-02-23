import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, MapPin, User, Filter } from 'lucide-react';
import { useState, useMemo } from 'react';
import type { LocationAnalytics } from '@/types/analytics';

export function LocationAnalyticsTable({ data }: { data: LocationAnalytics[] }) {
  const [expandedLocations, setExpandedLocations] = useState<string[]>([]);
  const [filterFloor, setFilterFloor] = useState('');
  const [filterRow, setFilterRow] = useState('');
  const [filterChamber, setFilterChamber] = useState('');

  const toggleLocation = (locationId: string) => {
    setExpandedLocations((prev) =>
      prev.includes(locationId) ? prev.filter((id) => id !== locationId) : [...prev, locationId]
    );
  };

  const filteredAndSortedLocations = useMemo(() => {
    let list = data;
    if (filterFloor.trim()) {
      const q = filterFloor.trim().toLowerCase();
      list = list.filter((loc) => loc.floor.toLowerCase().includes(q));
    }
    if (filterRow.trim()) {
      const q = filterRow.trim().toLowerCase();
      list = list.filter((loc) => loc.row.toLowerCase().includes(q));
    }
    if (filterChamber.trim()) {
      const q = filterChamber.trim().toLowerCase();
      list = list.filter((loc) => loc.chamber.toLowerCase().includes(q));
    }
    return [...list].sort((a, b) => b.totalCurrentBags - a.totalCurrentBags);
  }, [data, filterFloor, filterRow, filterChamber]);

  const sortedLocations = filteredAndSortedLocations;

  return (
    <Card>
      <CardHeader className="pb-4 px-4 sm:pb-6 sm:px-6">
        <CardTitle className="text-base sm:text-xl">Location-wise Inventory</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Detailed breakdown of stock by storage location and farmer
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 space-y-4">
        {/* Filters: Floor, Row, Chamber */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-sm font-medium text-muted-foreground">Filter by location</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="loc-filter-floor" className="text-xs font-medium">
                Floor
              </Label>
              <Input
                id="loc-filter-floor"
                type="text"
                placeholder="Any"
                value={filterFloor}
                onChange={(e) => setFilterFloor(e.target.value)}
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="loc-filter-row" className="text-xs font-medium">
                Row
              </Label>
              <Input
                id="loc-filter-row"
                type="text"
                placeholder="Any"
                value={filterRow}
                onChange={(e) => setFilterRow(e.target.value)}
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="loc-filter-chamber" className="text-xs font-medium">
                Chamber
              </Label>
              <Input
                id="loc-filter-chamber"
                type="text"
                placeholder="Any"
                value={filterChamber}
                onChange={(e) => setFilterChamber(e.target.value)}
                className="h-9"
              />
            </div>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="sm:hidden space-y-3">
          {sortedLocations.map((location) => (
            <Collapsible
              key={location.locationId}
              open={expandedLocations.includes(location.locationId)}
              onOpenChange={() => toggleLocation(location.locationId)}
            >
              <Card className="overflow-hidden">
                <CollapsibleTrigger className="w-full">
                  <div className="p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5 flex-1 min-w-0">
                        <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0 text-left">
                          <div className="font-medium text-sm leading-snug mb-1">
                            Floor {location.floor} • Row {location.row}
                          </div>
                          <div className="text-sm text-muted-foreground leading-snug">
                            Chamber {location.chamber}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1.5">
                            ID: {location.locationId.slice(-8)}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <Badge variant="secondary" className="text-xs px-2 py-1">
                          {location.breakdownByFarmer.length} farmers
                        </Badge>
                        <span className="font-bold text-primary text-base whitespace-nowrap">
                          {location.totalCurrentBags.toLocaleString()}
                        </span>
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${
                            expandedLocations.includes(location.locationId) ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="border-t bg-muted/30">
                    {location.breakdownByFarmer.map((farmer) => (
                      <div key={farmer.farmerId} className="p-4 border-b last:border-b-0">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-start gap-2 flex-1 min-w-0">
                            <User className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm mb-1.5 break-words">
                                {farmer.farmerName}
                              </div>
                              <Badge variant="outline" className="text-xs px-2 py-0.5">
                                Account #{farmer.accountNumber}
                              </Badge>
                            </div>
                          </div>
                          <Badge className="text-xs whitespace-nowrap shrink-0 px-2.5 py-1">
                            {farmer.totalCurrentBags.toLocaleString()} bags
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 gap-2.5">
                          {farmer.details.map((detail, idx) => {
                            const outgoingQuantity =
                              detail.initialQuantity - detail.currentQuantity;
                            return (
                              <div key={idx} className="p-3 rounded-lg bg-background border">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <div className="flex-1 min-w-0">
                                    <div className="text-xs text-muted-foreground mb-1 break-words leading-relaxed">
                                      {detail.commodity} • {detail.variety}
                                    </div>
                                    <div className="text-sm font-medium break-words">
                                      {detail.size}
                                    </div>
                                  </div>
                                  <span className="text-lg font-bold text-primary whitespace-nowrap">
                                    {detail.currentQuantity}
                                  </span>
                                </div>
                                <div className="space-y-1">
                                  {detail.currentQuantity !== detail.initialQuantity && (
                                    <div className="text-xs text-muted-foreground">
                                      Initial: {detail.initialQuantity}
                                    </div>
                                  )}
                                  {outgoingQuantity > 0 && (
                                    <div className="text-xs text-destructive font-medium">
                                      Outgoing: {outgoingQuantity}
                                    </div>
                                  )}
                                  <div className="text-xs text-muted-foreground">
                                    Stored:{' '}
                                    {new Date(detail.storedOn).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric',
                                    })}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 pl-4"></TableHead>
                <TableHead className="min-w-[200px] pl-4">Location</TableHead>
                <TableHead className="text-center">Farmers</TableHead>
                <TableHead className="text-center min-w-[100px] pr-4">Total Bags</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedLocations.map((location) => (
                <Collapsible
                  key={location.locationId}
                  open={expandedLocations.includes(location.locationId)}
                  onOpenChange={() => toggleLocation(location.locationId)}
                  asChild
                >
                  <>
                    <CollapsibleTrigger asChild>
                      <TableRow className="cursor-pointer hover:bg-muted/50">
                        <TableCell className="w-12 py-4 pl-4">
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${
                              expandedLocations.includes(location.locationId) ? 'rotate-180' : ''
                            }`}
                          />
                        </TableCell>
                        <TableCell className="py-4 pl-4">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                            <div className="min-w-0">
                              <div className="font-medium text-sm truncate">
                                Floor {location.floor} • Row {location.row} • Chamber{' '}
                                {location.chamber}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                ID: {location.locationId.slice(-8)}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center py-4">
                          <Badge variant="secondary" className="text-xs px-2 py-1">
                            {location.breakdownByFarmer.length}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center py-4 pr-4">
                          <span className="font-semibold text-primary text-sm whitespace-nowrap">
                            {location.totalCurrentBags.toLocaleString()}
                          </span>
                        </TableCell>
                      </TableRow>
                    </CollapsibleTrigger>
                    <CollapsibleContent asChild>
                      <>
                        {location.breakdownByFarmer.map((farmer) => (
                          <TableRow key={farmer.farmerId} className="bg-muted/30">
                            <TableCell className="w-12"></TableCell>
                            <TableCell colSpan={3} className="p-4 pr-4">
                              <div className="space-y-3">
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <User className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <span className="font-medium text-sm">{farmer.farmerName}</span>
                                    <Badge variant="outline" className="text-xs px-2 py-0.5">
                                      Account #{farmer.accountNumber}
                                    </Badge>
                                  </div>
                                  <Badge className="text-xs whitespace-nowrap px-2.5 py-1">
                                    {farmer.totalCurrentBags.toLocaleString()} bags
                                  </Badge>
                                </div>

                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                                  {farmer.details.map((detail, idx) => {
                                    const outgoingQuantity =
                                      detail.initialQuantity - detail.currentQuantity;
                                    return (
                                      <div
                                        key={idx}
                                        className="p-3 rounded-lg bg-background border"
                                      >
                                        <div className="text-xs text-muted-foreground mb-1 truncate">
                                          {detail.commodity} • {detail.variety}
                                        </div>
                                        <div className="flex items-baseline justify-between mb-1 gap-2">
                                          <span className="text-xs font-medium truncate">
                                            {detail.size}
                                          </span>
                                          <span className="text-base font-bold text-primary whitespace-nowrap">
                                            {detail.currentQuantity}
                                          </span>
                                        </div>
                                        {detail.currentQuantity !== detail.initialQuantity && (
                                          <div className="text-xs text-muted-foreground mb-1">
                                            Initial: {detail.initialQuantity}
                                          </div>
                                        )}
                                        {outgoingQuantity > 0 && (
                                          <div className="text-xs text-destructive font-medium mb-1">
                                            Outgoing: {outgoingQuantity}
                                          </div>
                                        )}
                                        <div className="text-xs text-muted-foreground">
                                          Stored:{' '}
                                          {new Date(detail.storedOn).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                          })}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </>
                    </CollapsibleContent>
                  </>
                </Collapsible>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
