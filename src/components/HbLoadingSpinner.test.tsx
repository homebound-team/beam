import { render } from "src/utils/rtl";
import { HbLoadingSpinner, HbSpinnerProvider } from "./HbLoadingSpinner";

describe("HbLoadingSpinner", () => {
  it("picks a quip", async () => {
    // When we render normally
    const r = await render(<HbLoadingSpinner />, { omitBeamContext: true });
    // Text is present, and the spinner has 2 children (icon + quip)
    expect(r.baseElement).toHaveTextContent(/.+/);
    expect(r.hbLoadingSpinner.childElementCount).toBe(2);
  });

  it("responds to iconOnly", async () => {
    // When we render with iconOnly
    const r = await render(<HbLoadingSpinner iconOnly />, { omitBeamContext: true });
    // The text child disappears from the DOM
    expect(r.hbLoadingSpinner.childElementCount).toBe(1);
  });

  it("may use extra quips only", async () => {
    // When we render with extra quips, and specify to only use those quips
    const r = await render(<HbLoadingSpinner extraQuips={["Find me"]} extraQuipsOnly />, { omitBeamContext: true });
    // Then we either got really lucky and this test instance picked our quip, or more likely it's only using our quip
    expect(r.baseElement).toHaveTextContent("Find me");
  });

  it("responds to global noQuips rules", async () => {
    // When the global context disables quips
    const r = await render(
      <HbSpinnerProvider noQuips>
        <HbLoadingSpinner />
      </HbSpinnerProvider>,
      { omitBeamContext: true },
    );
    // Then we get the default text
    expect(r.baseElement).toHaveTextContent("Loading...");
  });

  it("may override contextual noQuips rules", async () => {
    const r = await render(
      // Given quips have been disabled globally
      <HbSpinnerProvider noQuips>
        {/* When we pass in extra quips */}
        <HbLoadingSpinner extraQuips={["Find me"]} extraQuipsOnly />
      </HbSpinnerProvider>,
      { omitBeamContext: true },
    );
    // Then quips display
    expect(r.baseElement).toHaveTextContent("Find me");
  });
});
