import { Meta } from "@storybook/react";
import { useState } from "react";
import type { IconKey } from "src/components";
import { Css } from "src/Css";
import { MultiLineSelectField, Value } from "src/inputs";
import { FormLines } from "..";

export default {
  component: MultiLineSelectField,
  title: "Workspace/Inputs/Multi Line Select Fields",
  parameters: { backgrounds: { default: "white" } },
} as Meta;

type TestOption = {
  id: Value;
  name: string;
  icon?: IconKey;
};

const options: TestOption[] = [
  { id: "sh:1", name: "Triangle" },
  { id: "sh:2", name: "Square" },
  { id: "sh:3", name: "Circle" },
  { id: "sh:4", name: "Star" },
  { id: "sh:5", name: "Rectangle".repeat(5) },
];

export function MultiLineSelectFields() {
  const [values, setValues] = useState<Value[]>([]);

  return (
    <div css={Css.df.fdc.gap3.$}>
      <div css={Css.df.fdc.gap2.$}>
        <h1 css={Css.lg.$}>Regular</h1>
        <FormLines width="md">
          <MultiLineSelectField label="Favorite Icons" values={values} options={options} onSelect={(val) => setValues(val)} />
        </FormLines>
      </div>
      <div css={Css.df.fdc.gap2.$}>
        <h1 css={Css.lg.$}>With a hidden label</h1>
        <FormLines width="md">
          <MultiLineSelectField label="Favorite Icons" labelStyle="hidden" values={values} options={options} onSelect={(val) => setValues(val)} />
        </FormLines>
      </div>
      <div css={Css.df.fdc.gap2.$}>
        <h1 css={Css.lg.$}>With a horizontal layout</h1>
        <FormLines width="md">
          <MultiLineSelectField label="Favorite Icons" labelStyle="left" values={values} options={options} onSelect={(val) => setValues(val)} />
        </FormLines>
      </div>
    </div>
  );
}
