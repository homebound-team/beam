import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import { Key, useState } from "react";
import { Icons } from "src/components";
import { MultiSelectField, SelectFieldProps } from "src/inputs";
import { HasIdAndName, Optional } from "src/types";
import { zeroTo } from "src/utils/sb";

export default {
  component: MultiSelectField,
  title: "Inputs/Multi Select Fields",
} as Meta;

type TestOption = {
  id: Key;
  name: string;
  icon?: keyof typeof Icons;
};

export function MultiSelectFields() {
  const options: TestOption[] = zeroTo(10).map((i) => ({ id: i, name: `Project ${i}` }));
  return <TestSelectField label="Projects" value={options[2].id} options={options} />;
}

// Kind of annoying but to get type inference for HasIdAndName working, we
// have to re-copy/paste the overload here.
function TestSelectField<T extends object, V extends Key>(props: Omit<SelectFieldProps<T, V>, "onSelect">): JSX.Element;
function TestSelectField<O extends HasIdAndName<V>, V extends Key>(
  props: Optional<Omit<SelectFieldProps<O, V>, "onSelect">, "getOptionValue" | "getOptionLabel">,
): JSX.Element;
function TestSelectField<T extends object, V extends Key>(
  props: Optional<Omit<SelectFieldProps<T, V>, "onSelect">, "getOptionValue" | "getOptionLabel">,
): JSX.Element {
  const [selectedOptions, setSelectedOptions] = useState<V[]>(props.value ? [props.value] : []);

  return (
    <MultiSelectField<T, V>
      inlineLabel
      // The `as any` is due to something related to https://github.com/emotion-js/emotion/issues/2169
      // We may have to redo the conditional getOptionValue/getOptionLabel
      {...(props as any)}
      values={selectedOptions}
      onSelect={setSelectedOptions}
      onBlur={action("onBlur")}
      onFocus={action("onFocus")}
    />
  );
}
