import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import { waitFor, within } from "@storybook/test";
import { Css } from "src/Css";
import { ChipTextField } from "src/inputs/ChipTextField";
import { noop } from "src/utils";
import { newStory } from "src/utils/sb";

export default {
  component: ChipTextField,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/aWUE4pPeUTgrYZ4vaTYZQU/%E2%9C%A8Beam-Design-System?node-id=34522%3A101241",
    },
  },
} as Meta;

export const DefaultChip = newStory(
  () => {
    return (
      <div css={Css.df.gap1.bgWhite.p2.$}>
        <ChipTextField
          value="Add new"
          label="Chip Field"
          onChange={noop}
          onFocus={action("onFocus")}
          onBlur={action("onBlur")}
          required
        />
        <ChipTextField
          value={"Focused"}
          label="Focused"
          onChange={noop}
          onFocus={action("onFocus")}
          onBlur={action("onBlur")}
          autoFocus
        />
      </div>
    );
  },
  {
    play: async ({ canvasElement }) => {
      const canvas = within(canvasElement);
      return waitFor(async () => {
        await canvas.getByText("Focused").focus();
      });
    },
  },
);
