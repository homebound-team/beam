import { SideNavItems } from "src/components/SideNav/SideNavItems";
import type { SideNavItem } from "src/components/SideNav/sideNavTypes";
import { render, withRouter } from "src/utils/rtl";

describe("SideNavItems", () => {
  it("renders links, link groups, and sections under the default prefix", async () => {
    const r = await render(<SideNavItems items={createItems()} panelCollapsed={false} />, withRouter());

    expect(r.sideNav_link).toBeInTheDocument();
    expect(r.sideNav_linkGroup_trigger).toHaveTextContent("Budgets");
    expect(r.sideNav_section_label).toHaveTextContent("Workspace");
    expect(r.getByText("Members")).toBeInTheDocument();
  });

  it("renders nested sections inside a section scope", async () => {
    const r = await render(<SideNavItems items={[createNestedSection()]} panelCollapsed={false} />, withRouter());

    expect(r.sideNav_section_label).toHaveTextContent("Outer");
    expect(r.sideNav_section_section_label).toHaveTextContent("Inner");
    expect(r.getByText("Deep")).toBeInTheDocument();
  });

  function createNestedSection(): SideNavItem {
    return {
      label: "Outer",
      items: [
        {
          label: "Inner",
          items: [{ label: "Deep", href: "/deep" }],
        },
      ],
    };
  }

  function createItems(): SideNavItem[] {
    return [
      { label: "Dashboard", href: "/" },
      {
        label: "Budgets",
        links: [{ label: "Budget", href: "/budget" }],
      },
      {
        label: "Workspace",
        items: [{ label: "Members", href: "/members" }],
      },
    ];
  }
});
