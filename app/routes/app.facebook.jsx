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

export default function FacebookPage() {
  return (
    <Page>
      <TitleBar title="Facebook" />
      <Layout>
        <Layout.Section>
          <InlineStack gap="300" align="space-between" wrap>
            <Metric label="Toplam Harcama" value="$1,230.00" />
            <Metric label="Ortalama CPC" value="$0.80" />
            <Metric label="Toplam Getiri" value="$4,800.00" />
            <Metric label="Toplam ROAS" value="3.90" />
          </InlineStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}


