import { Meta } from "@storybook/react";
import { Css } from "src/Css";
import { Checkbox } from "src/index";

export default {
  component: Checkbox,
  title: "Components/Checkboxes",
} as Meta;

export function Checkboxes() {
  return (
    <div css={Css.df.flexColumn.$}>
      <div>
        <h2>No Label</h2>
        <div css={Css.df.wPx(120).justifyBetween.pb1.$}>
          <Checkbox aria-label="default" autoFocus onChange={() => {}}></Checkbox>
          <Checkbox aria-label="selected" isSelected></Checkbox>
          <Checkbox aria-label="indeterminate" isIndeterminate></Checkbox>
          <Checkbox aria-label="disabled" isDisabled></Checkbox>
        </div>
      </div>
      <h2>With Label</h2>
      <div css={Css.df.wPx(300).justifyBetween.pb1.$}>
        <Checkbox onChange={() => {}}>Label</Checkbox>
        <Checkbox isSelected>Label</Checkbox>
        <Checkbox isIndeterminate>Label</Checkbox>
        <Checkbox isDisabled>Label</Checkbox>
      </div>
    </div>
  );
}
