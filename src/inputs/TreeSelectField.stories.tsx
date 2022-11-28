import { action } from "@storybook/addon-actions";
import React, { useState } from "react";
import { HasIdAndName, Optional } from "../types";
import { Value } from "./index";
import { NestedOption } from "./internal/SelectFieldBase";
import { TreeSelectField, TreeSelectFieldProps } from "./TreeSelectField";

export default {
  component: TreeSelectField,
  title: "Workspace/Inputs/TreeSelectField",
};

type TestOption = {
  id: Value;
  name: string;
  children?: any;
};

const options: NestedOption<TestOption>[] = [
  {
    id: "dev:1",
    name: "Austin Dev 1",
    children: [
      {
        id: "cohort:1",
        name: "Austin Dev Cohort 1",
        children: [
          { id: "p:1", name: "Project 1" },
          { id: "p:2", name: "Project 2" },
        ],
      },
    ],
  },
  { id: "2", name: "Dallas", children: [{ id: "5", name: "Dallas Cohort 1" }] },
  { id: "3", name: "Driftwood", children: [{ id: "5", name: "Driftwood Cohort 1" }] },
  { id: "4", name: "Headwaters", children: [{ id: "5", name: "Headwaters Cohort 1", children: [] }] },
  { id: "5", name: "Houston Dev 1", children: [] },
];

export function DefaultTreeSelectField() {
  return (
    <TestTreeSelectField
      values={[options[2].id]}
      options={options}
      getOptionLabel={(o) => o.name}
      getOptionValue={(o) => o.id}
      label={"Dropdown Tree Component"}
    />
  );
}

// Kind of annoying but to get type inference for HasIdAndName working, we
// have to re-copy/paste the overload here.
function TestTreeSelectField<T extends object, V extends Value>(
  props: Omit<TreeSelectFieldProps<T, V>, "onSelect">,
): JSX.Element;
function TestTreeSelectField<O extends HasIdAndName<V>, V extends Value>(
  props: Optional<Omit<TreeSelectFieldProps<O, V>, "onSelect">, "getOptionValue" | "getOptionLabel">,
): JSX.Element;
function TestTreeSelectField<T extends object, V extends Value>(
  props: Optional<Omit<TreeSelectFieldProps<T, V>, "onSelect">, "getOptionValue" | "getOptionLabel">,
): JSX.Element {
  const [selectedOptions, setSelectedOptions] = useState<V[]>(props.values);
  return (
    <TreeSelectField<T, V>
      {...(props as any)}
      values={selectedOptions}
      onSelect={setSelectedOptions}
      onBlur={action("onBlur")}
      onFocus={action("onFocus")}
    />
  );
}
