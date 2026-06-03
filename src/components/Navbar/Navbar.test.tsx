import type { AppNavItem } from "src/components/AppNav/appNavTypes";
import type { NavbarUser } from "src/components/Navbar/Navbar";
import { Navbar } from "src/components/Navbar/Navbar";
import { setViewport } from "src/tests/viewport";
import { render, withRouter } from "src/utils/rtl";

describe("Navbar", () => {
  it("marks the active item with aria-current", async () => {
    const r = await render(
      <Navbar brand={createBrand()} items={createItems({ activeLabel: "Projects" })} />,
      withRouter("/projects"),
    );

    expect(r.navbar_link_projects).toHaveAttribute("aria-current", "page");
    expect(r.navbar_link_dashboard).not.toHaveAttribute("aria-current");
  });

  it("renders the brand slot content", async () => {
    const r = await render(<Navbar brand={<span>Acme</span>} items={createItems()} />, withRouter());

    expect(r.navbar_brand).toHaveTextContent("Acme");
  });

  it("renders the user menu when user.name is set", async () => {
    const r = await render(<Navbar brand={createBrand()} items={createItems()} user={createUser()} />, withRouter());

    expect(r.navbar_userMenu).toBeInTheDocument();
  });

  it("omits the user menu when user is not provided", async () => {
    const r = await render(<Navbar brand={createBrand()} items={createItems()} />, withRouter());

    expect(r.queryByTestId("navbar_userMenu")).not.toBeInTheDocument();
  });

  it("shows the mobile hamburger menu on small viewports", async () => {
    setViewport("sm");
    const r = await render(
      <Navbar brand={createBrand()} items={createItems()} trailingItems={createTrailingItems()} />,
      withRouter(),
    );

    expect(r.navbar_mobileMenu).toBeInTheDocument();
  });
});

function createBrand() {
  return <span>Brand</span>;
}

function createItems(opts?: { activeLabel?: string }): AppNavItem[] {
  const activeLabel = opts?.activeLabel;
  return [
    {
      label: "Dashboard",
      onClick: "/",
      active: activeLabel === "Dashboard",
    },
    {
      label: "Projects",
      onClick: "/projects",
      active: activeLabel === "Projects",
    },
  ];
}

function createTrailingItems(): AppNavItem[] {
  return [{ label: "Help", onClick: "/help", icon: "helpCircle", iconOnly: true }];
}

function createUser(): NavbarUser {
  return {
    name: "Tony Stark",
    menuItems: [{ label: "Profile", onClick: "/profile" }],
  };
}
