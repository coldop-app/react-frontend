import { SummaryCards } from './summary-cards';
import { StockSummaryTable } from './stock-summary-table';
import { CapacityUtilization } from './capacity-utilisation';
import { StockTrendChart } from './stock-trend-chart';
import { VarietyDistributionChart } from './variety-distribution-chart';
import { TopFarmersChart } from './top-farmers-chart';
import { analyticsData } from './data';

export default function AnalyticsPage() {
  return (
    <div className="p-6 space-y-6 min-h-screen">
      <SummaryCards data={analyticsData.inventoryStats} />
      <StockSummaryTable data={analyticsData.stockSummary} />
      <CapacityUtilization data={analyticsData.capacity} />
      <StockTrendChart data={analyticsData.stockTrend} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VarietyDistributionChart data={analyticsData.varietyDistribution} />
        <TopFarmersChart data={analyticsData.topFarmers} />
      </div>
    </div>
  );
}
