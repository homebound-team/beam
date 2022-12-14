import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import { ReactNode, useState } from "react";
import { Css } from "src/Css";
import { FormLines } from "src/forms";
import {
  radioChecked,
  radioDefault,
  radioDisabled,
  radioFocus,
  RadioGroupField,
  radioHover,
  radioReset,
  radioUnchecked,
} from "src/inputs/RadioGroupField";

export default {
  component: RadioGroupField,
  title: "Workspace/Inputs/Radio Group",
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/aWUE4pPeUTgrYZ4vaTYZQU/%E2%9C%A8Beam-Design-System?node-id=36814%3A102223",
    }
  },
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
    <FormLines width="sm">
      <p css={Css.mb1.$}>With RadioGroupField label</p>
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
        onBlur={action("onBlur")}
        onFocus={action("onFocus")}
      />
      <p css={Css.mb1.$}>With hidden RadioGroupField label</p>
      <RadioGroupField
        label={"Favorite cheese"}
        labelStyle="hidden"
        value={state}
        onChange={setState}
        options={[
          { label: "Asiago", value: "a" },
          { label: "Burratta", value: "b" },
          { label: "Camembert", value: "c" },
          { label: "Roquefort", value: "d" },
        ]}
        onBlur={action("onBlur")}
        onFocus={action("onFocus")}
      />
      <p css={Css.mb1.$}>With a left RadioGroupField label</p>
      <RadioGroupField
        label={"Favorite cheese"}
        labelStyle="left"
        value={state}
        onChange={setState}
        options={[
          { label: "Asiago", value: "a" },
          { label: "Burratta", value: "b" },
          { label: "Camembert", value: "c" },
          { label: "Roquefort", value: "d" },
        ]}
        onBlur={action("onBlur")}
        onFocus={action("onFocus")}
      />
    </FormLines>
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
      onBlur={action("onBlur")}
      onFocus={action("onFocus")}
    />
  );
}

export function Disabled() {
  return (
    <RadioGroupField
      label={"Favorite cheese"}
      value={"a"}
      onChange={() => { }}
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
      onBlur={action("onBlur")}
      onFocus={action("onFocus")}
    />
  );
}

export function ErrorMessage() {
  return (
    <RadioGroupField
      label={"Favorite cheese"}
      value={"a"}
      onChange={() => { }}
      errorMsg="Required"
      options={[
        { label: "Asiago", value: "a" },
        { label: "Burratta", value: "b" },
      ]}
      onBlur={action("onBlur")}
      onFocus={action("onFocus")}
    />
  );
}

export function HelperText() {
  return (
    <RadioGroupField
      label={"Favorite cheese"}
      value={"a"}
      onChange={() => { }}
      options={[
        { label: "Asiago", value: "a" },
        { label: "Burratta", value: "b" },
      ]}
      helperText="Some really long helper text that we expect to wrap."
      onBlur={action("onBlur")}
      onFocus={action("onFocus")}
    />
  );
}
