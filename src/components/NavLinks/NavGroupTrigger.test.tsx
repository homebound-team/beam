import { NavGroupTrigger } from "src/components/NavLinks/NavGroupTrigger";
import { useTestIds } from "src/utils";
import { click, render, withRouter } from "src/utils/rtl";

describe("NavGroupTrigger", () => {
  it("exposes disclosure semantics and label", async () => {
    const r = await render(<Harness expanded={false} />, withRouter());
    const trigger = r.getByRole("button", { name: "Budgets" });

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveAttribute("aria-controls", "nav-group-budgets");
  });

  it("calls onClick when pressed", async () => {
    const onClick = vi.fn();
    const r = await render(<Harness expanded={false} onClick={onClick} />, withRouter());

    click(r.getByRole("button", { name: "Budgets" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("reflects expanded in aria-expanded", async () => {
    const r = await render(<Harness expanded={true} />, withRouter());

    expect(r.getByRole("button", { name: "Budgets" })).toHaveAttribute("aria-expanded", "true");
  });

  it("uses the parent test-id scope when tid is spread from NavGroup", async () => {
    const r = await render(<ScopedHarness />, withRouter());

    expect(r.navGroup_trigger).toHaveTextContent("Budgets");
  });

  function Harness({ expanded, onClick = vi.fn() }: { expanded: boolean; onClick?: VoidFunction }) {
    return <NavGroupTrigger label="Budgets" navGroupId="nav-group-budgets" expanded={expanded} onClick={onClick} />;
  }

  function ScopedHarness() {
    const tid = useTestIds({}, "navGroup");

    return (
      <NavGroupTrigger {...tid} label="Budgets" navGroupId="nav-group-budgets" expanded={false} onClick={vi.fn()} />
    );
  }
});
