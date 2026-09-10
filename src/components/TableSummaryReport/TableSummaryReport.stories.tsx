import type { Meta } from "@storybook/react-vite";
import { useState } from "react";
import { TableSummaryReport } from "src/components/TableSummaryReport";
import type { TableSummaryReportProps } from "src/components/TableSummaryReport/types";
import { newStory, viewportModes } from "src/utils/sb";

export default {
  component: TableSummaryReport,
} as Meta;

export function Default() {
  return <TableSummaryReport {...createProps()} />;
}

export const Mobile = newStory(() => <TableSummaryReport {...createProps()} />, {
  parameters: { chromatic: { modes: viewportModes("iphone12") } },
});

export function NoIssues() {
  return <TableSummaryReport {...createProps({ metrics: [] })} />;
}

export function FourStatuses() {
  return <TableSummaryReport {...createProps({ metrics: createFourMetrics() })} />;
}

export function Interactive() {
  const [activeMetricValues, setActiveMetricValues] = useState<string[]>([]);
  return (
    <TableSummaryReport
      {...createProps({
        activeMetricValues,
        onMetricClick: (value) =>
          setActiveMetricValues((values) =>
            values.includes(value) ? values.filter((current) => current !== value) : [...values, value],
          ),
      })}
    />
  );
}

function createProps(overrides: Partial<TableSummaryReportProps<string>> = {}) {
  return {
    title: "Bid Package Coverage",
    totalLabel: "85 Cost Codes",
    segments: [
      { label: "Complete", count: 40, status: "success" as const },
      { label: "In Progress", count: 32, status: "neutral" as const },
      { label: "Incomplete", count: 9, status: "warning" as const },
      { label: "Missing", count: 4, status: "error" as const },
    ],
    metrics: [
      { value: "missing", label: "Missing", count: 4, status: "error" as const },
      { value: "incomplete", label: "Incomplete", count: 9, status: "warning" as const },
      { value: "warnings", label: "Warnings", count: 3, status: "warning" as const },
    ],
    issueAction: { label: "View 15 Issues", onClick: () => {} },
    ...overrides,
  };
}

function createFourMetrics() {
  return [
    { value: "status", label: "Status", count: 4, status: "warning" as const },
    { value: "missing", label: "Missing", count: 4, status: "error" as const },
    { value: "incomplete", label: "Incomplete", count: 9, status: "warning" as const },
    { value: "warnings", label: "Warnings", count: 3, status: "warning" as const },
  ];
}
