import { Button } from "src/components/Button";
import { useRightPaneActions } from "src/components/Layout/RightPaneLayout/useRightPane";
import { FormSectionLayout } from "src/layouts/FormSectionLayout/FormSectionLayout";
import { jumpLinksRailReservation } from "src/layouts/FormSectionLayout/JumpLinksRail";
import { beamFloatingRightOffsetVar, documentScrollRightPaneWidth } from "src/layouts/layoutVars";
import { setViewport } from "src/tests/viewport";
import { click, clickAndWait, render } from "src/utils/rtl";

describe("FormSectionLayout", () => {
  it("renders the form title, description, and delegates sections to FormSection", async () => {
    // Given a FormSectionLayout with a title, description, and two sections
    // When rendered
    const r = await render(
      <FormSectionLayout
        title="Trade Partners"
        description="Set up trade partner assignments for this project"
        sections={[
          { title: "General Contractor", fields: <div data-testid="gcFields" /> },
          { title: "Sub-Contractors", fields: <div data-testid="subFields" /> },
        ]}
      />,
    );
    // Then the form-level title/description render
    expect(r.formSectionLayout_title).toHaveTextContent("Trade Partners");
    expect(r.formSectionLayout_title.tagName).toBe("H2");
    expect(r.formSectionLayout_description).toHaveTextContent("Set up trade partner assignments for this project");
    // And each section is delegated to FormSection, rendering its own content
    expect(r.gcFields).toBeInTheDocument();
    expect(r.subFields).toBeInTheDocument();
  });

  it("omits the description and actions slots when not provided", async () => {
    // Given a FormSectionLayout with no description or actions
    // When rendered
    const r = await render(<FormSectionLayout title="Trade Partners" />);
    // Then neither slot renders
    expect(r.query.formSectionLayout_description).not.toBeInTheDocument();
    expect(r.query.formSectionLayout_actions).not.toBeInTheDocument();
  });

  it("renders its own top-right actions as Buttons", async () => {
    // Given a FormSectionLayout with actions
    // When rendered
    const r = await render(
      <FormSectionLayout title="Trade Partners" actions={[{ label: "Save draft", onClick: () => {} }]} />,
    );
    // Then the action renders as a real Button
    expect(r.saveDraft).toBeInTheDocument();
  });

  it("prepends AutoSaveIndicator in the actions area when withAutoSave is true", async () => {
    // Given a FormSectionLayout with withAutoSave and actions
    // When rendered
    const r = await render(
      <FormSectionLayout title="Trade Partners" withAutoSave actions={[{ label: "Save draft", onClick: () => {} }]} />,
    );
    // Then AutoSaveIndicator renders before the actions
    expect(r.autoSave).toBeInTheDocument();
    expect(r.autoSave.compareDocumentPosition(r.saveDraft)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it("renders AutoSaveIndicator in the actions area when withAutoSave is true and actions are omitted", async () => {
    // Given a FormSectionLayout with withAutoSave and no actions
    // When rendered
    const r = await render(<FormSectionLayout title="Trade Partners" withAutoSave />);
    // Then the actions slot still renders with AutoSaveIndicator
    expect(r.formSectionLayout_actions).toBeInTheDocument();
    expect(r.autoSave).toBeInTheDocument();
  });

  it("renders fields ahead of sections", async () => {
    // Given a FormSectionLayout with both top-level fields and sections
    const r = await render(
      <FormSectionLayout
        title="Trade Partners"
        initialFields={<div data-testid="topLevelFields" />}
        sections={[{ title: "General Contractor", fields: <div data-testid="gcFields" /> }]}
      />,
    );
    // Then the top-level fields render before the sections
    expect(r.topLevelFields).toBeInTheDocument();
    expect(r.topLevelFields.compareDocumentPosition(r.gcFields)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it("renders form content in a sm CenteredLayout", async () => {
    // Given a FormSectionLayout
    const r = await render(<FormSectionLayout title="Trade Partners" />);
    // Then the sm shell wraps the form title
    expect(r.centeredLayout).toHaveStyle({ width: "100%", maxWidth: "768px" });
    expect(r.formSectionLayout_title).toHaveTextContent("Trade Partners");
  });

  it("wraps form content in an AiCard when aiMode is true", async () => {
    // Given a FormSectionLayout with aiMode
    const r = await render(<FormSectionLayout aiMode title="Trade Partners" />);
    // Then the card wraps the form title
    expect(r.formSectionLayout_card).toHaveTextContent("Trade Partners");
  });

  it("omits AiCard when aiMode is false", async () => {
    // Given a FormSectionLayout without aiMode
    const r = await render(<FormSectionLayout title="Trade Partners" />);
    // Then the form title renders without the card wrapper
    expect(r.formSectionLayout_title).toHaveTextContent("Trade Partners");
    expect(r.query.formSectionLayout_card).not.toBeInTheDocument();
    expect(r.query.formSectionLayout_column).not.toBeInTheDocument();
  });

  it("renders JumpLinks from section titles when withJumpLinks is true", async () => {
    // Given two includable sections and withJumpLinks
    const r = await render(
      <FormSectionLayout
        withJumpLinks
        title="Link Design Package"
        sections={[
          { title: "Setup", fields: <div /> },
          { title: "Package Options", fields: <div /> },
        ]}
      />,
    );

    // Then both section titles appear as jump links, and each section has an id
    expect(r.formSectionLayout_jumpLinks).toHaveTextContent("Setup");
    expect(r.formSectionLayout_jumpLinks).toHaveTextContent("Package Options");
    expect(r.formSection_section_0).toHaveAttribute("id", "setup");
    expect(r.formSection_section_1).toHaveAttribute("id", "packageOptions");
  });

  it("mirrors the rail width so the form stays centered on the page", async () => {
    // Given a form with the rail showing
    const r = await render(
      <FormSectionLayout
        withJumpLinks
        title="Link Design Package"
        sections={[
          { title: "Setup", fields: <div /> },
          { title: "Package Options", fields: <div /> },
        ]}
      />,
    );

    // Then the content column reserves the rail's width on its other side
    // (truss passes dynamic values through a custom property; jsdom drops `clamp()` from computed style)
    expect(r.formSectionLayout_column.style.getPropertyValue("--marginRight")).toBe(jumpLinksRailReservation);
  });

  it("omits excludeJumpLink sections from the rail", async () => {
    // Given a third section marked excludeJumpLink
    const r = await render(
      <FormSectionLayout
        withJumpLinks
        title="Link Design Package"
        sections={[
          { title: "Setup", fields: <div /> },
          { title: "Package Options", fields: <div /> },
          { title: "Internal", excludeJumpLink: true, fields: <div /> },
        ]}
      />,
    );

    // Then Internal is not in the rail but still renders as a section
    expect(r.formSectionLayout_jumpLinks).not.toHaveTextContent("Internal");
    expect(r.formSection_section_2).toHaveAttribute("id", "internal");
  });

  it("does not render the rail when withJumpLinks is omitted", async () => {
    // Given a multi-section form without withJumpLinks
    const r = await render(
      <FormSectionLayout
        title="Link Design Package"
        sections={[
          { title: "Setup", fields: <div /> },
          { title: "Package Options", fields: <div /> },
        ]}
      />,
    );

    // Then no jump-link rail renders, and no column reserves space for one
    expect(r.query.formSectionLayout_jumpLinks).toBeNull();
    expect(r.query.formSectionLayout_column).toBeNull();
  });

  it("hides the rail when fewer than two includable sections exist", async () => {
    // Given withJumpLinks but only one section
    const r = await render(
      <FormSectionLayout withJumpLinks title="Link Design Package" sections={[{ title: "Setup", fields: <div /> }]} />,
    );

    // Then no jump-link rail renders
    expect(r.query.formSectionLayout_jumpLinks).toBeNull();
  });

  it("hides the rail on mobile", async () => {
    // Given a mobile viewport
    setViewport("sm");
    const r = await render(
      <FormSectionLayout
        withJumpLinks
        title="Link Design Package"
        sections={[
          { title: "Setup", fields: <div /> },
          { title: "Package Options", fields: <div /> },
        ]}
      />,
    );

    // Then the rail is hidden
    expect(r.query.formSectionLayout_jumpLinks).toBeNull();
  });

  it("scrolls to the section when a JumpLink is clicked", async () => {
    // Given a form with jump links
    Element.prototype.scrollIntoView = vi.fn();
    const r = await render(
      <FormSectionLayout
        withJumpLinks
        title="Link Design Package"
        sections={[
          { title: "Setup", fields: <div /> },
          { title: "Package Options", fields: <div /> },
        ]}
      />,
    );

    // When the first jump link is clicked
    click(r.formSectionLayout_jumpLinks_link_0);

    // Then the matching section scrolls into view
    expect(document.getElementById("setup")!.scrollIntoView).toHaveBeenCalledTimes(1);
  });

  it("default auto mode pushes on a typical desktop chrome", async () => {
    // Given default withRightPane (auto) where the sm shell collides but can push
    const r = await render(
      <FormSectionLayout
        withJumpLinks
        withRightPane={280}
        title="Link Design Package"
        sections={[
          { title: "Setup", fields: <OpenPaneButton /> },
          { title: "Package Options", fields: <div /> },
        ]}
      />,
    );

    // When the pane is opened
    await clickAndWait(r.openPane);

    // Then push constrains the column; the row is not widened
    expect(r.rightPaneContent).toBeInTheDocument();
    expect(r.query.rightPaneMain_overlay).toBeNull();
    expect(r.rightPaneMain_push).toBeInTheDocument();
    expect(document.documentElement.style.getPropertyValue(beamFloatingRightOffsetVar)).toBe(
      documentScrollRightPaneWidth(280),
    );
  });

  it("does not wrap in DocumentScrollRightPaneLayout without withRightPane", async () => {
    // Given a form that did not opt into the right pane
    const r = await render(
      <FormSectionLayout
        title="Link Design Package"
        sections={[
          { title: "Setup", fields: <OpenPaneButton /> },
          { title: "Package Options", fields: <div /> },
        ]}
      />,
    );

    // When the pane context is opened
    await clickAndWait(r.openPane);

    // Then FormSectionLayout does not host the document-scroll pane wrapper
    expect(r.query.documentScrollRightPaneLayout).toBeNull();
    expect(r.query.rightPaneContent).toBeNull();
    expect(r.query.rightPaneMain_overlay).toBeNull();
  });
});

function OpenPaneButton() {
  const { openRightPane } = useRightPaneActions();
  return <Button label="Open pane" onClick={() => openRightPane({ content: <div>Detail</div> })} />;
}
