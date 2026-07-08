import { Breadcrumb, Breadcrumbs } from "src/components/Breadcrumbs";
import { render } from "src/utils/rtl";

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
    // Given multiple breadcrumbs
    const breadcrumbs: Breadcrumb[] = [
      { label: "Home", href: "/" },
      { label: "Projects", href: "/projects" },
      { label: "Project 123", href: "/projects/123" },
    ];

    // When rendered
    const r = await render(<Breadcrumbs breadcrumbs={breadcrumbs} />, {});

    // Then they render as links in order with the correct hrefs
    const links = r.getAllByTestId("breadcrumb_link");
    expect(links.map((l) => l.textContent)).toEqual(["Home", "Projects", "Project 123"]);
    expect(links.map((l) => l.getAttribute("href"))).toEqual(["/", "/projects", "/projects/123"]);
  });

  it("separates breadcrumbs with a slash", async () => {
    // Given multiple breadcrumbs
    const breadcrumbs: Breadcrumb[] = [
      { label: "Home", href: "/" },
      { label: "Projects", href: "/projects" },
      { label: "Project 123", href: "/projects/123" },
    ];

    // When rendered
    const r = await render(<Breadcrumbs breadcrumbs={breadcrumbs} />, {});

    // Then they're separated by slashes (spacing comes from the flex container's `gap1`, not literal spaces in the text)
    expect(r.container.textContent).toBe("Home/Projects/Project 123");
  });

  it("caps long labels at a max width so only they truncate", async () => {
    // Given a breadcrumb with a very long label
    const longLabel = "A Really Long Project Name That Should Truncate Instead Of Wrapping";

    // When rendered
    const r = await render(<Breadcrumbs breadcrumbs={{ label: longLabel, href: "/" }} />, {});

    // Then the link is capped at a max width, with the full label available via a title attribute
    expect(r.breadcrumb_link).toHaveStyle({ maxWidth: "120px" });
    expect(r.breadcrumb_link).toHaveAttribute("title", longLabel);
  });

  it("does not clip short labels", async () => {
    // Given a breadcrumb with a short label
    // When rendered
    const r = await render(<Breadcrumbs breadcrumbs={{ label: "Home", href: "/" }} />, {});

    // Then it still gets the max-width style, but its text isn't truncated
    expect(r.breadcrumb_link).toHaveStyle({ maxWidth: "120px" });
    expect(r.breadcrumb_link).toHaveTextContent("Home");
  });
});
