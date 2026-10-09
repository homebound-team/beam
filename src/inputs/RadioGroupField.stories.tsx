import type { Meta } from "@storybook/react-vite";
import { type ReactNode, useState } from "react";
import { Carousel } from "src/components/Carousel";
import { Css, Tokens } from "src/Css";
import { FormLines } from "src/forms/FormLines";
import {
  radioChecked,
  radioDefault,
  radioDisabled,
  radioFocus,
  radioHover,
  radioReset,
  radioUnchecked,
} from "src/inputs/internal/radioStyles";
import { RadioGroupField } from "src/inputs/RadioGroupField";
import { StyledRadio } from "src/inputs/StyledRadio";
import { action } from "storybook/actions";

export default {
  component: RadioGroupField,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/aWUE4pPeUTgrYZ4vaTYZQU/%E2%9C%A8Beam-Design-System?node-id=36814%3A102223",
    },
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

export function Required() {
  const [state, setState] = useState<string | undefined>();
  return (
    <RadioGroupField
      label="Favorite cheese"
      required
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
    <FormLines width="sm">
      <p css={Css.mb1.$}>All options disabled</p>
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
        onBlur={action("onBlur")}
        onFocus={action("onFocus")}
      />
      <p css={Css.mb1.$}>Only a few options disabled, with a tooltip</p>
      <RadioGroupField
        label={"Favorite cheese"}
        value={"a"}
        onChange={() => {}}
        options={[
          { label: "Asiago", value: "a", disabled: "This option is disabled by some reason" },
          { label: "Burratta", value: "b" },
          { label: "Camembert", value: "c", disabled: true },
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
    </FormLines>
  );
}

export function ErrorMessage() {
  return (
    <RadioGroupField
      label={"Favorite cheese"}
      value={"a"}
      onChange={() => {}}
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
      onChange={() => {}}
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

export function HorizontalLayout() {
  const [state, setState] = useState<string | undefined>("option-1");
  return (
    <FormLines width="md">
      <RadioGroupField
        label="Estimate Type"
        layout="horizontal"
        value={state}
        onChange={setState}
        options={[
          { label: "Option 1", value: "option-1" },
          { label: "Option 2", value: "option-2" },
        ]}
        onBlur={action("onBlur")}
        onFocus={action("onFocus")}
      />
      <RadioGroupField
        label="Many Options"
        layout="horizontal"
        value={state}
        onChange={setState}
        options={Array.from({ length: 25 }, (_, i) => ({ label: `Option ${i + 1}`, value: `option-${i + 1}` }))}
        onBlur={action("onBlur")}
        onFocus={action("onFocus")}
      />
    </FormLines>
  );
}

/** `tooltip` renders an info icon beside the group's label. */
export function LabelTooltip() {
  return (
    <FormLines>
      <RadioGroupField
        label="Favorite cheese"
        tooltip="What this field is for"
        value="a"
        onChange={action("onChange")}
        options={[
          { value: "a", label: "Asiago" },
          { value: "b", label: "Burratta" },
        ]}
      />
    </FormLines>
  );
}

export function ThumbnailLayout() {
  const finishImages = ["disposal.png", "counter-top.jpeg", "fridge.jpeg", "fireplace.jpeg", "fridge2.jpeg"];
  const finishes = [
    "Chrome",
    "Brushed Nickel",
    "Satin Nickel",
    "Matte Black",
    "Brass",
    "Gold",
    "Bronze",
    "Copper",
    "Pewter",
    "Graphite",
    "Antique Brass",
    "Polished Brass",
    "Oil Rubbed Bronze",
    "Stainless Steel",
  ].map((label, i) => ({ label, value: `finish-${i + 1}`, imgSrc: finishImages[i % finishImages.length] }));
  const [value, setValue] = useState<string | undefined>("finish-1");
  return (
    <FormLines width="sm" gap={5}>
      <RadioGroupField
        label="Cabinet Hardware"
        layout="thumbnail"
        value={value}
        onChange={setValue}
        options={finishes}
        onBlur={action("onBlur")}
        onFocus={action("onFocus")}
      />
      <RadioGroupField
        label="With a disabled option, helper text and an error"
        layout="thumbnail"
        value={value}
        onChange={setValue}
        options={finishes.slice(0, 5).map((o, i) => (i === 2 ? { ...o, disabled: "Discontinued" } : o))}
        helperText="Pick the finish for every pull in the house."
        errorMsg="Required"
      />
      <div css={Css.wPx(240).$}>
        <Carousel>
          <RadioGroupField
            label="In a Carousel"
            labelStyle="hidden"
            layout="thumbnail"
            value={value}
            onChange={setValue}
            options={finishes}
          />
        </Carousel>
      </div>
    </FormLines>
  );
}

export function CustomOptionRows() {
  const packages = [
    {
      value: "front",
      label: "Front Load Washer and Dryer",
      price: "+ $10.00",
      images: ["fridge.jpeg", "fridge2.jpeg"],
    },
    { value: "top", label: "Top Load Washer and Dryer", price: "+ $10.00", images: ["disposal.png", "fireplace.jpeg"] },
    {
      value: "stacked",
      label: "Stacked Washer and Dryer",
      price: "+ $25.00",
      images: ["counter-top.jpeg"],
      disabled: "Doesn't fit the laundry room",
    },
  ];
  const [value, setValue] = useState<string | undefined>("top");
  return (
    <FormLines width="full" gap={5}>
      <div css={Css.wPx(720).maxw100.$}>
        <RadioGroupField
          label="Washer and Dryer"
          labelStyle="hidden"
          value={value}
          onChange={setValue}
          options={packages}
          renderOption={({ label, price, images }, radioProps) => {
            const { isDisabled = false } = radioProps;
            return (
              <label
                css={
                  Css.df.fdc.gap2.py2.bb
                    .bc(Tokens.FieldBorderDefault)
                    .cursorPointer.if(isDisabled)
                    .cursorNotAllowed.color(Tokens.TextDisabled).$
                }
              >
                {/* Spans, b/c a `<div>` isn't valid HTML inside a `<label>`. */}
                <span css={Css.df.aic.gap1.$}>
                  <StyledRadio {...radioProps} />
                  <span css={Css.fg1.mdSb.$}>{label}</span>
                  <span css={Css.md.$}>{price}</span>
                </span>
                <span css={Css.df.gap2.ml3.$}>
                  {images.map((src) => (
                    <img
                      key={src}
                      src={src}
                      alt=""
                      css={Css.sqPx(96).p1.br8.ba.bc(Tokens.FieldBorderDefault).objectContain.if(isDisabled).o50.$}
                    />
                  ))}
                </span>
              </label>
            );
          }}
        />
      </div>
    </FormLines>
  );
}
