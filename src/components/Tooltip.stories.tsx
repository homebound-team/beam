import { Meta } from "@storybook/react";
import { Css } from "src/Css";
import { Placement, Tooltip } from "./Tooltip";

export default {
  component: Tooltip,
  title: "Components/Tooltip",
} as Meta;

export function Tootlips() {
  const placements: Placement[] = [
    "auto",
    "auto-start",
    "auto-end",
    "bottom",
    "bottom-start",
    "bottom-end",
    "left",
    "left-start",
    "left-end",
    "right",
    "right-start",
    "right-end",
    "top",
    "top-start",
    "top-end",
  ];
  return (
    <div>
      {placements.map((placement, i) => (
        <div key={i}>
          <Tooltip
            tooltipinfo="Tooltip Info"
            placement={placement}
            css={Css.ml8.my3.bgGray900.white.br4.px1.py("20px").$}
          >
            This tooltip is positioned at: <span css={Css.b.$}>{placement}</span>
          </Tooltip>
        </div>
      ))}
    </div>
  );
}
