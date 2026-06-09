import { DocumentScrollLayoutProvider } from "src/layouts/DocumentScrollLayoutContext";
import { PageHeaderLayout } from "src/layouts/PageHeaderLayout";
import { beamLayoutViewportHeightVar, beamLayoutViewportWidthVar } from "src/layouts/layoutVars";
import { render } from "src/utils/rtl";

describe("DocumentScrollLayoutProvider", () => {
  it("publishes viewport CSS vars on the measurement root when rendered standalone", async () => {
    mockDocumentViewport(1024, 768);

    // When wrapped in the outermost provider
    const r = await render(
      <DocumentScrollLayoutProvider>
        <div data-testid="child" />
      </DocumentScrollLayoutProvider>,
    );

    // Then the display:contents measurement root sets measured viewport size (not 100vw/100vh fallbacks)
    const root = findViewportRoot(r.container);
    expect(root?.style.getPropertyValue(beamLayoutViewportWidthVar)).toBe("1024px");
    expect(root?.style.getPropertyValue(beamLayoutViewportHeightVar)).toBe("768px");
  });

  it("creates only one measurement root when nested inside another provider", async () => {
    mockDocumentViewport(1024, 768);

    // When an inner layout wraps itself in a second provider (bypasses re-measurement)
    const r = await render(
      <DocumentScrollLayoutProvider>
        <DocumentScrollLayoutProvider>
          <div data-testid="inner" />
        </DocumentScrollLayoutProvider>
      </DocumentScrollLayoutProvider>,
    );

    // Then only the outermost provider publishes viewport vars
    const roots = findAllViewportRoots(r.container);
    expect(roots).toHaveLength(1);
    expect(roots[0]?.style.getPropertyValue(beamLayoutViewportWidthVar)).toBe("1024px");
  });
});

describe("PageHeaderLayout viewport coordination", () => {
  it("wraps content in a viewport measurement root when rendered standalone", async () => {
    mockDocumentViewport(1024, 768);

    // When rendered without a NavbarLayout ancestor
    const r = await render(
      <PageHeaderLayout pageHeader={{ title: "Page title" }}>
        <span>Body</span>
      </PageHeaderLayout>,
    );

    // Then PageHeaderLayout's provider publishes viewport width for sticky header sizing
    const root = findViewportRoot(r.container);
    expect(root?.style.getPropertyValue(beamLayoutViewportWidthVar)).toBe("1024px");
    expect(r.pageHeaderLayout_pageHeader).toBeInTheDocument();
  });
});

function mockDocumentViewport(width: number, height: number): void {
  Object.defineProperty(document.documentElement, "clientWidth", { configurable: true, get: () => width });
  Object.defineProperty(document.documentElement, "clientHeight", { configurable: true, get: () => height });
}

function findViewportRoot(container: HTMLElement): HTMLElement | undefined {
  return findAllViewportRoots(container)[0];
}

function findAllViewportRoots(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll("div")).filter(
    (el) => el.style.getPropertyValue(beamLayoutViewportWidthVar) !== "",
  );
}
