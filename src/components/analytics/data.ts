export const analyticsData = {
  inventoryStats: {
    total: 57,
    topVariety: {
      name: 'Himalini',
      count: 50,
      percentage: 87.7,
    },
    secondVariety: {
      name: 'K. Jyoti',
      count: 7,
      percentage: 12.3,
    },
    topFarmer: {
      name: 'Bhatti Agritech',
      count: 34693,
      specialization: '30-35mm (73 bags)',
    },
  },

  stockSummary: {
    current: [
      { variety: 'B101', size40to45: 0, sizeAbove50: 0, total: 0 },
      { variety: 'Himalini', size40to45: 0, sizeAbove50: 50, total: 50 },
      { variety: 'K. Jyoti', size40to45: 7, sizeAbove50: 0, total: 7 },
    ],
    initial: 34693,
    outgoing: 34636,
  },

  capacity: {
    current: 57,
    available: 34943,
    total: 35000,
    utilizationPercentage: 0.2,
  },

  varietyDistribution: [
    { name: 'Himalini', value: 87.7, bags: 50, color: '#3b82f6' },
    { name: 'K. Jyoti', value: 12.3, bags: 7, color: '#10b981' },
    { name: 'B101', value: 0.0, bags: 0, color: '#22c55e' },
  ],

  topFarmers: [{ name: 'Bhatti Agritech', bags: 34693, storageShare: 100.0 }],

  stockTrend: Array.from({ length: 80 }, (_, i) => {
    const date = new Date(2025, 1, 16 + i);
    let value;
    if (i < 40) {
      value = Math.floor(500 + i * 850);
    } else if (i < 43) {
      value = Math.floor(34270 - (i - 40) * 11000);
    } else if (i < 45) {
      value = Math.floor(1270 + ((34270 - 1270) * (i - 43)) / 2);
    } else {
      value = Math.floor(34270 - (i - 45) * 980);
    }
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value,
      color: i < 40 ? '#22c55e' : i < 45 ? '#3b82f6' : '#ef4444',
    };
  }),
};
