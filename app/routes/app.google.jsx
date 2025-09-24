import { authenticate } from "../shopify.server";
import { TitleBar } from "@shopify/app-bridge-react";
import { Page, Layout, Card, BlockStack, Text, InlineStack, DataTable, Badge } from "@shopify/polaris";
import DateRangeControls, { getPresetRange } from "../components/DateRangeControls";
import { useMemo, useState, useEffect } from "react";
import ConnectPrompt from "../components/ConnectPrompt";
import { useLoaderData, useFetcher } from "@remix-run/react";
import KeyMetrics from "../components/KeyMetrics";
import IconHeader from "../components/IconHeader";
import CampaignInsights from "../components/CampaignInsights";
import RealTimeChart from "../components/RealTimeChart";
export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const { isConnected } = await import("../services/connections.server.js");
  const { isTestMode } = await import("../config/app.server.js");
  const connected = await isConnected("google", session.shop);
  return { 
    connected, 
    isTestMode: isTestMode(),
    shopDomain: session.shop
  };
};


export default function GooglePage() {
  const defaultRange = useMemo(() => getPresetRange("this_month"), []);
  const [selectedDates, setSelectedDates] = useState(defaultRange);
  const { connected, isTestMode: testMode } = useLoaderData();
  const fetcher = useFetcher();
  const [campaignData, setCampaignData] = useState(null);

  // Default campaign rows for when data is loading or not available
  const defaultRows = [
    ["Loading Campaign Data...", "$0.00", "$0.00", "$0.00", "0.00", "Loading"],
    ["Please wait...", "$0.00", "$0.00", "$0.00", "0.00", "Loading"],
  ];

  // Fetch campaign data when connected and date range changes
  useEffect(() => {
    if (connected && selectedDates && fetcher.state === 'idle') {
      fetcher.submit(
        { platform: "google", dateRange: JSON.stringify(selectedDates) },
        { method: "post", action: "/app/api/metrics" }
      );
    }
  }, [connected, selectedDates]);

  // Update campaign data when fetcher data changes
  useEffect(() => {
    if (fetcher.data && fetcher.data.campaigns) {
      setCampaignData(fetcher.data);
    }
  }, [fetcher.data]);

  const rows = campaignData?.campaigns || defaultRows;

  return (
    <Page>
      <TitleBar title="Google Ads" />
      <Layout>
        <Layout.Section>
          <InlineStack gap="300" blockAlign="center">
            <IconHeader iconSrc="/icons/google.svg" title="Google Ads" size={22} />
            {(testMode || campaignData?.isTestData) && (
              <Badge tone="warning">Test Mode</Badge>
            )}
          </InlineStack>
        </Layout.Section>
        {connected ? (
          <Layout.Section>
            <DateRangeControls selectedDates={selectedDates} onChange={setSelectedDates} />
          </Layout.Section>
        ) : null}
        {connected ? (
          <Layout.Section>
            <KeyMetrics 
              title="Google Ads - Key Metrics" 
              platform="google"
              dateRange={selectedDates}
              isTestMode={testMode}
            />
          </Layout.Section>
        ) : (
          <Layout.Section>
            <ConnectPrompt platform="Google Ads" />
          </Layout.Section>
        )}
        {connected ? (
          <Layout.Section>
            <RealTimeChart 
              metricsData={campaignData}
              platform="google"
              isTestMode={testMode}
            />
          </Layout.Section>
        ) : null}
        {connected ? (
          <Layout.Section>
            <Card>
              <BlockStack gap="200">
                <Text as="h3" variant="headingMd">Campaigns</Text>
                <DataTable
                  columnContentTypes={["text","text","text","text","text","text"]}
                  headings={["Campaign","Spend","CPC","Revenue","ROAS","Status"]}
                  rows={rows}
                />
              </BlockStack>
            </Card>
          </Layout.Section>
        ) : null}
        {connected ? (
          <Layout.Section>
            <CampaignInsights 
              campaigns={campaignData?.campaigns}
              platform="google"
              isTestMode={testMode}
            />
          </Layout.Section>
        ) : null}
      </Layout>
    </Page>
  );
}


