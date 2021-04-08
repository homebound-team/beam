import { Meta } from "@storybook/react";
import { ButtonGroup } from "src/index";

export default {
  component: ButtonGroup,
  title: "Components/Button Groups",
} as Meta;

export function ButtonGroups() {
  return (
    <div>
      <div>
        <h2>Icon Only</h2>
        <ButtonGroup buttons={[
          {icon: "chevronLeft"},
          {icon: "plus"},
          {icon: "chevronRight"},
          ]}/>
      </div>
      <div>
        <h2>Basic</h2>
        <ButtonGroup buttons={[
          {text: "Leading"},
          {text: "Middle"},
          {text: "Trailing"},
        ]}/>
      </div>
      <div>
        <h2>Active</h2>
        <ButtonGroup buttons={[
          {text: "Leading", active: true },
          {text: "Middle"},
          {text: "Trailing"},
        ]}/>
      </div>
      <div>
        <h2>Disabled</h2>
        <ButtonGroup disabled buttons={[
          {text: "Leading"},
          {text: "Middle"},
          {text: "Trailing"},
        ]}/>
      </div>
    </div>
  )
}