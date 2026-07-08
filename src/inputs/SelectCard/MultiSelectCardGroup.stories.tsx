import { Meta } from "@storybook/react-vite";
import { useState } from "react";
import { Css } from "src/Css";
import { MultiSelectCardGroup } from "src/inputs/SelectCard/MultiSelectCardGroup";
import {
  MultiSelectCardGroupProps,
  SelectCardGridGroupItemOption,
  SelectCardListGroupItemOption,
} from "src/inputs/SelectCard/types";

export default {
  component: MultiSelectCardGroup,
} as Meta<MultiSelectCardGroupProps<Category>>;

export function Default() {
  const [values, setValues] = useState<Category[]>([Category.Math]);

  return (
    <div css={Css.df.wPx(500).$}>
      <MultiSelectCardGroup
        label="Multi Select Card Group"
        options={createCategories()}
        onChange={(values) => setValues(values)}
        values={values}
      />
    </div>
  );
}

function createMixedOptions(): SelectCardGridGroupItemOption<string>[] {
  return [
    {
      icon: "single",
      label: "Single",
      description: "Slots share the same options, but each slot can have its own selection.",
      value: "single",
    },
    { icon: "abacus", label: "Math", value: "math" },
    {
      icon: "package",
      label: "Package",
      description: "Selections come in preconfigured bundles.",
      value: "package",
    },
    { icon: "dollar", label: "Finance", value: "finance" },
  ];
}

/** Mix of cards with and without descriptions in one group. */
export function MixedDescriptions() {
  const [values, setValues] = useState<string[]>(["single"]);

  return (
    <div css={Css.wPx(640).$}>
      <MultiSelectCardGroup
        label="Mixed Descriptions"
        options={createMixedOptions()}
        onChange={(values) => setValues(values)}
        values={values}
      />
    </div>
  );
}

function createListOptions(): SelectCardListGroupItemOption<string>[] {
  return [
    {
      label: "Inactive",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
      value: "inactive",
    },
    {
      label: "Inactive",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
      value: "inactive-2",
    },
    {
      label: "Selected Option",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
      value: "selected",
    },
  ];
}

/** Checkbox list rows stacked vertically (Figma Select Card Group / Checkbox). */
export function ListCheckboxGroup() {
  const [values, setValues] = useState<string[]>(["selected"]);

  return (
    <div css={Css.wPx(640).$}>
      <MultiSelectCardGroup
        label="List Checkbox Group"
        view="list"
        options={createListOptions()}
        onChange={setValues}
        values={values}
      />
    </div>
  );
}

function createExclusiveListOptions(): SelectCardListGroupItemOption<string>[] {
  return [
    { label: "Math", description: "Numbers and equations", value: "math" },
    { label: "History", description: "Past events", value: "history" },
    { label: "N/A", description: "None apply", value: "na", selectionBehavior: "exclusive" },
  ];
}

/** List rows with an exclusive N/A option. */
export function ListExclusiveOption() {
  const [values, setValues] = useState<string[]>(["math"]);

  return (
    <div css={Css.wPx(640).$}>
      <MultiSelectCardGroup
        label="Exclusive Option"
        view="list"
        options={createExclusiveListOptions()}
        onChange={setValues}
        values={values}
      />
    </div>
  );
}

enum Category {
  Math,
  History,
  Finance,
  Engineering,
  Management,
  Media,
  Na,
}

function createCategories(): SelectCardGridGroupItemOption<Category>[] {
  return [
    { icon: "abacus", label: "Math", value: Category.Math },
    { icon: "archive", label: "History", value: Category.History },
    { icon: "dollar", label: "Finance", value: Category.Finance },
    { icon: "hardHat", label: "Engineering", value: Category.Engineering },
    { icon: "columns", label: "Management", value: Category.Management },
    { icon: "camera", label: "Media", value: Category.Media },
    { icon: "remove", label: "N/A", value: Category.Na, selectionBehavior: "exclusive" },
  ];
}
