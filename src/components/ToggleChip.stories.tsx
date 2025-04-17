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

export const Default = newStory(
  () => (
    <div css={Css.bgWhite.p2.$}>
      <div css={Css.wPx(300).df.fdc.aifs.gap2.$}>
        <ExampleToggleChips />
      </div>
    </div>
  ),
  {
    play: hoverPlayFn(),
  },
);

export const Compact = newStory(
  () => (
    <div css={Css.bgWhite.p2.$}>
      <div css={Css.wPx(300).df.fdc.aifs.gap2.$}>
        <PresentationProvider fieldProps={{ compact: true }}>
          <ExampleToggleChips />
        </PresentationProvider>
      </div>
    </div>
  ),
  {
    play: hoverPlayFn(),
  },
);

function ExampleToggleChips() {
  return (
    <>
      <ToggleChip text="Default" onClick={action("click")} />
      <ToggleChip text="With Icon" icon="attachment" onClick={action("click")} />
      <ToggleChip text="Disabled" disabled onClick={action("click")} />
      <ToggleChip text="Hovered" onClick={action("click")} />
      <ToggleChip text={"Long text ".repeat(5)} icon="attachment" onClick={action("click")} />
    </>
  );
}

function hoverPlayFn() {
  return async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const chip = canvas.getByText("Hovered");
    return waitFor(async () => {
      await userEvent.hover(chip);
    });
  };
}
