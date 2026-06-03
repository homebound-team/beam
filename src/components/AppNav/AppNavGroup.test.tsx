import { AppNavGroupView } from "src/components/AppNav/AppNavGroup";
import type { AppNavGroup } from "src/components/AppNav/appNavTypes";
import { click, render, withRouter } from "src/utils/rtl";

describe("AppNavGroupView", () => {
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
    expect(r.linkGroup_link_budget).toHaveTextContent("Budget");
    expect(r.linkGroup_link_pOs).toHaveTextContent("POs");
  });

  function Harness({ panelCollapsed = false }: { panelCollapsed?: boolean }) {
    return <AppNavGroupView linkGroup={createLinkGroup()} panelCollapsed={panelCollapsed} />;
  }

  function createLinkGroup(): AppNavGroup {
    return {
      label: "Budgets",
      items: [
        { label: "Budget", onClick: "/budget", icon: "search" },
        { label: "POs", onClick: "/pos", icon: "search" },
      ],
    };
  }
});
