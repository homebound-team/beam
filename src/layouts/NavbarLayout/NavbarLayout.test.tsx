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
});

function createItems(): AppNavItem[] {
  return [
    { label: "Dashboard", onClick: () => {}, active: true },
    { label: "Projects", onClick: () => {} },
  ];
}
