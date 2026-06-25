import { Meta } from "@storybook/react-vite";
import { useState } from "react";
import { Css } from "src/Css";
import { SelectCardGroup, SelectCardGroupItemOption, SelectCardGroupProps } from "./SelectCardGroup";

export default {
  component: SelectCardGroup,
} as Meta<SelectCardGroupProps<Category>>;

enum Category {
  Math,
  History,
  Finance,
  Engineering,
  Management,
  Media,
  Na,
}

const categories: SelectCardGroupItemOption<Category>[] = [
  { icon: "abacus", label: "Math", value: Category.Math },
  { icon: "archive", label: "History", value: Category.History },
  { icon: "dollar", label: "Finance", value: Category.Finance },
  { icon: "hardHat", label: "Engineering", value: Category.Engineering },
  { icon: "kanban", label: "Management", value: Category.Management },
  { icon: "camera", label: "Media", value: Category.Media },
  { icon: "remove", label: "N/A", value: Category.Na, exclusive: true },
];

export function Default() {
  const [values, setValues] = useState<Category[]>([Category.Math]);

  return (
    <div>
      <div css={Css.df.wPx(500).$}>
        <SelectCardGroup
          label="Select Card Group"
          options={categories}
          onChange={(values) => setValues(values)}
          values={values}
        />
      </div>
    </div>
  );
}

const optionTypes: SelectCardGroupItemOption<string>[] = [
  {
    icon: "single",
    label: "Single",
    description: "Slots share the same options, but each slot can have its own selection.",
    value: "single",
  },
  {
    icon: "linked",
    label: "Linked",
    description: "Slots share the same options and always have the same selection.",
    value: "linked",
  },
  {
    icon: "package",
    label: "Package",
    description: "Slots are grouped and selected together as one package.",
    value: "package",
  },
];

/** Reproduces the "Option Type" use case from Figma — cards with descriptions. */
export function OptionType() {
  const [values, setValues] = useState<string[]>(["package"]);

  return (
    <div css={Css.wPx(640).$}>
      <SelectCardGroup
        label="Option Type"
        options={optionTypes}
        onChange={(values) => setValues(values)}
        values={values}
      />
    </div>
  );
}
