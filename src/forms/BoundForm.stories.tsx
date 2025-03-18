import { ObjectConfig, required, useFormState } from "@homebound/form-state";
import { Meta } from "@storybook/react";
import { useEffect, useState } from "react";
import { Css } from "src/Css";
import {
  boundCheckboxField,
  boundCheckboxGroupField,
  boundDateField,
  boundDateRangeField,
  BoundForm as BoundFormComponent,
  BoundFormInputConfig,
  boundIconCardField,
  boundIconCardGroupField,
  boundMultilineSelectField,
  boundMultiSelectField,
  boundNumberField,
  boundRadioGroupField,
  boundRichTextField,
  boundSelectField,
  boundSwitchField,
  boundTextAreaField,
  boundTextField,
  boundToggleChipGroupField,
  boundTreeSelectField,
} from "src/forms/BoundForm";
import { NestedOption } from "src/inputs";
import { IconCardGroupItemOption } from "src/inputs/IconCardGroup";
import { HasIdAndName } from "src/types";
import { withBeamDecorator } from "src/utils/sb";
import { AuthorInput as BaseAuthorInput } from "./formStateDomain";

export default {
  component: BoundFormComponent,
  decorators: [withBeamDecorator],
} as Meta;

export function BoundForm() {
  const formState = useFormState({
    config: formConfig,
    init: { input: { firstName: "John", lastName: "Doe" } },
  });

  return (
    <div css={Css.bgWhite.p3.py5.$}>
      <BoundFormComponent rows={inputConfig} formState={formState} />
    </div>
  );
}

export function SmallFormExample() {
  const formState = useFormState({
    config: formConfig,
    init: { input: { firstName: "John", middleInitial: "C", lastName: "Doe" } },
  });

  return (
    <div css={Css.bgWhite.p3.py5.$}>
      <BoundFormComponent
        rows={[
          { firstName: boundTextField(), middleInitial: boundTextField(), lastName: boundTextField() },
          { bio: boundTextAreaField() },
        ]}
        formState={formState}
      />
    </div>
  );
}

export function ReadOnlyForm() {
  const formState = useFormState({
    config: formConfig,
    init: { input: { firstName: "John", middleInitial: "C", lastName: "Doe", bio: "A bio for this author" } },
    readOnly: true,
  });

  return (
    <div css={Css.bgWhite.p3.py5.$}>
      <BoundFormComponent
        rows={[
          { firstName: boundTextField(), middleInitial: boundTextField(), lastName: boundTextField() },
          { bio: boundTextAreaField() },
        ]}
        formState={formState}
      />
    </div>
  );
}

export function LoadingBoundForm() {
  const [loadedData, setLoadedData] = useState<AuthorInput | undefined>(undefined);

  const formState = useFormState({
    config: formConfig,
    init: { input: loadedData, map: (a) => a },
  });

  useEffect(() => {
    if (loadedData) return;

    setTimeout(() => {
      setLoadedData({ firstName: "John", middleInitial: "C", lastName: "Doe", bio: "Some bio" });
    }, 1000);
  }, [loadedData]);

  return (
    <div css={Css.bgWhite.p3.py5.$}>
      <BoundFormComponent
        rows={[
          { firstName: boundTextField(), middleInitial: boundTextField(), lastName: boundTextField() },
          { bio: boundTextAreaField() },
        ]}
        formState={formState}
      />
    </div>
  );
}

function CustomComponent() {
  return <div css={Css.p4.br4.ba.bcGray200.$}>Example Custom Component</div>;
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

const shapesOptions = [
  { value: "shape:1", label: "Triangle" },
  { value: "shape:2", label: "Square" },
  { value: "shape:3", label: "Circle" },
];

const categories: IconCardGroupItemOption<string>[] = [
  { icon: "abacus", label: "Math", value: "math" },
  { icon: "archive", label: "History", value: "history" },
  { icon: "dollar", label: "Finance", value: "finance" },
  { icon: "hardHat", label: "Engineering", value: "engineering" },
  { icon: "kanban", label: "Management", value: "management" },
  { icon: "camera", label: "Media", value: "media" },
];

const genres: NestedOption<HasIdAndName>[] = [
  {
    id: "g:1",
    name: "Action",
    children: [
      {
        id: "g:2",
        name: "Action Adventure",
        children: [{ id: "g:3", name: "Action Adventure Comedy" }],
      },
      { id: "g:4", name: "Action Comedy" },
    ],
  },
  { id: "g:5", name: "Comedy", children: [{ id: "g:6", name: "Comedy Drama" }] },
];

type AuthorInput = BaseAuthorInput & {
  iconCardSelection?: boolean | null;
  iconCardGroupExample?: string[] | null;
  multiLineSelectExample?: string[] | null;
  radioGroupExample?: string | null;
  richTextExample?: string | null;
  switchFieldExample1?: boolean | null;
  switchFieldExample2?: boolean | null;
  toggleChipGroupField?: string[] | null;
  treeSelectExample?: string[] | null;
};

const inputConfig: BoundFormInputConfig<AuthorInput> = [
  { firstName: boundTextField(), middleInitial: boundTextField(), lastName: boundTextField() },
  { bio: boundTextAreaField() },
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
    heightInInches: boundNumberField({ label: "Height (in inches)" }),
    birthday: boundDateField(),
  },
  { isAvailable: boundCheckboxField({ label: "Is Retired" }) },
  { saleDates: boundDateRangeField() },
  { favoriteShapes: boundCheckboxGroupField({ options: shapesOptions, label: "Checkbox Group" }) },
  { iconCardSelection: boundIconCardField({ icon: "abacus" }) },
  { iconCardGroupExample: boundIconCardGroupField({ options: categories }) },
  {
    multiLineSelectExample: boundMultilineSelectField({
      options: colorOptions,
      getOptionLabel: (o) => o.name,
      getOptionValue: (o) => o.id,
    }),
  },
  { radioGroupExample: boundRadioGroupField({ options: shapesOptions }) },
  { richTextExample: boundRichTextField({ placeholder: "Example placeholder..." }) },
  { switchFieldExample1: boundSwitchField(), switchFieldExample2: boundSwitchField() },
  { toggleChipGroupField: boundToggleChipGroupField({ options: shapesOptions }) },
  {
    treeSelectExample: boundTreeSelectField({
      options: genres,
      getOptionLabel: (o) => o.name,
      getOptionValue: (o) => o.id,
    }),
  },

  // We can support any custom JSX node using the key `reactNode*`
  { reactNodeA: <CustomComponent /> },
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
  saleDates: { type: "value" },
  iconCardSelection: { type: "value" },
  iconCardGroupExample: { type: "value" },
  multiLineSelectExample: { type: "value" },
  radioGroupExample: { type: "value" },
  richTextExample: { type: "value" },
  switchFieldExample1: { type: "value" },
  switchFieldExample2: { type: "value" },
  toggleChipGroupField: { type: "value" },
  treeSelectExample: { type: "value" },
};
