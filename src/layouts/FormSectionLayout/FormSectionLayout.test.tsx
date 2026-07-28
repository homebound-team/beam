import { FormSectionLayout } from "src/layouts/FormSectionLayout/FormSectionLayout";
import { render } from "src/utils/rtl";

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
    expect(r.formSectionLayout_description).toHaveTextContent("Set up trade partner assignments for this project");
    // And each section is delegated to FormSection, rendering its own content
    expect(r.getByText("General Contractor")).toBeInTheDocument();
    expect(r.gcFields).toBeInTheDocument();
    expect(r.getByText("Sub-Contractors")).toBeInTheDocument();
    expect(r.subFields).toBeInTheDocument();
  });

  it("omits the description and actions slots when not provided", async () => {
    // Given a FormSectionLayout with no description or actions
    // When rendered
    const r = await render(<FormSectionLayout title="Trade Partners" sections={[]} />);
    // Then neither slot renders
    expect(r.query.formSectionLayout_description).not.toBeInTheDocument();
    expect(r.query.formSectionLayout_actions).not.toBeInTheDocument();
  });

  it("renders its own top-right actions as Buttons", async () => {
    // Given a FormSectionLayout with actions
    // When rendered
    const r = await render(
      <FormSectionLayout title="Trade Partners" actions={[{ label: "Save draft", onClick: () => {} }]} sections={[]} />,
    );
    // Then the action renders as a real Button
    expect(r.getByRole("button", { name: "Save draft" })).toBeInTheDocument();
  });
});
