import { useCallback, useMemo, useState } from "react";
import { Card, BlockStack, InlineStack, Text, DatePicker, Button, Box, TextField, InlineGrid } from "@shopify/polaris";

export function getPresetRange(presetId) {
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  switch (presetId) {
    case "today": {
      return { start: startOfToday, end: startOfToday };
    }
    case "yesterday": {
      const y = new Date(startOfToday);
      y.setDate(y.getDate() - 1);
      return { start: y, end: y };
    }
    case "last_week": {
      const end = startOfToday;
      const start = new Date(end);
      start.setDate(end.getDate() - 6);
      return { start, end };
    }
    case "this_month": {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      return { start, end: startOfToday };
    }
    case "last_7_days": {
      const end = startOfToday;
      const start = new Date(end);
      start.setDate(end.getDate() - 6);
      return { start, end };
    }
    case "last_month": {
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const end = new Date(today.getFullYear(), today.getMonth(), 0);
      return { start, end };
    }
    default: {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      return { start, end: startOfToday };
    }
  }
}

function toInputValue(date) {
  const d = new Date(date);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export default function DateRangeControls({
  label = "Select date range",
  selectedDates,
  onChange,
  onApply,
  onClose,
}) {
  const today = useMemo(() => new Date(), []);
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [tempRange, setTempRange] = useState(selectedDates);

  const handleMonthChange = useCallback((newMonth, newYear) => {
    setMonth(newMonth);
    setYear(newYear);
  }, []);

  const applyPreset = useCallback((presetId) => {
    const range = getPresetRange(presetId);
    setTempRange(range);
  }, []);

  const commit = useCallback(() => {
    onChange(tempRange);
    onApply?.(tempRange);
  }, [onApply, onChange, tempRange]);

  const cancel = useCallback(() => {
    setTempRange(selectedDates);
    onClose?.();
  }, [onClose, selectedDates]);

  const setStart = useCallback((value) => {
    const [dd, mm, yyyy] = value.split("/");
    const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    setTempRange((prev) => ({ ...prev, start: d }));
  }, []);

  const setEnd = useCallback((value) => {
    const [dd, mm, yyyy] = value.split("/");
    const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    setTempRange((prev) => ({ ...prev, end: d }));
  }, []);

  return (
    <Card>
      <BlockStack gap="300">
        <InlineStack align="space-between" blockAlign="center">
          <Text as="p" variant="bodyMd">{label}</Text>
        </InlineStack>

        <InlineGrid columns={{ xs: 1, md: 2 }} gap="400">
          <BlockStack gap="200">
            <InlineGrid columns={{ xs: 1, sm: 2 }} gap="200">
              <TextField label="Start date" value={toInputValue(tempRange.start)} onChange={setStart} autoComplete="off" />
              <TextField label="End date" value={toInputValue(tempRange.end)} onChange={setEnd} autoComplete="off" />
            </InlineGrid>

            <BlockStack gap="150">
              <Text as="p" variant="bodyMd">Compare</Text>
              <Text as="p" tone="subdued">Will be compared with the previous period based on the selected range.</Text>
            </BlockStack>

            <BlockStack gap="200">
              <Button onClick={() => applyPreset("today")}>Today</Button>
              <Button onClick={() => applyPreset("yesterday")}>Yesterday</Button>
              <Button onClick={() => applyPreset("last_week")}>Last week</Button>
            </BlockStack>
          </BlockStack>

          <Box>
            <DatePicker
              month={month}
              year={year}
              onChange={setTempRange}
              onMonthChange={handleMonthChange}
              selected={tempRange}
            />
          </Box>
        </InlineGrid>

        <InlineStack align="end">
          <Button variant="primary" onClick={commit}>Apply</Button>
        </InlineStack>
      </BlockStack>
    </Card>
  );
}

