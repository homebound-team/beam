import { renderHook } from "@testing-library/react";
import { DocumentTitleProvider } from "src/components/DocumentTitle/DocumentTitleContext";
import { PageHeader } from "src/components/Headers/PageHeader";
import { useDocumentTitle } from "src/hooks/useDocumentTitle";
import { render } from "src/utils/rtl";

describe("useDocumentTitle", () => {
  beforeEach(() => {
    document.title = "";
  });

  it("sets document.title with env prefix and suffix", () => {
    // Given a DocumentTitleProvider with local env and app suffix
    // When the hook registers a page title
    renderHook(() => useDocumentTitle("Potato"), {
      wrapper: ({ children }) => (
        <DocumentTitleProvider env="local" suffix="Blueprint | Homebound">
          {children}
        </DocumentTitleProvider>
      ),
    });

    // Then document.title includes the env prefix, page title, and app suffix
    expect(document.title).toBe("[LOCAL] Potato | Blueprint | Homebound");
  });

  it("joins variadic title segments before applying app suffix", () => {
    // Given a DocumentTitleProvider and multiple page title segments
    // When the hook registers the joined page title
    renderHook(() => useDocumentTitle("Schedule", "123 Sesame St"), {
      wrapper: ({ children }) => (
        <DocumentTitleProvider env="qa" suffix="Blueprint | Homebound">
          {children}
        </DocumentTitleProvider>
      ),
    });

    // Then document.title includes all segments plus the app suffix
    expect(document.title).toBe("[QA] Schedule | 123 Sesame St | Blueprint | Homebound");
  });

  it("omits env prefix in production", () => {
    // Given a DocumentTitleProvider in prod
    // When the hook registers a page title
    renderHook(() => useDocumentTitle("Potato"), {
      wrapper: ({ children }) => (
        <DocumentTitleProvider env="prod" suffix="Blueprint | Homebound">
          {children}
        </DocumentTitleProvider>
      ),
    });

    // Then document.title omits the env prefix
    expect(document.title).toBe("Potato | Blueprint | Homebound");
  });

  it("updates document.title when the title changes", () => {
    // Given a DocumentTitleProvider and an initial page title
    const { rerender } = renderHook(({ title }) => useDocumentTitle(title), {
      initialProps: { title: "Potato" },
      wrapper: ({ children }) => (
        <DocumentTitleProvider env="local" suffix="Blueprint | Homebound">
          {children}
        </DocumentTitleProvider>
      ),
    });

    expect(document.title).toBe("[LOCAL] Potato | Blueprint | Homebound");

    // When the page title changes
    rerender({ title: "Carrot" });

    // Then document.title reflects the new page title
    expect(document.title).toBe("[LOCAL] Carrot | Blueprint | Homebound");
  });

  it("falls back to env prefix and app suffix on unmount", () => {
    // Given a registered page title
    const { unmount } = renderHook(() => useDocumentTitle("Potato"), {
      wrapper: ({ children }) => (
        <DocumentTitleProvider env="local" suffix="Blueprint | Homebound">
          {children}
        </DocumentTitleProvider>
      ),
    });

    expect(document.title).toBe("[LOCAL] Potato | Blueprint | Homebound");

    // When the hook unmounts
    unmount();

    // Then document.title falls back to env prefix and app suffix only
    expect(document.title).toBe("[LOCAL] Blueprint | Homebound");
  });

  it("sets document.title from PageHeader when a provider is present", async () => {
    // Given a PageHeader inside a DocumentTitleProvider
    // When rendered
    await render(
      <DocumentTitleProvider env="local" suffix="Blueprint | Homebound">
        <PageHeader title="Projects" />
      </DocumentTitleProvider>,
      { omitBeamContext: true },
    );

    // Then document.title is set via PageHeader
    expect(document.title).toBe("[LOCAL] Projects | Blueprint | Homebound");
  });

  it("includes documentTitleSuffix in the browser tab title", async () => {
    // Given a PageHeader with documentTitleSuffix
    const r = await render(
      <DocumentTitleProvider env="qa" suffix="Blueprint | Homebound">
        <PageHeader title="Schedule" documentTitleSuffix="123 Sesame St" />
      </DocumentTitleProvider>,
      { omitBeamContext: true },
    );

    // Then the suffix appears in document.title but not the visible heading
    expect(document.title).toBe("[QA] Schedule | 123 Sesame St | Blueprint | Homebound");
    expect(r.header_title.textContent).toBe("Schedule");
  });

  it("leaves document.title unchanged when PageHeader renders without a provider", async () => {
    // Given an existing document.title and no DocumentTitleProvider
    document.title = "Initial title";

    // When PageHeader renders
    await render(<PageHeader title="Projects" />, { omitBeamContext: true });

    // Then document.title is unchanged
    expect(document.title).toBe("Initial title");
  });
});
