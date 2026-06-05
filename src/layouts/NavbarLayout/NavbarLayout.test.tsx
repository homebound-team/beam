import type { AppNavItem } from "src/components/AppNav/appNavTypes";
import { NavbarLayout } from "src/layouts/NavbarLayout";
import { render } from "src/utils/rtl";

describe("NavbarLayout", () => {
  it("renders the navbar slot and body children", async () => {
    // When rendered with a navbar and children
    const r = await render(
      <NavbarLayout navbar={{ brand: "Brand", items: createItems() }}>
        <span>Page content</span>
      </NavbarLayout>,
    );

    // Then the layout root, navbar slot, and body slot all render
    expect(r.navbarLayout).toBeInTheDocument();
    expect(r.navbarLayout_navbar).toBeInTheDocument();
    expect(r.navbarLayout_body).toHaveTextContent("Page content");
    // And the navbar's own content renders inside the slot
    expect(r.getByText("Dashboard")).toBeInTheDocument();
  });

  it("omits the navbar slot when the navbar prop is undefined", async () => {
    // When rendered without a navbar prop
    const r = await render(
      <NavbarLayout>
        <span>Body only</span>
      </NavbarLayout>,
    );

    // Then there's no navbar placeholder, but the body still renders
    expect(r.query.navbarLayout_navbar).toBeNull();
    expect(r.navbarLayout_body).toHaveTextContent("Body only");
  });
});

function createItems(): AppNavItem[] {
  return [
    { label: "Dashboard", onClick: () => {}, active: true },
    { label: "Projects", onClick: () => {} },
  ];
}
