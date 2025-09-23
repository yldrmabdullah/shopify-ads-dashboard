import prisma from "../db.server";
import { encrypt } from "../utils/crypto.server";

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

export async function fetchMetrics(platform, dateRange) {
  // Placeholder mocked metrics. Replace with API calls.
  return {
    keyMetrics: [
      { metric: "clicks", value: "19.29k", deltaPct: 12.34 },
      { metric: "impressions", value: "750.85k", deltaPct: 8.12 },
      { metric: "cost", value: "123.37k", deltaPct: -5.4 },
      { metric: "conversions", value: "2.99k", deltaPct: -2.1 },
    ],
    campaigns: [
      ["Campaign 1", "$320.00", "$0.70", "$1,312.00", "4.10"],
      ["Campaign 2", "$210.00", "$0.68", "$861.00", "4.10"],
    ],
  };
}

