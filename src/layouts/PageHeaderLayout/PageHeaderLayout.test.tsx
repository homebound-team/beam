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

    // Then the header slot and body slot render
    expect(r.pageHeaderLayout_pageHeader).toHaveTextContent("Page title");
    expect(r.pageHeaderLayout_body).toHaveTextContent("Body content");
  });
});
