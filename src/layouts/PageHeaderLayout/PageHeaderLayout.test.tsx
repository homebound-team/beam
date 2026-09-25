import type { ReactNode } from "react";
import { AutoSaveStatus, AutoSaveStatusContext } from "src/components/AutoSaveStatus/AutoSaveStatusProvider";
import { selfTopSpaced } from "src/layouts/layoutSpacing";
import { PageHeaderLayout } from "src/layouts/PageHeaderLayout/PageHeaderLayout";
import { noop } from "src/utils/helpers";
import { render } from "src/utils/rtl";
import { vi } from "vitest";

describe("PageHeaderLayout", () => {
  it("renders the page header slot and body children", async () => {
    // Given a page header and body content
    // When rendered
    const r = await render(
      <PageHeaderLayout pageHeader={{ title: "Page title" }}>
        <span>Body content</span>
      </PageHeaderLayout>,
    );

    // Then the header slot and body slot render
    expect(r.pageHeaderLayout_pageHeader).toHaveTextContent("Page title");
    expect(r.pageHeaderLayout_body).toHaveTextContent("Body content");
    expect(r.query.autoSave).toBeNull();
  });

  it("does not transition the header into place on mount", async () => {
    // Given the frame after mount has not yet run
    const raf = vi.spyOn(window, "requestAnimationFrame").mockReturnValue(1);

    // When the page header first renders
    const r = await render(<PageHeaderLayout pageHeader={{ title: "Page title" }} />);

    // Then the slide transition is held off, so the mount-time top correction does not animate
    expect(r.pageHeaderLayout_pageHeader).not.toHaveStyle({
      transition: "all 200ms cubic-bezier(0.4, 0, 0.2, 1)",
    });
    raf.mockRestore();
  });

  it("spaces the body's first child below the header", async () => {
    // Given a body whose first child does not pad its own top edge
    // When rendered
    const r = await render(
      <PageHeaderLayout pageHeader={{ title: "Page title" }}>
        <span>Body content</span>
      </PageHeaderLayout>,
    );

    // Then the first child picks up the body's top spacing
    expect(r.pageHeaderLayout_body.firstElementChild).toHaveStyle({ marginTop: "calc(var(--t-spacing) * 3)" });
  });

  it("skips the body spacing for chrome that pads its own top edge", async () => {
    // Given a body that starts with self-spaced chrome
    // When rendered
    const r = await render(
      <PageHeaderLayout pageHeader={{ title: "Page title" }}>
        <span {...selfTopSpaced}>Body content</span>
      </PageHeaderLayout>,
    );

    // Then the body adds no spacing of its own
    expect(r.pageHeaderLayout_body.firstElementChild).not.toHaveStyle({ marginTop: "calc(var(--t-spacing) * 3)" });
  });

  it("shows AutoSaveIndicator in the page header while saving", async () => {
    // Given a PageHeaderLayout with an in-flight auto-save
    // When rendered
    const r = await render(
      <MockAutoSaveProvider status={AutoSaveStatus.SAVING}>
        <PageHeaderLayout pageHeader={{ title: "Page title" }} />
      </MockAutoSaveProvider>,
    );
    // Then AutoSaveIndicator is in the page header
    expect(r.autoSave).toHaveTextContent("Saving");
  });
});

function MockAutoSaveProvider({
  status = AutoSaveStatus.IDLE,
  children,
}: {
  status?: AutoSaveStatus;
  children: ReactNode;
}) {
  return (
    <AutoSaveStatusContext.Provider
      value={{ status, resetStatus: noop, errors: [], resolveAutoSave: noop, triggerAutoSave: noop }}
    >
      {children}
    </AutoSaveStatusContext.Provider>
  );
}
