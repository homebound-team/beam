import { Button } from "src/components/Button";
import { useRightPaneActions } from "src/components/Layout/RightPaneLayout/useRightPane";
import { FormSectionLayout } from "src/layouts/FormSectionLayout/FormSectionLayout";
import {
  beamFloatingRightOffsetVar,
  documentScrollChromeWidth,
  documentScrollRightPaneWidth,
} from "src/layouts/layoutVars";
import { setViewport } from "src/tests/viewport";
import { click, clickAndWait, render, withRouter } from "src/utils/rtl";
import { FocusedFormLayout, FocusedFormLayoutProps } from "./FocusedFormLayout";

describe("FocusedFormLayout", () => {
  it("renders the header without stepper tabs and the body", async () => {
    // Given a FocusedFormLayout with a FormSectionLayout body
    const r = await render(<FocusedFormLayout {...baseProps()} />, withRouter());

    // Then the page title is in the header, there is no stepper, and the form title renders
    expect(r.focusedFormLayout_header).toHaveTextContent("Create Design Package");
    expect(r.query.header_stepperTabs).toBeNull();
    expect(r.formSectionLayout_title).toHaveTextContent("Link Design Package");
    expect(r.focusedFormLayout_body).toBeInTheDocument();
  });

  it("disables Create when primaryDisabled is true, and enables it once omitted", async () => {
    // Given a focused form with primaryDisabled
    const r = await render(<FocusedFormLayout {...baseProps({ primaryDisabled: true })} />, withRouter());

    // Then Create is disabled
    expect(r.create).toBeDisabled();

    // When primaryDisabled is omitted
    r.rerender(<FocusedFormLayout {...baseProps()} />);

    // Then Create is enabled
    expect(r.create).not.toBeDisabled();
  });

  it("disables Create without a tooltip when primaryDisabled is true", async () => {
    // Given a focused form with primaryDisabled true
    const r = await render(<FocusedFormLayout {...baseProps({ primaryDisabled: true })} />, withRouter());

    // Then Create is disabled and there is no tooltip
    expect(r.create).toBeDisabled();
    expect(r.query.tooltip).toBeNull();
  });

  it("shows a Beam tooltip on disabled Create when primaryDisabled is a reason", async () => {
    // Given a focused form with a primaryDisabled reason
    const r = await render(
      <FocusedFormLayout {...baseProps({ primaryDisabled: "Fill all required fields to continue." })} />,
      withRouter(),
    );

    // Then Create is disabled and wrapped in Beam's tooltip
    expect(r.create).toBeDisabled();
    expect(r.tooltip).toHaveAttribute("title", "Fill all required fields to continue.");

    // When primaryDisabled is omitted
    r.rerender(<FocusedFormLayout {...baseProps()} />);

    // Then Create is enabled and the tooltip is gone
    expect(r.create).not.toBeDisabled();
    expect(r.query.tooltip).toBeNull();
  });

  it("renders Cancel and Create without Continue", async () => {
    // Given a focused form on desktop
    const r = await render(<FocusedFormLayout {...baseProps()} />, withRouter());

    // Then the header has Cancel and Create, not Continue
    expect(r.focusedFormLayout_header).toHaveTextContent("Cancel");
    expect(r.focusedFormLayout_header).toHaveTextContent("Create");
    expect(r.query.continue).toBeNull();
  });

  it("calls onComplete when Create is clicked", async () => {
    // Given a valid focused form
    const onComplete = vi.fn();
    const r = await render(<FocusedFormLayout {...baseProps({ onComplete })} />, withRouter());

    // When Create is clicked
    click(r.create);

    // Then onComplete is called
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("calls onCancel when Cancel is clicked and the form is clean", async () => {
    // Given a focused form that reports not dirty
    const onCancel = vi.fn();
    const r = await render(<FocusedFormLayout {...baseProps({ onCancel, isDirty: () => false })} />, withRouter());

    // When Cancel is clicked
    click(r.cancel);

    // Then onCancel is called without a confirm modal
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(r.query.discardChanges).toBeNull();
  });

  it("confirms before calling onCancel when Cancel is clicked and the form is dirty", async () => {
    // Given a focused form that reports dirty
    const onCancel = vi.fn();
    const r = await render(<FocusedFormLayout {...baseProps({ onCancel, isDirty: () => true })} />, withRouter());

    // When Cancel is clicked
    click(r.cancel);

    // Then a confirm modal appears and onCancel is not called yet
    expect(r.discardChanges).toBeInTheDocument();
    expect(onCancel).not.toHaveBeenCalled();

    // When Discard Changes is clicked
    click(r.discardChanges);

    // Then onCancel is called
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("calls onSaveAndExit when Save & Exit is clicked", async () => {
    // Given a focused form with onSaveAndExit
    const onSaveAndExit = vi.fn();
    const r = await render(<FocusedFormLayout {...baseProps({ onSaveAndExit })} />, withRouter());

    // When Save & Exit is clicked
    click(r.saveExit);

    // Then onSaveAndExit is called
    expect(onSaveAndExit).toHaveBeenCalledTimes(1);
  });

  it("moves CTAs to the footer on mobile", async () => {
    // Given a mobile viewport
    setViewport("sm");
    const r = await render(<FocusedFormLayout {...baseProps()} />, withRouter());

    // Then Create is in the footer
    expect(r.focusedFormLayout_footer).toContainElement(r.create);
  });

  it("pins the header to the viewport when the body's right pane is open", async () => {
    // Given a FocusedFormLayout whose form body hosts a right pane (auto → push on typical chrome)
    const r = await render(
      <FocusedFormLayout
        {...baseProps({
          children: (
            <FormSectionLayout
              withJumpLinks
              withRightPane={280}
              title="Link Design Package"
              sections={[
                { title: "Setup", fields: <OpenPaneButton /> },
                { title: "Package Options", fields: <div /> },
              ]}
            />
          ),
        })}
      />,
      withRouter(),
    );

    // When the pane is opened
    await clickAndWait(r.openPane);

    // Then the header is viewport-fixed at chrome width
    expect(r.focusedFormLayout_header).toHaveStyle({
      position: "fixed",
      width: documentScrollChromeWidth(),
    });
    expect(document.documentElement.style.getPropertyValue(beamFloatingRightOffsetVar)).toBe(
      documentScrollRightPaneWidth(280),
    );
  });
});

function baseProps(overrides: Partial<FocusedFormLayoutProps> = {}): FocusedFormLayoutProps {
  const { children, ...rest } = overrides;
  return {
    title: "Create Design Package",
    onCancel: () => {},
    completeLabel: "Create",
    onComplete: () => {},
    children: children ?? (
      <FormSectionLayout
        title="Link Design Package"
        sections={[
          { title: "Setup", fields: <div /> },
          { title: "Package Options", fields: <div /> },
        ]}
      />
    ),
    ...rest,
  };
}

function OpenPaneButton() {
  const { openRightPane } = useRightPaneActions();
  return <Button label="Open pane" onClick={() => openRightPane({ content: <div>Detail</div> })} />;
}
