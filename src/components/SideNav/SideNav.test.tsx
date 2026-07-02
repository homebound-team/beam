import { ReactNode } from "react";
import type { AppNavItem } from "src/components/AppNav/appNavTypes";
import { APP_NAV_EXPANDED_LINK_GROUPS_STORAGE_KEY } from "src/components/AppNav/useAppNavGroupExpanded";
import { SideNav } from "src/components/SideNav/SideNav";
import { SideNavLayoutProvider, SideNavLayoutState } from "src/layouts/SideNavLayout/SideNavLayoutContext";
import { click, render, withRouter } from "src/utils/rtl";

describe("SideNav", () => {
  it("renders top, items, and footer when expanded", async () => {
    const items: AppNavItem[] = [
      { label: "Dashboard", icon: "columns", onClick: "/", active: true },
      { label: "Reports", icon: "search", onClick: "/reports" },
      {
        label: "Workspace",
        items: [
          { label: "Members", icon: "comment", onClick: "/members" },
          { label: "Settings", icon: "pencil", onClick: "/settings" },
        ],
      },
    ];
    const r = await render(
      withState("expanded", <SideNav top={<div>Brand</div>} items={items} footer={<div>User Menu</div>} />),
      withRouter(),
    );

    expect(r.sideNav_top).toHaveTextContent("Brand");
    expect(r.sideNav_footer).toHaveTextContent("User Menu");
    expect(r.sideNav_items).toHaveTextContent("Dashboard");
    expect(r.sideNav_items).toHaveTextContent("Members");
    expect(r.appNav_linkGroup_trigger).toHaveTextContent("Workspace");
    expect(r.getByText("Dashboard").closest("a")).toHaveAttribute("aria-current", "page");
  });

  it("hides labels and section headings when collapsed", async () => {
    const items: AppNavItem[] = [
      { label: "Dashboard", icon: "columns", onClick: "/", active: true },
      { label: "Reports", icon: "search", onClick: "/reports" },
      {
        section: true,
        label: "Workspace",
        items: [
          { label: "Members", icon: "comment", onClick: "/members" },
          { label: "Settings", icon: "pencil", onClick: "/settings" },
        ],
      },
    ];
    const r = await render(withState("collapse", <SideNav items={items} />), withRouter());

    expect(r.query.sideNav_section_label).toBeNull();
    expect(r.appNav_link_dashboard).toHaveTextContent("Dashboard");
    expect(r.appNav_link_reports).toHaveTextContent("Reports");
  });

  it("renders a top-level link group and toggles aria-expanded on click", async () => {
    const items: AppNavItem[] = [
      {
        label: "Budgets",
        items: [
          { label: "Budget", onClick: "/budget" },
          { label: "POs", onClick: "/pos" },
        ],
      },
    ];
    const r = await render(withState("expanded", <SideNav items={items} />), withRouter());

    expect(r.appNav_linkGroup_trigger).toHaveTextContent("Budgets");
    expect(r.appNav_linkGroup_trigger).toHaveAttribute("aria-expanded", "false");

    click(r.appNav_linkGroup_trigger);

    expect(r.appNav_linkGroup_trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("renders a link group nested in a section", async () => {
    const items: AppNavItem[] = [
      {
        section: true,
        label: "Workspace",
        items: [
          { label: "Members", onClick: "/members" },
          {
            label: "Settings",
            items: [
              { label: "General", onClick: "/settings/general" },
              { label: "Billing", onClick: "/settings/billing" },
            ],
          },
        ],
      },
    ];
    const r = await render(withState("expanded", <SideNav items={items} />), withRouter());

    expect(r.appNav_section_label).toHaveTextContent("Workspace");
    expect(r.getByText("Members")).toBeInTheDocument();
    expect(r.appNav_section_linkGroup_trigger).toHaveTextContent("Settings");
  });

  it("auto-expands a link group when one of its links is active", async () => {
    const items: AppNavItem[] = [
      {
        label: "Budgets",
        items: [
          { label: "Budget", onClick: "/budget", active: true },
          { label: "POs", onClick: "/pos" },
        ],
      },
    ];
    const r = await render(withState("expanded", <SideNav items={items} />), withRouter());

    expect(r.appNav_linkGroup_trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("persists toggled state to localStorage under the link group label", async () => {
    const items: AppNavItem[] = [
      {
        label: "Budgets",
        items: [{ label: "Budget", onClick: "/budget" }],
      },
    ];
    const r = await render(withState("expanded", <SideNav items={items} />), withRouter());

    click(r.appNav_linkGroup_trigger);

    const stored = JSON.parse(window.localStorage.getItem(APP_NAV_EXPANDED_LINK_GROUPS_STORAGE_KEY) ?? "{}");
    expect(stored).toEqual({ Budgets: true });
  });

  it("prefers stored state over active-link auto-expand", async () => {
    window.localStorage.setItem(APP_NAV_EXPANDED_LINK_GROUPS_STORAGE_KEY, JSON.stringify({ Budgets: false }));

    const items: AppNavItem[] = [
      {
        label: "Budgets",
        items: [
          { label: "Budget", onClick: "/budget", active: true },
          { label: "POs", onClick: "/pos" },
        ],
      },
    ];
    const r = await render(withState("expanded", <SideNav items={items} />), withRouter());

    expect(r.appNav_linkGroup_trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("hides the items list when collapsed and not every item has an icon", async () => {
    const items: AppNavItem[] = [
      { label: "Dashboard", onClick: "/" },
      { label: "Reports", icon: "search", onClick: "/reports" },
    ];
    const r = await render(withState("collapse", <SideNav items={items} />), withRouter());

    expect(r.sideNav_items).toBeEmptyDOMElement();
  });

  it("falls back to flat icons (no disclosure) for link groups when the rail is icon-only", async () => {
    const items: AppNavItem[] = [
      {
        label: "Budgets",
        items: [
          { label: "Budget", icon: "search", onClick: "/budget" },
          { label: "POs", icon: "search", onClick: "/pos" },
        ],
      },
    ];
    const r = await render(withState("collapse", <SideNav items={items} />), withRouter());

    expect(r.query.appNav_linkGroup_trigger).toBeNull();
  });

  it("renders an unlabeled section without a section heading", async () => {
    const items: AppNavItem[] = [
      {
        section: true,
        items: [{ label: "Help", onClick: "/help" }],
      },
    ];
    const r = await render(withState("expanded", <SideNav items={items} />), withRouter());

    expect(r.query.sideNav_section_label).toBeNull();
    expect(r.getByText("Help")).toBeInTheDocument();
  });

  function withState(state: SideNavLayoutState, children: ReactNode) {
    return <SideNavLayoutProvider defaultNavState={state}>{children}</SideNavLayoutProvider>;
  }
});
