import { Breadcrumb, Breadcrumbs } from "src/components/Breadcrumbs";
import { click, render } from "src/utils/rtl";

describe("Breadcrumbs", () => {
  it("renders a single breadcrumb", async () => {
    // Given a single, non-array Breadcrumb
    // When rendered
    const r = await render(<Breadcrumbs breadcrumbs={{ label: "Home", href: "/" }} />, {});
    // Then it renders as a link
    expect(r.breadcrumb_link).toHaveTextContent("Home");
    expect(r.breadcrumb_link).toHaveAttribute("href", "/");
  });

  it("renders multiple breadcrumbs in order with correct hrefs", async () => {
    // Given fewer than 3 breadcrumbs (below the collapse threshold)
    const breadcrumbs: Breadcrumb[] = [
      { label: "Home", href: "/" },
      { label: "Projects", href: "/projects" },
    ];

    // When rendered
    const r = await render(<Breadcrumbs breadcrumbs={breadcrumbs} />, {});

    // Then they render as links in order with the correct hrefs
    expect(r.breadcrumb_link_0.textContent).toEqual("Home");
    expect(r.breadcrumb_link_0).toHaveAttribute("href", "/");
    expect(r.breadcrumb_link_1.textContent).toEqual("Projects");
    expect(r.breadcrumb_link_1).toHaveAttribute("href", "/projects");
  });

  it("separates breadcrumbs with a slash", async () => {
    // Given fewer than 3 breadcrumbs (below the collapse threshold)
    const breadcrumbs: Breadcrumb[] = [
      { label: "Home", href: "/" },
      { label: "Projects", href: "/projects" },
    ];

    // When rendered
    const r = await render(<Breadcrumbs breadcrumbs={breadcrumbs} />, {});

    // Then they're separated by slashes (spacing comes from the flex container's `gap1`, not literal spaces in the text)
    expect(r.container.textContent).toBe("Home/Projects");
  });

  it("collapses to the first two and last breadcrumbs and opens to all breadcrumbs when clicked", async () => {
    // Given the default (desktop) viewport and 4 breadcrumbs
    const breadcrumbs: Breadcrumb[] = [
      { label: "Item A", href: "/a" },
      { label: "Item B", href: "/b" },
      { label: "Item C", href: "/c" },
      { label: "Item D", href: "/d" },
    ];

    // When rendered
    const r = await render(<Breadcrumbs breadcrumbs={breadcrumbs} />, {});

    // Then the first two and last breadcrumbs are visible, separated by an expandable "..."
    expect(r.breadcrumb_link_0).toHaveTextContent("Item A");
    expect(r.breadcrumb_link_1).toHaveTextContent("Item B");
    expect(r.breadcrumb_link_2).toHaveTextContent("Item D");
    expect(r.breadcrumb_expand).toBeInTheDocument();

    // And when the user clicks the "..."
    click(r.breadcrumb_expand);

    // Then all breadcrumbs are visible in order with the correct hrefs
    expect(r.breadcrumb_link_0).toHaveTextContent("Item A");
    expect(r.breadcrumb_link_0).toHaveAttribute("href", "/a");
    expect(r.breadcrumb_link_1).toHaveTextContent("Item B");
    expect(r.breadcrumb_link_1).toHaveAttribute("href", "/b");
    expect(r.breadcrumb_link_2).toHaveTextContent("Item C");
    expect(r.breadcrumb_link_2).toHaveAttribute("href", "/c");
    expect(r.breadcrumb_link_3).toHaveTextContent("Item D");
    expect(r.breadcrumb_link_3).toHaveAttribute("href", "/d");
    expect(r.query.breadcrumb_expand).not.toBeInTheDocument();
  });
});
