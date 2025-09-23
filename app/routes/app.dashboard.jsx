import { authenticate } from "../shopify.server";
import { TitleBar } from "@shopify/app-bridge-react";
import { Page, Layout } from "@shopify/polaris";
import { useCallback, useMemo, useState } from "react";
import DateRangeControls, { getPresetRange } from "../components/DateRangeControls";
import KeyMetrics from "../components/KeyMetrics";
import IconHeader from "../components/IconHeader";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

function MetricCard({ title, value, secondary }) {
  return (
    <Card>
      <BlockStack gap="200">
        <Text as="h3" variant="headingMd">{title}</Text>
        <Text as="p" variant="headingLg">{value}</Text>
        {secondary ? (
          <Text as="p" tone="subdued">{secondary}</Text>
        ) : null}
      </BlockStack>
    </Card>
  );
}

export default function DashboardPage() {
  const defaultRange = useMemo(() => getPresetRange("this_month"), []);
  const [selectedDates, setSelectedDates] = useState(defaultRange);

  const metricPresets = useMemo(() => ({
    core: {
      label: "Core",
      metrics: [
        { title: "Total Spend", value: "$2,430.00" },
        { title: "Avg CPC", value: "$0.75" },
        { title: "Total Revenue", value: "$9,720.00" },
        { title: "Total ROAS", value: "4.00" },
      ],
    },
    efficiency: {
      label: "Efficiency",
      metrics: [
        { title: "CPA", value: "$12.50" },
        { title: "CTR", value: "2.4%" },
        { title: "CVR", value: "3.1%" },
        { title: "AOV", value: "$82.00" },
      ],
    },
  }), [selectedDates]);

  return (
    <Page>
      <TitleBar title="Dashboard" />
      <Layout>
        <Layout.Section>
          <IconHeader iconSrc="/icons/dashboard.svg" title="Dashboard" size={22} />
        </Layout.Section>
        <Layout.Section>
          <DateRangeControls selectedDates={selectedDates} onChange={setSelectedDates} />
        </Layout.Section>

        <Layout.Section>
          <KeyMetrics title="Google Ads - Key Metrics" />
        </Layout.Section>
        <Layout.Section>
          <KeyMetrics title="Meta Ads - Key Metrics" />
        </Layout.Section>
      </Layout>
    </Page>
  );
}


