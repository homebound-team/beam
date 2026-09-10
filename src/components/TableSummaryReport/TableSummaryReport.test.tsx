import { fireEvent } from "@testing-library/react";
import { TableSummaryReport } from "src/components/TableSummaryReport";
import type { TableSummaryReportProps } from "src/components/TableSummaryReport/types";
import { click, render } from "src/utils/rtl";
import { vi } from "vitest";

describe("TableSummaryReport", () => {
  it("renders the coverage section without issue controls", async () => {
    // Given a report without issues
    const r = await render(<TableSummaryReport {...createProps({ metrics: [] })} />);
    // Then it retains coverage but hides issue controls
    expect(r.tableSummaryReport_coverage).toBeInTheDocument();
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
      <TableSummaryReport
        {...createProps({ onMetricClick, issueAction: { label: "View 15 Issues", onClick: onIssueClick } })}
      />,
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
    // Given coverage segments with no items
    const r = await render(
      <TableSummaryReport
        {...createProps({
          segments: [
            { label: "Complete", count: 0, status: "success" },
            { label: "Missing", count: 0, status: "error" },
          ],
        })}
      />,
    );
    // Then the legend does not render invalid percentages
    expect(r.tableSummaryReport_legend).toHaveTextContent("0% Complete (0)");
    expect(r.tableSummaryReport_legend).toHaveTextContent("0% Missing (0)");
  });

  it("sizes coverage segments according to their counts", async () => {
    // Given coverage with unequal segment counts
    const r = await render(
      <TableSummaryReport
        {...createProps({
          segments: [
            { label: "Complete", count: 3, status: "success" },
            { label: "Missing", count: 1, status: "error" },
          ],
        })}
      />,
    );
    // Then the bar uses counts as flex proportions
    expect(r.tableSummaryReport_coverageBar.children[0]).toHaveStyle({ flexGrow: "3" });
    expect(r.tableSummaryReport_coverageBar.children[1]).toHaveStyle({ flexGrow: "1" });
  });
});

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
    metrics: [{ value: "missing", label: "Missing", count: 4, status: "error" as const }],
    issueAction: { label: "View 15 Issues", onClick: () => {} },
    ...overrides,
  };
}
