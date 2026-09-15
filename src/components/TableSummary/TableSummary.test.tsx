import { fireEvent } from "@testing-library/react";
import { StackBarGraph, type StackBarGraphSegment } from "src/components/StackBarGraph";
import { TableSummary, type TableSummaryProps } from "src/components/TableSummary/TableSummary";
import { Palette } from "src/Css";
import { click, render } from "src/utils/rtl";
import { vi } from "vitest";

describe("TableSummary", () => {
  it("renders the footer without controls", async () => {
    // Given a report without metrics or header action
    const r = await render(<TableSummary {...createProps({ metrics: [], action: undefined })} />);
    // Then it retains the footer but hides metrics and the action
    expect(r.stackBarGraph).toBeInTheDocument();
    expect(r.query.tableSummary_metrics).toBeNull();
    expect(r.query.tableSummary_action).toBeNull();
  });

  it("renders all provided metrics", async () => {
    // Given a report with five metrics
    const r = await render(
      <TableSummary
        {...createProps({
          metrics: [
            { label: "One", count: 1, icon: "xCircle", color: Palette.Red500 },
            { label: "Two", count: 2, icon: "errorCircle", color: Palette.Orange500 },
            { label: "Three", count: 3, icon: "xCircle", color: Palette.Red500 },
            { label: "Four", count: 4, icon: "errorCircle", color: Palette.Orange500 },
            { label: "Five", count: 5, icon: "xCircle", color: Palette.Red500 },
          ],
        })}
      />,
    );
    // Then all five are rendered
    expect(r.tableSummary_metric_one).toBeInTheDocument();
    expect(r.tableSummary_metric_four).toBeInTheDocument();
    expect(r.tableSummary_metric_five).toBeInTheDocument();
  });

  it("reports metric and action clicks to its parent", async () => {
    const onMetricClick = vi.fn();
    const onActionClick = vi.fn();
    // Given an actionable report
    const r = await render(
      <TableSummary
        {...createProps({
          metrics: [{ label: "Missing", count: 4, icon: "xCircle", color: Palette.Red500, onClick: onMetricClick }],
          action: { label: "View Items", onClick: onActionClick },
        })}
      />,
    );
    // When the user activates a metric and the header action
    click(r.tableSummary_metric_missing);
    click(r.tableSummary_action);
    // Then the parent receives each action
    expect(onMetricClick).toHaveBeenCalledTimes(1);
    expect(onActionClick).toHaveBeenCalledTimes(1);
  });

  it("supports keyboard activation", async () => {
    const onMetricClick = vi.fn();
    // Given a focusable metric
    const r = await render(
      <TableSummary
        {...createProps({
          metrics: [{ label: "Missing", count: 4, icon: "xCircle", color: Palette.Red500, onClick: onMetricClick }],
        })}
      />,
    );
    // When keyboard activation occurs
    r.tableSummary_metric_missing.focus();
    fireEvent.keyDown(r.tableSummary_metric_missing, { key: "Enter" });
    fireEvent.keyUp(r.tableSummary_metric_missing, { key: "Enter" });
    // Then it stays focusable and notifies the parent
    expect(r.tableSummary_metric_missing).toHaveFocus();
    expect(onMetricClick).toHaveBeenCalledTimes(1);
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

function createProps(overrides: Partial<TableSummaryProps> = {}): TableSummaryProps {
  const { footer, ...rest } = overrides;
  return {
    title: "Bid Package Coverage",
    metrics: [{ label: "Missing", count: 4, icon: "xCircle", color: Palette.Red500 }],
    action: { label: "View Items", onClick: () => {} },
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
