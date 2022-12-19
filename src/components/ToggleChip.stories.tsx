import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import { Css, PresentationProvider, ToggleChip } from "src/index";

export default {
  component: ToggleChip,
  title: "Workspace/Components/ToggleChip",
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/aWUE4pPeUTgrYZ4vaTYZQU/%E2%9C%A8Beam-Design-System?node-id=34522%3A101241",
    },
  },
} as Meta;

export function DefaultToggleChip() {
  return (
    <div css={Css.df.fdc.gap4.$}>
      <div css={Css.wPx(300).df.fdc.aifs.gap2.$}>
        <ToggleChip text="First Last" onClick={action("click")} />
        <ToggleChip text="Disabled Chip" disabled onClick={action("click")} />
        <ToggleChip text={"First Last ".repeat(10)} onClick={action("click")} />
      </div>

      <div>
        <h2 css={Css.mb1.$}>Compact</h2>
        <div css={Css.wPx(300).df.fdc.aifs.gap2.$}>
          <PresentationProvider fieldProps={{ compact: true }}>
            <ToggleChip text="First Last" onClick={action("click")} />
            <ToggleChip text="Disabled Chip" disabled onClick={action("click")} />
            <ToggleChip text={"First Last ".repeat(10)} onClick={action("click")} />
          </PresentationProvider>
        </div>
      </div>
    </div>
  );
}
