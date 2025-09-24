/**
 * Platform constants for the advertising platforms integration
 */

// Platform identifiers
export const PLATFORMS = {
  GOOGLE: 'google',
  META: 'meta'
};

// Platform display names
export const PLATFORM_NAMES = {
  [PLATFORMS.GOOGLE]: 'Google Ads',
  [PLATFORMS.META]: 'Meta Ads'
};

// API versions
export const API_VERSIONS = {
  GOOGLE_ADS: 'v14',
  META_ADS: 'v18.0'
};

// API base URLs
export const API_BASE_URLS = {
  GOOGLE_ADS: 'https://googleads.googleapis.com',
  GOOGLE_OAUTH: 'https://oauth2.googleapis.com',
  META_ADS: 'https://graph.facebook.com'
};

// Metric types available across platforms
export const METRIC_TYPES = {
  CLICKS: 'clicks',
  IMPRESSIONS: 'impressions',
  COST: 'cost',
  CONVERSIONS: 'conversions',
  REVENUE: 'revenue',
  ROAS: 'roas',
  CTR: 'ctr',
  CPC: 'cpc',
  REACH: 'reach',
  CPM: 'cpm'
};

// Platform-specific metric configurations
export const PLATFORM_METRICS = {
  [PLATFORMS.GOOGLE]: [
    METRIC_TYPES.CLICKS,
    METRIC_TYPES.IMPRESSIONS,
    METRIC_TYPES.COST,
    METRIC_TYPES.CONVERSIONS,
    METRIC_TYPES.REVENUE,
    METRIC_TYPES.ROAS,
    METRIC_TYPES.CTR,
    METRIC_TYPES.CPC
  ],
  [PLATFORMS.META]: [
    METRIC_TYPES.CLICKS,
    METRIC_TYPES.IMPRESSIONS,
    METRIC_TYPES.COST,
    METRIC_TYPES.CONVERSIONS,
    METRIC_TYPES.REVENUE,
    METRIC_TYPES.ROAS,
    METRIC_TYPES.CTR,
    METRIC_TYPES.CPC,
    METRIC_TYPES.REACH,
    METRIC_TYPES.CPM
  ]
};

// Metric display labels
export const METRIC_LABELS = {
  [METRIC_TYPES.CLICKS]: 'Clicks',
  [METRIC_TYPES.IMPRESSIONS]: 'Impressions',
  [METRIC_TYPES.COST]: 'Cost',
  [METRIC_TYPES.CONVERSIONS]: 'Conversions',
  [METRIC_TYPES.REVENUE]: 'Revenue',
  [METRIC_TYPES.ROAS]: 'ROAS',
  [METRIC_TYPES.CTR]: 'CTR',
  [METRIC_TYPES.CPC]: 'CPC',
  [METRIC_TYPES.REACH]: 'Reach',
  [METRIC_TYPES.CPM]: 'CPM'
};

// Campaign status mappings
export const CAMPAIGN_STATUS = {
  GOOGLE: {
    ENABLED: 'Active',
    PAUSED: 'Paused',
    REMOVED: 'Removed'
  },
  META: {
    ACTIVE: 'Active',
    PAUSED: 'Paused',
    DELETED: 'Deleted',
    ARCHIVED: 'Archived'
  }
};

// Default chart colors
export const CHART_COLORS = {
  SUCCESS: '#00B386',
  CRITICAL: '#E0353C',
  PRIMARY: '#008060',
  SECONDARY: '#6B7280'
};

// Date range presets
export const DATE_RANGE_PRESETS = {
  TODAY: 'today',
  YESTERDAY: 'yesterday',
  LAST_WEEK: 'last_week',
  THIS_MONTH: 'this_month',
  LAST_7_DAYS: 'last_7_days',
  LAST_MONTH: 'last_month'
};
