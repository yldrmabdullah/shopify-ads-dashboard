-- CreateTable
CREATE TABLE "Shop" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shopDomain" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AdPlatformConnection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shopId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'connected',
    "connectedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AdPlatformConnection_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GoogleConnection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "connectionId" TEXT NOT NULL,
    "refreshTokenEnc" TEXT NOT NULL,
    "email" TEXT,
    "managerId" TEXT,
    "managerName" TEXT,
    "selectedExternalId" TEXT,
    "selectedName" TEXT,
    "currencyCode" TEXT,
    CONSTRAINT "GoogleConnection_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "AdPlatformConnection" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MetaConnection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "connectionId" TEXT NOT NULL,
    "longLivedTokenEnc" TEXT NOT NULL,
    "metaAccountId" TEXT,
    "metaAdId" TEXT,
    "metaAdName" TEXT,
    CONSTRAINT "MetaConnection_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "AdPlatformConnection" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Shop_shopDomain_key" ON "Shop"("shopDomain");

-- CreateIndex
CREATE UNIQUE INDEX "AdPlatformConnection_shopId_platform_key" ON "AdPlatformConnection"("shopId", "platform");

-- CreateIndex
CREATE UNIQUE INDEX "GoogleConnection_connectionId_key" ON "GoogleConnection"("connectionId");

-- CreateIndex
CREATE UNIQUE INDEX "MetaConnection_connectionId_key" ON "MetaConnection"("connectionId");
