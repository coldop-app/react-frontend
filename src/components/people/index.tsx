import { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  type StoreAdminFarmer,
  useGetAllFarmers,
} from '@/services/base/store-admin/functions/useGetAllFarmers';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AddFarmerModal } from '../forms';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import {
  User,
  Phone,
  MapPin,
  CheckCircle2,
  XCircle,
  Search,
  ChevronDown,
  IndianRupee,
  RefreshCw,
} from 'lucide-react';

const PeoplePage = () => {
  const { data, isLoading, error, refetch, isFetching } = useGetAllFarmers();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'Name' | 'Account Number'>('Name');

  const farmers = useMemo(() => data?.data || [], [data?.data]);

  // Filter + Sort
  const filteredFarmers = useMemo(() => {
    let result = farmers;

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (farmer) =>
          farmer.name.toLowerCase().includes(q) ||
          farmer.mobileNumber.includes(q) ||
          farmer.accountNumber.toString().includes(q) ||
          farmer.address.toLowerCase().includes(q)
      );
    }

    // Sorting
    const sorted = [...result].sort((a, b) => {
      if (sortBy === 'Name') return a.name.localeCompare(b.name);
      return a.accountNumber - b.accountNumber;
    });

    return sorted;
  }, [farmers, searchQuery, sortBy]);

  // Loading State
  if (isLoading) {
    return (
      <div className="p-4 space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive">Error loading farmers. Please try again.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header Section */}
      <div className="space-y-4">
        {/* Farmers Count with Refresh */}
        <Card>
          <CardContent className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-10 items-center justify-center rounded-lg bg-muted">
                <div className="h-4 w-4 rounded-sm bg-primary"></div>
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-bold">{farmers.length}</span>
                <span className="ml-2 text-sm sm:text-base">farmers</span>
              </div>
            </div>
            <Button
              onClick={() => refetch()}
              variant="outline"
              size="sm"
              disabled={isFetching}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </CardContent>
        </Card>

        {/* Search + Sort + Add Button */}
        <Card>
          <CardContent>
            <div className="space-y-6">
              {/* Search */}
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name, mobile, account number, or address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                {/* Sort Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-auto">
                      Sort by: {sortBy}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setSortBy('Name')}>Name</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy('Account Number')}>
                      Account Number
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Add Farmer Modal */}
                <AddFarmerModal farmers={farmers} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Farmers List */}
      {filteredFarmers.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-8 text-muted-foreground">
            {searchQuery ? 'No farmers match your search.' : 'No farmers registered yet.'}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredFarmers.map((farmer) => (
            <FarmerCard farmer={farmer} key={farmer.id} />
          ))}
        </div>
      )}
    </div>
  );
};

// ---------------- FARMER CARD ---------------- //

interface FarmerCardProps {
  farmer: StoreAdminFarmer;
}

const FarmerCard = ({ farmer }: FarmerCardProps) => {
  const navigate = useNavigate();

  // Rent paid = only Add Payment RENT (exclude "Store charge for incoming order" entries which are rent due)
  const isStoreChargeEntry = (entry: { type: string; remarks?: string | null }) =>
    entry.type === 'RENT' && entry.remarks?.includes('Store charge for incoming order');

  const rentCalculations = useMemo(() => {
    const totalRent = farmer.totalRentFromOrders ?? 0;
    const paymentHistory = farmer.paymentHistory || [];
    const rentPaid = paymentHistory
      .filter((entry) => entry.type === 'RENT' && !isStoreChargeEntry(entry))
      .reduce((sum, entry) => sum + entry.amount, 0);
    const remainingRent = totalRent - rentPaid;
    return { totalRent, rentPaid, remainingRent };
  }, [farmer.paymentHistory, farmer.totalRentFromOrders]);

  const handleClick = () => {
    navigate({
      to: '/store-admin/people/$farmerStorageLinkId',
      params: { farmerStorageLinkId: farmer.id },
      state: { farmer },
    });
  };

  return (
    <div onClick={handleClick} className="block">
      <Card className="transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">{farmer.name}</CardTitle>
                <CardDescription className="mt-1">Account #{farmer.accountNumber}</CardDescription>
              </div>
            </div>

            {/* Status */}
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                farmer.isActive ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
              }`}
            >
              {farmer.isActive ? (
                <CheckCircle2 className="h-3 w-3" />
              ) : (
                <XCircle className="h-3 w-3" />
              )}
              {farmer.isActive ? 'Active' : 'Inactive'}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              {farmer.mobileNumber}
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5" />
              {farmer.address}
            </div>

            {/* Rent Information */}
            {(rentCalculations.totalRent > 0 || rentCalculations.rentPaid > 0) && (
              <div className="pt-3 border-t border-border space-y-2">
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <IndianRupee className="h-4 w-4" />
                  <span>Rent Summary</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="text-muted-foreground">Total</p>
                    <p className="font-semibold text-foreground">
                      ₹{rentCalculations.totalRent.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Paid</p>
                    <p className="font-semibold text-green-600 dark:text-green-400">
                      ₹{rentCalculations.rentPaid.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Remaining</p>
                    <p
                      className={`font-semibold ${
                        rentCalculations.remainingRent > 0 ? 'text-destructive' : 'text-foreground'
                      }`}
                    >
                      ₹{rentCalculations.remainingRent.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PeoplePage;
