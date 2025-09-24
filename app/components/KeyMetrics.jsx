import { useMemo, useState, useCallback, useEffect } from "react";
import { Card, BlockStack, InlineStack, Text, InlineGrid, Popover, ActionList, Button, Badge } from "@shopify/polaris";
import { useFetcher } from "@remix-run/react";
import { PLATFORMS, PLATFORM_METRICS, METRIC_LABELS, CHART_COLORS } from "../constants/platforms.js";

/**
 * Sparkline component for displaying trend charts
 * @param {Object} props - Component props
 * @param {number[]} props.points - Array of data points for the chart
 * @param {string} props.stroke - Stroke color for the line (default: #00B386)
 * @returns {JSX.Element} SVG sparkline chart
 */
function Sparkline({ points, stroke = CHART_COLORS.SUCCESS }) {
  const CHART_WIDTH = 240;
  const CHART_HEIGHT = 70;
  
  const maxValue = Math.max(...points);
  const minValue = Math.min(...points);
  const valueRange = maxValue - minValue || 1;
  const stepX = CHART_WIDTH / Math.max(1, points.length - 1);
  
  const pathData = points
    .map((point, index) => {
      const x = index * stepX;
      const y = CHART_HEIGHT - ((point - minValue) / valueRange) * CHART_HEIGHT;
      return `${index === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");

  return (
    <svg 
      width={CHART_WIDTH} 
      height={CHART_HEIGHT} 
      viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} 
      aria-hidden
    >
      <path 
        d={pathData} 
        fill="none" 
        stroke={stroke} 
        strokeWidth="3" 
        strokeLinecap="round" 
      />
    </svg>
  );
}

/**
 * Metric selector dropdown component
 * @param {Object} props - Component props
 * @param {string} props.label - Display label for the selected metric
 * @param {Array} props.options - Array of metric options with label and value
 * @param {Function} props.onSelect - Callback when a metric is selected
 * @returns {JSX.Element} Popover with metric selection options
 */
function MetricSelector({ label, options, onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const toggleDropdown = useCallback(() => {
    setIsOpen(current => !current);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const actionItems = useMemo(() => 
    options.map((option) => ({
      content: option.label,
      onAction: () => {
        onSelect(option.value);
        setIsOpen(false);
      }
    })),
    [options, onSelect]
  );

  return (
    <Popover 
      active={isOpen} 
      autofocusTarget="first-node" 
      preferredAlignment="left" 
      onClose={handleClose}
      activator={
        <Button onClick={toggleDropdown} disclosure>
          {label}
        </Button>
      }
    >
      <ActionList items={actionItems} />
    </Popover>
  );
}

/**
 * Individual metric card component
 * @param {Object} props - Component props
 * @param {string} props.currentLabel - Current metric label
 * @param {Array} props.options - Available metric options
 * @param {string} props.value - Fallback value if no metrics data
 * @param {number} props.deltaPct - Fallback delta percentage
 * @param {number[]} props.trend - Trend data points for sparkline
 * @param {Function} props.onChange - Callback when metric selection changes
 * @param {string} props.metric - Current metric key
 * @param {Object} props.metricsData - Fetched metrics data
 * @returns {JSX.Element} Metric card with value, trend, and selector
 */
function MetricCard({ 
  currentLabel, 
  options, 
  value, 
  deltaPct, 
  trend, 
  onChange, 
  metric, 
  metricsData 
}) {
  // Get the actual metric data or use fallback values
  const actualMetric = metricsData?.keyMetrics?.find(m => m.metric === metric);
  const displayValue = actualMetric?.value ?? value;
  const displayDelta = actualMetric?.deltaPct ?? deltaPct;
  const isPositiveDelta = displayDelta >= 0;

  // Determine colors based on delta direction
  const deltaColor = isPositiveDelta ? "success" : "critical";
  const sparklineColor = isPositiveDelta ? CHART_COLORS.SUCCESS : CHART_COLORS.CRITICAL;
  const deltaIcon = isPositiveDelta ? "▲" : "▼";

  return (
    <Card>
      <BlockStack gap="200">
        <InlineStack align="space-between" blockAlign="center">
          <MetricSelector 
            label={currentLabel} 
            options={options} 
            onSelect={onChange} 
          />
        </InlineStack>
        
        <Text as="p" variant="heading2xl">
          {displayValue}
        </Text>
        
        <Sparkline 
          points={trend} 
          stroke={sparklineColor} 
        />
        
        <InlineStack gap="150" blockAlign="center">
          <Text as="p" tone={deltaColor}>
            {deltaIcon} {Math.abs(displayDelta).toFixed(2)}%
          </Text>
          <Text as="p" tone="subdued">
            vs previous period
          </Text>
        </InlineStack>
      </BlockStack>
    </Card>
  );
}

/**
 * Main KeyMetrics component for displaying platform metrics
 * @param {Object} props - Component props
 * @param {string} props.title - Title for the metrics section
 * @param {string} props.platform - Platform identifier ('google' or 'meta')
 * @param {Object} props.dateRange - Selected date range for metrics
 * @param {boolean} props.isTestMode - Whether test mode is active
 * @returns {JSX.Element} Key metrics dashboard component
 */
export default function KeyMetrics({ title, platform, dateRange, isTestMode }) {
  const fetcher = useFetcher();
  const [metricsData, setMetricsData] = useState(null);

  // Define available metrics based on platform using constants
  const metricOptions = useMemo(() => {
    const platformKey = platform === PLATFORMS.GOOGLE ? PLATFORMS.GOOGLE : PLATFORMS.META;
    const availableMetrics = PLATFORM_METRICS[platformKey] || [];
    
    return availableMetrics.map(metricType => ({
      label: METRIC_LABELS[metricType],
      value: metricType
    }));
  }, [platform]);

  // Default metric cards configuration with sample trend data
  const [metricCards, setMetricCards] = useState([
    { 
      key: "metric-1", 
      metric: "clicks", 
      value: "Loading...", 
      deltaPct: 0, 
      trend: [8, 6, 5, 6, 7, 5, 9, 12, 9, 11, 15] 
    },
    { 
      key: "metric-2", 
      metric: "impressions", 
      value: "Loading...", 
      deltaPct: 0, 
      trend: [40, 38, 35, 33, 36, 34, 37, 42, 45, 48, 50] 
    },
    { 
      key: "metric-3", 
      metric: "cost", 
      value: "Loading...", 
      deltaPct: 0, 
      trend: [5, 7, 6, 8, 6, 5, 6, 7, 8, 10, 13] 
    },
    { 
      key: "metric-4", 
      metric: "conversions", 
      value: "Loading...", 
      deltaPct: 0, 
      trend: [4, 5, 5, 6, 5, 4, 4, 3, 3, 2, 2] 
    },
  ]);

  // Validate and fix invalid metrics for the current platform
  useEffect(() => {
    if (platform && metricOptions.length > 0) {
      const validMetricValues = metricOptions.map(option => option.value);
      
      setMetricCards(previousCards => 
        previousCards.map(card => {
          if (!validMetricValues.includes(card.metric)) {
            // Find a replacement metric that's not already used
            const currentlyUsedMetrics = previousCards.map(c => c.metric);
            const availableMetric = validMetricValues.find(metricValue => 
              !currentlyUsedMetrics.includes(metricValue) || metricValue === card.metric
            );
            
            return { 
              ...card, 
              metric: availableMetric || validMetricValues[0] 
            };
          }
          return card;
        })
      );
    }
  }, [platform, metricOptions]);

  // Fetch metrics data when platform or date range changes
  useEffect(() => {
    if (platform && dateRange && fetcher.state === 'idle') {
      fetcher.submit(
        { platform, dateRange: JSON.stringify(dateRange) },
        { method: "post", action: "/app/api/metrics" }
      );
    }
  }, [platform, dateRange, fetcher]);

  // Update metrics data when fetcher completes
  useEffect(() => {
    if (fetcher.data?.keyMetrics && fetcher.state === 'idle') {
      setMetricsData(fetcher.data);
    }
  }, [fetcher.data, fetcher.state]);

  // Handle metric selection change for a specific card
  const handleMetricChange = useCallback((cardIndex, newMetricValue) => {
    setMetricCards(previousCards => 
      previousCards.map((card, index) => 
        index === cardIndex 
          ? { ...card, metric: newMetricValue } 
          : card
      )
    );
  }, []);

  // Get currently selected metrics from all cards
  const getSelectedMetrics = useCallback(() => {
    return metricCards.map(card => card.metric);
  }, [metricCards]);

  // Get available options for a specific metric card
  const getAvailableOptions = useCallback((currentMetric, currentIndex) => {
    const selectedMetrics = getSelectedMetrics();
    
    return metricOptions
      .filter((option) => {
        // Don't show current metric in the dropdown
        if (option.value === currentMetric) return false;
        
        // Don't show metrics that are already selected in other cards
        const isUsedElsewhere = selectedMetrics.some((selectedMetric, index) => 
          selectedMetric === option.value && index !== currentIndex
        );
        
        return !isUsedElsewhere;
      });
  }, [metricOptions, getSelectedMetrics]);

  // Get display label for a metric value
  const getMetricLabel = useCallback((metricValue) => {
    return metricOptions.find((option) => option.value === metricValue)?.label || metricValue;
  }, [metricOptions]);

  return (
    <BlockStack gap="200">
      {/* Header section with title and test mode indicator */}
      <InlineStack align="space-between" blockAlign="center">
        <Text as="h3" variant="headingLg">
          {title || "Key Metrics"}
        </Text>
        {(isTestMode || metricsData?.isTestData) && (
          <Badge tone="warning">Test Mode</Badge>
        )}
      </InlineStack>
      
      {/* Description */}
      <Text as="p" tone="subdued">
        Selected date range compared to the previous period.
      </Text>
      
      {/* Metrics cards grid */}
      <InlineGrid 
        columns={{ xs: 1, sm: 2, md: 2, lg: 4 }} 
        gap="300"
      >
        {metricCards.map((card, cardIndex) => (
          <MetricCard
            key={card.key}
            currentLabel={getMetricLabel(card.metric)}
            options={getAvailableOptions(card.metric, cardIndex)}
            value={card.value}
            deltaPct={card.deltaPct}
            trend={card.trend}
            metric={card.metric}
            metricsData={metricsData}
            onChange={(newMetricValue) => handleMetricChange(cardIndex, newMetricValue)}
          />
        ))}
      </InlineGrid>
    </BlockStack>
  );
}

