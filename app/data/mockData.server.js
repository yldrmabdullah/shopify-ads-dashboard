// Mock data for testing - organized by platform
export const mockData = {
  google: {
    keyMetrics: [
      { metric: "clicks", value: "25.4k", deltaPct: 15.2 },
      { metric: "impressions", value: "892.1k", deltaPct: 8.7 },
      { metric: "cost", value: "$1,247.89", deltaPct: -3.2 },
      { metric: "conversions", value: "189", deltaPct: 12.8 },
      { metric: "revenue", value: "$7,234.56", deltaPct: 18.9 },
      { metric: "roas", value: "5.80", deltaPct: 22.4 },
      { metric: "ctr", value: "2.85%", deltaPct: 5.1 },
      { metric: "cpc", value: "$6.60", deltaPct: -8.4 }
    ],
    campaigns: [
      ["Black Friday Electronics Sale | Search", "$420.50", "$3.20", "$1,842.00", "4.38", "Active"],
      ["Smart Home Devices | Display Network", "$318.75", "$2.85", "$1,156.00", "3.63", "Active"], 
      ["iPhone 15 Pro Max | YouTube Video", "$287.60", "$4.12", "$978.00", "3.40", "Paused"],
      ["Holiday Gift Guide | Shopping Ads", "$502.90", "$2.95", "$2,156.00", "4.29", "Active"],
      ["Brand Awareness | Google Search", "$156.30", "$1.85", "$687.00", "4.40", "Active"],
      ["Winter Collection 2024 | Performance Max", "$678.20", "$2.10", "$3,245.00", "4.78", "Active"],
      ["Retargeting - Cart Abandoners | Display", "$234.80", "$4.56", "$892.00", "3.80", "Active"]
    ],
    accountInfo: {
      accountName: "Test Google Ads Account",
      accountId: "123-456-7890",
      currency: "USD",
      timeZone: "America/New_York"
    }
  },

  meta: {
    keyMetrics: [
      { metric: "reach", value: "156.8k", deltaPct: 18.9 },
      { metric: "impressions", value: "743.2k", deltaPct: 12.4 },
      { metric: "cost", value: "$986.45", deltaPct: -5.8 },
      { metric: "clicks", value: "12.7k", deltaPct: 9.6 },
      { metric: "conversions", value: "234", deltaPct: 22.3 },
      { metric: "revenue", value: "$4,567.89", deltaPct: 28.7 },
      { metric: "roas", value: "4.63", deltaPct: 15.4 },
      { metric: "ctr", value: "1.71%", deltaPct: 8.3 },
      { metric: "cpm", value: "$1.33", deltaPct: -12.1 },
      { metric: "cpc", value: "$0.78", deltaPct: -15.2 }
    ],
    campaigns: [
      ["Holiday Sale 2024 | Facebook Feed", "$245.80", "$0.85", "$1,456.00", "3.12", "Active"],
      ["New Product Launch | Instagram Stories", "$198.30", "$1.12", "$987.00", "2.89", "Active"],
      ["Tutorial Series | Facebook Video", "$312.75", "$0.95", "$1,678.00", "3.58", "Active"],
      ["Lifestyle Content | Instagram Reels", "$167.90", "$0.72", "$823.00", "2.95", "Paused"],
      ["Product Catalog | Facebook Carousel", "$423.15", "$1.05", "$2,134.00", "4.02", "Active"],
      ["Black Friday Countdown | Meta Advantage+", "$589.40", "$0.67", "$2,845.00", "4.83", "Active"],
      ["Customer Testimonials | Instagram Feed", "$134.20", "$1.23", "$654.00", "4.87", "Active"]
    ],
    accountInfo: {
      accountName: "Test Meta Business Account", 
      accountId: "987654321",
      currency: "USD",
      timeZone: "America/New_York"
    }
  }
};

