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
          <Checkbox aria-label="default" onChange={() => {}} label="Default" />
          <Checkbox aria-label="selected" selected label="Selected" />
          <Checkbox aria-label="selected" autoFocus selected label="Selected/Focused" />
          <Checkbox aria-label="indeterminate" indeterminate label="Indeterminate" />
          <Checkbox aria-label="disabled" disabled label="Disabled" />
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
