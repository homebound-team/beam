import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import { Button, ButtonProps, Icon } from "src";
import { Css } from "src/Css";
import { withRouter } from "src/utils/sb";

export default {
  title: "Components/Button",
  component: Button,
  decorators: [withRouter()],
  args: { onClick: action("onPress") },
  argTypes: {
    autoFocus: { control: false },
    variant: { control: false },
    icon: { control: false },
    size: { control: false },
    children: { control: false },
  },
  parameters: {
    // To better view the hover state
    backgrounds: { default: "white" },
  },
} as Meta<ButtonProps>;

export function ButtonVariations(args: ButtonProps) {
  return (
    <div css={Css.dg.flexColumn.childGap2.$}>
      <div>
        <h2>Primary</h2>
        <div css={buttonRowStyles}>
          <Button onClick="https://google.com" label="Primary Button" autoFocus />
          <Button {...args} disabled label="Disabled" />
        </div>
        <div css={buttonRowStyles}>
          <Button {...args} size="md" label="Primary Button" />
          <Button {...args} size="md" disabled label="Disabled" />
        </div>
        <div css={buttonRowStyles}>
          <Button {...args} size="lg" label="Primary Button" />
          <Button {...args} size="lg" disabled label="Disabled" />
        </div>
        <div css={buttonRowStyles}>
          <Button {...args} icon="plus" label="Primary Button" />
          <Button {...args} disabled icon="plus" label="Disabled" />
        </div>
        <div css={buttonRowStyles}>
          <Button {...args} size="md" icon="plus" label="Primary Button" />
          <Button {...args} size="md" disabled icon="plus" label="Disabled" />
        </div>
        <div css={buttonRowStyles}>
          <Button {...args} size="lg" icon="plus" label="Primary Button" />
          <Button {...args} size="lg" disabled icon="plus" label="Disabled" />
        </div>
      </div>

      <div>
        <h2>Secondary</h2>
        <div css={buttonRowStyles}>
          <Button {...args} variant="secondary" label="Secondary Button" />
          <Button {...args} variant="secondary" disabled label="Disabled" />
        </div>
        <div css={buttonRowStyles}>
          <Button {...args} size="md" variant="secondary" label="Secondary Button" />
          <Button {...args} size="md" variant="secondary" disabled label="Disabled" />
        </div>
        <div css={buttonRowStyles}>
          <Button {...args} size="lg" variant="secondary" label="Secondary Button" />
          <Button {...args} size="lg" variant="secondary" disabled label="Disabled" />
        </div>
        <div css={buttonRowStyles}>
          <Button {...args} icon="plus" variant="secondary" label="Secondary Button" />
          <Button {...args} icon="plus" variant="secondary" disabled label="Disabled" />
        </div>
        <div css={buttonRowStyles}>
          <Button {...args} icon="plus" size="md" variant="secondary" label="Secondary Button" />
          <Button {...args} icon="plus" size="md" variant="secondary" disabled label="Disabled" />
        </div>
        <div css={buttonRowStyles}>
          <Button {...args} icon="plus" size="lg" variant="secondary" label="Secondary Button" />
          <Button {...args} icon="plus" size="lg" variant="secondary" disabled label="Disabled" />
        </div>
      </div>

      <div>
        <h2>Tertiary</h2>
        <div css={buttonRowStyles}>
          <Button {...args} variant="tertiary" label="Tertiary Button" />
          <Button {...args} variant="tertiary" disabled label="Disabled" />
        </div>
        <div css={buttonRowStyles}>
          <Button {...args} size="md" variant="tertiary" label="Tertiary Button" />
          <Button {...args} size="md" variant="tertiary" disabled label="Disabled" />
        </div>
        <div css={buttonRowStyles}>
          <Button {...args} icon="plus" variant="tertiary" label="Tertiary Button" />
          <Button {...args} icon="plus" variant="tertiary" disabled label="Disabled" />
        </div>
        <div css={buttonRowStyles}>
          <Button {...args} icon="plus" size="md" variant="tertiary" label="Tertiary Button" />
          <Button {...args} icon="plus" size="md" variant="tertiary" disabled label="Disabled" />
        </div>
      </div>

      <div>
        <h2>Danger!</h2>
        <div css={buttonRowStyles}>
          <Button {...args} variant="danger" label="Danger Button" />
          <Button {...args} variant="danger" disabled label="Disabled" />
        </div>
        <div css={buttonRowStyles}>
          <Button {...args} size="md" variant="danger" label="Danger Button" />
          <Button {...args} size="md" variant="danger" disabled label="Disabled" />
        </div>
        <div css={buttonRowStyles}>
          <Button {...args} size="lg" variant="danger" label="Danger Button" />
          <Button {...args} size="lg" variant="danger" disabled label="Disabled" />
        </div>
        <div css={buttonRowStyles}>
          <Button {...args} icon="trash" variant="danger" label="Danger Button" />
          <Button {...args} icon="trash" variant="danger" disabled label="Disabled" />
        </div>
        <div css={buttonRowStyles}>
          <Button {...args} icon="trash" size="md" variant="danger" label="Danger Button" />
          <Button {...args} icon="trash" size="md" variant="danger" disabled label="Disabled" />
        </div>
        <div css={buttonRowStyles}>
          <Button {...args} icon="trash" size="lg" variant="danger" label="Danger Button" />
          <Button {...args} icon="trash" size="lg" variant="danger" disabled label="Disabled" />
        </div>
      </div>
    </div>
  );
}

