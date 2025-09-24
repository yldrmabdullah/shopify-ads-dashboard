/**
 * Google Ads API Service
 * Handles all Google Ads API interactions including authentication and data fetching
 */

import { google } from 'googleapis';
import { getCredentials } from '../config/app.server.js';
import { decrypt } from '../utils/crypto.server.js';

const GOOGLE_ADS_API_VERSION = 'v14';
const GOOGLE_ADS_BASE_URL = 'https://googleads.googleapis.com';

/**
 * Google Ads API client configuration
 */
export class GoogleAdsClient {
  constructor(accessToken, managerId) {
    this.accessToken = accessToken;
    this.managerId = managerId;
    this.auth = new google.auth.OAuth2();
    this.auth.setCredentials({ access_token: accessToken });
  }

  /**
   * Fetch metrics for a specific date range
   * @param {string} accountId - Google Ads account ID
   * @param {Object} dateRange - Date range object with start and end dates
   * @returns {Promise<Object>} Metrics data
   */
  async fetchMetrics(accountId, dateRange) {
    try {
      const startDate = this.formatDate(dateRange.start);
      const endDate = this.formatDate(dateRange.end);

      const query = `
        SELECT 
          metrics.clicks,
          metrics.impressions,
          metrics.cost_micros,
          metrics.conversions,
          metrics.conversions_value,
          metrics.ctr,
          metrics.cost_per_conversion,
          metrics.average_cpc
        FROM customer 
        WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
      `;

      const response = await this.executeQuery(accountId, query);
      return this.processMetricsResponse(response);
    } catch (error) {
      console.error('Error fetching Google Ads metrics:', error);
      throw new Error(`Failed to fetch Google Ads metrics: ${error.message}`);
    }
  }

  /**
   * Fetch campaign data for a specific date range
   * @param {string} accountId - Google Ads account ID
   * @param {Object} dateRange - Date range object with start and end dates
   * @returns {Promise<Array>} Campaign data array
   */
  async fetchCampaigns(accountId, dateRange) {
    try {
      const startDate = this.formatDate(dateRange.start);
      const endDate = this.formatDate(dateRange.end);

      const query = `
        SELECT 
          campaign.name,
          campaign.status,
          metrics.cost_micros,
          metrics.average_cpc,
          metrics.conversions_value,
          metrics.value_per_conversion
        FROM campaign 
        WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
        AND campaign.status = 'ENABLED'
        ORDER BY metrics.cost_micros DESC
        LIMIT 20
      `;

      const response = await this.executeQuery(accountId, query);
      return this.processCampaignsResponse(response);
    } catch (error) {
      console.error('Error fetching Google Ads campaigns:', error);
      throw new Error(`Failed to fetch Google Ads campaigns: ${error.message}`);
    }
  }

  /**
   * Execute a Google Ads query
   * @param {string} accountId - Google Ads account ID
   * @param {string} query - GAQL query string
   * @returns {Promise<Object>} API response
   */
  async executeQuery(accountId, query) {
    const url = `${GOOGLE_ADS_BASE_URL}/${GOOGLE_ADS_API_VERSION}/customers/${accountId}/googleAds:search`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
        'login-customer-id': this.managerId
      },
      body: JSON.stringify({ query })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google Ads API error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  /**
   * Process metrics response from Google Ads API
   * @param {Object} response - Raw API response
   * @returns {Object} Processed metrics data
   */
  processMetricsResponse(response) {
    const results = response.results || [];
    
    if (results.length === 0) {
      return this.getEmptyMetrics();
    }

    // Aggregate metrics across all results
    const aggregated = results.reduce((acc, result) => {
      const metrics = result.metrics || {};
      return {
        clicks: (acc.clicks || 0) + (parseInt(metrics.clicks) || 0),
        impressions: (acc.impressions || 0) + (parseInt(metrics.impressions) || 0),
        costMicros: (acc.costMicros || 0) + (parseInt(metrics.cost_micros) || 0),
        conversions: (acc.conversions || 0) + (parseFloat(metrics.conversions) || 0),
        conversionValue: (acc.conversionValue || 0) + (parseFloat(metrics.conversions_value) || 0),
        ctr: (acc.ctr || 0) + (parseFloat(metrics.ctr) || 0),
        avgCpc: (acc.avgCpc || 0) + (parseFloat(metrics.average_cpc) || 0)
      };
    }, {});

    const cost = aggregated.costMicros / 1000000; // Convert from micros to currency
    const revenue = aggregated.conversionValue;
    const roas = cost > 0 ? revenue / cost : 0;
    const cpc = aggregated.clicks > 0 ? cost / aggregated.clicks : 0;
    const ctr = aggregated.impressions > 0 ? (aggregated.clicks / aggregated.impressions) * 100 : 0;

    return {
      keyMetrics: [
        { metric: "clicks", value: this.formatNumber(aggregated.clicks), deltaPct: this.generateDeltaPct() },
        { metric: "impressions", value: this.formatNumber(aggregated.impressions), deltaPct: this.generateDeltaPct() },
        { metric: "cost", value: `$${cost.toFixed(2)}`, deltaPct: this.generateDeltaPct() },
        { metric: "conversions", value: aggregated.conversions.toFixed(0), deltaPct: this.generateDeltaPct() },
        { metric: "revenue", value: `$${revenue.toFixed(2)}`, deltaPct: this.generateDeltaPct() },
        { metric: "roas", value: roas.toFixed(2), deltaPct: this.generateDeltaPct() },
        { metric: "ctr", value: `${ctr.toFixed(2)}%`, deltaPct: this.generateDeltaPct() },
        { metric: "cpc", value: `$${cpc.toFixed(2)}`, deltaPct: this.generateDeltaPct() }
      ]
    };
  }

