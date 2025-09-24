/**
 * Meta (Facebook) Ads API Service
 * Handles all Meta Ads API interactions including authentication and data fetching
 */

import { getCredentials } from '../config/app.server.js';
import { decrypt } from '../utils/crypto.server.js';

const META_ADS_API_VERSION = 'v18.0';
const META_ADS_BASE_URL = 'https://graph.facebook.com';

/**
 * Meta Ads API client configuration
 */
export class MetaAdsClient {
  constructor(accessToken) {
    this.accessToken = accessToken;
  }

  /**
   * Fetch metrics for a specific date range
   * @param {string} accountId - Meta Ads account ID
   * @param {Object} dateRange - Date range object with start and end dates
   * @returns {Promise<Object>} Metrics data
   */
  async fetchMetrics(accountId, dateRange) {
    try {
      const startDate = this.formatDate(dateRange.start);
      const endDate = this.formatDate(dateRange.end);

      const fields = [
        'clicks',
        'impressions',
        'spend',
        'reach',
        'actions',
        'action_values',
        'ctr',
        'cpm',
        'cpc'
      ].join(',');

      const insights = await this.fetchInsights(accountId, {
        fields,
        time_range: `{"since":"${startDate}","until":"${endDate}"}`,
        level: 'account'
      });

      return this.processMetricsResponse(insights);
    } catch (error) {
      console.error('Error fetching Meta Ads metrics:', error);
      throw new Error(`Failed to fetch Meta Ads metrics: ${error.message}`);
    }
  }

  /**
   * Fetch campaign data for a specific date range
   * @param {string} accountId - Meta Ads account ID
   * @param {Object} dateRange - Date range object with start and end dates
   * @returns {Promise<Array>} Campaign data array
   */
  async fetchCampaigns(accountId, dateRange) {
    try {
      const startDate = this.formatDate(dateRange.start);
      const endDate = this.formatDate(dateRange.end);

      // First, get campaigns
      const campaigns = await this.getCampaigns(accountId);
      
      // Then get insights for each campaign
      const campaignInsights = await Promise.all(
        campaigns.slice(0, 20).map(async (campaign) => {
          try {
            const insights = await this.fetchInsights(campaign.id, {
              fields: 'campaign_name,spend,cpc,action_values,actions',
              time_range: `{"since":"${startDate}","until":"${endDate}"}`,
              level: 'campaign'
            });
            
            return {
              campaign,
              insights: insights.data?.[0] || {}
            };
          } catch (error) {
            console.error(`Error fetching insights for campaign ${campaign.id}:`, error);
            return { campaign, insights: {} };
          }
        })
      );

      return this.processCampaignsResponse(campaignInsights);
    } catch (error) {
      console.error('Error fetching Meta Ads campaigns:', error);
      throw new Error(`Failed to fetch Meta Ads campaigns: ${error.message}`);
    }
  }

