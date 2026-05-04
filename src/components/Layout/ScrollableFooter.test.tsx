import { render } from "src/utils/rtl";
import { ScrollableContent } from "./ScrollableContent";
import { ScrollableFooter } from "./ScrollableFooter";
import { ScrollableParent } from "./ScrollableParent";

describe("ScrollableFooter", () => {
  it("renders ScrollableFooter children in the parent's footer slot alongside ScrollableContent", async () => {
    const r = await render(
      <ScrollableParent>
        <ScrollableContent>
          <div data-testid="pageContent">Hello World!</div>
        </ScrollableContent>
        <ScrollableFooter>
          <div data-testid="pageFooter">Save</div>
        </ScrollableFooter>
      </ScrollableParent>,
    );
    expect(r.pageContent).toHaveTextContent("Hello World!");
    expect(r.pageFooter).toHaveTextContent("Save");
  });

  it("renders ScrollableFooter children inline if not wrapped in ScrollableParent", async () => {
    const r = await render(
      <div>
        <ScrollableFooter>
          <div data-testid="pageFooter">Save</div>
        </ScrollableFooter>
      </div>,
    );
    expect(r.pageFooter).toHaveTextContent("Save");
  });
});
