import { Button } from "src/components/Button";
import { useRightPane } from "src/components/Layout/RightPaneLayout/useRightPane";
import {
  beamFloatingRightOffsetVar,
  beamRightPaneWidthVar,
  documentScrollChromeWidth,
  documentScrollRightPaneWidth,
} from "src/layouts/layoutVars";
import { setViewport } from "src/tests/viewport";
import { click, clickAndWait, render, withRouter } from "src/utils/rtl";
import { FocusedFormLayout, FocusedFormLayoutProps } from "./FocusedFormLayout";

describe("FocusedFormLayout", () => {
  it("renders the header without stepper tabs and the form body", async () => {
    // Given a FocusedFormLayout with two sections
    const r = await render(<FocusedFormLayout {...baseProps()} />, withRouter());

    // Then the page title is in the header, there is no stepper, and the form title renders
    expect(r.focusedFormLayout_header).toHaveTextContent("Create Design Package");
    expect(r.query.header_stepperTabs).toBeNull();
    expect(r.formSectionLayout_title).toHaveTextContent("Link Design Package");
    expect(r.focusedFormLayout_body).toBeInTheDocument();
  });

  it("renders JumpLinks from section titles", async () => {
    // Given a FocusedFormLayout with two includable sections
    const r = await render(<FocusedFormLayout {...baseProps()} />, withRouter());

    // Then both section titles appear as jump links, and each section has an id
    expect(r.focusedFormLayout_jumpLinks).toHaveTextContent("Setup");
    expect(r.focusedFormLayout_jumpLinks).toHaveTextContent("Package Options");
    expect(r.formSection_section_0).toHaveAttribute("id", "setup");
    expect(r.formSection_section_1).toHaveAttribute("id", "packageOptions");
  });

  it("omits excludeJumpLink sections from the rail", async () => {
    // Given a third section marked excludeJumpLink
    const r = await render(
      <FocusedFormLayout
        {...baseProps({
          form: {
            title: "Link Design Package",
            sections: [
              { title: "Setup", fields: <div /> },
              { title: "Package Options", fields: <div /> },
              { title: "Internal", excludeJumpLink: true, fields: <div /> },
            ],
          },
        })}
      />,
      withRouter(),
    );

    // Then Internal is not in the rail but still renders as a section
    expect(r.focusedFormLayout_jumpLinks).not.toHaveTextContent("Internal");
    expect(r.formSection_section_2).toHaveAttribute("id", "internal");
  });

  it("hides the rail when withJumpLinks is false", async () => {
    // Given a multi-section form with withJumpLinks={false}
    const r = await render(<FocusedFormLayout {...baseProps({ withJumpLinks: false })} />, withRouter());

    // Then no jump-link rail renders
    expect(r.query.focusedFormLayout_jumpLinks).toBeNull();
  });

  it("hides the rail when fewer than two includable sections exist", async () => {
    // Given a form with one section
    const r = await render(
      <FocusedFormLayout
        {...baseProps({
          form: { title: "Link Design Package", sections: [{ title: "Setup", fields: <div /> }] },
        })}
      />,
      withRouter(),
    );

    // Then no jump-link rail renders
    expect(r.query.focusedFormLayout_jumpLinks).toBeNull();
  });

  it("hides the rail on mobile", async () => {
    // Given a mobile viewport
    setViewport("sm");
    const r = await render(<FocusedFormLayout {...baseProps()} />, withRouter());

    // Then the rail is hidden and CTAs move to the footer
    expect(r.query.focusedFormLayout_jumpLinks).toBeNull();
    expect(r.focusedFormLayout_footer).toContainElement(r.create);
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

  it("scrolls to the section when a JumpLink is clicked", async () => {
    // Given a focused form with jump links
    Element.prototype.scrollIntoView = vi.fn();
    const r = await render(<FocusedFormLayout {...baseProps()} />, withRouter());

    // When the first jump link is clicked
    click(r.focusedFormLayout_jumpLinks_link_0);

    // Then the matching section scrolls into view
    expect(document.getElementById("setup")!.scrollIntoView).toHaveBeenCalledTimes(1);
  });

  it("renders a right pane spacer when mode is overlay", async () => {
    // Given a FocusedFormLayout that opted into overlay (spacer) mode
    const r = await render(
      <FocusedFormLayout
        {...baseProps({
          withRightPane: { width: 280, mode: "overlay" },
          form: {
            title: "Link Design Package",
            sections: [
              { title: "Setup", fields: <OpenPaneButton /> },
              { title: "Package Options", fields: <div /> },
            ],
          },
        })}
      />,
      withRouter(),
    );

    // Then there is no spacer while the pane is closed
    expect(r.query.rightPaneSpacer).toBeNull();
    expect(r.query.rightPaneContent).toBeNull();

    // When the pane is opened
    await clickAndWait(r.openPane);

    // Then the pane renders and a spacer matching the pane width is rendered after the body
    expect(r.rightPaneContent).toBeInTheDocument();
    expect(r.rightPaneSpacer).toBeInTheDocument();
    expect(r.rightPaneSpacer).toHaveStyle({ width: documentScrollRightPaneWidth(280) });
    expect(r.documentScrollRightPaneLayout.style.getPropertyValue(beamRightPaneWidthVar)).toBe(
      documentScrollRightPaneWidth(280),
    );
    expect(document.documentElement.style.getPropertyValue(beamFloatingRightOffsetVar)).toBe(
      documentScrollRightPaneWidth(280),
    );
  });

  it("default auto mode pushes on a typical desktop chrome without an empty spacer", async () => {
    // Given default withRightPane (auto) on lg chrome where the sm shell collides but can push
    const r = await render(
      <FocusedFormLayout
        {...baseProps({
          withRightPane: 280,
          form: {
            title: "Link Design Package",
            sections: [
              { title: "Setup", fields: <OpenPaneButton /> },
              { title: "Package Options", fields: <div /> },
            ],
          },
        })}
      />,
      withRouter(),
    );

    // When the pane is opened
    await clickAndWait(r.openPane);

    // Then push constrains the column; no overlay spacer
    expect(r.rightPaneContent).toBeInTheDocument();
    expect(r.query.rightPaneSpacer).toBeNull();
    expect(r.rightPaneSpacer_push).toBeInTheDocument();
    expect(document.documentElement.style.getPropertyValue(beamFloatingRightOffsetVar)).toBe(
      documentScrollRightPaneWidth(280),
    );
  });

  it("pins the header to the viewport when the right pane is open", async () => {
    // Given a FocusedFormLayout that opted into the right pane
    const r = await render(
      <FocusedFormLayout
        {...baseProps({
          withRightPane: { width: 280, mode: "overlay" },
          form: {
            title: "Link Design Package",
            sections: [
              { title: "Setup", fields: <OpenPaneButton /> },
              { title: "Package Options", fields: <div /> },
            ],
          },
        })}
      />,
      withRouter(),
    );

    // When the pane is opened
    await clickAndWait(r.openPane);

    // Then the header is viewport-fixed at chrome width (does not ride the horizontal spacer)
    expect(r.focusedFormLayout_header).toHaveStyle({
      position: "fixed",
      width: documentScrollChromeWidth(),
    });
  });

  it("does not wrap in DocumentScrollRightPaneLayout without withRightPane", async () => {
    // Given a FocusedFormLayout that did not opt into the right pane
    const r = await render(
      <FocusedFormLayout
        {...baseProps({
          form: {
            title: "Link Design Package",
            sections: [
              { title: "Setup", fields: <OpenPaneButton /> },
              { title: "Package Options", fields: <div /> },
            ],
          },
        })}
      />,
      withRouter(),
    );

    // When the pane context is opened
    await clickAndWait(r.openPane);

    // Then FocusedFormLayout does not host the document-scroll pane wrapper
    expect(r.query.documentScrollRightPaneLayout).toBeNull();
    expect(r.query.rightPaneContent).toBeNull();
    expect(r.query.rightPaneSpacer).toBeNull();
  });
});

function baseProps(overrides: Partial<FocusedFormLayoutProps> = {}): FocusedFormLayoutProps {
  const {
    form = {
      title: "Link Design Package",
      sections: [
        { title: "Setup", fields: <div /> },
        { title: "Package Options", fields: <div /> },
      ],
    },
    ...rest
  } = overrides;
  return {
    title: "Create Design Package",
    onCancel: () => {},
    completeLabel: "Create",
    onComplete: () => {},
    isValid: true,
    form,
    ...rest,
  };
}

function OpenPaneButton() {
  const { openRightPane } = useRightPane();
  return <Button label="Open pane" onClick={() => openRightPane({ content: <div>Detail</div> })} />;
}
