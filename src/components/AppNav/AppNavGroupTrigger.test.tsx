import { AppNavGroupTrigger } from "src/components/AppNav/AppNavGroupTrigger";
import { useTestIds } from "src/utils";
import { click, render, withRouter } from "src/utils/rtl";

describe("AppNavGroupTrigger", () => {
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

  it("uses the parent test-id scope when tid is spread from AppNavGroup", async () => {
    const r = await render(<ScopedHarness />, withRouter());

    expect(r.appNavGroup_trigger).toHaveTextContent("Budgets");
  });

  function Harness({ expanded, onClick = vi.fn() }: { expanded: boolean; onClick?: VoidFunction }) {
    return <AppNavGroupTrigger label="Budgets" navGroupId="nav-group-budgets" expanded={expanded} onClick={onClick} />;
  }

  function ScopedHarness() {
    const tid = useTestIds({}, "appNavGroup");

    return (
      <AppNavGroupTrigger {...tid} label="Budgets" navGroupId="nav-group-budgets" expanded={false} onClick={vi.fn()} />
    );
  }
});
