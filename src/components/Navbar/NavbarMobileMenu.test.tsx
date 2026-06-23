import type { AppNavItem } from "src/components/AppNav/appNavTypes";
import { environmentBannerSizePx } from "src/components/EnvironmentBanner/EnvironmentBanner";
import { NavbarMobileMenu } from "src/components/Navbar/NavbarMobileMenu";
import { EnvironmentBannerLayoutHeightProvider } from "src/layouts/EnvironmentBannerLayout/EnvironmentBannerLayoutHeightContext";
import { click, render, withRouter } from "src/utils/rtl";
import { zIndices } from "src/utils/zIndices";

describe("NavbarMobileMenu", () => {
  it("toggles the drawer open and closed via the hamburger", async () => {
    const r = await render(<NavbarMobileMenu items={createItems()} />, withRouter());

    expect(r.query.navbar_mobileMenuPanel).toBeNull();
    click(r.navbar_mobileMenu);
    expect(r.navbar_mobileMenuPanel).toBeInTheDocument();
    click(r.navbar_mobileMenu);
    expect(r.query.navbar_mobileMenuPanel).toBeNull();
  });

  it("closes the drawer via the in-drawer close button", async () => {
    const r = await render(<NavbarMobileMenu items={createItems()} />, withRouter());

    click(r.navbar_mobileMenu);
    click(r.navbar_mobileMenuClose);
    expect(r.query.navbar_mobileMenuPanel).toBeNull();
  });

  it("renders link groups in the drawer", async () => {
    const r = await render(<NavbarMobileMenu items={createItemsWithLinkGroup()} />, withRouter());

    click(r.navbar_mobileMenu);
    expect(r.navbar_linkGroup_trigger).toHaveAttribute("aria-expanded", "true");
    expect(r.navbar_linkGroup_link_plans).toHaveTextContent("Plans");
  });

  it("closes the drawer when a navigating link is tapped", async () => {
    const r = await render(<NavbarMobileMenu items={createItems()} />, withRouter("/"));

    click(r.navbar_mobileMenu);
    expect(r.navbar_mobileMenuPanel).toBeInTheDocument();

    click(r.navbar_link_projects);
    expect(r.query.navbar_mobileMenuPanel).toBeNull();
  });

  it("closes the drawer when tapping a link for the current route", async () => {
    const r = await render(<NavbarMobileMenu items={createItems()} />, withRouter("/projects"));

    click(r.navbar_mobileMenu);
    expect(r.navbar_mobileMenuPanel).toBeInTheDocument();

    // A same-route tap doesn't change the location, so only the drawer's anchor-click capture closes it.
    click(r.navbar_link_projects);
    expect(r.query.navbar_mobileMenuPanel).toBeNull();
  });

  it("keeps the drawer open when toggling a link group", async () => {
    const r = await render(<NavbarMobileMenu items={createItemsWithLinkGroup()} />, withRouter());

    click(r.navbar_mobileMenu);
    expect(r.navbar_mobileMenuPanel).toBeInTheDocument();

    // The link group trigger is a <button>, not an <a>, so toggling it must not close the drawer.
    click(r.navbar_linkGroup_trigger);
    expect(r.navbar_mobileMenuPanel).toBeInTheDocument();
  });

  it("positions the drawer below the environment banner and above the navbar", async () => {
    // Given a displayed environment banner height in context
    const r = await render(
      <EnvironmentBannerLayoutHeightProvider value={environmentBannerSizePx}>
        <NavbarMobileMenu items={createItems()} />
      </EnvironmentBannerLayoutHeightProvider>,
      withRouter(),
    );

    // When the mobile drawer opens
    click(r.navbar_mobileMenu);

    // Then the overlay clears the navbar and starts below the banner
    expect(r.navbar_mobileMenuDrawer).toHaveStyle({
      top: `${environmentBannerSizePx}px`,
      zIndex: String(zIndices.navbarMobileMenu),
    });
    expect(r.navbar_mobileMenuScrim).toHaveStyle({
      top: `${environmentBannerSizePx}px`,
      zIndex: String(zIndices.navbarMobileMenuScrim),
    });
  });
});

function createItems(): AppNavItem[] {
  return [
    { label: "Dashboard", onClick: "/" },
    { label: "Projects", onClick: "/projects" },
  ];
}

function createItemsWithLinkGroup(): AppNavItem[] {
  return [
    { label: "Dashboard", onClick: "/" },
    {
      label: "Libraries",
      defaultExpanded: true,
      items: [
        { label: "Plans", onClick: "/libraries/plans" },
        { label: "Materials", onClick: "/libraries/materials" },
      ],
    },
  ];
}
