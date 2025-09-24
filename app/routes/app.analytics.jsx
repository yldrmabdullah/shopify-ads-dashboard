import { authenticate } from "../shopify.server";
import { TitleBar } from "@shopify/app-bridge-react";
import { Page, Layout, Card, BlockStack, Text, InlineStack, InlineGrid, Badge, DataTable } from "@shopify/polaris";
import { useMemo, useState, useEffect } from "react";
import { useLoaderData, useFetcher } from "@remix-run/react";
import IconHeader from "../components/IconHeader";
import DateRangeControls, { getPresetRange } from "../components/DateRangeControls";
export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const { isConnected } = await import("../services/connections.server.js");
  const { isTestMode } = await import("../config/app.server.js");
  
  return { 
    googleConnected: await isConnected("google", session.shop),
    metaConnected: await isConnected("meta", session.shop),
    isTestMode: isTestMode(),
    shopDomain: session.shop
  };
};

/**
 * Performance Comparison Component
 */
function PerformanceComparison({ googleData, metaData }) {
  const comparisonMetrics = useMemo(() => {
    if (!googleData?.keyMetrics || !metaData?.keyMetrics) return [];

    const getMetricValue = (data, metric) => {
      const found = data.keyMetrics.find(m => m.metric === metric);
      return found ? parseFloat(found.value.replace(/[$,k%]/g, '')) : 0;
    };

    return [
      {
        metric: "Cost Efficiency",
        google: `$${getMetricValue(googleData, 'cpc').toFixed(2)} CPC`,
        meta: `$${getMetricValue(metaData, 'cpc').toFixed(2)} CPC`,
        winner: getMetricValue(googleData, 'cpc') < getMetricValue(metaData, 'cpc') ? 'Google' : 'Meta'
      },
      {
        metric: "ROAS Performance", 
        google: `${getMetricValue(googleData, 'roas').toFixed(2)}x`,
        meta: `${getMetricValue(metaData, 'roas').toFixed(2)}x`,
        winner: getMetricValue(googleData, 'roas') > getMetricValue(metaData, 'roas') ? 'Google' : 'Meta'
      },
      {
        metric: "Engagement Rate",
        google: `${getMetricValue(googleData, 'ctr').toFixed(2)}%`,
        meta: `${getMetricValue(metaData, 'ctr').toFixed(2)}%`,
        winner: getMetricValue(googleData, 'ctr') > getMetricValue(metaData, 'ctr') ? 'Google' : 'Meta'
      }
    ];
  }, [googleData, metaData]);

  return (
    <Card>
      <BlockStack gap="400">
        <Text as="h3" variant="headingMd">Platform Performance Comparison</Text>
        <DataTable
          columnContentTypes={["text", "text", "text", "text"]}
          headings={["Metric", "Google Ads", "Meta Ads", "Winner"]}
          rows={comparisonMetrics.map(metric => [
            metric.metric,
            metric.google,
            metric.meta,
            <Badge key={metric.metric} tone={metric.winner === 'Google' ? 'success' : 'info'}>
              {metric.winner}
            </Badge>
          ])}
        />
      </BlockStack>
    </Card>
  );
}

/**
 * Budget Optimization Recommendations
 */
function BudgetOptimization({ totalSpend, platformData }) {
  const recommendations = useMemo(() => {
    const suggestions = [];
    
    if (platformData.google && platformData.meta) {
      const googleROAS = parseFloat(platformData.google.keyMetrics?.find(m => m.metric === 'roas')?.value || '0');
      const metaROAS = parseFloat(platformData.meta.keyMetrics?.find(m => m.metric === 'roas')?.value || '0');
      
      if (googleROAS > metaROAS * 1.2) {
        suggestions.push({
          type: "Increase Budget",
          platform: "Google Ads", 
          reason: `ROAS is ${((googleROAS/metaROAS - 1) * 100).toFixed(0)}% higher`,
          impact: "High"
        });
      } else if (metaROAS > googleROAS * 1.2) {
        suggestions.push({
          type: "Increase Budget",
          platform: "Meta Ads",
          reason: `ROAS is ${((metaROAS/googleROAS - 1) * 100).toFixed(0)}% higher`, 
          impact: "High"
        });
      }
    }

    return suggestions;
  }, [platformData]);

  return (
    <Card>
      <BlockStack gap="400">
        <Text as="h3" variant="headingMd">AI-Powered Budget Recommendations</Text>
        {recommendations.length > 0 ? (
          <BlockStack gap="200">
            {recommendations.map((rec, index) => (
              <InlineStack key={index} align="space-between" blockAlign="center">
                <BlockStack gap="100">
                  <Text as="p" variant="bodyMd" fontWeight="medium">{rec.type} - {rec.platform}</Text>
                  <Text as="p" variant="bodySm" tone="subdued">{rec.reason}</Text>
                </BlockStack>
                <Badge tone={rec.impact === 'High' ? 'critical' : 'warning'}>
                  {rec.impact} Impact
                </Badge>
              </InlineStack>
            ))}
          </BlockStack>
        ) : (
          <Text as="p" tone="subdued">Budget allocation is currently optimized</Text>
        )}
      </BlockStack>
    </Card>
  );
}

