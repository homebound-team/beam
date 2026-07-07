import { Breadcrumb, Breadcrumbs } from "src/components/Breadcrumbs";
import { render } from "src/utils/rtl";

describe("Breadcrumbs", () => {
  it("renders a single breadcrumb", async () => {
    // Given a single, non-array Breadcrumb
    const r = await render(<Breadcrumbs breadcrumbs={{ label: "Home", href: "/" }} />, {});
    // Then it renders as a link
    expect(r.breadcrumb_link).toHaveTextContent("Home");
    expect(r.breadcrumb_link).toHaveAttribute("href", "/");
  });

  it("renders multiple breadcrumbs in order with correct hrefs", async () => {
    const breadcrumbs: Breadcrumb[] = [
      { label: "Home", href: "/" },
      { label: "Projects", href: "/projects" },
      { label: "Project 123", href: "/projects/123" },
    ];
    const r = await render(<Breadcrumbs breadcrumbs={breadcrumbs} />, {});
    const links = r.getAllByTestId("breadcrumb_link");
    expect(links.map((l) => l.textContent)).toEqual(["Home", "Projects", "Project 123"]);
    expect(links.map((l) => l.getAttribute("href"))).toEqual(["/", "/projects", "/projects/123"]);
  });

  it("separates breadcrumbs with a slash", async () => {
    const breadcrumbs: Breadcrumb[] = [
      { label: "Home", href: "/" },
      { label: "Projects", href: "/projects" },
      { label: "Project 123", href: "/projects/123" },
    ];
    const r = await render(<Breadcrumbs breadcrumbs={breadcrumbs} />, {});
    // Spacing between crumbs comes from the flex container's `gap1`, not literal spaces in the text
    expect(r.container.textContent).toBe("Home/Projects/Project 123");
  });

  it("exposes the full label via a title attribute for when it's truncated", async () => {
    const longLabel = "A Really Long Project Name That Should Truncate Instead Of Wrapping";
    const r = await render(<Breadcrumbs breadcrumbs={{ label: longLabel, href: "/" }} />, {});
    expect(r.breadcrumb_link).toHaveAttribute("title", longLabel);
  });
});
