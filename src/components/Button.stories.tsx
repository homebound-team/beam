import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import { Button, ButtonProps } from "src";
import { Css } from "src/Css";

export default {
  title: "Components/Buttons",
  component: Button,
  args: {
    onPress: action("onPress"),
  },
  argTypes: {
    autoFocus: { control: false },
    variant: { control: false },
    icon: { control: false },
    size: { control: false },
    children: { control: false },
  },
} as Meta<ButtonProps>;

export function Buttons(args: ButtonProps) {
  return (
    <div css={Css.dg.gtc("repeat(4, auto)").$}>
      <div>
        <h2>Primary</h2>
        <div>
          <Button {...args} autoFocus>
            Primary Button
          </Button>
          <Button {...args} isDisabled>
            Disabled
          </Button>
        </div>
        <div>
          <Button {...args} size="md">
            Primary Button
          </Button>
          <Button {...args} size="md" isDisabled>
            Disabled
          </Button>
        </div>
        <div>
          <Button {...args} size="lg">
            Primary Button
          </Button>
          <Button {...args} size="lg" isDisabled {...args}>
            Disabled
          </Button>
        </div>
        <div>
          <Button {...args} icon="plus">
            Primary Button
          </Button>
          <Button {...args} isDisabled icon="plus">
            Disabled
          </Button>
        </div>
        <div>
          <Button {...args} size="md" icon="plus">
            Primary Button
          </Button>
          <Button {...args} size="md" isDisabled icon="plus">
            Disabled
          </Button>
        </div>
        <div>
          <Button {...args} size="lg" icon="plus">
            Primary Button
          </Button>
          <Button {...args} size="lg" isDisabled icon="plus">
            Disabled
          </Button>
        </div>
      </div>

      <div>
        <h2>Secondary</h2>
        <div>
          <Button {...args} variant="secondary">
            Secondary Button
          </Button>
          <Button {...args} variant="secondary" isDisabled>
            Disabled
          </Button>
        </div>
        <div>
          <Button {...args} size="md" variant="secondary">
            Secondary Button
          </Button>
          <Button {...args} size="md" variant="secondary" isDisabled>
            Disabled
          </Button>
        </div>
        <div>
          <Button {...args} size="lg" variant="secondary">
            Secondary Button
          </Button>
          <Button {...args} size="lg" variant="secondary" isDisabled>
            Disabled
          </Button>
        </div>
        <div>
          <Button {...args} icon="plus" variant="secondary">
            Secondary Button
          </Button>
          <Button {...args} icon="plus" variant="secondary" isDisabled>
            Disabled
          </Button>
        </div>
        <div>
          <Button {...args} icon="plus" size="md" variant="secondary">
            Secondary Button
          </Button>
          <Button {...args} icon="plus" size="md" variant="secondary" isDisabled>
            Disabled
          </Button>
        </div>
        <div>
          <Button {...args} icon="plus" size="lg" variant="secondary">
            Secondary Button
          </Button>
          <Button {...args} icon="plus" size="lg" variant="secondary" isDisabled>
            Disabled
          </Button>
        </div>
      </div>

      <div>
        <h2>Tertiary</h2>
        <div>
          <Button {...args} variant="tertiary">
            Tertiary Button
          </Button>
          <Button {...args} variant="tertiary" isDisabled>
            Disabled
          </Button>
        </div>
        <div>
          <Button {...args} icon="plus" variant="tertiary">
            Tertiary Button
          </Button>
          <Button {...args} icon="plus" variant="tertiary" isDisabled>
            Disabled
          </Button>
        </div>
      </div>

      <div>
        <h2>Danger!</h2>
        <div>
          <Button {...args} variant="danger">
            Danger Button
          </Button>
          <Button {...args} variant="danger" isDisabled>
            Disabled
          </Button>
        </div>
        <div>
          <Button {...args} size="md" variant="danger">
            Danger Button
          </Button>
          <Button {...args} size="md" variant="danger" isDisabled>
            Disabled
          </Button>
        </div>
        <div>
          <Button {...args} size="lg" variant="danger">
            Danger Button
          </Button>
          <Button {...args} size="lg" variant="danger" isDisabled>
            Disabled
          </Button>
        </div>
        <div>
          <Button {...args} icon="trash" variant="danger">
            Danger Button
          </Button>
          <Button {...args} icon="trash" variant="danger" isDisabled>
            Disabled
          </Button>
        </div>
        <div>
          <Button {...args} icon="trash" size="md" variant="danger">
            Danger Button
          </Button>
          <Button {...args} icon="trash" size="md" variant="danger" isDisabled>
            Disabled
          </Button>
        </div>
        <div>
          <Button {...args} icon="trash" size="lg" variant="danger">
            Danger Button
          </Button>
          <Button {...args} icon="trash" size="lg" variant="danger" isDisabled>
            Disabled
          </Button>
        </div>
      </div>
    </div>
  );
}
