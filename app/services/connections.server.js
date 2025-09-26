import prisma from "../db.server";
import { encrypt, decrypt } from "../utils/crypto.server";
import { isTestMode, getCurrentConfig, isMockDataEnabled, getCredentials, isMockConnectionsEnabled } from "../config/app.server.js";

// In-memory mock connection store for Test Mode
function getMockConnectionStore() {
  if (!global.__mockConnectionStore) {
    global.__mockConnectionStore = new Map();
  }
  return global.__mockConnectionStore;
}
import { getMockData } from "../data/mockData.server.js";
import { GoogleAdsClient, refreshGoogleAccessToken } from "./google-ads.server.js";
import { MetaAdsClient, validateMetaAccessToken } from "./meta-ads.server.js";

export async function isConnected(platform, shopDomain) {
  if (!shopDomain) return false;
  // In mock mode, simulate connected state for local development
  if (isMockConnectionsEnabled && typeof isMockConnectionsEnabled === "function" && isMockConnectionsEnabled()) {
    const store = getMockConnectionStore();
    const key = `${shopDomain}:${platform}`;
    return store.get(key) === true;
  }
  if (!prisma || !prisma.shop || !prisma.adPlatformConnection) return false;
  const shop = await prisma.shop.findUnique({ where: { shopDomain } });
  if (!shop) return false;
  const conn = await prisma.adPlatformConnection.findUnique({ where: { shopId_platform: { shopId: shop.id, platform } } });
  return Boolean(conn && conn.status === "connected");
}

export async function setConnected(platform, connected, shopDomain) {
  if (!shopDomain) return;
  if (isMockConnectionsEnabled && typeof isMockConnectionsEnabled === "function" && isMockConnectionsEnabled()) {
    const store = getMockConnectionStore();
    const key = `${shopDomain}:${platform}`;
    store.set(key, Boolean(connected));
    return;
  }
  if (!prisma || !prisma.shop || !prisma.adPlatformConnection) return;
  let shop = await prisma.shop.findUnique({ where: { shopDomain } });
  if (!shop) shop = await prisma.shop.create({ data: { shopDomain } });
  const base = {
    shopId: shop.id,
    platform,
    status: connected ? "connected" : "disconnected",
  };
  await prisma.adPlatformConnection.upsert({
    where: { shopId_platform: { shopId: shop.id, platform } },
    create: base,
    update: base,
  });
}

export async function saveGoogleAuth({ shopDomain, refreshToken, email, managerId, managerName, selectedExternalId, selectedName, currencyCode }) {
  if (!shopDomain) return;
  let shop = await prisma.shop.findUnique({ where: { shopDomain } });
  if (!shop) shop = await prisma.shop.create({ data: { shopDomain } });
  const conn = await prisma.adPlatformConnection.upsert({
    where: { shopId_platform: { shopId: shop.id, platform: "google" } },
    create: { shopId: shop.id, platform: "google" },
    update: {},
  });
  await prisma.googleConnection.upsert({
    where: { connectionId: conn.id },
    create: {
      connectionId: conn.id,
      refreshTokenEnc: encrypt(refreshToken),
      email, managerId, managerName, selectedExternalId, selectedName, currencyCode,
    },
    update: {
      refreshTokenEnc: encrypt(refreshToken),
      email, managerId, managerName, selectedExternalId, selectedName, currencyCode,
    },
  });
  await prisma.adPlatformConnection.update({ where: { id: conn.id }, data: { status: "connected" } });
}

export async function saveMetaAuth({ shopDomain, longLivedToken, metaAccountId, metaAdId, metaAdName }) {
  if (!shopDomain) return;
  let shop = await prisma.shop.findUnique({ where: { shopDomain } });
  if (!shop) shop = await prisma.shop.create({ data: { shopDomain } });
  const conn = await prisma.adPlatformConnection.upsert({
    where: { shopId_platform: { shopId: shop.id, platform: "meta" } },
    create: { shopId: shop.id, platform: "meta" },
    update: {},
  });
  await prisma.metaConnection.upsert({
    where: { connectionId: conn.id },
    create: {
      connectionId: conn.id,
      longLivedTokenEnc: encrypt(longLivedToken),
      metaAccountId, metaAdId, metaAdName,
    },
    update: {
      longLivedTokenEnc: encrypt(longLivedToken),
      metaAccountId, metaAdId, metaAdName,
    },
  });
  await prisma.adPlatformConnection.update({ where: { id: conn.id }, data: { status: "connected" } });
}

