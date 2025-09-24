import { useCallback, useMemo, useState } from "react";
import { Card, BlockStack, InlineStack, Text, DatePicker, Button, Box, TextField, InlineGrid } from "@shopify/polaris";
import { getPresetDateRange, addDateRangeVariation } from "../utils/dateUtils.js";
import { formatDateForInput, parseInputDate } from "../utils/formatters.js";

// Export the utility function for backward compatibility
export function getPresetRange(presetId) {
  return getPresetDateRange(presetId);
}

// Use utility functions instead of local implementations
function toInputValue(date) {
  return formatDateForInput(date);
}

function parseInputValue(value) {
  return parseInputDate(value);
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
  const [selectedStart, setSelectedStart] = useState(selectedDates.start);
  const [selectedEnd, setSelectedEnd] = useState(selectedDates.end);

  const handleMonthChange = useCallback((newMonth, newYear) => {
    setMonth(newMonth);
    setYear(newYear);
  }, []);

  const applyPreset = useCallback((presetId) => {
    const range = getPresetRange(presetId);
    setTempRange(range);
    setSelectedStart(range.start);
    setSelectedEnd(range.end);
  }, []);

  const commit = useCallback(() => {
    // Add random variation on each apply to force new data
    const rangeWithVariation = addDateRangeVariation(tempRange);
    onChange(rangeWithVariation);
    onApply?.(rangeWithVariation);
  }, [onApply, onChange, tempRange]);

  const cancel = useCallback(() => {
    setTempRange(selectedDates);
    onClose?.();
  }, [onClose, selectedDates]);

  const setStart = useCallback((value) => {
    const d = parseInputValue(value);
    if (d) {
      setSelectedStart(d);
      setTempRange((prev) => ({ ...prev, start: d }));
    }
  }, []);

  const setEnd = useCallback((value) => {
    const d = parseInputValue(value);
    if (d) {
      setSelectedEnd(d);
      setTempRange((prev) => ({ ...prev, end: d }));
    }
  }, []);

  const handleDatePickerChange = useCallback((selectedRange) => {
    // Handle date picker selection for range
    if (selectedRange.start) {
      setSelectedStart(selectedRange.start);
      setTempRange(prev => ({ ...prev, start: selectedRange.start }));
    }
    
    if (selectedRange.end) {
      setSelectedEnd(selectedRange.end);
      setTempRange(prev => ({ ...prev, end: selectedRange.end }));
    }
    
    // If both dates are provided, update the full range
    if (selectedRange.start && selectedRange.end) {
      setTempRange(selectedRange);
    }
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
              <TextField 
                label="Start date" 
                value={toInputValue(tempRange.start)} 
                onChange={setStart} 
                autoComplete="off"
                placeholder="DD/MM/YYYY"
                helpText="Enter start date (DD/MM/YYYY)"
              />
              <TextField 
                label="End date" 
                value={toInputValue(tempRange.end)} 
                onChange={setEnd} 
                autoComplete="off"
                placeholder="DD/MM/YYYY"
                helpText="Enter end date (DD/MM/YYYY)"
              />
            </InlineGrid>

            <BlockStack gap="150">
              <Text as="p" variant="bodyMd">Compare</Text>
              <Text as="p" tone="subdued">Will be compared with the previous period based on the selected range.</Text>
            </BlockStack>

            <BlockStack gap="200">
              <Button onClick={() => applyPreset("today")}>Today</Button>
              <Button onClick={() => applyPreset("yesterday")}>Yesterday</Button>
              <Button onClick={() => applyPreset("last_7_days")}>Last 7 days</Button>
              <Button onClick={() => applyPreset("this_month")}>This month</Button>
              <Button onClick={() => applyPreset("last_month")}>Last month</Button>
            </BlockStack>
          </BlockStack>

          <Box>
            <DatePicker
              month={month}
              year={year}
              onChange={handleDatePickerChange}
              onMonthChange={handleMonthChange}
              selected={{
                start: selectedStart,
                end: selectedEnd || selectedStart
              }}
              allowRange
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

