import { Card, BlockStack, Text, Button, InlineStack } from "@shopify/polaris";
import { Link } from "@remix-run/react";

export default function ConnectPrompt({ platform }) {
  return (
    <Card>
      <BlockStack gap="200">
        <Text as="h3" variant="headingMd">Please connect {platform}</Text>
        <Text as="p" tone="subdued">To view metrics, connect your {platform} account.</Text>
        <InlineStack>
          <Button url="/app/connections" variant="primary" component={Link}>Go to Connections</Button>
        </InlineStack>
      </BlockStack>
    </Card>
  );
}

