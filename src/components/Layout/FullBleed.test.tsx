import { FullBleed, ScrollableParent } from "src/components/Layout";
import { render } from "src/utils/rtl";

describe("FullBleed", () => {
  it("converts ScrollableParent spacing increments into full-bleed margins", async () => {
    const r = await render(
      <ScrollableParent px={3}>
        <FullBleed>
          <div data-testid="fullBleed">Hello World!</div>
        </FullBleed>
      </ScrollableParent>,
    );

    expect(r.fullBleed).toHaveStyle({
      marginLeft: "calc(calc(var(--t-spacing) * 3) * -1)",
      marginRight: "calc(calc(var(--t-spacing) * 3) * -1)",
      paddingLeft: "calc(var(--t-spacing) * 3)",
      paddingRight: "calc(var(--t-spacing) * 3)",
    });
  });
});