// Helper function to get mock data by platform with date-based variations
export function getMockData(platform, dataType = 'all', dateRange = null) {
  if (!mockData[platform]) {
    return null;
  }

  const baseData = mockData[platform];
  
  // Apply date-based variations
  if (dateRange) {
    const dateVariation = getDateVariation(dateRange);
    const adjustedData = applyDateVariation(baseData, dateVariation);
    
    if (dataType === 'all') {
      return adjustedData;
    }
    return adjustedData[dataType] || null;
  }

  if (dataType === 'all') {
    return baseData;
  }

  return baseData[dataType] || null;
}

// Generate variation factor based on date range and variation seed
function getDateVariation(dateRange) {
  if (!dateRange?.start || !dateRange?.end) {
    return 1;
  }
  
  const start = new Date(dateRange.start);
  const end = new Date(dateRange.end);
  const daysDiff = Math.abs(end - start) / (1000 * 60 * 60 * 24);
  
  // Use _variation if provided for fresh data, otherwise use date-based seed
  let deterministicRandom;
  if (dateRange._variation) {
    deterministicRandom = dateRange._variation;
  } else {
    const dateString = `${start.toISOString().split('T')[0]}-${end.toISOString().split('T')[0]}`;
    const seed = simpleHash(dateString);
    deterministicRandom = seededRandom(seed);
  }
  
  // Shorter periods tend to have higher volatility
  if (daysDiff <= 7) return 0.7 + deterministicRandom * 0.6; // 0.7 - 1.3
  if (daysDiff <= 30) return 0.8 + deterministicRandom * 0.4; // 0.8 - 1.2
  return 0.9 + deterministicRandom * 0.2; // 0.9 - 1.1
}

// Simple hash function for date strings
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// Seeded random number generator for consistent results
function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Apply date variation to mock data
function applyDateVariation(data, variation) {
  const adjustedData = JSON.parse(JSON.stringify(data)); // Deep clone
  
  // Adjust key metrics
  adjustedData.keyMetrics = adjustedData.keyMetrics.map(metric => ({
    ...metric,
    value: adjustMetricValue(metric.value, variation),
    deltaPct: adjustDeltaPercent(metric.deltaPct, variation)
  }));
  
  // Adjust campaigns
  adjustedData.campaigns = adjustedData.campaigns.map(campaign => [
    campaign[0], // Campaign name stays the same
    adjustMetricValue(campaign[1], variation), // Spend
    adjustMetricValue(campaign[2], variation), // CPC
    adjustMetricValue(campaign[3], variation), // Revenue
    adjustMetricValue(campaign[4], variation, false), // ROAS (no currency symbol)
    campaign[5] // Status stays the same
  ]);
  
  return adjustedData;
}

// Adjust metric values based on variation
function adjustMetricValue(value, variation, hasCurrency = true) {
  if (typeof value !== 'string') return value;
  
  const numericValue = parseFloat(value.replace(/[$,k%]/g, ''));
  if (isNaN(numericValue)) return value;
  
  const adjustedValue = numericValue * variation;
  
  // Format based on original format
  if (value.includes('k')) {
    return `${(adjustedValue).toFixed(1)}k`;
  }
  if (value.includes('$')) {
    return `$${adjustedValue.toFixed(2)}`;
  }
  if (value.includes('%')) {
    return `${adjustedValue.toFixed(2)}%`;
  }
  
  return adjustedValue.toFixed(2);
}

// Adjust delta percentage with deterministic variation
function adjustDeltaPercent(deltaPct, variation) {
  const baseDelta = deltaPct * variation;
  // Use variation as a deterministic factor instead of random
  const deterministicFactor = (variation - 1) * 5; // Convert variation to ±5% factor
  return Math.max(-99, Math.min(99, baseDelta + deterministicFactor));
}

// Helper function to generate random variations for testing
export function generateVariation(baseValue, variationPercent = 10) {
  const variation = (Math.random() - 0.5) * 2 * variationPercent / 100;
  return baseValue * (1 + variation);
}
