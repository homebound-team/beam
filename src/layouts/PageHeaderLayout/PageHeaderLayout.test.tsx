import type { ReactNode } from "react";
import { AutoSaveStatus, AutoSaveStatusContext } from "src/components/AutoSaveStatus/AutoSaveStatusProvider";
import { PageHeaderLayout } from "src/layouts/PageHeaderLayout/PageHeaderLayout";
import { noop } from "src/utils/helpers";
import { render } from "src/utils/rtl";

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