export async function fetchMetrics(platform, dateRange, shopDomain) {
  if (isMockDataEnabled()) {
    const mockPlatformData = getMockData(platform, 'all', dateRange);
    if (mockPlatformData) {
      return {
        ...mockPlatformData,
        isTestData: true
      };
    }
  }
  
  if (platform === 'google') {
    return await fetchGoogleAdsMetrics(shopDomain, dateRange);
  }
  
  if (platform === 'meta') {
    return await fetchMetaAdsMetrics(shopDomain, dateRange);
  }
  
  return null;
}

async function fetchGoogleAdsMetrics(shopDomain, dateRange) {
  try {
    const shop = await prisma.shop.findUnique({ where: { shopDomain } });
    if (!shop) {
      throw new Error('Shop not found');
    }
    
    const connection = await prisma.adPlatformConnection.findUnique({
      where: { shopId_platform: { shopId: shop.id, platform: "google" } },
      include: { GoogleConnection: true }
    });
    
    if (!connection || !connection.GoogleConnection) {
      throw new Error('Google connection not found');
    }
    
    const googleConn = connection.GoogleConnection;
    
    // Get fresh access token
    const accessToken = await refreshGoogleAccessToken(googleConn.refreshTokenEnc);
    
    // Create Google Ads client
    const googleAdsClient = new GoogleAdsClient(accessToken, googleConn.managerId);
    
    // Use selected external ID as account ID
    const accountId = googleConn.selectedExternalId;
    if (!accountId) {
      throw new Error('Google Ads account ID not found');
    }
    
    // Fetch metrics and campaigns
    const [metricsData, campaignsData] = await Promise.all([
      googleAdsClient.fetchMetrics(accountId, dateRange),
      googleAdsClient.fetchCampaigns(accountId, dateRange)
    ]);
    
    return {
      ...metricsData,
      campaigns: campaignsData,
      accountInfo: {
        accountName: googleConn.selectedName || "Google Ads Account",
        accountId: googleConn.selectedExternalId || "123-456-7890",
        currency: googleConn.currencyCode || "USD",
        timeZone: "America/New_York"
      },
      isTestData: false
    };
    
  } catch (error) {
    console.error('Error fetching Google Ads metrics:', error);
    return {
      keyMetrics: [],
      campaigns: [],
      accountInfo: {},
      isTestData: false,
      error: error.message
    };
  }
}

async function fetchMetaAdsMetrics(shopDomain, dateRange) {
  try {
    const shop = await prisma.shop.findUnique({ where: { shopDomain } });
    if (!shop) {
      throw new Error('Shop not found');
    }
    
    const connection = await prisma.adPlatformConnection.findUnique({
      where: { shopId_platform: { shopId: shop.id, platform: "meta" } },
      include: { MetaConnection: true }
    });
    
    if (!connection || !connection.MetaConnection) {
      throw new Error('Meta connection not found');
    }
    
    const metaConn = connection.MetaConnection;
    const accessToken = decrypt(metaConn.longLivedTokenEnc);
    
    // Validate token first
    const isValidToken = await validateMetaAccessToken(accessToken);
    if (!isValidToken) {
      throw new Error('Invalid Meta access token');
    }
    
    // Create Meta Ads client
    const metaAdsClient = new MetaAdsClient(accessToken);
    
    // Use meta account ID
    const accountId = metaConn.metaAccountId;
    if (!accountId) {
      throw new Error('Meta Ads account ID not found');
    }
    
    // Fetch metrics and campaigns
    const [metricsData, campaignsData] = await Promise.all([
      metaAdsClient.fetchMetrics(accountId, dateRange),
      metaAdsClient.fetchCampaigns(accountId, dateRange)
    ]);
    
    return {
      ...metricsData,
      campaigns: campaignsData,
      accountInfo: {
        accountName: metaConn.metaAdName || "Meta Business Account",
        accountId: metaConn.metaAccountId || "987654321",
        currency: "USD",
        timeZone: "America/New_York"
      },
      isTestData: false
    };
    
  } catch (error) {
    console.error('Error fetching Meta Ads metrics:', error);
    return {
      keyMetrics: [],
      campaigns: [],
      accountInfo: {},
      isTestData: false,
      error: error.message
    };
  }
}

/**
 * Utility functions for date formatting
 * These functions are used by both Google and Meta API services
 */

/**
 * Format date for API usage (YYYY-MM-DD format)
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
function formatDateForAPI(date) {
  return date instanceof Date ? date.toISOString().split('T')[0] : date;
}

/**
 * Get the start date of the last month
 * @returns {string} Formatted date string
 */
function getLastMonthStart() {
  const date = new Date();
  date.setMonth(date.getMonth() - 1);
  date.setDate(1);
  return date.toISOString().split('T')[0];
}

/**
 * Get the end date of the last month  
 * @returns {string} Formatted date string
 */
function getLastMonthEnd() {
  const date = new Date();
  date.setDate(0);
  return date.toISOString().split('T')[0];
}

