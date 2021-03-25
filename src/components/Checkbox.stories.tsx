import { Meta } from "@storybook/react";
import { Css } from "src/Css";
import { Checkbox } from "src/index";

export default {
  component: Checkbox,
  title: "Components/Checkboxes",
} as Meta;

export function Checkboxes() {
  return (
    <div css={Css.dg.gap2.p1.$}>
      <div>
        <h2 css={Css.mb1.$}>Basic Checkboxes</h2>
        <div css={Css.dg.gap1.$}>
          <Checkbox onChange={() => {}} label="Default" />
          <Checkbox onChange={() => {}} selected label="Selected" />
          <Checkbox onChange={() => {}} autoFocus selected label="Selected/Focused" />
          <Checkbox onChange={() => {}} indeterminate label="Indeterminate" />
          <Checkbox onChange={() => {}} disabled label="Disabled" />
        </div>
      </div>
      <div>
        <h2 css={Css.mb1.$}>Checkbox with Label and Description</h2>
        <div>
          <Checkbox
            onChange={() => {}}
            description="Get notified when someone posts a comment on a posting"
            label="Comments"
          />
        </div>
      </div>
    </div>
  );
}
