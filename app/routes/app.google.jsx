import { authenticate } from "../shopify.server";
import { TitleBar } from "@shopify/app-bridge-react";
import { Page, Layout, Card, BlockStack, Text, InlineStack } from "@shopify/polaris";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

function Metric({ label, value }) {
  return (
    <Card>
      <BlockStack gap="200">
        <Text as="h3" variant="headingMd">{label}</Text>
        <Text as="p" variant="headingLg">{value}</Text>
      </BlockStack>
    </Card>
  );
}

export default function GooglePage() {
  return (
    <Page>
      <TitleBar title="Google" />
      <Layout>
        <Layout.Section>
          <InlineStack gap="300" align="space-between" wrap>
            <Metric label="Toplam Harcama" value="$1,200.00" />
            <Metric label="Ortalama CPC" value="$0.70" />
            <Metric label="Toplam Getiri" value="$4,920.00" />
            <Metric label="Toplam ROAS" value="4.10" />
          </InlineStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}


