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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, MapPin, User } from 'lucide-react';
import { useState } from 'react';
import type { LocationAnalytics } from '@/types/analytics';

export function LocationAnalyticsTable({ data }: { data: LocationAnalytics[] }) {
  const [expandedLocations, setExpandedLocations] = useState<string[]>([]);

  const toggleLocation = (locationId: string) => {
    setExpandedLocations((prev) =>
      prev.includes(locationId) ? prev.filter((id) => id !== locationId) : [...prev, locationId]
    );
  };

  // Sort by total bags descending
  const sortedLocations = [...data].sort((a, b) => b.totalCurrentBags - a.totalCurrentBags);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Location-wise Inventory</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Detailed breakdown of stock by storage location and farmer
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead className="min-w-[200px]">Location</TableHead>
                <TableHead className="text-center">Farmers</TableHead>
                <TableHead className="text-center">Total Bags</TableHead>
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
                        <TableCell>
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${
                              expandedLocations.includes(location.locationId) ? 'rotate-180' : ''
                            }`}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">
                                Floor {location.floor} • Row {location.row} • Chamber{' '}
                                {location.chamber}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Location ID: {location.locationId.slice(-8)}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">{location.breakdownByFarmer.length}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-semibold text-primary">
                            {location.totalCurrentBags.toLocaleString()}
                          </span>
                        </TableCell>
                      </TableRow>
                    </CollapsibleTrigger>
                    <CollapsibleContent asChild>
                      <>
                        {location.breakdownByFarmer.map((farmer) => (
                          <TableRow key={farmer.farmerId} className="bg-muted/30">
                            <TableCell></TableCell>
                            <TableCell colSpan={3}>
                              <div className="py-2 space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">{farmer.farmerName}</span>
                                    <Badge variant="outline" className="text-xs">
                                      Account #{farmer.accountNumber}
                                    </Badge>
                                  </div>
                                  <Badge className="text-xs">
                                    {farmer.totalCurrentBags.toLocaleString()} bags
                                  </Badge>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 pl-6">
                                  {farmer.details.map((detail, idx) => (
                                    <div
                                      key={idx}
                                      className="p-3 rounded-lg bg-background border border-border"
                                    >
                                      <div className="text-xs text-muted-foreground mb-1">
                                        {detail.commodity} • {detail.variety}
                                      </div>
                                      <div className="flex items-baseline justify-between mb-1">
                                        <span className="text-xs font-medium">{detail.size}</span>
                                        <span className="text-base font-bold text-primary">
                                          {detail.currentQuantity}
                                        </span>
                                      </div>
                                      {detail.currentQuantity !== detail.initialQuantity && (
                                        <div className="text-xs text-muted-foreground">
                                          Initial: {detail.initialQuantity}
                                        </div>
                                      )}
                                      <div className="text-xs text-muted-foreground mt-1">
                                        Stored:{' '}
                                        {new Date(detail.storedOn).toLocaleDateString('en-US', {
                                          month: 'short',
                                          day: 'numeric',
                                          year: 'numeric',
                                        })}
                                      </div>
                                    </div>
                                  ))}
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
