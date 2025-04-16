import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import { userEvent, waitFor, within } from "@storybook/test";
import { Css, PresentationProvider, ToggleChip } from "src/index";
import { newStory } from "src/utils/sb";

export default {
  component: ToggleChip,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/aWUE4pPeUTgrYZ4vaTYZQU/%E2%9C%A8Beam-Design-System?node-id=34522%3A101241",
    },
  },
} as Meta;

export const DefaultToggleChip = newStory(
  () => (
    <div css={Css.df.fdc.gap4.bgWhite.p2.$}>
      <div>
        <h2 css={Css.mb1.$}>Standard</h2>
        <div css={Css.wPx(300).df.fdc.aifs.gap2.$}>
          <ToggleChip text="Default" onClick={action("click")} />
          <ToggleChip text="Icon" icon="attachment" onClick={action("click")} />
          <ToggleChip text="Disabled" disabled onClick={action("click")} />
          <ToggleChip text="Hovered" onClick={action("click")} />
          <ToggleChip text="No x chip" clearable={false} onClick={action("click")} />
          <ToggleChip text="Active" clearable={false} active={true} onClick={action("click")} />
          <ToggleChip text={"Long text ".repeat(5)} icon="attachment" onClick={action("click")} />
        </div>
      </div>

      <div>
        <h2 css={Css.mb1.$}>Compact</h2>
        <div css={Css.wPx(300).df.fdc.aifs.gap2.$}>
          <PresentationProvider fieldProps={{ compact: true }}>
            <ToggleChip text="Default" onClick={action("click")} />
            <ToggleChip text="Icon" icon="attachment" onClick={action("click")} />
            <ToggleChip text="Disabled" disabled onClick={action("click")} />
            <ToggleChip text="Hovered" onClick={action("click")} />
            <ToggleChip text="No x chip" clearable={false} onClick={action("click")} />
            <ToggleChip text="Active" clearable={false} active={true} onClick={action("click")} />
            <ToggleChip text={"Long text ".repeat(5)} icon="attachment" onClick={action("click")} />
          </PresentationProvider>
        </div>
      </div>
    </div>
  ),
  {
    play: async ({ canvasElement }) => {
      const canvas = within(canvasElement);
      const chip = canvas.getByText("Hovered chip");
      return waitFor(async () => {
        await userEvent.hover(chip);
      });
    },
  },
);
