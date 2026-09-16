import type { Meta } from "@storybook/react-vite";
import { useCallback, useMemo, useState } from "react";
import { StackBarGraph, type StackBarGraphSegment } from "src/components/StackBarGraph";
import { GridTable } from "src/components/Table/GridTable";
import type { GridColumn } from "src/components/Table/types";
import { simpleHeader, type SimpleHeaderAndData } from "src/components/Table/utils/simpleHelpers";
import { TableSummary, type TableSummaryProps } from "src/components/TableSummary/TableSummary";
import { Css, Palette } from "src/Css";
import { newStory, viewportModes } from "src/utils/sb";

export default {
  component: TableSummary,
} as Meta;

export function Default() {
  return <TableSummary {...createProps()} />;
}

export const Mobile = newStory(() => <TableSummary {...createProps()} />, {
  parameters: { chromatic: { modes: viewportModes("iphone12") } },
});

export function NoMetrics() {
  return <TableSummary {...createProps({ metrics: [] })} />;
}

export function FourStatuses() {
  return (
    <TableSummary
      {...createProps({
        metrics: [
          { label: "Status", count: 4, icon: "errorCircle", color: Palette.Orange500 },
          { label: "Missing", count: 4, icon: "xCircle", color: Palette.Red500 },
          { label: "Incomplete", count: 9, icon: "errorCircle", color: Palette.Orange500 },
          { label: "Warnings", count: 3, icon: "errorCircle", color: Palette.Orange500 },
        ],
      })}
    />
  );
}

/** Demonstrates applying a report status filter and scrolling to the filtered table. */
export function FiltersTableAndScrolls() {
  const [filteredStatuses, setFilteredStatuses] = useState<string[]>([]);
  const rows = useMemo(() => createCoverageRows(), []);
  const filteredRows =
    filteredStatuses.length === 0 ? rows : rows.filter((row) => filteredStatuses.includes(row.data.status));
  const columns: GridColumn<CoverageRow>[] = [
    { header: "Bid Package", data: ({ name }) => name },
    { header: "Status", data: ({ status }) => status },
  ];

  const applyFilter = useCallback((statuses: string[]) => {
    setFilteredStatuses(statuses);
    scrollTableIntoView();
  }, []);

  const toggleStatus = useCallback(
    (status: string) => {
      applyFilter(
        filteredStatuses.includes(status)
          ? filteredStatuses.filter((current) => current !== status)
          : [...filteredStatuses, status],
      );
    },
    [applyFilter, filteredStatuses],
  );

  return (
    <div css={Css.df.fdc.gap4.$}>
      <TableSummary
        {...createProps({
          metrics: [
            {
              label: "Missing",
              count: 4,
              icon: "xCircle",
              color: Palette.Red500,
              onClick: () => toggleStatus("missing"),
            },
            {
              label: "Incomplete",
              count: 9,
              icon: "errorCircle",
              color: Palette.Orange500,
              onClick: () => toggleStatus("incomplete"),
            },
            {
              label: "Warnings",
              count: 3,
              icon: "errorCircle",
              color: Palette.Orange500,
              onClick: () => toggleStatus("warnings"),
            },
          ],
          action: {
            label: "View Items",
            onClick: () => applyFilter(["missing", "incomplete", "warnings"]),
          },
        })}
      />
      <div id="tableSummaryStoryTable">
        <GridTable columns={columns} rows={[simpleHeader, ...filteredRows]} />
      </div>
    </div>
  );
}

function createProps(overrides: Partial<TableSummaryProps> = {}): TableSummaryProps {
  const { footer, ...rest } = overrides;
  return {
    title: "Bid Package Coverage",
    metrics: [
      { label: "Missing", count: 4, icon: "xCircle", color: Palette.Red500 },
      { label: "Incomplete", count: 9, icon: "errorCircle", color: Palette.Orange500 },
      { label: "Warnings", count: 3, icon: "errorCircle", color: Palette.Orange500 },
    ],
    action: { label: "View Items", onClick: () => {} },
    footer: footer ?? <StackBarGraph title="Coverage by status" totalLabel="Cost Codes" segments={defaultSegments()} />,
    ...rest,
  };
}

function defaultSegments(): StackBarGraphSegment[] {
  return [
    { label: "Complete", count: 40, color: Palette.Green500 },
    { label: "In Progress", count: 32, color: Palette.Gray500 },
    { label: "Incomplete", count: 9, color: Palette.Orange500 },
    { label: "Missing", count: 4, color: Palette.Red500 },
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
  document.getElementById("tableSummaryStoryTable")?.scrollIntoView({ behavior: "smooth", block: "start" });
}
