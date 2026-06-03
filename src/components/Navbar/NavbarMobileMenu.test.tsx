import type { AppNavItem } from "src/components/AppNav/appNavTypes";
import { NavbarMobileMenu } from "src/components/Navbar/NavbarMobileMenu";
import { click, render, withRouter } from "src/utils/rtl";

describe("NavbarMobileMenu", () => {
  it("toggles the drawer open and closed via the hamburger", async () => {
    const r = await render(<NavbarMobileMenu items={createItems()} trailingItems={[]} />, withRouter());

    expect(r.query.navbar_mobileMenuPanel).toBeNull();
    click(r.navbar_mobileMenu);
    expect(r.navbar_mobileMenuPanel).toBeInTheDocument();
    click(r.navbar_mobileMenu);
    expect(r.query.navbar_mobileMenuPanel).toBeNull();
  });

  it("closes the drawer via the in-drawer close button", async () => {
    const r = await render(<NavbarMobileMenu items={createItems()} trailingItems={[]} />, withRouter());

    click(r.navbar_mobileMenu);
    click(r.navbar_mobileMenuClose);
    expect(r.query.navbar_mobileMenuPanel).toBeNull();
  });

  it("renders link groups in the drawer", async () => {
    const r = await render(<NavbarMobileMenu items={createItemsWithLinkGroup()} trailingItems={[]} />, withRouter());

    click(r.navbar_mobileMenu);
    expect(r.navbar_linkGroup_trigger).toHaveAttribute("aria-expanded", "true");
    expect(r.navbar_linkGroup_link_plans).toHaveTextContent("Plans");
  });

  it("excludes icon-only toolbar links from the drawer", async () => {
    const trailingItems: AppNavItem[] = [
      { label: "Help", onClick: "/help", icon: "helpCircle", iconOnly: true },
      { label: "Settings", onClick: "/settings" },
    ];
    const r = await render(<NavbarMobileMenu items={createItems()} trailingItems={trailingItems} />, withRouter());

    click(r.navbar_mobileMenu);
    // Labeled trailing items fold into the drawer; compact icon-only toolbar links do not.
    expect(r.navbar_link_settings).toBeInTheDocument();
    expect(r.query.navbar_link_help).toBeNull();
  });

  it("closes the drawer when a navigating link is tapped", async () => {
    const r = await render(<NavbarMobileMenu items={createItems()} trailingItems={[]} />, withRouter("/"));

    click(r.navbar_mobileMenu);
    expect(r.navbar_mobileMenuPanel).toBeInTheDocument();

    click(r.navbar_link_projects);
    expect(r.query.navbar_mobileMenuPanel).toBeNull();
  });

  it("closes the drawer when tapping a link for the current route", async () => {
    const r = await render(<NavbarMobileMenu items={createItems()} trailingItems={[]} />, withRouter("/projects"));

    click(r.navbar_mobileMenu);
    expect(r.navbar_mobileMenuPanel).toBeInTheDocument();

    // A same-route tap doesn't change the location, so only the drawer's anchor-click capture closes it.
    click(r.navbar_link_projects);
    expect(r.query.navbar_mobileMenuPanel).toBeNull();
  });

  it("keeps the drawer open when toggling a link group", async () => {
    const r = await render(<NavbarMobileMenu items={createItemsWithLinkGroup()} trailingItems={[]} />, withRouter());

    click(r.navbar_mobileMenu);
    expect(r.navbar_mobileMenuPanel).toBeInTheDocument();

    // The link group trigger is a <button>, not an <a>, so toggling it must not close the drawer.
    click(r.navbar_linkGroup_trigger);
    expect(r.navbar_mobileMenuPanel).toBeInTheDocument();
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
