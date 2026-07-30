import { Meta } from "@storybook/react-vite";
import { useState } from "react";
import { Css } from "src/Css";
import { SelectCardGroup } from "src/inputs/SelectCard/SelectCardGroup";
import {
  SelectCardGridGroupItemOption,
  SelectCardGroupProps,
  SelectCardListGroupItemOption,
} from "src/inputs/SelectCard/types";
import { action } from "storybook/actions";

export default {
  component: SelectCardGroup,
} as Meta<SelectCardGroupProps<string>>;

function createOptionTypes(): SelectCardGridGroupItemOption<string>[] {
  return [
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
      disabled: true,
      tooltip: "Type cannot be modified for existing options",
    },
    {
      icon: "package",
      label: "Package",
      description: "Selections come in preconfigured bundles.",
      value: "package",
    },
  ];
}

/** Reproduces the "Option Type" use case from Figma — cards with descriptions. */
export function OptionType() {
  const [value, setValue] = useState<string>("package");

  return (
    <div css={Css.wPx(640).$}>
      <SelectCardGroup label="Option Type" options={createOptionTypes()} onChange={setValue} value={value} />
    </div>
  );
}

/** Icon on the left, label and description on the right. */
export function HorizontalLayout() {
  const [value, setValue] = useState<string>("package");

  return (
    <div css={Css.wPx(640).$}>
      <SelectCardGroup
        label="Option Type"
        layout="horizontal"
        options={createOptionTypes()}
        onChange={setValue}
        value={value}
      />
    </div>
  );
}

/** Image on the left, label and description on the right. */
export function HorizontalLayoutWithImages() {
  const [value, setValue] = useState<string>("fridge");
  const link = { label: "More info", onClick: action("more info clicked") };
  const options: SelectCardGridGroupItemOption<string>[] = [
    { image: "fridge.jpeg", label: "Fridge", description: "Stainless steel, counter-depth", value: "fridge", link },
    { image: "disposal.png", label: "Disposal", description: "1/2 HP continuous feed", value: "disposal", link },
    { image: "counter-top.jpeg", label: "Counter Top", description: "Quartz, 3cm thickness", value: "counter-top" },
  ];

  return (
    <div css={Css.wPx(640).$}>
      <SelectCardGroup label="Appliances" layout="horizontal" options={options} onChange={setValue} value={value} />
    </div>
  );
}

function createRadioListOptions(): SelectCardListGroupItemOption<string>[] {
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

/** Radio list rows stacked vertically (Figma Select Card Group / Radio). */
export function ListRadioGroup() {
  const [value, setValue] = useState<string>("selected");

  return (
    <div css={Css.wPx(640).$}>
      <SelectCardGroup
        label="List Radio Group"
        view="list"
        options={createRadioListOptions()}
        onChange={setValue}
        value={value}
      />
    </div>
  );
}
