import { useMemo } from "react";
import { Card, BlockStack, Text, InlineStack, Badge, InlineGrid, ProgressBar } from "@shopify/polaris";

/**
 * Campaign Performance Insights Component
 * Analyzes campaign data and provides actionable insights
 */
export default function CampaignInsights({ campaigns, platform, isTestMode }) {
  // Analyze campaign performance
  const insights = useMemo(() => {
    if (!campaigns || campaigns.length === 0) return null;

    // Parse campaign data (format: [name, spend, cpc, revenue, roas, status])
    const activeCampaigns = campaigns.filter(campaign => campaign[5] === 'Active');
    
    if (activeCampaigns.length === 0) return null;

    // Calculate metrics
    const totalSpend = activeCampaigns.reduce((sum, campaign) => {
      return sum + parseFloat(campaign[1].replace(/[$,]/g, ''));
    }, 0);

    const avgROAS = activeCampaigns.reduce((sum, campaign) => {
      return sum + parseFloat(campaign[4] || '0');
    }, 0) / activeCampaigns.length;

    // Find best and worst performing campaigns
    const campaignPerformance = activeCampaigns.map(campaign => ({
      name: campaign[0],
      spend: parseFloat(campaign[1].replace(/[$,]/g, '')),
      roas: parseFloat(campaign[4] || '0'),
      revenue: parseFloat(campaign[3].replace(/[$,]/g, ''))
    })).sort((a, b) => b.roas - a.roas);

    const bestCampaign = campaignPerformance[0];
    const worstCampaign = campaignPerformance[campaignPerformance.length - 1];

    // Generate insights
    const generatedInsights = [];

    // ROAS Analysis
    if (avgROAS > 4) {
      generatedInsights.push({
        type: "success",
        title: "Excellent ROAS Performance",
        description: `Average ROAS of ${avgROAS.toFixed(2)}x exceeds industry benchmark`,
        action: "Consider increasing budget allocation"
      });
    } else if (avgROAS < 2) {
      generatedInsights.push({
        type: "warning", 
        title: "ROAS Below Target",
        description: `Average ROAS of ${avgROAS.toFixed(2)}x needs optimization`,
        action: "Review targeting and ad creative"
      });
    }

    // Top Performer
    if (bestCampaign && bestCampaign.roas > avgROAS * 1.5) {
      generatedInsights.push({
        type: "info",
        title: "Top Performing Campaign",
        description: `"${bestCampaign.name}" achieving ${bestCampaign.roas.toFixed(2)}x ROAS`,
        action: "Scale this campaign strategy"
      });
    }

    // Budget Distribution
    const topSpender = campaignPerformance.reduce((max, campaign) => 
      campaign.spend > max.spend ? campaign : max, campaignPerformance[0]);
    
    if (topSpender && topSpender.spend > totalSpend * 0.5) {
      generatedInsights.push({
        type: "attention",
        title: "Budget Concentration Risk", 
        description: `${((topSpender.spend / totalSpend) * 100).toFixed(0)}% budget in single campaign`,
        action: "Consider diversifying spend"
      });
    }

    return {
      totalSpend,
      avgROAS,
      activeCampaigns: activeCampaigns.length,
      bestCampaign,
      worstCampaign,
      insights: generatedInsights,
      campaignPerformance
    };
  }, [campaigns]);

  if (!insights) {
    return (
      <Card>
        <BlockStack gap="200">
          <Text as="h3" variant="headingMd">Campaign Insights</Text>
          <Text as="p" tone="subdued">No active campaigns to analyze</Text>
        </BlockStack>
      </Card>
    );
  }

  return (
    <Card>
      <BlockStack gap="400">
        {/* Header */}
        <InlineStack align="space-between" blockAlign="center">
          <Text as="h3" variant="headingMd">
            {platform === 'google' ? 'Google Ads' : 'Meta Ads'} Campaign Insights
          </Text>
          {isTestMode && <Badge tone="warning" size="small">AI Powered</Badge>}
        </InlineStack>

        {/* Key Metrics Summary */}
        <InlineGrid columns={{ xs: 1, sm: 3 }} gap="300">
          <BlockStack gap="100">
            <Text as="p" variant="bodySm" tone="subdued">Active Campaigns</Text>
            <Text as="p" variant="headingLg">{insights.activeCampaigns}</Text>
          </BlockStack>
          <BlockStack gap="100">
            <Text as="p" variant="bodySm" tone="subdued">Total Spend</Text>
            <Text as="p" variant="headingLg">${insights.totalSpend.toFixed(2)}</Text>
          </BlockStack>
          <BlockStack gap="100">
            <Text as="p" variant="bodySm" tone="subdued">Avg. ROAS</Text>
            <Text as="p" variant="headingLg">{insights.avgROAS.toFixed(2)}x</Text>
          </BlockStack>
        </InlineGrid>

        {/* Performance Distribution */}
        <BlockStack gap="200">
          <Text as="p" variant="bodyMd" fontWeight="medium">Campaign Performance Distribution</Text>
          {insights.campaignPerformance.slice(0, 3).map((campaign, index) => (
            <BlockStack key={campaign.name} gap="100">
              <InlineStack align="space-between" blockAlign="center">
                <Text as="p" variant="bodySm">{campaign.name}</Text>
                <InlineStack gap="200" blockAlign="center">
                  <Text as="p" variant="bodySm">{campaign.roas.toFixed(2)}x ROAS</Text>
                  <Badge tone={index === 0 ? "success" : index === 1 ? "info" : "warning"} size="small">
                    #{index + 1}
                  </Badge>
                </InlineStack>
              </InlineStack>
              <ProgressBar 
                progress={(campaign.roas / Math.max(...insights.campaignPerformance.map(c => c.roas))) * 100}
                tone={index === 0 ? "success" : index === 1 ? "primary" : "critical"}
              />
            </BlockStack>
          ))}
        </BlockStack>

        {/* AI-Generated Insights */}
        <BlockStack gap="300">
          <Text as="p" variant="bodyMd" fontWeight="medium">AI-Powered Recommendations</Text>
          {insights.insights.map((insight, index) => (
            <Card key={index} background={
              insight.type === 'success' ? 'bg-surface-success' :
              insight.type === 'warning' ? 'bg-surface-warning' :
              insight.type === 'attention' ? 'bg-surface-critical-subdued' : 'bg-surface-info'
            }>
              <BlockStack gap="200">
                <InlineStack align="space-between" blockAlign="start">
                  <Text as="p" variant="bodyMd" fontWeight="medium">{insight.title}</Text>
                  <Badge tone={
                    insight.type === 'success' ? 'success' :
                    insight.type === 'warning' ? 'warning' :
                    insight.type === 'attention' ? 'critical' : 'info'
                  } size="small">
                    {insight.type.toUpperCase()}
                  </Badge>
                </InlineStack>
                <Text as="p" variant="bodySm">{insight.description}</Text>
                <Text as="p" variant="bodySm" fontWeight="medium" tone="subdued">
                  💡 Recommendation: {insight.action}
                </Text>
              </BlockStack>
            </Card>
          ))}
        </BlockStack>

        {/* Best vs Worst Performer */}
        {insights.bestCampaign && insights.worstCampaign && (
          <InlineGrid columns={{ xs: 1, sm: 2 }} gap="300">
            <Card background="bg-surface-success-subdued">
              <BlockStack gap="200">
                <InlineStack gap="200" blockAlign="center">
                  <Text as="p" variant="bodyMd" fontWeight="medium">🏆 Top Performer</Text>
                  <Badge tone="success" size="small">Best ROAS</Badge>
                </InlineStack>
                <Text as="p" variant="bodySm">{insights.bestCampaign.name}</Text>
                <Text as="p" variant="headingMd">{insights.bestCampaign.roas.toFixed(2)}x ROAS</Text>
              </BlockStack>
            </Card>
            <Card background="bg-surface-warning-subdued">
              <BlockStack gap="200">
                <InlineStack gap="200" blockAlign="center">
                  <Text as="p" variant="bodyMd" fontWeight="medium">📈 Needs Attention</Text>
                  <Badge tone="warning" size="small">Optimize</Badge>
                </InlineStack>
                <Text as="p" variant="bodySm">{insights.worstCampaign.name}</Text>
                <Text as="p" variant="headingMd">{insights.worstCampaign.roas.toFixed(2)}x ROAS</Text>
              </BlockStack>
            </Card>
          </InlineGrid>
        )}
      </BlockStack>
    </Card>
  );
}