  /**
   * Process campaigns response from Google Ads API
   * @param {Object} response - Raw API response
   * @returns {Array} Processed campaigns data
   */
  processCampaignsResponse(response) {
    const results = response.results || [];
    
    return results.map(result => {
      const campaign = result.campaign || {};
      const metrics = result.metrics || {};
      
      const cost = (parseInt(metrics.cost_micros) || 0) / 1000000;
      const cpc = (parseFloat(metrics.average_cpc) || 0) / 1000000;
      const revenue = parseFloat(metrics.conversions_value) || 0;
      const roas = parseFloat(metrics.value_per_conversion) || 0;
      const status = this.mapCampaignStatus(campaign.status);

      return [
        campaign.name || 'Unnamed Campaign',
        `$${cost.toFixed(2)}`,
        `$${cpc.toFixed(2)}`,
        `$${revenue.toFixed(2)}`,
        roas.toFixed(2),
        status
      ];
    });
  }

  /**
   * Map Google Ads campaign status to display format
   * @param {string} status - Google Ads campaign status
   * @returns {string} Display status
   */
  mapCampaignStatus(status) {
    const statusMap = {
      'ENABLED': 'Active',
      'PAUSED': 'Paused',
      'REMOVED': 'Removed'
    };
    return statusMap[status] || 'Unknown';
  }

  /**
   * Format date for Google Ads API
   * @param {Date|string} date - Date to format
   * @returns {string} Formatted date (YYYY-MM-DD)
   */
  formatDate(date) {
    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    }
    return date;
  }

  /**
   * Format numbers for display
   * @param {number} num - Number to format
   * @returns {string} Formatted number
   */
  formatNumber(num) {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  }

  /**
   * Generate random delta percentage for demo purposes
   * In production, this would calculate actual period-over-period changes
   * @returns {number} Delta percentage
   */
  generateDeltaPct() {
    return (Math.random() - 0.5) * 40; // Random between -20% and +20%
  }

  /**
   * Get empty metrics structure
   * @returns {Object} Empty metrics object
   */
  getEmptyMetrics() {
    return {
      keyMetrics: [
        { metric: "clicks", value: "0", deltaPct: 0 },
        { metric: "impressions", value: "0", deltaPct: 0 },
        { metric: "cost", value: "$0.00", deltaPct: 0 },
        { metric: "conversions", value: "0", deltaPct: 0 },
        { metric: "revenue", value: "$0.00", deltaPct: 0 },
        { metric: "roas", value: "0.00", deltaPct: 0 },
        { metric: "ctr", value: "0.00%", deltaPct: 0 },
        { metric: "cpc", value: "$0.00", deltaPct: 0 }
      ]
    };
  }
}

/**
 * Refresh Google OAuth access token
 * @param {string} refreshToken - Encrypted refresh token
 * @returns {Promise<string>} New access token
 */
export async function refreshGoogleAccessToken(refreshToken) {
  const credentials = getCredentials('google');
  
  if (!credentials) {
    throw new Error('Google credentials not configured');
  }

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: decrypt(refreshToken),
      client_id: credentials.clientId,
      client_secret: credentials.clientSecret,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to refresh Google access token: ${errorText}`);
  }

  const tokenData = await response.json();
  return tokenData.access_token;
}

/**
 * Validate Google Ads connection
 * @param {string} accessToken - Access token
 * @param {string} managerId - Manager account ID
 * @returns {Promise<boolean>} Connection validity
 */
export async function validateGoogleAdsConnection(accessToken, managerId) {
  try {
    const client = new GoogleAdsClient(accessToken, managerId);
    // Simple test query to validate connection
    await client.executeQuery(managerId, 'SELECT customer.id FROM customer LIMIT 1');
    return true;
  } catch (error) {
    console.error('Google Ads connection validation failed:', error);
    return false;
  }
}
