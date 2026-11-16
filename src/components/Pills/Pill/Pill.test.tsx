import { Pill } from "src/components/Pills/Pill/Pill";
import { render } from "src/utils/rtl";

describe("Pill", () => {
  it("renders the label as read-only text with no close control", async () => {
    // Given a pill for one selected value
    // When rendered
    const r = await render(<Pill text="Great Room 109" />);
    // Then the label is shown
    expect(r.pill).toHaveTextContent("Great Room 109");
  });
});
