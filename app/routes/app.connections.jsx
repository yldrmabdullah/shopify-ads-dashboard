import { authenticate } from "../shopify.server";
import { TitleBar } from "@shopify/app-bridge-react";
import { Page, Layout, Card, BlockStack, Text, InlineStack, Button, InlineGrid, Box } from "@shopify/polaris";
import IconHeader from "../components/IconHeader";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export default function ConnectionsPage() {
  return (
    <Page>
      <TitleBar title="Connections" />
      <Layout>
        <Layout.Section>
          <IconHeader iconSrc="/icons/dashboard.svg" title="Connections" />
        </Layout.Section>
        <Layout.Section>
          <InlineGrid columns={{ xs: 1, sm: 2 }} gap="300">
            <Card>
              <BlockStack gap="200">
                <InlineStack gap="200" blockAlign="center">
                  <img src="/icons/google.svg" width={20} height={20} alt="" />
                  <Text as="h3" variant="headingMd">Google Ads</Text>
                </InlineStack>
                <Text as="p" tone="subdued">Connect your Google Ads account to fetch metrics.</Text>
                <InlineStack>
                  <Button variant="primary">Connect</Button>
                </InlineStack>
              </BlockStack>
            </Card>
            <Card>
              <BlockStack gap="200">
                <InlineStack gap="200" blockAlign="center">
                  <img src="/icons/meta.svg" width={20} height={20} alt="" />
                  <Text as="h3" variant="headingMd">Meta Ads</Text>
                </InlineStack>
                <Text as="p" tone="subdued">Connect your Meta Ads account to fetch metrics.</Text>
                <InlineStack>
                  <Button variant="primary">Connect</Button>
                </InlineStack>
              </BlockStack>
            </Card>
          </InlineGrid>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

