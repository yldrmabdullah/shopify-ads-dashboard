import { authenticate } from "../shopify.server";
import { TitleBar } from "@shopify/app-bridge-react";
import { Page, Layout } from "@shopify/polaris";
import { useCallback, useMemo, useState } from "react";
import DateRangeControls, { getPresetRange } from "../components/DateRangeControls";
import KeyMetrics from "../components/KeyMetrics";
import IconHeader from "../components/IconHeader";
import ConnectPrompt from "../components/ConnectPrompt";
import { useLoaderData } from "@remix-run/react";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  const { isConnected } = await import("../services/connections.server.js");
  return {
    googleConnected: isConnected("google"),
    metaConnected: isConnected("meta"),
  };
};

// removed unused MetricCard

export default function DashboardPage() {
  const defaultRange = useMemo(() => getPresetRange("this_month"), []);
  const [selectedDates, setSelectedDates] = useState(defaultRange);
  const { googleConnected, metaConnected } = useLoaderData();

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
        {(googleConnected || metaConnected) ? (
          <Layout.Section>
            <DateRangeControls selectedDates={selectedDates} onChange={setSelectedDates} />
          </Layout.Section>
        ) : null}

        {googleConnected ? (
          <Layout.Section>
            <KeyMetrics title="Google Ads - Key Metrics" />
          </Layout.Section>
        ) : (
          <Layout.Section>
            <ConnectPrompt platform="Google Ads" />
          </Layout.Section>
        )}
        {metaConnected ? (
          <Layout.Section>
            <KeyMetrics title="Meta Ads - Key Metrics" />
          </Layout.Section>
        ) : (
          <Layout.Section>
            <ConnectPrompt platform="Meta Ads" />
          </Layout.Section>
        )}
      </Layout>
    </Page>
  );
}


