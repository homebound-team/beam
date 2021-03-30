import { Meta } from "@storybook/react";
import { ReactNode, useState } from "react";
import {
  radioChecked,
  radioDefault,
  radioDisabled,
  radioFocus,
  RadioGroupField,
  radioHover,
  radioReset,
  radioUnchecked,
} from "src/components/RadioGroupField";
import { Css } from "src/Css";

export default {
  component: RadioGroupField,
  title: "Components/Radio Group",
} as Meta;

export function BaseStates() {
  const examples: [string, ReactNode][] = [
    [
      "Unchecked",
      <input
        type="radio"
        css={{
          ...radioReset,
          ...radioDefault,
          ...radioUnchecked,
        }}
      />,
    ],
    [
      "Checked",
      <input
        type="radio"
        css={{
          ...radioReset,
          ...radioDefault,
          ...radioChecked,
        }}
      />,
    ],
    [
      "Unchecked/Focus",
      <input
        type="radio"
        css={{
          ...radioReset,
          ...radioDefault,
          ...radioUnchecked,
          ...radioFocus,
        }}
      />,
    ],
    [
      "Checked/Focus",
      <input
        type="radio"
        css={{
          ...radioReset,
          ...radioDefault,
          ...radioChecked,
          ...radioFocus,
        }}
      />,
    ],
    [
      "Unchecked/Hover",
      <input
        type="radio"
        css={{
          ...radioReset,
          ...radioDefault,
          ...radioHover,
          ...radioUnchecked,
        }}
      />,
    ],
    [
      "Checked/Hover",
      <input
        type="radio"
        css={{
          ...radioReset,
          ...radioDefault,
          ...radioHover,
          ...radioChecked,
        }}
      />,
    ],
    [
      "Disabled",
      <input
        type="radio"
        disabled
        css={{
          ...radioReset,
          ...radioDefault,
          ...radioUnchecked,
          ...radioDisabled,
        }}
      />,
    ],
  ];
  return (
    <div>
      <div css={Css.dig.gtc("auto auto").$}>
        {examples.map(([label, node]) => {
          const style = Css.m1.$;
          return (
            <>
              <div css={style}>{label}</div>
              <div css={style}>{node}</div>
            </>
          );
        })}
      </div>
    </div>
  );
}

export function OnlyLabels() {
  const [state, setState] = useState<string | undefined>();
  return (
    <RadioGroupField
      label={"Favorite cheese"}
      value={state}
      onChange={setState}
      options={[
        { label: "Asiago", value: "a" },
        { label: "Burratta", value: "b" },
        { label: "Camembert", value: "c" },
        { label: "Roquefort", value: "d" },
      ]}
    />
  );
}

export function LabelsAndDescriptions() {
  const [state, setState] = useState<string | undefined>();
  return (
    <RadioGroupField
      label={"Favorite cheese"}
      value={state}
      onChange={setState}
      options={[
        {
          value: "a",
          label: "Asiago",
          description: "The tradition of making this cheese comes from Italy and dates back hundreds of years.",
        },
        {
          value: "b",
          label: "Burratta",
          description: "Burrata is an Italian cow milk cheese made from mozzarella and cream.",
        },
        {
          value: "c",
          label: "Camembert",
          description: "It claims to be one of the best-known French cheeses and the world’s most imitated one.",
        },
        {
          value: "d",
          label: "Roquefort",
          description:
            "Roquefort is a sheep milk cheese from Southern France, and is one of the world's best known blue cheeses.",
        },
      ]}
    />
  );
}

export function Disabled() {
  return (
    <RadioGroupField
      label={"Favorite cheese"}
      value={"a"}
      onChange={() => {}}
      disabled={true}
      options={[
        { label: "Asiago", value: "a" },
        { label: "Burratta", value: "b" },
        { label: "Camembert", value: "c" },
        {
          label: "Roquefort",
          description:
            "Roquefort is a sheep milk cheese from Southern France, and is one of the world's best known blue cheeses.",
          value: "d",
        },
      ]}
    />
  );
}
