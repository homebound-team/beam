import { act } from "@testing-library/react";
import { DocumentScrollLayoutProvider } from "src/layouts/DocumentScrollLayoutContext";
import { DocumentScrollToTopButton } from "src/layouts/DocumentScrollToTopButton";
import { click, render } from "src/utils/rtl";
import { vi } from "vitest";

describe("DocumentScrollToTopButton", () => {
  beforeEach(() => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  });

  afterEach(() => {
    Object.defineProperty(window, "scrollY", { value: 0, configurable: true });
  });

  it("stays hidden until the user scrolls past one viewport height", async () => {
    // Given the control at the top of the page
    const r = await render(<DocumentScrollToTopButton viewportHeight={768} />);

    // Then the scroll-to-top control is hidden
    expect(r.documentScrollToTop_wrapper).toHaveAttribute("aria-hidden", "true");
    expect(r.documentScrollToTop_wrapper).toHaveAttribute("inert");

    // When scrolled past one viewport height
    scrollWindow(769);

    // Then the control becomes visible
    expect(r.documentScrollToTop_wrapper).toHaveAttribute("aria-hidden", "false");
    expect(r.documentScrollToTop_wrapper).not.toHaveAttribute("inert");
  });

  it("hides again when scrolled back within one viewport height", async () => {
    // Given the scroll-to-top control is visible mid-page
    const r = await render(<DocumentScrollToTopButton viewportHeight={768} />);
    scrollWindow(900);
    expect(r.documentScrollToTop_wrapper).toHaveAttribute("aria-hidden", "false");

    // When scrolled back above the threshold
    scrollWindow(400);

    // Then the control hides again
    expect(r.documentScrollToTop_wrapper).toHaveAttribute("aria-hidden", "true");
    expect(r.documentScrollToTop_wrapper).toHaveAttribute("inert");
  });

  it("scrolls to the top when clicked", async () => {
    // Given the scroll-to-top control is visible
    const r = await render(<DocumentScrollToTopButton viewportHeight={768} />);
    scrollWindow(900);

    // When the button is clicked
    click(r.documentScrollToTop);

    // Then the window scrolls smoothly to the top
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
  });

  it("renders only on the outermost document-scroll provider", async () => {
    // Given nested document-scroll providers
    mockDocumentViewport(1024, 768);
    const r = await render(
      <DocumentScrollLayoutProvider>
        <DocumentScrollLayoutProvider>
          <div />
        </DocumentScrollLayoutProvider>
      </DocumentScrollLayoutProvider>,
    );

    // Then only one scroll-to-top button is mounted
    expect(r.documentScrollToTop).toBeInTheDocument();
    expect(r.getAllByTestId("documentScrollToTop")).toHaveLength(1);
  });
});

function mockDocumentViewport(width: number, height: number): void {
  Object.defineProperty(document.documentElement, "clientWidth", { configurable: true, get: () => width });
  Object.defineProperty(document.documentElement, "clientHeight", { configurable: true, get: () => height });
}

function scrollWindow(y: number): void {
  Object.defineProperty(window, "scrollY", { value: y, configurable: true });
  act(() => {
    window.dispatchEvent(new Event("scroll"));
  });
}
