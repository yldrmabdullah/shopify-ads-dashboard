import { authenticate } from "../shopify.server";
import { TitleBar } from "@shopify/app-bridge-react";
import { Page, Layout, Card, BlockStack, Text, InlineStack, Button, InlineGrid, Badge } from "@shopify/polaris";
import IconHeader from "../components/IconHeader";
import { Form, useLoaderData } from "@remix-run/react";
import { redirect } from "@remix-run/node";
import { isTestMode } from "../config/app.server.js";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shopDomain = session.shop;
  const { isConnected } = await import("../services/connections.server.js");
  return {
    googleConnected: await isConnected("google", shopDomain),
    metaConnected: await isConnected("meta", shopDomain),
    isTestMode: isTestMode(),
  };
};

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shopDomain = session.shop;
  const form = await request.formData();
  const platform = String(form.get("platform"));
  const intent = String(form.get("intent") || "connect");
  const { setConnected, saveGoogleAuth, saveMetaAuth } = await import("../services/connections.server.js");

  if (form.get("action") === "saveGoogle") {
    await saveGoogleAuth({
      shopDomain,
      refreshToken: String(form.get("refreshToken") || ""),
      email: String(form.get("email") || ""),
      managerId: String(form.get("managerId") || ""),
      managerName: String(form.get("managerName") || ""),
      selectedExternalId: String(form.get("externalId") || ""),
      selectedName: String(form.get("accountName") || ""),
      currencyCode: String(form.get("currencyCode") || ""),
    });
  } else if (form.get("action") === "saveMeta") {
    await saveMetaAuth({
      shopDomain,
      longLivedToken: String(form.get("longLivedToken") || ""),
      metaAccountId: String(form.get("metaAccountId") || ""),
      metaAdId: String(form.get("metaAdId") || ""),
      metaAdName: String(form.get("metaAdName") || ""),
    });
  } else {
    await setConnected(platform, intent === "connect", shopDomain);
  }
  return redirect("/app/connections");
};

export default function ConnectionsPage() {
  const { googleConnected, metaConnected, isTestMode } = useLoaderData();
  return (
    <Page>
      <TitleBar title="Connections" />
      <Layout>
        <Layout.Section>
          <InlineStack gap="300" blockAlign="center">
            <IconHeader iconSrc="/icons/dashboard.svg" title="Connections" />
            {isTestMode && (
              <Badge tone="info">Test Mode Active</Badge>
            )}
          </InlineStack>
        </Layout.Section>
        <Layout.Section>
          <InlineGrid columns={{ xs: 1, sm: 2 }} gap="300">
            <Card>
              <BlockStack gap="200">
                <InlineStack gap="200" blockAlign="center">
                  <img src="/icons/google.svg" width={20} height={20} alt="" />
                  <Text as="h3" variant="headingMd">Google Ads</Text>
                  {isTestMode && (
                    <Badge tone="warning" size="small">Test Mode</Badge>
                  )}
                </InlineStack>
                <Text as="p" tone="subdued">Connect your Google Ads account to fetch metrics.</Text>
                {googleConnected ? (
                  <Form method="post">
                    <input type="hidden" name="platform" value="google" />
                    <input type="hidden" name="intent" value="disconnect" />
                    <InlineStack gap="200">
                      <Button submit variant="tertiary">Disconnect</Button>
                      <Button url="https://ads.google.com" target="_blank">Learn more</Button>
                    </InlineStack>
                  </Form>
                ) : (
                  <Form method="post">
                    <input type="hidden" name="platform" value="google" />
                    <input type="hidden" name="intent" value="connect" />
                    <InlineStack gap="200">
                      <Button submit variant="primary">
                        {isTestMode ? "Connect (Test Mode)" : "Connect"}
                      </Button>
                      <Button url="https://ads.google.com" target="_blank">Learn more</Button>
                    </InlineStack>
                  </Form>
                )}
              </BlockStack>
            </Card>
            <Card>
              <BlockStack gap="200">
                <InlineStack gap="200" blockAlign="center">
                  <img src="/icons/meta.svg" width={20} height={20} alt="" />
                  <Text as="h3" variant="headingMd">Meta Ads</Text>
                  {isTestMode && (
                    <Badge tone="warning" size="small">Test Mode</Badge>
                  )}
                </InlineStack>
                <Text as="p" tone="subdued">Connect your Meta Ads account to fetch metrics.</Text>
                {metaConnected ? (
                  <Form method="post">
                    <input type="hidden" name="platform" value="meta" />
                    <input type="hidden" name="intent" value="disconnect" />
                    <InlineStack gap="200">
                      <Button submit variant="tertiary">Disconnect</Button>
                      <Button url="https://www.facebook.com/business/ads" target="_blank">Learn more</Button>
                    </InlineStack>
                  </Form>
                ) : (
                  <Form method="post">
                    <input type="hidden" name="platform" value="meta" />
                    <input type="hidden" name="intent" value="connect" />
                    <InlineStack gap="200">
                      <Button submit variant="primary">
                        {isTestMode ? "Connect (Test Mode)" : "Connect"}
                      </Button>
                      <Button url="https://www.facebook.com/business/ads" target="_blank">Learn more</Button>
                    </InlineStack>
                  </Form>
                )}
              </BlockStack>
            </Card>
          </InlineGrid>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

