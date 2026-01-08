import { ObjectConfig, required, useFormState } from "@homebound/form-state";
import { Meta } from "@storybook/react";
import { useState } from "react";
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
import {
  Css,
  FormPageLayout as FormPageLayoutComponent,
  FormSectionConfig,
  Icon,
  TextField,
  Tooltip,
  useSnackbar,
  useToast,
} from "src/index";
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
  const { showToast } = useToast();
  const { triggerNotice } = useSnackbar();

  return (
    <FormPageLayoutComponent
      pageTitle="Detail Title"
      submitAction={{ label: "Save", onClick: noop }}
      cancelAction={{
        label: "Cancel",
        onClick: () => showToast({ message: "Cancel Action Triggered", type: "warning" }),
      }}
      tertiaryAction={{
        label: "Tertiary Test",
        onClick: () => triggerNotice({ message: "Tertiary Action Triggered" }),
      }}
      breadCrumb={[
        { label: "Breadcrumb A", href: "/breadcrumb-a" },
        { label: "Breadcrumb B", href: "/breadcrumb-b" },
      ]}
      formSections={formSections}
      formState={formState}
      rightSideBar={[
        { icon: "comment", render: () => <CommentComponent /> },
        { icon: "time", render: () => <div>History</div> },
      ]}
    />
  );
}

export function SingleColumn() {
  const formState = useFormState({
    config: formConfig,
    init: { input: { firstName: "John", middleInitial: "C", lastName: "Doe" } },
  });
  const { showToast } = useToast();
  const { triggerNotice } = useSnackbar();

  return (
    <FormPageLayoutComponent
      pageTitle="Detail Title"
      submitAction={{ label: "Save", onClick: noop }}
      cancelAction={{
        label: "Cancel",
        onClick: () => showToast({ message: "Cancel Action Triggered", type: "warning" }),
      }}
      tertiaryAction={{
        label: "Tertiary Test",
        onClick: () => triggerNotice({ message: "Tertiary Action Triggered" }),
      }}
      breadCrumb={[
        { label: "Breadcrumb A", href: "/breadcrumb-a" },
        { label: "Breadcrumb B", href: "/breadcrumb-b" },
      ]}
      formSections={singleColumnConfig}
      formState={formState}
      rightSideBar={[{ icon: "comment", render: () => <CommentComponent /> }]}
    />
  );
}

export function withCollapsibleBreadcrumbs() {
  const formState = useFormState({
    config: formConfig,
    init: { input: { firstName: "John", middleInitial: "C", lastName: "Doe" } },
  });
  const { showToast } = useToast();
  const { triggerNotice } = useSnackbar();

  return (
    <FormPageLayoutComponent
      pageTitle="Detail Title"
      submitAction={{ label: "Save", onClick: noop }}
      cancelAction={{
        label: "Cancel",
        onClick: () => showToast({ message: "Cancel Action Triggered", type: "warning" }),
      }}
      tertiaryAction={{
        label: "Tertiary Test",
        onClick: () => triggerNotice({ message: "Tertiary Action Triggered" }),
      }}
      breadCrumb={[
        { label: "Breadcrumb A", href: "/breadcrumb-a" },
        { label: "Breadcrumb B", href: "/breadcrumb-b" },
        { label: "Breadcrumb C", href: "/breadcrumb-c" },
        { label: "Breadcrumb D", href: "/breadcrumb-d" },
        { label: "Breadcrumb E", href: "/breadcrumb-e" },
        {
          label: "Breadcrumb F",
          href: "/breadcrumb-f",
          right: (
            <div css={Css.pl1.$}>
              <Tooltip title="This can be used to display additional information" placement="bottom">
                <Icon icon="infoCircle" inc={2} />
              </Tooltip>
            </div>
          ),
        },
      ]}
      formSections={singleColumnConfig}
      formState={formState}
      rightSideBar={[{ icon: "comment", render: () => <CommentComponent /> }]}
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

const singleColumnConfig: FormSectionConfig<AuthorInput> = [
  {
    title: "Author Overview",
    icon: "userCircle",
    rows: [
      { firstName: boundTextField() },
      { middleInitial: boundTextField() },
      { lastName: boundTextField() },
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
      },
      {
        favoriteColors: boundMultiSelectField({
          options: colorOptions,
          getOptionLabel: (o) => o.name,
          getOptionValue: (o) => o.id,
        }),
      },
      { heightInInches: boundNumberField({ label: "Height (in inches)" }) },
      { birthday: boundDateField() },
      { isAvailable: boundCheckboxField({ label: "Is Retired" }) },
    ],
  },
  {
    title: "Third Section With Long Title",
    icon: "abacus",
    rows: [
      { firstName: boundTextField() },
      { middleInitial: boundTextField() },
      { lastName: boundTextField() },
      { bio: boundTextAreaField() },
    ],
  },
  { rows: [{ firstName: boundTextField() }] },
];

function CommentComponent() {
  const [comment, setComment] = useState<string | undefined>(undefined);

  return (
    <div css={Css.df.fdc.gap1.$}>
      <div>Comments</div>
      <TextField
        placeholder="Add a comment"
        labelStyle="hidden"
        label="comment"
        value={comment}
        onChange={setComment}
      />
    </div>
  );
}
