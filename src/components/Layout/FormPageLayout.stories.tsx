import { ObjectConfig, required, useFormState } from "@homebound/form-state";
import { Meta } from "@storybook/react";
import {
  boundCheckboxField,
  boundDateField,
  boundMultiSelectField,
  boundNumberField,
  boundSelectField,
  boundTextAreaField,
  boundTextField,
} from "src/forms";
import { AuthorInput } from "src/forms/formStateDomain";
import { FormPageLayout as FormPageLayoutComponent, FormSectionConfig } from "src/index";
import { noop } from "src/utils";
import { withBeamDecorator, withDimensions, withRouter } from "src/utils/sb";

export default {
  component: FormPageLayoutComponent,
  decorators: [withBeamDecorator, withDimensions(), withRouter()],
  parameters: { layout: "fullscreen" },
} as Meta;

export function FormPageLayout() {
  const formState = useFormState({
    config: formConfig,
    init: { input: { firstName: "John", middleInitial: "C", lastName: "Doe" } },
  });

  return (
    <FormPageLayoutComponent
      pageTitle="Detail Title"
      submitAction={{ label: "Save", onClick: noop }}
      cancelAction={{ label: "Cancel", onClick: noop }}
      tertiaryAction={{ label: "Tertiary Test", onClick: noop }}
      breadCrumb={[
        { label: "Breadcrumb A", href: "/breadcrumb-a" },
        { label: "Breadcrumb B", href: "/breadcrumb-b" },
      ]}
      formSections={formSections}
      formState={formState}
    />
  );
}

const sportsOptions = [
  { id: "s:1", name: "Basketball" },
  { id: "s:2", name: "Baseball" },
];

const colorOptions = [
  { id: "c:1", name: "Red" },
  { id: "c:2", name: "Blue" },
  { id: "c:3", name: "Green" },
];

const formSections: FormSectionConfig<AuthorInput> = [
  {
    title: "Author Overview",
    icon: "userCircle",
    rows: [
      { firstName: boundTextField(), middleInitial: boundTextField(), lastName: boundTextField() },
      { bio: boundTextAreaField() },
    ],
  },
  {
    title: "More Details",
    icon: "openBook",
    rows: [
      {
        favoriteSport: boundSelectField({
          options: sportsOptions,
          getOptionLabel: (o) => o.name,
          getOptionValue: (o) => o.id,
        }),
        favoriteColors: boundMultiSelectField({
          options: colorOptions,
          getOptionLabel: (o) => o.name,
          getOptionValue: (o) => o.id,
        }),
      },
      { heightInInches: boundNumberField({ label: "Height (in inches)" }), birthday: boundDateField() },
      { isAvailable: boundCheckboxField({ label: "Is Retired" }) },
    ],
  },
];

const formConfig: ObjectConfig<AuthorInput> = {
  firstName: { type: "value", rules: [required] },
  middleInitial: { type: "value" },
  lastName: { type: "value", rules: [required] },
  birthday: { type: "value", rules: [required] },
  heightInInches: { type: "value" },
  favoriteSport: { type: "value" },
  favoriteColors: { type: "value" },
  bio: { type: "value" },
  isAvailable: { type: "value" },
  favoriteShapes: { type: "value" },
};
