import { redirect } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { isTestMode, getCurrentConfig, isMockConnectionsEnabled, getCredentials } from "../config/app.server.js";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  
  // If mock connections are enabled, simulate connection without OAuth
  if (isMockConnectionsEnabled()) {
    console.log('Mock mode: Simulating Google OAuth success for shop:', session.shop);
    
    // Set connected status for test mode
    const { setConnected } = await import("../services/connections.server.js");
    await setConnected("google", true, session.shop);
    
    return redirect("/app/connections?google_status=connected&test_mode=true");
  }

  // Production/Real OAuth mode: Real OAuth flow
  const url = new URL(request.url);
  const origin = `${url.protocol}//${url.host}`;
  const credentials = getCredentials('google');
  const redirectUri = credentials?.redirectUri || `${origin}/app/connections/google/callback`;

  const clientId = credentials?.clientId;
  if (!clientId) {
    console.error('Google client ID not found in configuration');
    return redirect("/app/connections?error=missing_credentials");
  }

  const scope = [
    "openid",
    "email", 
    "profile",
    "https://www.googleapis.com/auth/adwords",
  ];

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    access_type: "offline",
    include_granted_scopes: "true",
    prompt: "consent",
    scope: scope.join(" "),
    state: session.shop,
  });

  return redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
};