import { render } from "src/utils/rtl";
import { HbLoadingSpinner, HbSpinnerProvider } from "./HbLoadingSpinner";

describe("HbLoadingSpinner", () => {
  it("picks a quip", async () => {
    // When we render normally
    const r = await render(
      <HbSpinnerProvider quips={["*"]}>
        <HbLoadingSpinner />
      </HbSpinnerProvider>,
    );
    // Then the quip is in the dom
    expect(r.getByTestId("hbSpinner_quip")).toHaveTextContent("*");
  });

  it("responds to iconOnly", async () => {
    // When we render with iconOnly
    const r = await render(<HbLoadingSpinner iconOnly />);
    // The text is not in the DOM
    expect(r.queryByTestId("hbSpinner_quip")).not.toBeInTheDocument();
  });

  it("may use extra quips only", async () => {
    // When we render with extra quips, and specify to only use those quips
    const r = await render(<HbLoadingSpinner extraQuips={["Find me"]} extraQuipsOnly />);
    // Then we either got really lucky and this test instance picked our quip, or more likely it's only using our quip
    expect(r.baseElement).toHaveTextContent("Find me");
  });

  it("defaults when no quips are provided", async () => {
    // When the global context disables quips
    const r = await render(
      <HbSpinnerProvider quips={[]}>
        <HbLoadingSpinner />
      </HbSpinnerProvider>,
    );
    // Then we get the default text
    expect(r.baseElement).toHaveTextContent("Loading...");
  });

  it("may override contextual noQuips rules", async () => {
    const r = await render(
      // Given quips have been disabled globally
      <HbSpinnerProvider quips={[]}>
        {/* When we pass in extra quips */}
        <HbLoadingSpinner extraQuips={["Find me"]} />
      </HbSpinnerProvider>,
    );
    // Then quips display
    expect(r.baseElement).toHaveTextContent("Find me");
  });
});
