import { StackBarGraph } from "src/components/StackBarGraph";
import { render } from "src/utils/rtl";

describe("StackBarGraph", () => {
  it("shows zero percent for segments with a zero total", async () => {
    // Given stack bar segments with no items
    const r = await render(
      <StackBarGraph
        title="Coverage by status"
        totalLabel="Cost Codes"
        segments={[
          { label: "Complete", count: 0, status: "success" },
          { label: "Missing", count: 0, status: "error" },
        ]}
      />,
    );
    // Then the legend does not render invalid percentages
    expect(r.stackBarGraph_legend).toHaveTextContent("0% Complete (0)");
    expect(r.stackBarGraph_legend).toHaveTextContent("0% Missing (0)");
  });

  it("sizes stack bar segments according to their counts", async () => {
    // Given a stack bar with unequal segment counts
    const r = await render(
      <StackBarGraph
        title="Coverage by status"
        totalLabel="Cost Codes"
        segments={[
          { label: "Complete", count: 3, status: "success" },
          { label: "Missing", count: 1, status: "error" },
        ]}
      />,
    );
    // Then the bar uses counts as flex proportions
    expect(r.stackBarGraph_bar.children[0]).toHaveStyle({ flexGrow: "3" });
    expect(r.stackBarGraph_bar.children[1]).toHaveStyle({ flexGrow: "1" });
  });

  it("renders a caller-provided title", async () => {
    // Given a custom stack bar title
    const r = await render(
      <StackBarGraph
        title="Bid package status"
        totalLabel="Cost Codes"
        segments={[{ label: "Complete", count: 40, status: "success" }]}
      />,
    );
    // Then the custom title is shown
    expect(r.stackBarGraph).toHaveTextContent("Bid package status");
  });
});
