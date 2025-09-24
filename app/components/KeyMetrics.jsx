import { useMemo, useState, useCallback, useEffect } from "react";
import { Card, BlockStack, InlineStack, Text, InlineGrid, Popover, ActionList, Button, Badge } from "@shopify/polaris";
import { useFetcher } from "@remix-run/react";

function Sparkline({ points, stroke = "#00B386" }) {
  const width = 240;
  const height = 70;
  const maxY = Math.max(...points);
  const minY = Math.min(...points);
  const range = maxY - minY || 1;
  const stepX = width / Math.max(1, points.length - 1);
  const d = points
    .map((p, i) => {
      const x = i * stepX;
      const y = height - ((p - minY) / range) * height;
      return `${i === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden>
      <path d={d} fill="none" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function MetricSelector({ label, options, onSelect }) {
  const [open, setOpen] = useState(false);
  const toggle = () => setOpen((o) => !o);
  const items = options.map((o) => ({ content: o.label, onAction: () => { onSelect(o.value); setOpen(false); } }));

  return (
    <Popover active={open} autofocusTarget="first-node" preferredAlignment="left" onClose={() => setOpen(false)} activator={
      <Button onClick={toggle} disclosure>
        {label}
      </Button>
    }>
      <ActionList items={items} />
    </Popover>
  );
}

function MetricCard({ currentLabel, options, value, deltaPct, trend, onChange, metric, metricsData }) {
  // Get the actual value from metrics data based on selected metric
  const actualMetric = metricsData?.keyMetrics?.find(m => m.metric === metric);
  const displayValue = actualMetric ? actualMetric.value : value;
  const displayDelta = actualMetric ? actualMetric.deltaPct : deltaPct;
  const deltaIsPositive = displayDelta >= 0;

  return (
    <Card>
      <BlockStack gap="200">
        <InlineStack align="space-between" blockAlign="center">
          <MetricSelector label={currentLabel} options={options} onSelect={onChange} />
        </InlineStack>
        <Text as="p" variant="heading2xl">{displayValue}</Text>
        <Sparkline points={trend} stroke={deltaIsPositive ? "#00B386" : "#E0353C"} />
        <InlineStack gap="150" blockAlign="center">
          <Text as="p" tone={deltaIsPositive ? "success" : "critical"}>
            {deltaIsPositive ? "▲" : "▼"} {Math.abs(displayDelta).toFixed(2)}%
          </Text>
          <Text as="p" tone="subdued">vs previous period</Text>
        </InlineStack>
      </BlockStack>
    </Card>
  );
}

export default function KeyMetrics({ title, platform, dateRange, isTestMode }) {
  const fetcher = useFetcher();
  const [metricsData, setMetricsData] = useState(null);

  const metricOptions = useMemo(
    () => {
      const commonMetrics = [
        { label: "Clicks", value: "clicks" },
        { label: "Impressions", value: "impressions" },
        { label: "Cost", value: "cost" },
        { label: "Conversions", value: "conversions" },
        { label: "Revenue", value: "revenue" },
        { label: "ROAS", value: "roas" },
        { label: "CTR", value: "ctr" },
        { label: "CPC", value: "cpc" },
      ];

      if (platform === 'meta') {
        return [
          ...commonMetrics,
          { label: "Reach", value: "reach" },
          { label: "CPM", value: "cpm" },
        ];
      }

      // Google Ads - no reach or cpm
      return commonMetrics;
    },
    [platform]
  );

  const [cards, setCards] = useState([
    { key: "a", metric: "clicks", value: "Loading...", deltaPct: 0, trend: [8,6,5,6,7,5,9,12,9,11,15] },
    { key: "b", metric: "impressions", value: "Loading...", deltaPct: 0, trend: [40,38,35,33,36,34,37,42,45,48,50] },
    { key: "c", metric: "cost", value: "Loading...", deltaPct: 0, trend: [5,7,6,8,6,5,6,7,8,10,13] },
    { key: "d", metric: "conversions", value: "Loading...", deltaPct: 0, trend: [4,5,5,6,5,4,4,3,3,2,2] },
  ]);

  // Auto-fix invalid metrics for platform
  useEffect(() => {
    if (platform && metricOptions.length > 0) {
      const validMetrics = metricOptions.map(option => option.value);
      setCards(prevCards => 
        prevCards.map(card => {
          if (!validMetrics.includes(card.metric)) {
            // Find a replacement metric that's not already used
            const usedMetrics = prevCards.map(c => c.metric);
            const availableMetric = validMetrics.find(metric => 
              !usedMetrics.includes(metric) || metric === card.metric
            );
            return { ...card, metric: availableMetric || validMetrics[0] };
          }
          return card;
        })
      );
    }
  }, [platform, metricOptions]);

  useEffect(() => {
    if (platform && dateRange && fetcher.state === 'idle') {
      fetcher.submit(
        { platform, dateRange: JSON.stringify(dateRange) },
        { method: "post", action: "/app/api/metrics" }
      );
    }
  }, [platform, dateRange]);

  useEffect(() => {
    if (fetcher.data?.keyMetrics && fetcher.state === 'idle') {
      setMetricsData(fetcher.data);
    }
  }, [fetcher.data, fetcher.state]);

  const handleChange = useCallback((index, newMetric) => {
    setCards((prev) => prev.map((c, i) => (i === index ? { ...c, metric: newMetric } : c)));
  }, []);

  // Get all currently selected metrics except for the current card
  const getSelectedMetrics = useCallback(() => {
    return cards.map(c => c.metric);
  }, [cards]);

  const optionFor = useCallback((currentMetric, currentIndex) => {
    const selectedMetrics = getSelectedMetrics();
    return metricOptions
      .filter((o) => {
        // Don't show current metric
        if (o.value === currentMetric) return false;
        // Don't show metrics that are already selected in other cards
        const isSelectedElsewhere = selectedMetrics.some((selectedMetric, index) => 
          selectedMetric === o.value && index !== currentIndex
        );
        return !isSelectedElsewhere;
      })
      .map((o) => ({ ...o, default: false }));
  }, [metricOptions, getSelectedMetrics]);

  const labelFor = (metric) => (metricOptions.find((o) => o.value === metric)?.label || metric);

  return (
    <BlockStack gap="200">
      <InlineStack align="space-between" blockAlign="center">
        <Text as="h3" variant="headingLg">{title || "Key Metrics"}</Text>
        {(isTestMode || metricsData?.isTestData) && (
          <Badge tone="warning">Test Mode</Badge>
        )}
      </InlineStack>
      <Text as="p" tone="subdued">Selected date range compared to the previous period.</Text>
      <InlineGrid columns={{ xs: 1, sm: 2, md: 2, lg: 4 }} gap="300">
        {cards.map((c, idx) => (
          <MetricCard
            key={c.key}
            currentLabel={labelFor(c.metric)}
            options={optionFor(c.metric, idx)}
            value={c.value}
            deltaPct={c.deltaPct}
            trend={c.trend}
            metric={c.metric}
            metricsData={metricsData}
            onChange={(val) => handleChange(idx, val)}
          />)
        )}
      </InlineGrid>
    </BlockStack>
  );
}

