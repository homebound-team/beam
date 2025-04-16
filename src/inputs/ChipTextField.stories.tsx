import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import { waitFor, within } from "@storybook/test";
import { useState } from "react";
import { Css } from "src/Css";
import { ChipTextField } from "src/inputs/ChipTextField";
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
    const [value, setValue] = useState("Add new");

    return (
      <div css={Css.df.gap1.bgWhite.p2.$}>
        <ChipTextField
          value={value}
          label="Chip Field"
          onChange={setValue}
          onFocus={action("onFocus")}
          onBlur={action("onBlur")}
          required
        />
        <ChipTextField
          value={value}
          label="Focused"
          onChange={setValue}
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
