import type { Meta } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { Css } from "src/Css";
import { SelectedOptionPillList } from "src/forms/SelectedOptionPillList";
import { action } from "storybook/actions";

export default {
  component: SelectedOptionPillList,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/DchiwVkssXeYi2Er8sMU2k/H2-2026-Plans---Automated-Construction-Doc-Capture?node-id=1462-46208",
    },
  },
} as Meta;

export function Default() {
  return (
    <div css={Css.maxwPx(592).$}>
      <SelectedOptionPillList options={createOptions()} />
    </div>
  );
}

function createOptions() {
  return [
    {
      id: "keep",
      value: optionValue("CEILBEAM01", "Faux Ceiling Beams", "Living Room 101"),
      onRemove: action("onRemove keep"),
    },
    {
      id: "ai-add",
      value: optionValue("CAB001", "Upper Cabinets", "Kitchen"),
      helperText: sourcesHelperText(),
      onRemove: action("onRemove ai-add"),
      aiMode: true,
    },
    {
      id: "plain",
      value: "A long option name that should wrap within the capsule instead of overflowing",
      helperText: <span css={Css.xs.$}>Sources: Page 1</span>,
      onRemove: action("onRemove plain"),
    },
  ];
}

function optionValue(id: string, name: string, location: string): ReactNode {
  return (
    <span css={Css.sm.$}>
      {id} <span css={Css.smSb.$}>{name}</span> {location}
    </span>
  );
}

function sourcesHelperText(): ReactNode {
  return (
    <span css={Css.xs.$}>
      Sources:{" "}
      <a href="#page-3" css={Css.blue600.$}>
        Page 3
      </a>
      ,{" "}
      <a href="#page-76" css={Css.blue600.$}>
        Page 76
      </a>
    </span>
  );
}
