import { act } from "react";
import { Tokens } from "src/Css";
import { DocumentScrollLayoutProvider } from "src/layouts/DocumentScrollLayoutContext";
import { PageHeaderLayout } from "src/layouts/PageHeaderLayout/PageHeaderLayout";
import { beamLayoutViewportHeightVar, beamLayoutViewportWidthVar } from "src/layouts/layoutVars";
import { mockDocumentViewport, render } from "src/utils/rtl";
import { vi } from "vitest";

describe("DocumentScrollLayoutProvider", () => {
  beforeEach(() => {
    document.body.style.backgroundColor = "";
  });

  it("sets document.body background to the surface token while mounted", async () => {
    // Given a measured document viewport and no prior inline body background
    mockDocumentViewport(1024, 768);

    // When wrapped in the outermost provider
    const r = await render(
      <DocumentScrollLayoutProvider>
        <div data-testid="child" />
      </DocumentScrollLayoutProvider>,
    );

    // Then document.body uses the default surface background
    expect(document.body.style.backgroundColor).toBe(`var(${Tokens.Surface})`);

    // When the provider unmounts
    r.unmount();

    // Then the prior inline body background is restored
    expect(document.body.style.backgroundColor).toBe("");
  });

  it("publishes viewport CSS vars on the measurement root when rendered standalone", async () => {
    // Given a measured document viewport
    mockDocumentViewport(1024, 768);

    // When wrapped in the outermost provider
    const r = await render(
      <DocumentScrollLayoutProvider>
        <div data-testid="child" />
      </DocumentScrollLayoutProvider>,
    );

    // Then the measurement root sets measured viewport size (not 100vw/100vh fallbacks)
    const root = findViewportRoot(r.container);
    expect(root?.style.getPropertyValue(beamLayoutViewportWidthVar)).toBe("1024px");
    expect(root?.style.getPropertyValue(beamLayoutViewportHeightVar)).toBe("768px");
  });

  it("rereads the viewport height when the content shell resizes", async () => {
    // Given a viewport measurement, and observers split between the document element and the content shell
    let onShellResize: (() => void) | undefined;
    const origResizeObserver = window.ResizeObserver;
    window.ResizeObserver = vi.fn().mockImplementation(function (this: ResizeObserver, cb: ResizeObserverCallback) {
      this.observe = (el: Element) => {
        if (el !== document.documentElement) onShellResize = () => cb([{ target: el } as ResizeObserverEntry], this);
      };
      this.unobserve = () => {};
      this.disconnect = () => {};
    }) as unknown as typeof ResizeObserver;
    mockDocumentViewport(1024, 768);

    try {
      // When the shell resizes after a horizontal scrollbar shortens the viewport
      const r = await render(
        <DocumentScrollLayoutProvider>
          <div data-testid="child" />
        </DocumentScrollLayoutProvider>,
      );
      const root = findViewportRoot(r.container);
      mockDocumentViewport(1024, 753);
      act(() => onShellResize?.());

      // Then the height var matches the shorter viewport without a window resize
      expect(root?.style.getPropertyValue(beamLayoutViewportHeightVar)).toBe("753px");
    } finally {
      window.ResizeObserver = origResizeObserver;
    }
  });

  it("creates only one measurement root when nested inside another provider", async () => {
    // Given a measured document viewport
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
    // Given a measured document viewport
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

function findViewportRoot(container: HTMLElement): HTMLElement | undefined {
  return findAllViewportRoots(container)[0];
}

function findAllViewportRoots(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll("div")).filter(
    (el) => el.style.getPropertyValue(beamLayoutViewportWidthVar) !== "",
  );
}
