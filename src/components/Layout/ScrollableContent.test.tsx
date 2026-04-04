import { render } from "src/utils/rtl";
import { ScrollableContent, useVirtualizedScrollParent } from "./ScrollableContent";
import { ScrollableParent } from "./ScrollableParent";

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

  it("provides the scrollable parent to virtualized children", async () => {
    const r = await render(
      <ScrollableParent>
        <ScrollableContent virtualized>
          <VirtualizedScrollParentProbe />
        </ScrollableContent>
      </ScrollableParent>,
    );
    expect(r.scrollParentProbe).toHaveTextContent("present");
  });

  it("does not provide the scrollable parent unless virtualized", async () => {
    const r = await render(
      <ScrollableParent>
        <ScrollableContent>
          <VirtualizedScrollParentProbe />
        </ScrollableContent>
      </ScrollableParent>,
    );
    expect(r.scrollParentProbe).toHaveTextContent("missing");
  });
});

function VirtualizedScrollParentProbe() {
  const scrollParent = useVirtualizedScrollParent();
  return <div data-testid="scrollParentProbe">{scrollParent ? "present" : "missing"}</div>;
}