export function ButtonWithTooltip() {
  return (
    <div css={Css.dg.flexColumn.childGap2.justifyStart.$}>
      <div>
        <h2>Tooltip provided via 'disabled' property</h2>
        <Button
          disabled={
            <div>
              You <b>cannot</b> currently perform this operation because of:
              <ul>
                <li>reason one</li>
                <li>reason two</li>
              </ul>
            </div>
          }
          label="Upload"
        />
      </div>
      <div>
        <h2>Tooltip provided via 'tooltip' property</h2>
        <Button tooltip="Create a new entity" label="Add new" />
      </div>
    </div>
  );
}

export function ButtonLink() {
  return (
    <div css={Css.dg.flexColumn.childGap2.$}>
      <div>
        <h2>Primary</h2>
        <div css={buttonRowStyles}>
          <Button onClick="/fakePath" label="Relative URL link" />
          <Button
            onClick="https://www.homebound.com"
            label="Absolute URL link"
            endAdornment={<Icon icon="linkExternal" />}
          />
          <Button icon="plus" onClick="https://www.homebound.com" label="Disabled link" disabled />
        </div>

        <h2>Secondary</h2>
        <div css={buttonRowStyles}>
          <Button variant="secondary" onClick="/fakePath" label="Relative URL link" />
          <Button
            variant="secondary"
            onClick="https://www.homebound.com"
            label="Absolute URL link"
            endAdornment={<Icon icon="linkExternal" />}
          />
          <Button variant="secondary" icon="plus" onClick="https://www.homebound.com" label="Disabled link" disabled />
        </div>

        <h2>Tertiary</h2>
        <div css={buttonRowStyles}>
          <Button variant="tertiary" onClick="/fakePath" label="Relative URL link" />
          <Button
            variant="tertiary"
            onClick="https://www.homebound.com"
            label="Absolute URL link"
            endAdornment={<Icon icon="linkExternal" />}
          />
          <Button variant="tertiary" icon="plus" onClick="https://www.homebound.com" label="Disabled link" disabled />
        </div>

        <h2>Danger</h2>
        <div css={buttonRowStyles}>
          <Button variant="danger" onClick="/fakePath" label="Relative URL link" />
          <Button
            variant="danger"
            onClick="https://www.homebound.com"
            label="Absolute URL link"
            endAdornment={<Icon icon="linkExternal" />}
          />
          <Button variant="danger" icon="plus" onClick="https://www.homebound.com" label="Disabled link" disabled />
        </div>
      </div>
    </div>
  );
}

const buttonRowStyles = Css.df.childGap1.my1.$;
