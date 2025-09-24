import { redirect } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { isTestMode, getCurrentConfig, isMockConnectionsEnabled, getCredentials } from "../config/app.server.js";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  
  // If mock connections are enabled, simulate connection without OAuth
  if (isMockConnectionsEnabled()) {
    console.log('Mock mode: Simulating Meta OAuth success for shop:', session.shop);
    
    // Set connected status for test mode
    const { setConnected } = await import("../services/connections.server.js");
    await setConnected("meta", true, session.shop);
    
    return redirect("/app/connections?meta_status=connected&test_mode=true");
  }

  // Production/Real OAuth mode: Real OAuth flow
  const url = new URL(request.url);
  const origin = `${url.protocol}//${url.host}`;
  const credentials = getCredentials('meta');
  const redirectUri = credentials?.redirectUri || `${origin}/app/connections/meta/callback`;

  const clientId = credentials?.clientId;
  if (!clientId) {
    console.error('Meta client ID not found in configuration');
    return redirect("/app/connections?error=missing_credentials");
  }

  const scope = [
    "ads_read",
    "business_management",
  ];

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: scope.join(","),
    state: session.shop,
  });

  return redirect(`https://www.facebook.com/v20.0/dialog/oauth?${params.toString()}`);
};


