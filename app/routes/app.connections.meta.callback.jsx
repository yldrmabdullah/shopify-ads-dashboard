import { redirect } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { saveMetaAuth, setConnected } from "../services/connections.server";
import { getCredentials } from "../config/app.server.js";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) {
    return redirect(`/app/connections?meta_error=${encodeURIComponent(error)}`);
  }
  if (!code) {
    return redirect(`/app/connections?meta_error=missing_code`);
  }

  const origin = `${url.protocol}//${url.host}`;
  const credentials = getCredentials('meta');
  const redirectUri = credentials?.redirectUri || `${origin}/app/connections/meta/callback`;

  if (!credentials?.clientId || !credentials?.clientSecret) {
    console.error('Meta credentials not found in configuration');
    return redirect(`/app/connections?meta_error=missing_credentials`);
  }

  const clientId = credentials.clientId;
  const clientSecret = credentials.clientSecret;

  const tokenUrl = new URL("https://graph.facebook.com/v20.0/oauth/access_token");
  tokenUrl.search = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    code,
  }).toString();

  const tokenRes = await fetch(tokenUrl, { method: "GET" });
  if (!tokenRes.ok) {
    return redirect(`/app/connections?meta_error=token_exchange_failed`);
  }
  const tokenJson = await tokenRes.json();
  const accessToken = tokenJson.access_token;

  if (!accessToken) {
    return redirect(`/app/connections?meta_error=missing_access_token`);
  }
  const longLivedUrl = new URL("https://graph.facebook.com/v20.0/oauth/access_token");
  longLivedUrl.search = new URLSearchParams({
    grant_type: "fb_exchange_token",
    client_id: clientId,
    client_secret: clientSecret,
    fb_exchange_token: accessToken,
  }).toString();

  const longRes = await fetch(longLivedUrl, { method: "GET" });
  const longJson = longRes.ok ? await longRes.json() : null;
  const longLivedToken = longJson?.access_token || accessToken;

  await saveMetaAuth({
    shopDomain: session.shop,
    longLivedToken,
    metaAccountId: null,
    metaAdId: null,
    metaAdName: null,
  });

  await setConnected("meta", true, session.shop);
  return redirect("/app/connections?meta_status=connected");
};


