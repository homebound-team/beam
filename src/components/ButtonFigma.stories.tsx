import { Button, ButtonProps } from "./Button";
import { Meta } from "@storybook/react";

export default {
  component: Button,
} as Meta<ButtonProps>;

export const ForFigma = {
  args: {
    label: "Test for Figma",
    variant: "primary",
    size: "md",
    icon: undefined,
    contrast: false,
    disabled: false,
  },
};
