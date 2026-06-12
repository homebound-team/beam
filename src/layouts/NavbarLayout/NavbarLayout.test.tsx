import { NavbarLayout } from "src/layouts/NavbarLayout";
import { render } from "src/utils/rtl";

describe("NavbarLayout", () => {
  it("renders the navbar slot and body children", async () => {
    // Given a navbar and body content
    // When rendered
    const r = await render(
      <NavbarLayout
        navbar={{
          brand: "Brand",
          items: [
            { label: "Dashboard", onClick: () => {}, active: true },
            { label: "Projects", onClick: () => {} },
          ],
        }}
      >
        <span>Page content</span>
      </NavbarLayout>,
    );

    // Then the navbar slot and body slot render
    expect(r.navbarLayout_navbar).toHaveTextContent("Dashboard");
    expect(r.navbarLayout_body).toHaveTextContent("Page content");
  });
});
