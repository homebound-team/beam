import type { ReactNode } from "react";

export type TableSummaryReportStatus = "success" | "neutral" | "warning" | "error";

export type TableSummaryReportSegment = {
  label: string;
  count: number;
  status: TableSummaryReportStatus;
};

export type TableSummaryReportMetric<V extends string | number> = {
  value: V;
  label: string;
  count: number;
  status: Exclude<TableSummaryReportStatus, "neutral" | "success">;
  disabled?: boolean;
};

export type TableSummaryReportProps<V extends string | number> = {
  title: ReactNode;
  totalLabel: ReactNode;
  segments: readonly TableSummaryReportSegment[];
  metrics?: readonly TableSummaryReportMetric<V>[];
  activeMetricValues?: readonly V[];
  onMetricClick?: (value: V) => void;
  issueAction?: {
    label: ReactNode;
    onClick: VoidFunction;
    disabled?: boolean;
  };
  "data-testid"?: string;
};
