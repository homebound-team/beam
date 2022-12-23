import { Meta } from "@storybook/react";
import { useState } from "react";
import type { IconKey } from "src/components";
import { Css } from "src/Css";
import { MultiLineSelectField, Value } from "src/inputs";

export default {
  component: MultiLineSelectField,
  title: "Workspace/Inputs/Multi Line Select Fields",
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/aWUE4pPeUTgrYZ4vaTYZQU/%E2%9C%A8Beam-Design-System?node-id=36053%3A101882",
    },
  },
} as Meta;

type TestOption = {
  id: Value;
  name: string;
  icon?: IconKey;
};

const options: TestOption[] = [
  { id: "1", name: "Download", icon: "download" },
  { id: "2", name: "Camera", icon: "camera" },
  { id: "3", name: "Info Circle", icon: "infoCircle" },
  { id: "4", name: "Calendar", icon: "calendar" },
  { id: "5", name: "Dollar dollar bill, ya'll! ".repeat(5), icon: "dollar" },
];

export function MultiSelectFields() {
  const [pro, setPro] = useState<Value[]>([]);

  return (
    <div css={Css.df.fdc.gap5.$}>
      <div css={Css.df.fdc.gap2.$}>
        <h1 css={Css.lg.$}>Regular</h1>
        <MultiLineSelectField label="Favorite Icons" values={pro} options={options} onSelect={(val) => setPro(val)} />
      </div>

      <div>output</div>
      {pro.map((e, i) => (
        <div key={i}>{e?.toString}</div>
      ))}
    </div>
  );
}
