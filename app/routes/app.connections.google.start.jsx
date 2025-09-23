import { redirect } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);

  const url = new URL(request.url);
  const origin = `${url.protocol}//${url.host}`;
  const redirectUri = `${origin}/app/connections/google/callback`;

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const scope = [
    "openid",
    "email",
    "profile",
    "https://www.googleapis.com/auth/adwords",
  ];

  const params = new URLSearchParams({
    client_id: clientId || "",
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