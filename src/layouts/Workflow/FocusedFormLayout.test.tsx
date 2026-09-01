import { FormSectionLayout } from "src/layouts/FormSectionLayout/FormSectionLayout";
import { setViewport } from "src/tests/viewport";
import { click, render, withRouter } from "src/utils/rtl";
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

  it("disables Create when isValid is false, and enables it once valid", async () => {
    // Given an invalid focused form
    const r = await render(<FocusedFormLayout {...baseProps({ isValid: false })} />, withRouter());

    // Then Create is disabled
    expect(r.create).toBeDisabled();

    // When it becomes valid
    r.rerender(<FocusedFormLayout {...baseProps({ isValid: true })} />);

    // Then Create is enabled
    expect(r.create).not.toBeDisabled();
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
});

function baseProps(overrides: Partial<FocusedFormLayoutProps> = {}): FocusedFormLayoutProps {
  const { children, ...rest } = overrides;
  return {
    title: "Create Design Package",
    onCancel: () => {},
    completeLabel: "Create",
    onComplete: () => {},
    isValid: true,
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
