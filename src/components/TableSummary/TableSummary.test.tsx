import { fireEvent } from "@testing-library/react";
import { StackBarGraph, type StackBarGraphSegment } from "src/components/StackBarGraph";
import { TableSummary, type TableSummaryProps } from "src/components/TableSummary";
import { click, render } from "src/utils/rtl";
import { vi } from "vitest";

describe("TableSummary", () => {
  it("renders the stack bar graph without status controls", async () => {
    // Given a report without metrics
    const r = await render(<TableSummary {...createProps({ metrics: [] })} />);
    // Then it retains the stack bar graph but hides status controls
    expect(r.stackBarGraph).toBeInTheDocument();
    expect(r.query.tableSummary_metrics).toBeNull();
    expect(r.query.tableSummary_statusAction).toBeNull();
  });

  it("shows no more than four status metrics", async () => {
    // Given a report with five metrics
    const r = await render(
      <TableSummary
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
    expect(r.tableSummary_metric_one).toBeInTheDocument();
    expect(r.tableSummary_metric_four).toBeInTheDocument();
    expect(r.query.tableSummary_metric_five).toBeNull();
  });

  it("reports metric and status action clicks to its parent", async () => {
    const onMetricClick = vi.fn();
    const onStatusClick = vi.fn();
    // Given an actionable report
    const r = await render(
      <TableSummary {...createProps({ onMetricClick, statusLabel: "View Items", onStatusClick })} />,
    );
    // When the user activates a metric and the status action
    click(r.tableSummary_metric_missing);
    click(r.tableSummary_statusAction);
    // Then the parent receives each action
    expect(onMetricClick).toHaveBeenCalledWith("missing");
    expect(onStatusClick).toHaveBeenCalledTimes(1);
  });

  it("does not activate disabled metrics", async () => {
    const onMetricClick = vi.fn();
    // Given a disabled missing metric
    const r = await render(
      <TableSummary
        {...createProps({
          onMetricClick,
          metrics: [{ value: "missing", label: "Missing", count: 4, status: "error", disabled: true }],
        })}
      />,
    );
    // When it is clicked
    click(r.tableSummary_metric_missing);
    // Then it remains disabled and does not notify the parent
    expect(r.tableSummary_metric_missing).toBeDisabled();
    expect(onMetricClick).not.toHaveBeenCalled();
  });

  it("supports keyboard activation and controlled pressed state", async () => {
    const onMetricClick = vi.fn();
    // Given a metric marked active by its parent
    const r = await render(<TableSummary {...createProps({ activeMetricValues: ["missing"], onMetricClick })} />);
    // When keyboard activation occurs
    r.tableSummary_metric_missing.focus();
    fireEvent.keyDown(r.tableSummary_metric_missing, { key: "Enter" });
    fireEvent.keyUp(r.tableSummary_metric_missing, { key: "Enter" });
    // Then it stays focusable, pressed, and notifies the parent
    expect(r.tableSummary_metric_missing).toHaveFocus();
    expect(r.tableSummary_metric_missing).toHaveAttribute("aria-pressed", "true");
    expect(onMetricClick).toHaveBeenCalledWith("missing");
  });

  it("renders a caller-provided footer", async () => {
    // Given a custom stack bar in the footer
    const r = await render(
      <TableSummary
        {...createProps({
          footer: <StackBarGraph title="Bid package status" totalLabel="Cost Codes" segments={defaultSegments()} />,
        })}
      />,
    );
    // Then the composed footer is shown
    expect(r.stackBarGraph).toHaveTextContent("Bid package status");
  });
});

function createProps(overrides: Partial<TableSummaryProps<string>> = {}): TableSummaryProps<string> {
  const { footer, ...rest } = overrides;
  return {
    title: "Bid Package Coverage",
    metrics: [{ value: "missing", label: "Missing", count: 4, status: "error" }],
    statusLabel: "View Items",
    onStatusClick: () => {},
    footer: footer ?? <StackBarGraph title="Coverage by status" totalLabel="Cost Codes" segments={defaultSegments()} />,
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
