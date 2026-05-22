import { useState } from "react";
import { NavGroup, NavGroupLink } from "src/components/NavLinks/NavGroup";
import { click, render, withRouter } from "src/utils/rtl";

describe("NavGroup", () => {
  it("toggles disclosure when the consumer updates expanded", async () => {
    const r = await render(<TestComponent />, withRouter());

    expect(r.navGroup_trigger).toHaveAttribute("aria-expanded", "false");
    expect(r.navGroup_panel).toHaveAttribute("aria-hidden", "true");
    expect(r.navGroup_panel).toHaveAttribute("id", "nav-group-budgets");
    expect(r.navGroup_trigger).toHaveAttribute("aria-controls", "nav-group-budgets");

    click(r.navGroup_trigger);
    expect(r.navGroup_trigger).toHaveAttribute("aria-expanded", "true");
    expect(r.navGroup_panel).toHaveAttribute("aria-hidden", "false");

    click(r.navGroup_trigger);
    expect(r.navGroup_trigger).toHaveAttribute("aria-expanded", "false");
    expect(r.navGroup_panel).toHaveAttribute("aria-hidden", "true");
  });

  it("renders expanded when the consumer passes expanded={true}", async () => {
    const r = await render(<TestComponent initial />, withRouter());

    expect(r.navGroup_trigger).toHaveAttribute("aria-expanded", "true");
    expect(r.navGroup_panel).toHaveAttribute("aria-hidden", "false");

    click(r.navGroup_trigger);
    expect(r.navGroup_trigger).toHaveAttribute("aria-expanded", "false");
    expect(r.navGroup_panel).toHaveAttribute("aria-hidden", "true");
  });

  it("calls onClick without updating expanded until the consumer does", async () => {
    const onClick = vi.fn();
    const r = await render(
      <NavGroup label="Budgets" links={createDefaultLinks().slice(0, 1)} expanded={true} onClick={onClick} />,
      withRouter(),
    );

    click(r.navGroup_trigger);

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(r.navGroup_trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("renders a NavLink for each link", async () => {
    const r = await render(<TestComponent initial />, withRouter());

    expect(r.navGroup_link_budget).toHaveTextContent("Budget");
    expect(r.getByTestId("navGroup_link_p-os")).toHaveTextContent("POs");
  });

  function createDefaultLinks(): NavGroupLink[] {
    return [
      { label: "Budget", href: "/budget" },
      { label: "POs", href: "/pos" },
    ];
  }

  function TestComponent({ initial = false }: { initial?: boolean }) {
    const [expanded, setExpanded] = useState(initial);
    return (
      <NavGroup
        label="Budgets"
        links={createDefaultLinks()}
        expanded={expanded}
        onClick={() => setExpanded((prev) => !prev)}
      />
    );
  }
});