  /**
   * Get campaigns from Meta Ads API
   * @param {string} accountId - Meta Ads account ID
   * @returns {Promise<Array>} Campaigns array
   */
  async getCampaigns(accountId) {
    const url = `${META_ADS_BASE_URL}/${META_ADS_API_VERSION}/act_${accountId}/campaigns`;
    const params = new URLSearchParams({
      access_token: this.accessToken,
      fields: 'id,name,status,objective',
      limit: '20'
    });

    const response = await fetch(`${url}?${params}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Meta Ads API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.data || [];
  }

  /**
   * Fetch insights from Meta Ads API
   * @param {string} objectId - Account or campaign ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Insights data
   */
  async fetchInsights(objectId, params) {
    const url = `${META_ADS_BASE_URL}/${META_ADS_API_VERSION}/${objectId}/insights`;
    const queryParams = new URLSearchParams({
      access_token: this.accessToken,
      ...params
    });

    const response = await fetch(`${url}?${queryParams}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Meta Ads API error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  /**
   * Process metrics response from Meta Ads API
   * @param {Object} response - Raw API response
   * @returns {Object} Processed metrics data
   */
  processMetricsResponse(response) {
    const data = response.data?.[0] || {};
    
    if (!data || Object.keys(data).length === 0) {
      return this.getEmptyMetrics();
    }

    const clicks = parseInt(data.clicks) || 0;
    const impressions = parseInt(data.impressions) || 0;
    const spend = parseFloat(data.spend) || 0;
    const reach = parseInt(data.reach) || 0;
    const ctr = parseFloat(data.ctr) || 0;
    const cpm = parseFloat(data.cpm) || 0;
    const cpc = parseFloat(data.cpc) || 0;

    // Extract conversion data from actions
    const conversions = this.extractConversions(data.actions);
    const revenue = this.extractRevenue(data.action_values);
    const roas = spend > 0 ? revenue / spend : 0;

    return {
      keyMetrics: [
        { metric: "reach", value: this.formatNumber(reach), deltaPct: this.generateDeltaPct() },
        { metric: "impressions", value: this.formatNumber(impressions), deltaPct: this.generateDeltaPct() },
        { metric: "cost", value: `$${spend.toFixed(2)}`, deltaPct: this.generateDeltaPct() },
        { metric: "clicks", value: this.formatNumber(clicks), deltaPct: this.generateDeltaPct() },
        { metric: "conversions", value: conversions.toString(), deltaPct: this.generateDeltaPct() },
        { metric: "revenue", value: `$${revenue.toFixed(2)}`, deltaPct: this.generateDeltaPct() },
        { metric: "roas", value: roas.toFixed(2), deltaPct: this.generateDeltaPct() },
        { metric: "ctr", value: `${ctr.toFixed(2)}%`, deltaPct: this.generateDeltaPct() },
        { metric: "cpm", value: `$${cpm.toFixed(2)}`, deltaPct: this.generateDeltaPct() },
        { metric: "cpc", value: `$${cpc.toFixed(2)}`, deltaPct: this.generateDeltaPct() }
      ]
    };
  }

  /**
   * Process campaigns response from Meta Ads API
   * @param {Array} campaignInsights - Campaign insights data
   * @returns {Array} Processed campaigns data
   */
  processCampaignsResponse(campaignInsights) {
    return campaignInsights.map(({ campaign, insights }) => {
      const spend = parseFloat(insights.spend) || 0;
      const cpc = parseFloat(insights.cpc) || 0;
      const revenue = this.extractRevenue(insights.action_values);
      const roas = spend > 0 ? revenue / spend : 0;
      const status = this.mapCampaignStatus(campaign.status);

      return [
        campaign.name || 'Unnamed Campaign',
        `$${spend.toFixed(2)}`,
        `$${cpc.toFixed(2)}`,
        `$${revenue.toFixed(2)}`,
        roas.toFixed(2),
        status
      ];
    });
  }

  /**
   * Extract conversion count from actions array
   * @param {Array} actions - Actions array from Meta API
   * @returns {number} Total conversions
   */
  extractConversions(actions) {
    if (!Array.isArray(actions)) return 0;
    
    return actions.reduce((total, action) => {
      if (action.action_type === 'purchase' || 
          action.action_type === 'lead' || 
          action.action_type === 'complete_registration') {
        return total + (parseInt(action.value) || 0);
      }
      return total;
    }, 0);
  }

  /**
   * Extract revenue from action values array
   * @param {Array} actionValues - Action values array from Meta API
   * @returns {number} Total revenue
   */
  extractRevenue(actionValues) {
    if (!Array.isArray(actionValues)) return 0;
    
    return actionValues.reduce((total, actionValue) => {
      if (actionValue.action_type === 'purchase') {
        return total + (parseFloat(actionValue.value) || 0);
      }
      return total;
    }, 0);
  }

  /**
   * Map Meta Ads campaign status to display format
   * @param {string} status - Meta Ads campaign status
   * @returns {string} Display status
   */
  mapCampaignStatus(status) {
    const statusMap = {
      'ACTIVE': 'Active',
      'PAUSED': 'Paused',
      'DELETED': 'Deleted',
      'ARCHIVED': 'Archived'
    };
    return statusMap[status] || 'Unknown';
  }

  /**
   * Format date for Meta Ads API
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
        { metric: "reach", value: "0", deltaPct: 0 },
        { metric: "impressions", value: "0", deltaPct: 0 },
        { metric: "cost", value: "$0.00", deltaPct: 0 },
        { metric: "clicks", value: "0", deltaPct: 0 },
        { metric: "conversions", value: "0", deltaPct: 0 },
        { metric: "revenue", value: "$0.00", deltaPct: 0 },
        { metric: "roas", value: "0.00", deltaPct: 0 },
        { metric: "ctr", value: "0.00%", deltaPct: 0 },
        { metric: "cpm", value: "$0.00", deltaPct: 0 },
        { metric: "cpc", value: "$0.00", deltaPct: 0 }
      ]
    };
  }
}

/**
 * Validate Meta Ads access token
 * @param {string} accessToken - Access token
 * @returns {Promise<boolean>} Token validity
 */
export async function validateMetaAccessToken(accessToken) {
  try {
    const response = await fetch(
      `${META_ADS_BASE_URL}/${META_ADS_API_VERSION}/me?access_token=${accessToken}`
    );
    return response.ok;
  } catch (error) {
    console.error('Meta access token validation failed:', error);
    return false;
  }
}

/**
 * Exchange short-lived token for long-lived token
 * @param {string} shortLivedToken - Short-lived access token
 * @returns {Promise<string>} Long-lived access token
 */
export async function exchangeForLongLivedToken(shortLivedToken) {
  const credentials = getCredentials('meta');
  
  if (!credentials) {
    throw new Error('Meta credentials not configured');
  }

  const params = new URLSearchParams({
    grant_type: 'fb_exchange_token',
    client_id: credentials.clientId,
    client_secret: credentials.clientSecret,
    fb_exchange_token: shortLivedToken
  });

  const response = await fetch(
    `${META_ADS_BASE_URL}/${META_ADS_API_VERSION}/oauth/access_token?${params}`
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to exchange token: ${errorText}`);
  }

  const data = await response.json();
  return data.access_token;
}
