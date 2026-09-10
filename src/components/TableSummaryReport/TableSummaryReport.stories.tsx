import type { Meta } from "@storybook/react-vite";
import { useCallback, useMemo, useState } from "react";
import { GridTable } from "src/components/Table/GridTable";
import type { GridColumn } from "src/components/Table/types";
import { simpleHeader, type SimpleHeaderAndData } from "src/components/Table/utils/simpleHelpers";
import { TableSummaryReport } from "src/components/TableSummaryReport";
import type { TableSummaryReportProps } from "src/components/TableSummaryReport/types";
import { Css } from "src/Css";
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

/** Demonstrates applying a report status filter and scrolling to the filtered table. */
export function FiltersTableAndScrolls() {
  const [activeMetricValues, setActiveMetricValues] = useState<string[]>([]);
  const rows = useMemo(() => createCoverageRows(), []);
  const filteredRows =
    activeMetricValues.length === 0 ? rows : rows.filter((row) => activeMetricValues.includes(row.data.status));
  const columns: GridColumn<CoverageRow>[] = [
    { header: "Bid Package", data: ({ name }) => name },
    { header: "Status", data: ({ status }) => status },
  ];

  const applyFilter = useCallback((values: string[]) => {
    setActiveMetricValues(values);
    scrollTableIntoView();
  }, []);

  return (
    <div css={Css.df.fdc.gap4.$}>
      <TableSummaryReport
        {...createProps({
          activeMetricValues,
          onMetricClick: (value) =>
            applyFilter(
              activeMetricValues.includes(value)
                ? activeMetricValues.filter((current) => current !== value)
                : [...activeMetricValues, value],
            ),
          issueAction: {
            label: "View 16 Issues",
            onClick: () => applyFilter(["missing", "incomplete", "warnings"]),
          },
        })}
      />
      <div id="tableSummaryReportStoryTable">
        <GridTable columns={columns} rows={[simpleHeader, ...filteredRows]} />
      </div>
    </div>
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

type CoverageData = { name: string; status: string };
type CoverageRow = SimpleHeaderAndData<CoverageData>;
type CoverageDataRow = Extract<CoverageRow, { kind: "data" }>;

function createCoverageRows(): CoverageDataRow[] {
  return [
    ...createRows("missing", "Missing", 4),
    ...createRows("incomplete", "Incomplete", 9),
    ...createRows("warnings", "Warnings", 3),
  ];
}

function createRows(status: string, label: string, count: number): CoverageDataRow[] {
  return Array.from({ length: count }, (_, index) => ({
    kind: "data",
    id: `${status}-${index + 1}`,
    data: { name: `${label} Bid Package ${index + 1}`, status },
  }));
}

function scrollTableIntoView() {
  document.getElementById("tableSummaryReportStoryTable")?.scrollIntoView({ behavior: "smooth", block: "start" });
}
