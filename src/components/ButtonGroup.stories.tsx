import type { Meta } from "@storybook/react-vite";
import { Css } from "src/Css";
import { ButtonGroup } from "src/index";
import { LabeledExamples } from "src/utils/sb";

export default {
  title: "Components/Button Group",
  component: ButtonGroup,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/62R8KiDklvgBBSH0mQGWHo/BEAM_27_LIBRARY?node-id=4280-223",
    },
  },
} as Meta;

export function Examples() {
  return (
    <LabeledExamples
      labelWidth={120}
      examples={[
        { label: "Text · 2", children: <ButtonGroup buttons={[{ text: "Cost", active: true }, { text: "Price" }]} /> },
        {
          label: "Text · 3",
          children: (
            <>
              <ButtonGroup buttons={[{ text: "Plans", active: true }, { text: "Options" }, { text: "Elevations" }]} />
              <ButtonGroup buttons={[{ text: "Plans" }, { text: "Options", active: true }, { text: "Elevations" }]} />
              <ButtonGroup buttons={[{ text: "Plans" }, { text: "Options" }, { text: "Elevations", active: true }]} />
            </>
          ),
        },
        {
          label: "Icon · 2",
          children: (
            <ButtonGroup
              buttons={[
                { icon: "chevronLeft", tooltip: "Previous" },
                { icon: "chevronRight", tooltip: "Next" },
              ]}
            />
          ),
        },
        {
          label: "Icon · 3",
          children: (
            <ButtonGroup
              buttons={[
                { icon: "chevronLeft", tooltip: "Previous" },
                { icon: "plus", tooltip: "Add" },
                { icon: "chevronRight", tooltip: "Next" },
              ]}
            />
          ),
        },
        {
          label: "Disabled",
          children: <ButtonGroup disabled buttons={[{ text: "Plans" }, { text: "Options" }, { text: "Elevations" }]} />,
        },
        {
          label: "Disabled button",
          children: (
            <ButtonGroup
              buttons={[
                { text: "Plans", active: true },
                { text: "Options", disabled: "Disabled Reason" },
                { text: "Elevations" },
              ]}
            />
          ),
        },
        {
          label: "Tooltips",
          children: (
            <ButtonGroup
              buttons={[
                { text: "Cost", tooltip: "Before markup", active: true },
                { text: "Price", tooltip: "After markup" },
              ]}
            />
          ),
        },
        {
          label: "Full width",
          children: (
            <div css={Css.wPx(400).$}>
              <ButtonGroup fullWidth buttons={[{ text: "Cost", active: true }, { text: "Price" }]} />
            </div>
          ),
        },
      ]}
    />
  );
}
