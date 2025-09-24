import { authenticate } from "../shopify.server";
import { TitleBar } from "@shopify/app-bridge-react";
import { Page, Layout } from "@shopify/polaris";
import { useMemo, useState } from "react";
import DateRangeControls, { getPresetRange } from "../components/DateRangeControls";
import KeyMetrics from "../components/KeyMetrics";
import IconHeader from "../components/IconHeader";
import ConnectPrompt from "../components/ConnectPrompt";
import { useLoaderData } from "@remix-run/react";
export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const { isConnected } = await import("../services/connections.server.js");
  const { isTestMode } = await import("../config/app.server.js");
  const [googleConnected, metaConnected] = await Promise.all([
    isConnected("google", session.shop),
    isConnected("meta", session.shop),
  ]);
  return { 
    googleConnected, 
    metaConnected, 
    isTestMode: isTestMode(),
    shopDomain: session.shop
  };
};

export default function DashboardPage() {
  const defaultRange = useMemo(() => getPresetRange("this_month"), []);
  const [selectedDates, setSelectedDates] = useState(defaultRange);
  const { googleConnected, metaConnected, isTestMode: testMode } = useLoaderData();

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
        {metaConnected ? (
          <Layout.Section>
            <KeyMetrics 
              title="Meta Ads - Key Metrics" 
              platform="meta"
              dateRange={selectedDates}
              isTestMode={testMode}
            />
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


