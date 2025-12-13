import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Package, Sprout, Box, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { analyticsData } from './data';

interface SummaryCardProps {
  icon: React.ElementType;
  title: string;
  value: string | number;
  subtitle: string;
  color: 'blue' | 'purple' | 'pink' | 'green';
}

function SummaryCard({ icon: Icon, title, value, subtitle, color }: SummaryCardProps) {
  const colorVariants = {
    blue: 'bg-primary/10 text-primary',
    purple: 'bg-secondary/10 text-secondary-foreground',
    pink: 'bg-accent/10 text-accent-foreground',
    green: 'bg-muted text-muted-foreground',
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="w-full">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <div className={cn('p-2 rounded-lg', colorVariants[color])}>
                <Icon className="h-4 w-4" />
              </div>
              <span className="font-medium uppercase tracking-wide">{title}</span>
            </div>
            <div className="text-3xl font-bold mb-1">{value}</div>
            <div className="text-sm text-muted-foreground">{subtitle}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function SummaryCards({ data }: { data: typeof analyticsData.inventoryStats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <SummaryCard
        icon={Package}
        title="Total Inventory"
        value={data.total}
        subtitle="Total bags stored"
        color="blue"
      />
      <SummaryCard
        icon={Sprout}
        title="Top Variety"
        value={data.topVariety.name}
        subtitle={`${data.topVariety.count} bags stored • ${data.topVariety.percentage}% of total inventory`}
        color="purple"
      />
      <SummaryCard
        icon={Box}
        title="Second Variety"
        value={data.secondVariety.name}
        subtitle={`${data.secondVariety.count} bags • ${data.secondVariety.percentage}% of all varieties`}
        color="pink"
      />
      <SummaryCard
        icon={TrendingUp}
        title="Top Farmer"
        value={data.topFarmer.name}
        subtitle={`${data.topFarmer.count.toLocaleString()} bags stored • ${data.topFarmer.specialization}`}
        color="green"
      />
    </div>
  );
}
