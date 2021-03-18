import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import { Button, ButtonProps, Css } from "src/index";

export default {
  title: "Components/Buttons",
  component: Button,
  args: {
    onPress: action("onPress"),
  },
} as Meta<ButtonProps>;

export function Buttons(args: ButtonProps) {
  return (
    <div css={Css.dg.gtc("repeat(4, auto)").$}>
      <div>
        <h2>Primary</h2>
        <div>
          <Button autoFocus {...args}>
            Primary Button
          </Button>
          <Button isDisabled {...args}>
            Disabled
          </Button>
        </div>
        <div>
          <Button size="md" {...args}>
            Primary Button
          </Button>
          <Button size="md" isDisabled {...args}>
            Disabled
          </Button>
        </div>
        <div>
          <Button size="lg" {...args}>
            Primary Button
          </Button>
          <Button size="lg" isDisabled {...args}>
            Disabled
          </Button>
        </div>
        <div>
          <Button icon="plus" {...args}>
            Primary Button
          </Button>
          <Button isDisabled icon="plus" {...args}>
            Disabled
          </Button>
        </div>
        <div>
          <Button size="md" icon="plus" {...args}>
            Primary Button
          </Button>
          <Button size="md" isDisabled icon="plus" {...args}>
            Disabled
          </Button>
        </div>
        <div>
          <Button size="lg" icon="plus" {...args}>
            Primary Button
          </Button>
          <Button size="lg" isDisabled icon="plus" {...args}>
            Disabled
          </Button>
        </div>
      </div>

      <div>
        <h2>Secondary</h2>
        <div>
          <Button variant="secondary" {...args}>
            Secondary Button
          </Button>
          <Button variant="secondary" isDisabled {...args}>
            Disabled
          </Button>
        </div>
        <div>
          <Button size="md" variant="secondary" {...args}>
            Secondary Button
          </Button>
          <Button size="md" variant="secondary" isDisabled {...args}>
            Disabled
          </Button>
        </div>
        <div>
          <Button size="lg" variant="secondary" {...args}>
            Secondary Button
          </Button>
          <Button size="lg" variant="secondary" isDisabled {...args}>
            Disabled
          </Button>
        </div>
        <div>
          <Button icon="plus" variant="secondary" {...args}>
            Secondary Button
          </Button>
          <Button icon="plus" variant="secondary" isDisabled {...args}>
            Disabled
          </Button>
        </div>
        <div>
          <Button icon="plus" size="md" variant="secondary" {...args}>
            Secondary Button
          </Button>
          <Button icon="plus" size="md" variant="secondary" isDisabled {...args}>
            Disabled
          </Button>
        </div>
        <div>
          <Button icon="plus" size="lg" variant="secondary" {...args}>
            Secondary Button
          </Button>
          <Button icon="plus" size="lg" variant="secondary" isDisabled {...args}>
            Disabled
          </Button>
        </div>
      </div>

      <div>
        <h2>Tertiary</h2>
        <div>
          <Button variant="tertiary" {...args}>
            Tertiary Button
          </Button>
          <Button variant="tertiary" isDisabled {...args}>
            Disabled
          </Button>
        </div>
        <div>
          <Button icon="plus" variant="tertiary" {...args}>
            Tertiary Button
          </Button>
          <Button icon="plus" variant="tertiary" isDisabled {...args}>
            Disabled
          </Button>
        </div>
      </div>

      <div>
        <h2>Danger!</h2>
        <div>
          <Button variant="danger" {...args}>
            Danger Button
          </Button>
          <Button variant="danger" isDisabled {...args}>
            Disabled
          </Button>
        </div>
        <div>
          <Button size="md" variant="danger" {...args}>
            Danger Button
          </Button>
          <Button size="md" variant="danger" isDisabled {...args}>
            Disabled
          </Button>
        </div>
        <div>
          <Button size="lg" variant="danger" {...args}>
            Danger Button
          </Button>
          <Button size="lg" variant="danger" isDisabled {...args}>
            Disabled
          </Button>
        </div>
        <div>
          <Button icon="trash" variant="danger" {...args}>
            Danger Button
          </Button>
          <Button icon="trash" variant="danger" isDisabled {...args}>
            Disabled
          </Button>
        </div>
        <div>
          <Button icon="trash" size="md" variant="danger" {...args}>
            Danger Button
          </Button>
          <Button icon="trash" size="md" variant="danger" isDisabled {...args}>
            Disabled
          </Button>
        </div>
        <div>
          <Button icon="trash" size="lg" variant="danger" {...args}>
            Danger Button
          </Button>
          <Button icon="trash" size="lg" variant="danger" isDisabled {...args}>
            Disabled
          </Button>
        </div>
      </div>
    </div>
  );
}
