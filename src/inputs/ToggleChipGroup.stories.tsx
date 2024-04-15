import { Meta } from "@storybook/react";
import { useState } from "react";
import { ToggleChipGroup } from "src/inputs/ToggleChipGroup";
import { Css } from "..";

export default {
  component: ToggleChipGroup,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/aWUE4pPeUTgrYZ4vaTYZQU/%E2%9C%A8Beam-Design-System?node-id=34522%3A101241",
    },
  },
} as Meta;

export function ToggleChipGroups() {
  const [selectedValues, setSelectedValues] = useState<string[]>(["m:2"]);
  const options = [
    { label: "Bahamas", value: "m:1" },
    { label: "Southern California", value: "m:2" },
    { label: "Northern California", value: "m:3" },
    { label: "South Bay CA", value: "m:4" },
    { label: "Austin", value: "m:5" },
  ];
  return (
    <>
      <p css={Css.mt2.mb2.$} >Label Above Style:</p>
      <ToggleChipGroup label="Select Markets" options={options} values={selectedValues} onChange={setSelectedValues} />
      <div css={Css.m2.$} />
      <p css={Css.mt2.mb2.$} >Label Left Style:</p>
      <ToggleChipGroup
        label="Select Markets"
        labelStyle="left"
        options={options}
        values={selectedValues}
        onChange={setSelectedValues}
      />
    </>
  );
}
