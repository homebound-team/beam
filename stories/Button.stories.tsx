import {Button, Css, px} from "../";
import {Meta} from "@storybook/react";

export default {
  component: Button,
  title: "Components/Buttons"
} as Meta;

export function Buttons() {
  return (
    <div css={{...Css.dg.$, gridTemplateColumns: "repeat(4, auto)"}}>
      <div>
        <h2>Primary</h2>
        <div>
          <Button autoFocus>Primary Button</Button>
          <Button isDisabled>Disabled</Button>
        </div>
        <div>
          <Button size="md">Primary Button</Button>
          <Button size="md" isDisabled>Disabled</Button>
        </div>
        <div>
          <Button size="lg">Primary Button</Button>
          <Button size="lg" isDisabled>Disabled</Button>
        </div>
      </div>

      <div>
        <h2>Secondary</h2>
        <div>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="secondary" isDisabled>Disabled</Button>
        </div>
        <div>
          <Button size="md" variant="secondary">Secondary Button</Button>
          <Button size="md" variant="secondary" isDisabled>Disabled</Button>
        </div>
        <div>
          <Button size="lg" variant="secondary">Secondary Button</Button>
          <Button size="lg" variant="secondary" isDisabled>Disabled</Button>
        </div>
      </div>

      <div>
        <h2>Tertiary</h2>
        <div>
          <Button variant="tertiary">Tertiary Button</Button>
          <Button variant="tertiary" isDisabled>Disabled</Button>
        </div>
      </div>

      <div>
        <h2>Danger!</h2>
        <div>
          <Button variant="danger">Danger Button</Button>
          <Button variant="danger" isDisabled>Disabled</Button>
        </div>
        <div>
          <Button size="md" variant="danger">Danger Button</Button>
          <Button size="md" variant="danger" isDisabled>Disabled</Button>
        </div>
        <div>
          <Button size="lg" variant="danger">Danger Button</Button>
          <Button size="lg" variant="danger" isDisabled>Disabled</Button>
        </div>
      </div>
    </div>
  );
}
