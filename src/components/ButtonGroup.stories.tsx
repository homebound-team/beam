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
        <ButtonGroup buttons={[
          {icon: "chevronLeft"},
          {icon: "plus"},
          {icon: "chevronRight"},
          ]}/>
      </div>
      <div>
        <ButtonGroup buttons={[
          {text: "Leading"},
          {text: "Middle"},
          {text: "Trailing"},
        ]}/>
      </div>
      <div>
        <ButtonGroup disabled buttons={[
          {text: "Leading"},
          {text: "Middle"},
          {text: "Trailing"},
        ]}/>
      </div>
      <div>
        <ButtonGroup buttons={[
          {text: "Leading"},
          {text: "Middle"},
          {text: "Middle"},
          {text: "Middle"},
          {text: "Trailing"},
        ]}/>
      </div>
    </div>
  )
}