import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import { Button, ButtonProps } from "src";
import { Css } from "src/Css";

export default {
  title: "Components/Buttons",
  component: Button,
  args: { onClick: action("onPress") },
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
          <Button {...args} label="Primary Button" autoFocus />
          <Button {...args} disabled label="Disabled" />
        </div>
        <div>
          <Button {...args} size="md" label="Primary Button" />
          <Button {...args} size="md" disabled label="Disabled" />
        </div>
        <div>
          <Button {...args} size="lg" label="Primary Button" />
          <Button {...args} size="lg" disabled {...args} label="Disabled" />
        </div>
        <div>
          <Button {...args} icon="plus" label="Primary Button" />
          <Button {...args} disabled icon="plus" label="Disabled" />
        </div>
        <div>
          <Button {...args} size="md" icon="plus" label="Primary Button" />
          <Button {...args} size="md" disabled icon="plus" label="Disabled" />
        </div>
        <div>
          <Button {...args} size="lg" icon="plus" label="Primary Button" />
          <Button {...args} size="lg" disabled icon="plus" label="Disabled" />
        </div>
      </div>

      <div>
        <h2>Secondary</h2>
        <div>
          <Button {...args} variant="secondary" label="Secondary Button" />
          <Button {...args} variant="secondary" disabled label="Disabled" />
        </div>
        <div>
          <Button {...args} size="md" variant="secondary" label="Secondary Button" />
          <Button {...args} size="md" variant="secondary" disabled label="Disabled" />
        </div>
        <div>
          <Button {...args} size="lg" variant="secondary" label="Secondary Button" />
          <Button {...args} size="lg" variant="secondary" disabled label="Disabled" />
        </div>
        <div>
          <Button {...args} icon="plus" variant="secondary" label="Secondary Button" />
          <Button {...args} icon="plus" variant="secondary" disabled label="Disabled" />
        </div>
        <div>
          <Button {...args} icon="plus" size="md" variant="secondary" label="Secondary Button" />
          <Button {...args} icon="plus" size="md" variant="secondary" disabled label="Disabled" />
        </div>
        <div>
          <Button {...args} icon="plus" size="lg" variant="secondary" label="Secondary Button" />
          <Button {...args} icon="plus" size="lg" variant="secondary" disabled label="Disabled" />
        </div>
      </div>

      <div>
        <h2>Tertiary</h2>
        <div>
          <Button {...args} variant="tertiary" label="Tertiary Button" />
          <Button {...args} variant="tertiary" disabled label="Disabled" />
        </div>
        <div>
          <Button {...args} icon="plus" variant="tertiary" label="Tertiary Button" />
          <Button {...args} icon="plus" variant="tertiary" disabled label="Disabled" />
        </div>
      </div>

      <div>
        <h2>Danger!</h2>
        <div>
          <Button {...args} variant="danger" label="Danger Button" />
          <Button {...args} variant="danger" disabled label="Disabled" />
        </div>
        <div>
          <Button {...args} size="md" variant="danger" label="Danger Button" />
          <Button {...args} size="md" variant="danger" disabled label="Disabled" />
        </div>
        <div>
          <Button {...args} size="lg" variant="danger" label="Danger Button" />
          <Button {...args} size="lg" variant="danger" disabled label="Disabled" />
        </div>
        <div>
          <Button {...args} icon="trash" variant="danger" label="Danger Button" />
          <Button {...args} icon="trash" variant="danger" disabled label="Disabled" />
        </div>
        <div>
          <Button {...args} icon="trash" size="md" variant="danger" label="Danger Button" />
          <Button {...args} icon="trash" size="md" variant="danger" disabled label="Disabled" />
        </div>
        <div>
          <Button {...args} icon="trash" size="lg" variant="danger" label="Danger Button" />
          <Button {...args} icon="trash" size="lg" variant="danger" disabled label="Disabled" />
        </div>
      </div>
    </div>
  );
}
