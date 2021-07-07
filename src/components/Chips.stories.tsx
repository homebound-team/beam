import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import { Chips } from "src/components/Chips";
import { Css } from "src/Css";

export default {
  component: Chips,
  title: "Components/Chips",
} as Meta;

export function DefaultChips() {
  return (
    <div css={Css.wPx(300).ba.$}>
      <Chips
        values={[{ name: "First Last" }, { name: "Second Last" }, { name: "Third Last" }, { name: "Fourth Last" }]}
        getLabel={(v) => v.name}
        onRemove={(v) => action(`removed ${v.name}`)()}
      />
    </div>
  );
}
