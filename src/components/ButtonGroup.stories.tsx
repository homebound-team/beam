import type { Meta } from "@storybook/react-vite";
import { Css } from "src/Css";
import { ButtonGroup } from "src/index";

export default {
  component: ButtonGroup,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/62R8KiDklvgBBSH0mQGWHo/BEAM_27_LIBRARY?node-id=4280-223",
    },
  },
} as Meta;

export function ButtonGroups() {
  return (
    <div css={Css.df.fdc.gap2.$}>
      <div>
        <h2>Text</h2>
        <div css={Css.df.gap3.$}>
          <ButtonGroup buttons={[{ text: "Cost", active: true }, { text: "Price" }]} />
          <ButtonGroup buttons={[{ text: "Plans", active: true }, { text: "Options" }, { text: "Elevations" }]} />
          <ButtonGroup buttons={[{ text: "Plans" }, { text: "Options", active: true }, { text: "Elevations" }]} />
          <ButtonGroup buttons={[{ text: "Plans" }, { text: "Options" }, { text: "Elevations", active: true }]} />
        </div>
      </div>
      <div>
        <h2>Icon</h2>
        <div css={Css.df.gap3.$}>
          <ButtonGroup
            buttons={[
              { icon: "chevronLeft", tooltip: "Previous" },
              { icon: "chevronRight", tooltip: "Next" },
            ]}
          />
          <ButtonGroup
            buttons={[
              { icon: "chevronLeft", tooltip: "Previous" },
              { icon: "plus", tooltip: "Add" },
              { icon: "chevronRight", tooltip: "Next" },
            ]}
          />
        </div>
      </div>
      <div>
        <h2>Disabled</h2>
        <div css={Css.df.gap3.$}>
          <ButtonGroup disabled buttons={[{ text: "Plans" }, { text: "Options" }, { text: "Elevations" }]} />
          <ButtonGroup
            buttons={[
              { text: "Plans", active: true },
              { text: "Options", disabled: "Disabled Reason" },
              { text: "Elevations" },
            ]}
          />
        </div>
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
      <div>
        <h2>Full Width</h2>
        <div css={Css.wPx(400).$}>
          <ButtonGroup fullWidth buttons={[{ text: "Cost", active: true }, { text: "Price" }]} />
        </div>
      </div>
    </div>
  );
}
