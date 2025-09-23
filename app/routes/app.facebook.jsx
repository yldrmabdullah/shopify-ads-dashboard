import { authenticate } from "../shopify.server";
import { TitleBar } from "@shopify/app-bridge-react";
import { Page, Layout, Card, BlockStack, Text, InlineStack, DataTable } from "@shopify/polaris";
import DateRangeControls, { getPresetRange } from "../components/DateRangeControls";
import { useMemo, useState } from "react";
import KeyMetrics from "../components/KeyMetrics";
import IconHeader from "../components/IconHeader";

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
  const defaultRange = useMemo(() => getPresetRange("this_month"), []);
  const [selectedDates, setSelectedDates] = useState(defaultRange);

  const rows = [
    ["Campaign A", "$300.00", "$0.85", "$1,200.00", "4.0"],
    ["Campaign B", "$180.00", "$0.75", "$720.00", "4.0"],
  ];

  return (
    <Page>
      <TitleBar title="Meta Ads" />
      <Layout>
        <Layout.Section>
          <IconHeader iconSrc="/icons/meta.svg" title="Meta Ads" size={22} />
        </Layout.Section>
        <Layout.Section>
          <DateRangeControls selectedDates={selectedDates} onChange={setSelectedDates} />
        </Layout.Section>
        <Layout.Section>
          <KeyMetrics title="Meta Ads - Key Metrics" />
        </Layout.Section>
        <Layout.Section>
          <Card>
            <BlockStack gap="200">
              <Text as="h3" variant="headingMd">Campaigns</Text>
              <DataTable
                columnContentTypes={["text","text","text","text","text"]}
                headings={["Campaign","Spend","CPC","Revenue","ROAS"]}
                rows={rows}
              />
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}


