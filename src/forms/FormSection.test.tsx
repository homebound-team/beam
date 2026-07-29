import { FormSection } from "src/forms/FormSection";
import { render } from "src/utils/rtl";

describe("FormSection", () => {
  it("renders title, description, and fields", async () => {
    // Given a FormSection with a title, description, and fields
    // When rendered
    const r = await render(
      <FormSection
        title="Trade Partners"
        description="Manage trade partner assignments"
        fields={<div data-testid="customFields">Fields</div>}
      />,
    );
    // Then the title, description, and fields all render
    expect(r.formSection_title).toHaveTextContent("Trade Partners");
    expect(r.formSection_description).toHaveTextContent("Manage trade partner assignments");
    expect(r.customFields).toBeInTheDocument();
  });

  it("renders actions as Buttons", async () => {
    // Given a FormSection with actions
    // When rendered
    const r = await render(<FormSection title="Trade Partners" actions={[{ label: "Add", onClick: () => {} }]} />);
    // Then the action renders as a real Button
    expect(r.add).toBeInTheDocument();
  });

  it("omits the description and actions slots when not provided", async () => {
    // Given a FormSection with no description or actions
    // When rendered
    const r = await render(<FormSection title="Trade Partners" />);
    // Then neither slot renders
    expect(r.query.formSection_description).not.toBeInTheDocument();
    expect(r.query.formSection_actions).not.toBeInTheDocument();
  });

  it("uses the section-level title style by default", async () => {
    // Given a top-level FormSection (isChild omitted)
    // When rendered
    const r = await render(<FormSection title="Trade Partners" />);
    // Then it renders at the section (lg) heading size
    expect(r.formSection_title).toHaveStyle({ fontSize: "18px" });
  });

  it("uses the smaller child title style when isChild is set", async () => {
    // Given a FormSection explicitly marked isChild
    // When rendered
    const r = await render(<FormSection title="Sub-Contractors" isChild />);
    // Then it renders at the child (md) heading size
    expect(r.formSection_title).toHaveStyle({ fontSize: "16px" });
  });

  it("renders childSections at the smaller child title size", async () => {
    // Given a FormSection with a nested childSections array
    // When rendered
    const r = await render(
      <FormSection
        title="Trade Partners"
        childSections={[
          { title: "Electrical", fields: <div data-testid="electricalFields" /> },
          { title: "Plumbing", fields: <div data-testid="plumbingFields" /> },
        ]}
      />,
    );
    // Then both child sections render, nested under the parent
    expect(r.formSection_title).toHaveTextContent("Trade Partners");
    expect(r.electricalFields).toBeInTheDocument();
    expect(r.plumbingFields).toBeInTheDocument();
    // And each child section's title renders at the child heading size
    [r.formSection_childSection_title_0, r.formSection_childSection_title_1].forEach((title) =>
      expect(title).toHaveStyle({ fontSize: "16px" }),
    );
  });
});
