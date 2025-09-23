import { authenticate } from "../shopify.server";
import { TitleBar } from "@shopify/app-bridge-react";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  InlineStack,
  Text,
  DatePicker,
  Button,
  Box,
} from "@shopify/polaris";
import { useCallback, useMemo, useState } from "react";

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
  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const [selectedDates, setSelectedDates] = useState({ start: monthStart, end: today });
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());

  const handleMonthChange = useCallback((month, year) => {
    setMonth(month);
    setYear(year);
  }, []);

  const averageCpc = useMemo(() => "$0.75", []);
  const totalSpend = useMemo(() => "$2,430.00", []);
  const totalRevenue = useMemo(() => "$9,720.00", []);
  const totalRoas = useMemo(() => "4.00", []);

  return (
    <Page>
      <TitleBar title="Dashboard" />
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="300">
              <Text as="p" variant="bodyMd">Select date range to view aggregated metrics</Text>
              <InlineStack align="space-between" blockAlign="center">
                <Box>
                  <DatePicker
                    month={month}
                    year={year}
                    onChange={setSelectedDates}
                    onMonthChange={handleMonthChange}
                    selected={selectedDates}
                  />
                </Box>
                <InlineStack gap="300">
                  <Button onClick={() => setSelectedDates({ start: monthStart, end: today })}>This month</Button>
                  <Button onClick={() => setSelectedDates({ start: today, end: today })}>Today</Button>
                </InlineStack>
              </InlineStack>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <InlineStack gap="300" align="space-between" wrap>
            <MetricCard title="Toplam Harcama" value={totalSpend} />
            <MetricCard title="Ortalama CPC" value={averageCpc} />
            <MetricCard title="Toplam Getiri" value={totalRevenue} />
            <MetricCard title="Toplam ROAS" value={totalRoas} />
          </InlineStack>
        </Layout.Section>

        <Layout.Section>
          <InlineStack gap="300" wrap>
            <Button variant="primary">Facebook'a bağlan</Button>
            <Button variant="primary">Google'a bağlan</Button>
          </InlineStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}


