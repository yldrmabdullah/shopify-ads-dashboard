import prisma from "../db.server";
import { encrypt, decrypt } from "../utils/crypto.server";
import { isTestMode, getCurrentConfig, isMockDataEnabled, getCredentials } from "../config/app.server.js";
import { getMockData } from "../data/mockData.server.js";

export async function isConnected(platform, shopDomain) {
  if (!shopDomain) return false;
  const shop = await prisma.shop.findUnique({ where: { shopDomain } });
  if (!shop) return false;
  const conn = await prisma.adPlatformConnection.findUnique({ where: { shopId_platform: { shopId: shop.id, platform } } });
  return Boolean(conn && conn.status === "connected");
}

export async function setConnected(platform, connected, shopDomain) {
  if (!shopDomain) return;
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
    const refreshToken = decrypt(googleConn.refreshTokenEnc);
    
    // Get access token using refresh token
    const credentials = getCredentials('google');
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: credentials.clientId,
        client_secret: credentials.clientSecret,
      }),
    });
    
    if (!tokenResponse.ok) {
      throw new Error('Failed to refresh Google access token');
    }
    
    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    
    const startDate = dateRange?.start ? formatDateForGoogle(dateRange.start) : getLastMonthStart();
    const endDate = dateRange?.end ? formatDateForGoogle(dateRange.end) : getLastMonthEnd();
    
    // TODO: Implement Google Ads API calls with accessToken, startDate, endDate
    
    return {
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
        ["Holiday Shopping | Google Search", "$420.50", "$3.20", "$1,842.00", "4.38", "Active"],
        ["Brand Awareness | Display Network", "$318.75", "$2.85", "$1,156.00", "3.63", "Active"], 
        ["Product Reviews | YouTube Ads", "$287.60", "$4.12", "$978.00", "3.40", "Paused"],
        ["Winter Sale | Shopping Campaign", "$502.90", "$2.95", "$2,156.00", "4.29", "Active"]
      ],
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
    
    const startDate = dateRange?.start ? formatDateForMeta(dateRange.start) : getLastMonthStart();
    const endDate = dateRange?.end ? formatDateForMeta(dateRange.end) : getLastMonthEnd();
    
    // TODO: Implement Meta Ads API calls with accessToken, startDate, endDate
    
    return {
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
        ["Holiday Collection | Facebook Feed", "$245.80", "$0.85", "$1,456.00", "3.12", "Active"],
        ["Brand Launch | Instagram Stories", "$198.30", "$1.12", "$987.00", "2.89", "Active"],
        ["Tutorial Videos | Facebook Video", "$312.75", "$0.95", "$1,678.00", "3.58", "Active"],
        ["Lifestyle Content | Instagram Reels", "$167.90", "$0.72", "$823.00", "2.95", "Paused"]
      ],
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

function formatDateForGoogle(date) {
  return date instanceof Date ? date.toISOString().split('T')[0] : date;
}

function formatDateForMeta(date) {
  return date instanceof Date ? date.toISOString().split('T')[0] : date;
}

function getLastMonthStart() {
  const date = new Date();
  date.setMonth(date.getMonth() - 1);
  date.setDate(1);
  return date.toISOString().split('T')[0];
}

function getLastMonthEnd() {
  const date = new Date();
  date.setDate(0);
  return date.toISOString().split('T')[0];
}

