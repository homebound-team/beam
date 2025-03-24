import { createObjectState, ObjectConfig, required } from "@homebound/form-state";
import { FormPageLayout } from "src/components/Layout";
import { boundCheckboxField, boundTextField } from "src/forms";
import { AuthorInput } from "src/forms/formStateDomain";
import { noop } from "src/utils";
import { render, withRouter } from "src/utils/rtl";

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
    expect(r.formPageLayout_pageHeader_submitAction).toHaveTextContent("Save");
    expect(r.formPageLayout_pageHeader_submitAction).not.toBeDisabled();
    expect(r.formPageLayout_pageHeader_cancelAction).toHaveTextContent("Cancel");
    expect(r.formPageLayout_pageHeader_cancelAction).not.toBeDisabled();
    expect(r.formPageLayout_pageHeader_tertiaryAction).toHaveTextContent("Delete");
    expect(r.formPageLayout_pageHeader_tertiaryAction).toBeDisabled();

    // And each of the form sections to be rendered with their fields and titles
    expect(r.formPageLayout_formSection_0).toHaveTextContent("About");
    expect(r.firstName).toHaveValue("John");
    expect(r.lastName).toHaveValue("Doe");
    expect(r.formPageLayout_formSection_1).toHaveTextContent("Settings");
    expect(r.isAvailable).toBeChecked();

    // And each of the sections to have a nav link
    expect(r.formPageLayout_sectionNavLink_0).toHaveTextContent("About");
    expect(r.formPageLayout_sectionNavLink_1).toHaveTextContent("Settings");
  });
});
