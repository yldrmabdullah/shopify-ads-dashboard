import { useMemo, useState, useCallback } from "react";
import { Card, BlockStack, InlineStack, Text, InlineGrid, Popover, ActionList, Button } from "@shopify/polaris";

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

function MetricCard({ currentLabel, options, value, deltaPct, trend, onChange }) {
  const isPositive = deltaPct >= 0;
  const color = isPositive ? "#00B386" : "#E0353C";

  return (
    <Card>
      <BlockStack gap="200">
        <InlineStack align="space-between" blockAlign="center">
          <MetricSelector label={currentLabel} options={options} onSelect={onChange} />
        </InlineStack>
        <Text as="p" variant="heading2xl">{value}</Text>
        <Sparkline points={trend} stroke={color} />
        <InlineStack gap="150" blockAlign="center">
          <Text as="p" tone={isPositive ? "success" : "critical"}>
            {isPositive ? "▲" : "▼"} {Math.abs(deltaPct).toFixed(2)}%
          </Text>
          <Text as="p" tone="subdued">vs previous period</Text>
        </InlineStack>
      </BlockStack>
    </Card>
  );
}

export default function KeyMetrics({ title }) {
  const metricOptions = useMemo(
    () => [
      { label: "Clicks", value: "clicks", default: true },
      { label: "Impressions", value: "impressions" },
      { label: "Cost", value: "cost" },
      { label: "Conversions", value: "conversions" },
      { label: "Revenue", value: "revenue" },
      { label: "ROAS", value: "roas" },
    ],
    []
  );

  const [cards, setCards] = useState([
    { key: "a", metric: "clicks", value: "19.29k", deltaPct: 52.72, trend: [8,6,5,6,7,5,9,12,9,11,15] },
    { key: "b", metric: "impressions", value: "750.85k", deltaPct: 14.49, trend: [40,38,35,33,36,34,37,42,45,48,50] },
    { key: "c", metric: "cost", value: "123.37k", deltaPct: -138.55, trend: [5,7,6,8,6,5,6,7,8,10,13] },
    { key: "d", metric: "conversions", value: "2.99k", deltaPct: -33.86, trend: [4,5,5,6,5,4,4,3,3,2,2] },
  ]);

  const handleChange = useCallback((index, newMetric) => {
    setCards((prev) => prev.map((c, i) => (i === index ? { ...c, metric: newMetric } : c)));
  }, []);

  const optionFor = (metric) => metricOptions
    .filter((o) => o.value !== metric)
    .map((o) => ({ ...o, default: false }));

  const labelFor = (metric) => (metricOptions.find((o) => o.value === metric)?.label || metric);

  return (
    <BlockStack gap="200">
      <Text as="h3" variant="headingLg">{title || "Key Metrics"}</Text>
      <Text as="p" tone="subdued">Selected date range compared to the previous period.</Text>
      <InlineGrid columns={{ xs: 1, sm: 2, md: 2, lg: 4 }} gap="300">
        {cards.map((c, idx) => (
          <MetricCard
            key={c.key}
            currentLabel={labelFor(c.metric)}
            options={optionFor(c.metric)}
            value={c.value}
            deltaPct={c.deltaPct}
            trend={c.trend}
            onChange={(val) => handleChange(idx, val)}
          />)
        )}
      </InlineGrid>
    </BlockStack>
  );
}

