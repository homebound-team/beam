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
  { icon: "columns", label: "Management", value: Category.Management },
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
    exclusive: true,
  },
  {
    icon: "linked",
    label: "Linked",
    description: "Slots share the same options and always have the same selection.",
    value: "linked",
    exclusive: true,
    disabled: true,
    tooltip: "Type cannot be modified for existing options",
  },
  {
    icon: "package",
    label: "Package",
    description: "Selections come in preconfigured bundles.",
    value: "package",
    exclusive: true,
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

const mixedOptions: SelectCardGroupItemOption<string>[] = [
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

/**
 * Mix of cards with and without descriptions in one group. The description cards grow to fill the
 * row and stretch to a shared height, while the label-only cards keep their fixed compact size.
 */
export function MixedDescriptions() {
  const [values, setValues] = useState<string[]>(["single"]);

  return (
    <div css={Css.wPx(640).$}>
      <SelectCardGroup
        label="Mixed Descriptions"
        options={mixedOptions}
        onChange={(values) => setValues(values)}
        values={values}
      />
    </div>
  );
}
