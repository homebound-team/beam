import { StepperTab } from "src/components/StepperTabs/StepperTab";
import { Palette } from "src/Css";
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

  it("shows the check icon when completed", async () => {
    // Given a completed tab
    // When rendered
    const r = await render(
      <StepperTab label="Step Label" value="step" active={false} completed={true} onClick={vi.fn()} />,
    );
    // Then the check icon is shown
    expect(r.query.stepperTab_check).toBeInTheDocument();
  });

  it("does not show the check icon when not completed", async () => {
    // Given a non-completed tab
    // When rendered
    const r = await render(
      <StepperTab label="Step Label" value="step" active={false} completed={false} onClick={vi.fn()} />,
    );
    // Then the check icon is not shown
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

  it("does not show the check icon for a completed step that hasn't been visited", async () => {
    // Given a completed tab that has not been visited
    const r = await render(
      <StepperTab label="Step Label" value="step" active={false} completed={true} visited={false} onClick={vi.fn()} />,
    );
    // Then the check icon is not shown, since it can't visually read as done until visited
    expect(r.query.stepperTab_check).not.toBeInTheDocument();
  });

  it("shows blue styling once visited, even before completed", async () => {
    // Given a visited but not-yet-completed tab
    const r = await render(
      <StepperTab label="Step Label" value="step" active={false} completed={false} visited={true} onClick={vi.fn()} />,
    );
    // Then no check icon renders, but the border reads as visited (blue)
    expect(r.query.stepperTab_check).not.toBeInTheDocument();
    expect(r.stepperTab_step).toHaveStyle({ borderBottomColor: Palette.Blue600 });
  });

  it("uses grey styling for a step that has not been visited", async () => {
    // Given an unvisited tab
    const r = await render(
      <StepperTab label="Step Label" value="step" active={false} completed={false} visited={false} onClick={vi.fn()} />,
    );
    // Then the border reads as not-yet-reached (grey)
    expect(r.stepperTab_step).toHaveStyle({ borderBottomColor: Palette.Gray300 });
  });

  it("collapsed border color depends only on visited, not completed/active", async () => {
    // Given a completed, active, but unvisited collapsed tab
    const notVisited = await render(
      <StepperTab label="Step Label" value="s1" active completed visited={false} collapsed onClick={vi.fn()} />,
    );
    // Then it still reads as grey (unvisited)
    expect(notVisited.stepperTab_s1).toHaveStyle({ borderBottomColor: Palette.Gray300 });

    // Given an inactive, not-completed, but visited collapsed tab
    const visited = await render(
      <StepperTab label="Step Label" value="s2" active={false} completed={false} visited collapsed onClick={vi.fn()} />,
    );
    // Then it reads as blue (visited)
    expect(visited.stepperTab_s2).toHaveStyle({ borderBottomColor: Palette.Blue600 });
  });
});
