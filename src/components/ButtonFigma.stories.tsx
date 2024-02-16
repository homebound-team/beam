import { Button, ButtonProps } from "./Button";
import { Meta } from "@storybook/react";
import { Icons } from "src/components/Icon";

export default {
  component: Button,
} as Meta<ButtonProps>;

const iconKeys = Object.keys(Icons);

export const ForFigma = {
  argTypes: {
    icon: { control: "select", options: iconKeys },
    endAdornment: { control: "select", options: iconKeys },
  },
  args: {
    label: "Test for Figma",
    variant: "primary",
    size: "md",
    icon: undefined,
    contrast: false,
    disabled: false,
  },
};
