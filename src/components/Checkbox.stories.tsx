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
        <h2>Basic Checkboxes</h2>
        <div css={Css.dg.gap2.$}>
          <Checkbox aria-label="default" onChange={() => {}}>
            Default
          </Checkbox>
          <Checkbox aria-label="selected" isSelected onChange={() => {}}>
            Selected
          </Checkbox>
          <Checkbox aria-label="selected" autoFocus isSelected>
            Selected/Focused
          </Checkbox>
          <Checkbox aria-label="indeterminate" isIndeterminate>
            Indeterminate
          </Checkbox>
          <Checkbox aria-label="disabled" isDisabled>
            Disabled
          </Checkbox>
        </div>
      </div>
      <h2>Checkbox with Label and Description</h2>
      <div css={Css.gap2.dg.$}>
        <Checkbox onChange={() => {}} description="Get notified when someone posts a comment on a posting">
          Comments
        </Checkbox>
      </div>
    </div>
  );
}
