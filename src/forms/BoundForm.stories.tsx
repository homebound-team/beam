import { ObjectConfig, required, useFormState } from "@homebound/form-state";
import { Meta } from "@storybook/react";
import { useEffect, useState } from "react";
import { Css } from "src/Css";
import {
  BoundForm as BoundFormComponent,
  BoundFormInputConfig,
  checkboxField,
  dateField,
  multiSelectField,
  numberField,
  selectField,
  textAreaField,
  textField,
} from "src/forms/BoundForm";
import { withBeamDecorator } from "src/utils/sb";
import { AuthorInput } from "./formStateDomain";

export default {
  component: BoundFormComponent,
  decorators: [withBeamDecorator],
} as Meta;

export function BoundForm() {
  const formState = useFormState({
    config: formConfig,
    init: { input: { firstName: "John", middleInitial: "C", lastName: "Doe" } },
  });

  return (
    <div css={Css.bgWhite.p3.py5.$}>
      <BoundFormComponent inputConfig={inputConfig} formState={formState} />
    </div>
  );
}

export function SingleSectionBoundForm() {
  const formState = useFormState({
    config: formConfig,
    init: { input: { firstName: "John", middleInitial: "C", lastName: "Doe" } },
  });

  return (
    <div css={Css.bgWhite.p3.py5.$}>
      <BoundFormComponent
        inputConfig={{
          rows: [
            { firstName: textField(), middleInitial: textField(), lastName: textField() },
            { bio: textAreaField() },
          ],
        }}
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
        inputConfig={{
          rows: [
            { firstName: textField(), middleInitial: textField(), lastName: textField() },
            { bio: textAreaField() },
          ],
        }}
        formState={formState}
      />
    </div>
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

const inputConfig: BoundFormInputConfig<AuthorInput> = [
  {
    title: "Author Overview",
    icon: "userCircle",
    rows: [
      { firstName: textField(), middleInitial: textField(), lastName: textField() },
      { bio: textAreaField() },
      // We can support any custom JSX node, TODO to come up with a better example
      // { height: <div>Example custom component</div> },
    ],
  },
  {
    title: "More Details",
    icon: "openBook",
    rows: [
      {
        favoriteSport: selectField({
          options: sportsOptions,
          getOptionLabel: (o) => o.name,
          getOptionValue: (o) => o.id,
        }),
        favoriteColors: multiSelectField({
          options: colorOptions,
          getOptionLabel: (o) => o.name,
          getOptionValue: (o) => o.id,
        }),
        heightInInches: numberField({ label: "Height (in inches)" }),
        birthday: dateField(),
      },
      { isAvailable: checkboxField({ label: "Is Retired" }) },
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
};
