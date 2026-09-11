import type { Meta } from "@storybook/react-vite";
import { useCallback, useMemo, useState } from "react";
import { StackBarGraph, type StackBarGraphSegment } from "src/components/StackBarGraph";
import { GridTable } from "src/components/Table/GridTable";
import type { GridColumn } from "src/components/Table/types";
import { simpleHeader, type SimpleHeaderAndData } from "src/components/Table/utils/simpleHelpers";
import { TableSummaryReport, type TableSummaryReportProps } from "src/components/TableSummaryReport";
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
          issueLabel: "View Issues",
          onIssueClick: () => applyFilter(["missing", "incomplete", "warnings"]),
        })}
      />
      <div id="tableSummaryReportStoryTable">
        <GridTable columns={columns} rows={[simpleHeader, ...filteredRows]} />
      </div>
    </div>
  );
}

function createProps(overrides: Partial<TableSummaryReportProps<string>> = {}): TableSummaryReportProps<string> {
  const { footer, ...rest } = overrides;
  return {
    title: "Bid Package Coverage",
    metrics: [
      { value: "missing", label: "Missing", count: 4, status: "error" },
      { value: "incomplete", label: "Incomplete", count: 9, status: "warning" },
      { value: "warnings", label: "Warnings", count: 3, status: "warning" },
    ],
    issueLabel: "View Issues",
    onIssueClick: () => {},
    footer: footer ?? <StackBarGraph title="Coverage by status" totalLabel="Cost Codes" segments={defaultSegments()} />,
    ...rest,
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

function defaultSegments(): StackBarGraphSegment[] {
  return [
    { label: "Complete", count: 40, status: "success" },
    { label: "In Progress", count: 32, status: "neutral" },
    { label: "Incomplete", count: 9, status: "warning" },
    { label: "Missing", count: 4, status: "error" },
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
