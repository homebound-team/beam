import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import { ToggleChips } from "src/components/ToggleChips";
import { Css } from "src/Css";

export default {
  component: ToggleChips,
  title: "Workspace/Components/ToggleChips",
} as Meta;

export function DefaultToggleChips() {
  return (
    <div css={Css.wPx(300).$}>
      <ToggleChips
        values={[{ name: "First Last" }, { name: "Second Last" }, { name: "Third Last" }, { name: "Fourth Last" }]}
        getLabel={(v) => v.name}
        onRemove={(v) => action(`removed ${v.name}`)()}
      />
    </div>
  );
}
