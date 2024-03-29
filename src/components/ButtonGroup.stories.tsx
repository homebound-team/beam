import { Meta } from "@storybook/react";
import { Css } from "src/Css";
import { ButtonGroup } from "src/index";

export default {
  component: ButtonGroup,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/aWUE4pPeUTgrYZ4vaTYZQU/%E2%9C%A8Beam-Design-System?node-id=31586%3A99872",
    },
  },
} as Meta;

export function ButtonGroups() {
  return (
    <div css={Css.df.fdc.gap2.$}>
      <div>
        <h2>Icon Only</h2>
        <ButtonGroup size="xs" buttons={[{ icon: "chevronLeft" }, { icon: "plus" }, { icon: "chevronRight" }]} />
        <ButtonGroup buttons={[{ icon: "chevronLeft" }, { icon: "plus" }, { icon: "chevronRight" }]} />
        <ButtonGroup size="md" buttons={[{ icon: "chevronLeft" }, { icon: "plus" }, { icon: "chevronRight" }]} />
      </div>
      <div>
        <h2>Basic</h2>
        <ButtonGroup size="xs" buttons={[{ text: "Leading" }, { text: "Middle" }, { text: "Trailing" }]} />
        <ButtonGroup buttons={[{ text: "Leading" }, { text: "Middle" }, { text: "Trailing" }]} />
        <ButtonGroup size="md" buttons={[{ text: "Leading" }, { text: "Middle" }, { text: "Trailing" }]} />
      </div>
      <div>
        <h2>Active</h2>

        <ButtonGroup
          size="xs"
          buttons={[{ text: "Leading", active: true }, { text: "Middle" }, { text: "Trailing" }]}
        />
        <ButtonGroup buttons={[{ text: "Leading", active: true }, { text: "Middle" }, { text: "Trailing" }]} />
        <ButtonGroup
          size="md"
          buttons={[{ text: "Leading", active: true }, { text: "Middle" }, { text: "Trailing" }]}
        />
      </div>
      <div>
        <h2>Disabled</h2>
        <ButtonGroup size="xs" disabled buttons={[{ text: "Leading" }, { text: "Middle" }, { text: "Trailing" }]} />
        <ButtonGroup disabled buttons={[{ text: "Leading" }, { text: "Middle" }, { text: "Trailing" }]} />
        <ButtonGroup size="md" disabled buttons={[{ text: "Leading" }, { text: "Middle" }, { text: "Trailing" }]} />
      </div>
      <div>
        <h2>With Tooltips</h2>
        <ButtonGroup
          buttons={[
            { text: "Leading", tooltip: "Active Tooltip" },
            { text: "Middle" },
            { text: "Trailing", disabled: "Disabled Reason" },
          ]}
        />
      </div>
    </div>
  );
}
