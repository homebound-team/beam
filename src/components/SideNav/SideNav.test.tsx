import { ReactNode } from "react";
import { SideNav, SideNavItem } from "src/components/SideNav/SideNav";
import { SIDE_NAV_EXPANDED_LINK_GROUPS_STORAGE_KEY } from "src/components/SideNav/useSideNavLinkGroupExpanded";
import { SideNavLayoutProvider, SideNavLayoutState } from "src/layouts/SideNavLayout/SideNavLayoutContext";
import { click, render, withRouter } from "src/utils/rtl";

describe("SideNav", () => {
  afterEach(() => {
    window.localStorage.removeItem(SIDE_NAV_EXPANDED_LINK_GROUPS_STORAGE_KEY);
  });

  it("renders top, items, and footer when expanded", async () => {
    const r = await render(
      withState("expanded", <SideNav top={<div>Brand</div>} items={createItems()} footer={<div>User Menu</div>} />),
      withRouter(),
    );

    expect(r.sideNav_top).toHaveTextContent("Brand");
    expect(r.sideNav_footer).toHaveTextContent("User Menu");
    expect(r.sideNav_items).toHaveTextContent("Dashboard");
    expect(r.sideNav_items).toHaveTextContent("Members");
    expect(r.sideNav_section_label).toHaveTextContent("Workspace");
    expect(r.getByText("Dashboard").closest("a")).toHaveAttribute("aria-current", "page");
  });

  it("hides labels and section headings when collapsed", async () => {
    const r = await render(withState("collapse", <SideNav items={createItems()} />), withRouter());

    expect(r.queryByTestId("sideNav_section_label")).toBeNull();
    expect(r.sideNav_link_0).toHaveTextContent("Dashboard");
    expect(r.sideNav_link_1).toHaveTextContent("Reports");
  });

  it("renders a top-level link group and toggles aria-expanded on click", async () => {
    const r = await render(withState("expanded", <SideNav items={createLinkGroupItems()} />), withRouter());

    expect(r.sideNav_linkGroup_trigger).toHaveTextContent("Budgets");
    expect(r.sideNav_linkGroup_trigger).toHaveAttribute("aria-expanded", "false");

    click(r.sideNav_linkGroup_trigger);

    expect(r.sideNav_linkGroup_trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("renders a link group nested in a section", async () => {
    const r = await render(withState("expanded", <SideNav items={createNestedLinkGroupItems()} />), withRouter());

    expect(r.sideNav_section_label).toHaveTextContent("Workspace");
    expect(r.getByText("Members")).toBeInTheDocument();
    expect(r.sideNav_section_linkGroup_trigger).toHaveTextContent("Settings");
  });

  it("auto-expands a link group when one of its links is active", async () => {
    const r = await render(withState("expanded", <SideNav items={createActiveLinkGroupItems()} />), withRouter());

    expect(r.sideNav_linkGroup_trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("persists toggled state to localStorage under the link group label", async () => {
    const r = await render(withState("expanded", <SideNav items={createSingleLinkGroupItems()} />), withRouter());

    click(r.sideNav_linkGroup_trigger);

    const stored = JSON.parse(window.localStorage.getItem(SIDE_NAV_EXPANDED_LINK_GROUPS_STORAGE_KEY) ?? "{}");
    expect(stored).toEqual({ Budgets: true });
  });

  it("prefers stored state over active-link auto-expand", async () => {
    window.localStorage.setItem(SIDE_NAV_EXPANDED_LINK_GROUPS_STORAGE_KEY, JSON.stringify({ Budgets: false }));

    const r = await render(withState("expanded", <SideNav items={createActiveLinkGroupItems()} />), withRouter());

    expect(r.sideNav_linkGroup_trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("hides the items list when collapsed and not every item has an icon", async () => {
    const r = await render(withState("collapse", <SideNav items={createMixedIconItems()} />), withRouter());

    expect(r.sideNav_items).toBeEmptyDOMElement();
  });

  it("falls back to flat icons (no disclosure) for link groups when the rail is icon-only", async () => {
    const r = await render(withState("collapse", <SideNav items={createIconLinkGroupItems()} />), withRouter());

    expect(r.queryByTestId("sideNav_linkGroup_trigger")).toBeNull();
  });

  it("renders an unlabeled section without a section heading", async () => {
    const r = await render(withState("expanded", <SideNav items={createUnlabeledSectionItems()} />), withRouter());

    expect(r.queryByTestId("sideNav_section_label")).toBeNull();
    expect(r.getByText("Help")).toBeInTheDocument();
  });

  function withState(state: SideNavLayoutState, children: ReactNode) {
    return <SideNavLayoutProvider defaultNavState={state}>{children}</SideNavLayoutProvider>;
  }

  function createItems(): SideNavItem[] {
    return [
      { label: "Dashboard", icon: "kanban", onClick: "/", active: true },
      { label: "Reports", icon: "search", onClick: "/reports" },
      {
        label: "Workspace",
        items: [
          { label: "Members", icon: "comment", onClick: "/members" },
          { label: "Settings", icon: "pencil", onClick: "/settings" },
        ],
      },
    ];
  }

  function createLinkGroupItems(): SideNavItem[] {
    return [
      {
        label: "Budgets",
        links: [
          { label: "Budget", onClick: "/budget" },
          { label: "POs", onClick: "/pos" },
        ],
      },
    ];
  }

  function createNestedLinkGroupItems(): SideNavItem[] {
    return [
      {
        label: "Workspace",
        items: [
          { label: "Members", onClick: "/members" },
          {
            label: "Settings",
            links: [
              { label: "General", onClick: "/settings/general" },
              { label: "Billing", onClick: "/settings/billing" },
            ],
          },
        ],
      },
    ];
  }

  function createActiveLinkGroupItems(): SideNavItem[] {
    return [
      {
        label: "Budgets",
        links: [
          { label: "Budget", onClick: "/budget", active: true },
          { label: "POs", onClick: "/pos" },
        ],
      },
    ];
  }

  function createSingleLinkGroupItems(): SideNavItem[] {
    return [
      {
        label: "Budgets",
        links: [{ label: "Budget", onClick: "/budget" }],
      },
    ];
  }

  function createMixedIconItems(): SideNavItem[] {
    return [
      { label: "Dashboard", onClick: "/" },
      { label: "Reports", icon: "search", onClick: "/reports" },
    ];
  }

  function createIconLinkGroupItems(): SideNavItem[] {
    return [
      {
        label: "Budgets",
        links: [
          { label: "Budget", icon: "search", onClick: "/budget" },
          { label: "POs", icon: "search", onClick: "/pos" },
        ],
      },
    ];
  }

  function createUnlabeledSectionItems(): SideNavItem[] {
    return [
      {
        items: [{ label: "Help", onClick: "/help" }],
      },
    ];
  }
});
