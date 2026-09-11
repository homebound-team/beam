import { fireEvent } from "@testing-library/react";
import type { StackBarGraphSegment, TableSummaryReportProps } from "src/components/TableSummaryReport";
import { StackBarGraph, TableSummaryReport } from "src/components/TableSummaryReport";
import { click, render } from "src/utils/rtl";
import { vi } from "vitest";

describe("TableSummaryReport", () => {
  it("renders the stack bar graph without issue controls", async () => {
    // Given a report without issues
    const r = await render(<TableSummaryReport {...createProps({ metrics: [] })} />);
    // Then it retains the stack bar graph but hides issue controls
    expect(r.stackBarGraph).toBeInTheDocument();
    expect(r.query.tableSummaryReport_metrics).toBeNull();
    expect(r.query.tableSummaryReport_issueAction).toBeNull();
  });

  it("shows no more than four issue metrics", async () => {
    // Given a report with five metrics
    const r = await render(
      <TableSummaryReport
        {...createProps({
          metrics: [
            { value: "one", label: "One", count: 1, status: "error" },
            { value: "two", label: "Two", count: 2, status: "warning" },
            { value: "three", label: "Three", count: 3, status: "error" },
            { value: "four", label: "Four", count: 4, status: "warning" },
            { value: "five", label: "Five", count: 5, status: "error" },
          ],
        })}
      />,
    );
    // Then only the first four are rendered
    expect(r.tableSummaryReport_metric_one).toBeInTheDocument();
    expect(r.tableSummaryReport_metric_four).toBeInTheDocument();
    expect(r.query.tableSummaryReport_metric_five).toBeNull();
  });

  it("reports metric and issue action clicks to its parent", async () => {
    const onMetricClick = vi.fn();
    const onIssueClick = vi.fn();
    // Given an actionable report
    const r = await render(
      <TableSummaryReport {...createProps({ onMetricClick, issueLabel: "View Issues", onIssueClick })} />,
    );
    // When the user activates a metric and the issues action
    click(r.tableSummaryReport_metric_missing);
    click(r.tableSummaryReport_issueAction);
    // Then the parent receives each action
    expect(onMetricClick).toHaveBeenCalledWith("missing");
    expect(onIssueClick).toHaveBeenCalledTimes(1);
  });

  it("does not activate disabled metrics", async () => {
    const onMetricClick = vi.fn();
    // Given a disabled missing metric
    const r = await render(
      <TableSummaryReport
        {...createProps({
          onMetricClick,
          metrics: [{ value: "missing", label: "Missing", count: 4, status: "error", disabled: true }],
        })}
      />,
    );
    // When it is clicked
    click(r.tableSummaryReport_metric_missing);
    // Then it remains disabled and does not notify the parent
    expect(r.tableSummaryReport_metric_missing).toBeDisabled();
    expect(onMetricClick).not.toHaveBeenCalled();
  });

  it("supports keyboard activation and controlled pressed state", async () => {
    const onMetricClick = vi.fn();
    // Given a metric marked active by its parent
    const r = await render(<TableSummaryReport {...createProps({ activeMetricValues: ["missing"], onMetricClick })} />);
    // When keyboard activation occurs
    r.tableSummaryReport_metric_missing.focus();
    fireEvent.keyDown(r.tableSummaryReport_metric_missing, { key: "Enter" });
    fireEvent.keyUp(r.tableSummaryReport_metric_missing, { key: "Enter" });
    // Then it stays focusable, pressed, and notifies the parent
    expect(r.tableSummaryReport_metric_missing).toHaveFocus();
    expect(r.tableSummaryReport_metric_missing).toHaveAttribute("aria-pressed", "true");
    expect(onMetricClick).toHaveBeenCalledWith("missing");
  });

  it("shows zero percent for segments with a zero total", async () => {
    // Given stack bar segments with no items
    const r = await render(
      <TableSummaryReport
        {...createProps({
          footer: (
            <StackBarGraph
              title="Coverage by status"
              totalLabel="Cost Codes"
              segments={[
                { label: "Complete", count: 0, status: "success" },
                { label: "Missing", count: 0, status: "error" },
              ]}
            />
          ),
        })}
      />,
    );
    // Then the legend does not render invalid percentages
    expect(r.stackBarGraph_legend).toHaveTextContent("0% Complete (0)");
    expect(r.stackBarGraph_legend).toHaveTextContent("0% Missing (0)");
  });

  it("sizes stack bar segments according to their counts", async () => {
    // Given a stack bar with unequal segment counts
    const r = await render(
      <TableSummaryReport
        {...createProps({
          footer: (
            <StackBarGraph
              title="Coverage by status"
              totalLabel="Cost Codes"
              segments={[
                { label: "Complete", count: 3, status: "success" },
                { label: "Missing", count: 1, status: "error" },
              ]}
            />
          ),
        })}
      />,
    );
    // Then the bar uses counts as flex proportions
    expect(r.stackBarGraph_bar.children[0]).toHaveStyle({ flexGrow: "3" });
    expect(r.stackBarGraph_bar.children[1]).toHaveStyle({ flexGrow: "1" });
  });

  it("renders a caller-provided stack bar title", async () => {
    // Given a custom stack bar title
    const r = await render(
      <TableSummaryReport
        {...createProps({
          footer: <StackBarGraph title="Bid package status" totalLabel="Cost Codes" segments={defaultSegments()} />,
        })}
      />,
    );
    // Then the custom title is shown
    expect(r.stackBarGraph).toHaveTextContent("Bid package status");
  });
});

function createProps(overrides: Partial<TableSummaryReportProps<string>> = {}): TableSummaryReportProps<string> {
  const { footer, ...rest } = overrides;
  return {
    title: "Bid Package Coverage",
    metrics: [{ value: "missing", label: "Missing", count: 4, status: "error" }],
    issueLabel: "View Issues",
    onIssueClick: () => {},
    footer: footer ?? (
      <StackBarGraph title="Coverage by status" totalLabel="Cost Codes" segments={defaultSegments()} />
    ),
    ...rest,
  };
}

function defaultSegments(): StackBarGraphSegment[] {
  return [
    { label: "Complete", count: 40, status: "success" },
    { label: "In Progress", count: 32, status: "neutral" },
    { label: "Incomplete", count: 9, status: "warning" },
    { label: "Missing", count: 4, status: "error" },
  ];
}
