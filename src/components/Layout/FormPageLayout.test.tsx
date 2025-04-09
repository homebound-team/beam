import { createObjectState, ObjectConfig, required } from "@homebound/form-state";
import { FormPageLayout } from "src/components/Layout";
import { boundCheckboxField, boundTextField } from "src/forms";
import { AuthorInput } from "src/forms/formStateDomain";
import { noop } from "src/utils";
import { render, type, withRouter } from "src/utils/rtl";

const formConfig: ObjectConfig<AuthorInput> = {
  isAvailable: { type: "value", rules: [required] },
  firstName: { type: "value", rules: [required] },
  lastName: { type: "value" },
};

describe("FormPageLayout", () => {
  it("renders content", async () => {
    // Given a formState with configured fields
    const formState = createObjectState(formConfig, { isAvailable: true, firstName: "John", lastName: "Doe" });

    // And a `FormPageLayout` with a title, breadcrumb, form sections and button actions
    const r = await render(
      <FormPageLayout
        pageTitle="User Details"
        breadCrumb={[
          { label: "Home", href: "/" },
          { label: "Users", href: "/users" },
        ]}
        formState={formState}
        formSections={[
          { title: "About", icon: "userCircle", rows: [{ firstName: boundTextField(), lastName: boundTextField() }] },
          { title: "Settings", icon: "cog", rows: [{ isAvailable: boundCheckboxField() }] },
        ]}
        submitAction={{ label: "Save", onClick: noop }}
        cancelAction={{ label: "Cancel", onClick: noop }}
        tertiaryAction={{ label: "Delete", onClick: noop, disabled: true }}
      />,
      withRouter(),
    );

    // Expect the header to be rendered with the correct title and breadcrumb
    expect(r.formPageLayout_pageHeader_pageTitle).toHaveTextContent("User Details");
    expect(r.pageHeaderBreadcrumbs_navLink_0).toHaveTextContent("Home");
    expect(r.pageHeaderBreadcrumbs_navLink_1).toHaveTextContent("Users");

    // And the action buttons to be rendered with the correct labels and states
    expect(r.save).toHaveTextContent("Save");
    expect(r.cancel).toHaveTextContent("Cancel");
    expect(r.cancel).not.toBeDisabled();
    expect(r.delete).toHaveTextContent("Delete");
    expect(r.delete).toBeDisabled();

    // Where the save button is initially disabled for the untouched form
    expect(r.save).toBeDisabled();

    // And when we change a field, the save button is enabled
    type(r.firstName, "Jane");
    expect(r.save).not.toBeDisabled();

    // And each of the form sections to be rendered with their fields and titles
    expect(r.formPageLayout_formSection_0).toHaveTextContent("About");
    expect(r.firstName).toHaveValue("Jane");
    expect(r.lastName).toHaveValue("Doe");
    expect(r.formPageLayout_formSection_1).toHaveTextContent("Settings");
    expect(r.isAvailable).toBeChecked();

    // And each of the sections to have a nav link
    expect(r.formPageLayout_sectionNavLink_0).toHaveTextContent("About");
    expect(r.formPageLayout_sectionNavLink_1).toHaveTextContent("Settings");
  });
});
