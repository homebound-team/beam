import { click, render } from "src/utils/rtl";
import { PageHeaderBreadcrumbs } from "./PageHeaderBreadcrumbs";

describe("PageHeaderBreadcrumbs", () => {
  it("renders collapsible breadcrumbs", async () => {
    // Given a PageHeaderBreadcrumbs with more than 3 items
    // When the component is rendered
    const r = await render(
      <PageHeaderBreadcrumbs
        breadcrumb={[
          { label: "Item A", href: "/a" },
          { label: "Item B", href: "/b" },
          { label: "Item C", href: "/c" },
          { label: "Item D", href: "/d" },
          { label: "Item E", href: "/e" },
        ]}
      />,
      {},
    );
    // Then only the first and last two breadcrumb items should be visible
    const breadcrumbItems = r.getAllByTestId("pageHeaderBreadcrumbs_navLink");
    expect(breadcrumbItems).toHaveLength(3);
    expect(breadcrumbItems.map((item) => item.textContent)).toEqual(["Item A", "Item D", "Item E"]);
    // And when the user expands the breadcrumbs
    click(r.pageHeaderBreadcrumbs_expand);
    // Then all breadcrumb items should be visible
    const expandedBreadcrumbItems = r.getAllByTestId("pageHeaderBreadcrumbs_navLink");
    expect(expandedBreadcrumbItems).toHaveLength(5);
    expect(expandedBreadcrumbItems.map((item) => item.textContent)).toEqual([
      "Item A",
      "Item B",
      "Item C",
      "Item D",
      "Item E",
    ]);
  });
});
