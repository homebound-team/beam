import { StepperTab } from "src/components/StepperTabs/StepperTab";
import { Tokens } from "src/Css";
import { click, render } from "src/utils/rtl";
import { vi } from "vitest";

describe("StepperTab", () => {
  it("renders the label", async () => {
    // Given a tab
    // When rendered
    const r = await render(
      <StepperTab label="Step Label" value="step" active={false} completed={false} onClick={vi.fn()} />,
    );
    // Then the label is displayed
    expect(r.stepperTab_step).toHaveTextContent("Step Label");
  });

  it("shows the check icon at full opacity when completed", async () => {
    // Given a completed tab
    // When rendered
    const r = await render(<StepperTab label="Step Label" value="step" active={false} completed onClick={vi.fn()} />);
    // Then the check is mounted and fully opaque
    expect(r.stepperTab_check).toBeInTheDocument();
    expect(r.stepperTab_check.parentElement).toHaveStyle({ opacity: "1" });
  });

  it("keeps the check icon at zero opacity when not completed", async () => {
    // Given a non-completed tab
    // When rendered
    const r = await render(
      <StepperTab label="Step Label" value="step" active={false} completed={false} onClick={vi.fn()} />,
    );
    // Then the check is mounted but hidden for the entrance animation
    expect(r.stepperTab_check).toBeInTheDocument();
    expect(r.stepperTab_check.parentElement).toHaveStyle({ opacity: "0" });
  });

  it("does not render the check icon when collapsed", async () => {
    // Given a collapsed tab
    // When rendered
    const r = await render(
      <StepperTab label="Step Label" value="step" active={false} completed collapsed onClick={vi.fn()} />,
    );
    // Then the check is not in the document
    expect(r.query.stepperTab_check).not.toBeInTheDocument();
  });

  it("invokes onClick with the tab's value", async () => {
    // Given a tab with a given value
    const onClick = vi.fn();
    const r = await render(<StepperTab label="Step Label" value="step2" active completed={false} onClick={onClick} />);
    // When clicked
    click(r.stepperTab_step2);
    // Then onClick is invoked with that value
    expect(onClick).toHaveBeenCalledWith("step2");
  });

  it("uses a primary indicator for an active-but-not-completed step, same as expanded", async () => {
    // Given an active, not-yet-completed, collapsed tab
    const r = await render(
      <StepperTab label="Step Label" value="step" active completed={false} collapsed onClick={vi.fn()} />,
    );
    // Then the indicator reads as primary, matching the expanded state's active-or-completed rule
    expect(r.stepperTab_indicator).toHaveStyle({ backgroundColor: Tokens.Primary });
    // And its indicator is 3px tall
    expect(r.stepperTab_indicator).toHaveStyle({ height: "3px" });
  });

  it("uses a default indicator for an inactive, not-completed step", async () => {
    // Given an inactive, not-completed, collapsed tab
    const r = await render(
      <StepperTab label="Step Label" value="step" active={false} completed={false} collapsed onClick={vi.fn()} />,
    );
    // Then the indicator reads as the default field border
    expect(r.stepperTab_indicator).toHaveStyle({ backgroundColor: Tokens.FieldBorderDefault });
    // And its indicator is 2px tall
    expect(r.stepperTab_indicator).toHaveStyle({ height: "2px" });
  });
});
