import { Icon as IconComponent, IconProps, Icons } from "src/components";
import { Meta, StoryObj } from "@storybook/react";
import { Palette } from "src/Css";

export default {
  component: IconComponent,
} as Meta<IconProps>;

export const ForFigma: StoryObj<IconProps> = {
  argTypes: {
    color: {
      control: {
        type: "select",
        labels: Object.fromEntries(Object.entries(Palette).map(([key, value]) => [value, key])),
      },
    },
    icon: {
      control: {
        type: "select",
        options: Object.keys(Icons),
      },
    },
  },
  args: {
    icon: "x",
    inc: 3,
  },
  parameters: {
    s2d: {
      variantProperties: [
        {
          fromArg: "inc",
          name: "Size",
          values: [
            { name: "Small", argValue: 2 },
            { name: "Medium", argValue: 3 },
            { name: "Large", argValue: 4 },
          ],
        },
      ],
    },
  },
};
