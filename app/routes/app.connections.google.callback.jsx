import { redirect } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { saveGoogleAuth, setConnected } from "../services/connections.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) {
    return redirect(`/app/connections?google_error=${encodeURIComponent(error)}`);
  }
  if (!code) {
    return redirect(`/app/connections?google_error=missing_code`);
  }

  const origin = `${url.protocol}//${url.host}`;
  const redirectUri = `${origin}/app/connections/google/callback`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }).toString(),
  });

  if (!tokenRes.ok) {
    return redirect(`/app/connections?google_error=token_exchange_failed`);
  }

  const tokenJson = await tokenRes.json();
  const refreshToken = tokenJson.refresh_token;
  const email = tokenJson.id_token ? undefined : undefined;

  if (!refreshToken) {
    // If no refresh_token returned, user may have connected before; prompt=consent + access_type=offline should mitigate.
    return redirect(`/app/connections?google_error=missing_refresh_token`);
  }

  await saveGoogleAuth(session.shop, {
    refreshToken,
    email,
    managerId: null,
    managerName: null,
    selectedExternalId: null,
    selectedName: null,
    currencyCode: null,
  });

  await setConnected("google", true, session.shop);
  return redirect("/app/connections?google_status=connected");
};