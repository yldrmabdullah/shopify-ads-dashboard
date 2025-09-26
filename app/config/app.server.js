export const appConfig = {
  // Base flags; final decision is made in isTestMode()
  isTestMode: process.env.NODE_ENV !== 'production' || process.env.APP_TEST_MODE === 'true',
  
  testMode: {
    enableMockConnections: true,
    enableMockData: true,
    testCredentials: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID || 'test_google_client_id',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'test_google_client_secret',
        redirectUri: process.env.SHOPIFY_APP_URL ? `${process.env.SHOPIFY_APP_URL}/app/connections/google/callback` : 'http://localhost:3000/app/connections/google/callback'
      },
      meta: {
        clientId: process.env.META_CLIENT_ID || 'test_meta_client_id', 
        clientSecret: process.env.META_CLIENT_SECRET || 'test_meta_client_secret',
        redirectUri: process.env.SHOPIFY_APP_URL ? `${process.env.SHOPIFY_APP_URL}/app/connections/meta/callback` : 'http://localhost:3000/app/connections/meta/callback'
      }
    }
  },

  productionMode: {
    enableMockConnections: false,
    enableMockData: false,
    credentials: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        redirectUri: `${process.env.SHOPIFY_APP_URL}/app/connections/google/callback`
      },
      meta: {
        clientId: process.env.META_CLIENT_ID,
        clientSecret: process.env.META_CLIENT_SECRET,
        redirectUri: `${process.env.SHOPIFY_APP_URL}/app/connections/meta/callback`
      }
    }
  }
};

export function getCurrentConfig() {
  return isTestMode() ? appConfig.testMode : appConfig.productionMode;
}

export function isTestMode() {
  return process.env.NODE_ENV !== 'production' || process.env.APP_TEST_MODE === 'true';
}

export function getCredentials(platform) {
  const config = getCurrentConfig();
  const creds = config.credentials || config.testCredentials;
  return creds[platform] || null;
}

export function isMockConnectionsEnabled() {
  const config = getCurrentConfig();
  return config.enableMockConnections || false;
}

export function isMockDataEnabled() {
  const config = getCurrentConfig();
  return config.enableMockData || false;
}
