import { ScrollableContent, ScrollableParent } from "src/components/Layout";
import { render } from "src/utils/rtl";

describe("ScrollableContent", () => {
  it("renders ScrollableContent children in portal", async () => {
    const r = await render(
      <ScrollableParent>
        <ScrollableContent>
          <div data-testid="pageContent">Hello World!</div>
        </ScrollableContent>
      </ScrollableParent>,
    );

    expect(r.pageContent).toBeTruthy();
  });

  it("renders ScrollableContent children inline if not wrapped in ScrollableParent", async () => {
    const r = await render(
      <div>
        <ScrollableContent>
          <div data-testid="pageContent">Hello World!</div>
        </ScrollableContent>
      </div>,
    );

    expect(r.pageContent).toBeTruthy();
  });
});