export default function AnalyticsPage() {
  const { googleConnected, metaConnected, isTestMode } = useLoaderData();
  const [selectedDates, setSelectedDates] = useState(() => getPresetRange("last_7_days"));
  const [googleData, setGoogleData] = useState(null);
  const [metaData, setMetaData] = useState(null);
  
  const googleFetcher = useFetcher();
  const metaFetcher = useFetcher();

  // Fetch data for both platforms
  useEffect(() => {
    if (googleConnected && selectedDates && googleFetcher.state === 'idle') {
      googleFetcher.submit(
        { platform: "google", dateRange: JSON.stringify(selectedDates) },
        { method: "post", action: "/app/api/metrics" }
      );
    }
    if (metaConnected && selectedDates && metaFetcher.state === 'idle') {
      metaFetcher.submit(
        { platform: "meta", dateRange: JSON.stringify(selectedDates) },
        { method: "post", action: "/app/api/metrics" }
      );
    }
  }, [selectedDates, googleConnected, metaConnected]);

  useEffect(() => {
    if (googleFetcher.data && googleFetcher.state === 'idle') {
      setGoogleData(googleFetcher.data);
    }
  }, [googleFetcher.data, googleFetcher.state]);

  useEffect(() => {
    if (metaFetcher.data && metaFetcher.state === 'idle') {
      setMetaData(metaFetcher.data);
    }
  }, [metaFetcher.data, metaFetcher.state]);

  const totalSpend = useMemo(() => {
    let total = 0;
    if (googleData?.keyMetrics) {
      const googleCost = googleData.keyMetrics.find(m => m.metric === 'cost');
      if (googleCost) total += parseFloat(googleCost.value.replace(/[$,]/g, ''));
    }
    if (metaData?.keyMetrics) {
      const metaCost = metaData.keyMetrics.find(m => m.metric === 'cost');
      if (metaCost) total += parseFloat(metaCost.value.replace(/[$,]/g, ''));
    }
    return total;
  }, [googleData, metaData]);

  return (
    <Page>
      <TitleBar title="Advanced Analytics" />
      <Layout>
        <Layout.Section>
          <InlineStack gap="300" blockAlign="center">
            <IconHeader iconSrc="/icons/dashboard.svg" title="Advanced Analytics" />
            {isTestMode && <Badge tone="warning">Test Mode</Badge>}
          </InlineStack>
        </Layout.Section>

        <Layout.Section>
          <DateRangeControls selectedDates={selectedDates} onChange={setSelectedDates} />
        </Layout.Section>

        {/* Total Spend Overview */}
        <Layout.Section>
          <Card>
            <BlockStack gap="200">
              <Text as="h3" variant="headingMd">Cross-Platform Overview</Text>
              <InlineGrid columns={{ xs: 1, sm: 3 }} gap="400">
                <BlockStack gap="100">
                  <Text as="p" variant="bodySm" tone="subdued">Total Ad Spend</Text>
                  <Text as="p" variant="heading2xl">${totalSpend.toFixed(2)}</Text>
                </BlockStack>
                <BlockStack gap="100">
                  <Text as="p" variant="bodySm" tone="subdued">Platforms Connected</Text>
                  <Text as="p" variant="heading2xl">
                    {(googleConnected ? 1 : 0) + (metaConnected ? 1 : 0)}/2
                  </Text>
                </BlockStack>
                <BlockStack gap="100">
                  <Text as="p" variant="bodySm" tone="subdued">Data Freshness</Text>
                  <Text as="p" variant="headingMd">Real-time</Text>
                </BlockStack>
              </InlineGrid>
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Performance Comparison */}
        {googleData && metaData && (
          <Layout.Section>
            <PerformanceComparison googleData={googleData} metaData={metaData} />
          </Layout.Section>
        )}

        {/* Budget Optimization */}
        <Layout.Section>
          <BudgetOptimization 
            totalSpend={totalSpend} 
            platformData={{ google: googleData, meta: metaData }} 
          />
        </Layout.Section>

        {/* Connection Status */}
        <Layout.Section>
          <Card>
            <BlockStack gap="200">
              <Text as="h3" variant="headingMd">Platform Connection Status</Text>
              <InlineGrid columns={{ xs: 1, sm: 2 }} gap="300">
                <InlineStack gap="200" blockAlign="center">
                  <img src="/icons/google.svg" width={20} height={20} alt="" />
                  <Text>Google Ads</Text>
                  <Badge tone={googleConnected ? "success" : "critical"}>
                    {googleConnected ? "Connected" : "Disconnected"}
                  </Badge>
                </InlineStack>
                <InlineStack gap="200" blockAlign="center">
                  <img src="/icons/meta.svg" width={20} height={20} alt="" />
                  <Text>Meta Ads</Text>
                  <Badge tone={metaConnected ? "success" : "critical"}>
                    {metaConnected ? "Connected" : "Disconnected"}
                  </Badge>
                </InlineStack>
              </InlineGrid>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
