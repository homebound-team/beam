import { PageHeaderLayout } from "src/layouts/PageHeaderLayout";
import { render } from "src/utils/rtl";

describe("PageHeaderLayout", () => {
  it("renders the page header slot and body children", async () => {
    // When rendered with a pageHeader and children
    const r = await render(
      <PageHeaderLayout pageHeader={{ title: "Page title" }}>
        <span>Body content</span>
      </PageHeaderLayout>,
    );

    // Then the layout root, header slot, and body slot all render
    expect(r.pageHeaderLayout).toBeInTheDocument();
    expect(r.pageHeaderLayout_pageHeader).toBeInTheDocument();
    expect(r.getByText("Page title")).toBeInTheDocument();
    expect(r.pageHeaderLayout_body).toHaveTextContent("Body content");
  });

  it("omits the header slot when the pageHeader prop is undefined", async () => {
    // When rendered without a pageHeader prop
    const r = await render(
      <PageHeaderLayout>
        <span>Body only</span>
      </PageHeaderLayout>,
    );

    // Then there's no header placeholder, but the body still renders
    expect(r.query.pageHeaderLayout_pageHeader).toBeNull();
    expect(r.pageHeaderLayout_body).toHaveTextContent("Body only");
  });
});
