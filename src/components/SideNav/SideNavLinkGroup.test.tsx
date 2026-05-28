import { SideNavLinkGroupView } from "src/components/SideNav/SideNavLinkGroup";
import type { SideNavLinkGroup } from "src/components/SideNav/sideNavTypes";
import { click, render, withRouter } from "src/utils/rtl";

describe("SideNavLinkGroupView", () => {
  afterEach(() => {
    localStorage.clear();
  });

  it("toggles aria-expanded on click", async () => {
    const r = await render(<Harness />, withRouter());

    expect(r.linkGroup_trigger).toHaveAttribute("aria-expanded", "false");

    click(r.linkGroup_trigger);

    expect(r.linkGroup_trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("renders child links as icon-only rows when the rail is collapsed", async () => {
    const r = await render(<Harness panelCollapsed />, withRouter());

    expect(r.queryByTestId("linkGroup_trigger")).toBeNull();
    expect(r.linkGroup_link_0).toHaveTextContent("Budget");
    expect(r.linkGroup_link_1).toHaveTextContent("POs");
  });

  function Harness({ panelCollapsed = false }: { panelCollapsed?: boolean }) {
    return <SideNavLinkGroupView linkGroup={createLinkGroup()} panelCollapsed={panelCollapsed} />;
  }

  function createLinkGroup(): SideNavLinkGroup {
    return {
      label: "Budgets",
      links: [
        { label: "Budget", onClick: "/budget", icon: "search" },
        { label: "POs", onClick: "/pos", icon: "search" },
      ],
    };
  }
});
