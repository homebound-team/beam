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
      marginLeft: "calc(24px * -1)",
      marginRight: "calc(24px * -1)",
      paddingLeft: "24px",
      paddingRight: "24px",
    });
  });
});
