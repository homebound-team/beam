import { Meta } from "@storybook/react";
import { Css } from "src/Css";
import { Placement, Tooltip } from "./Tooltip";

export default {
  component: Tooltip,
  title: "Workspace/Components/Tooltip",
  parameters: { 
    design: {
      type: "figma",
      url: "https://www.figma.com/file/aWUE4pPeUTgrYZ4vaTYZQU/%E2%9C%A8Beam-Design-System?node-id=36259%3A103869",
    }
  },
} as Meta;

export function TooltipPlacements() {
  const placements: Placement[] = ["auto", "bottom", "left", "right", "top"];
  return (
    <div css={Css.w25.ml("25%").$}>
      {placements.map((placement, i) => (
        <Tooltip title="Tooltip Info" placement={placement} key={i}>
          <span css={Css.db.tc.my5.bgGray400.br4.$}>
            This tooltip is positioned at: <span css={Css.b.$}>{placement}</span>
          </span>
        </Tooltip>
      ))}
    </div>
  );
}

export function TooltipDisabled() {
  return (
    <Tooltip title="Tooltip Info" disabled={true}>
      <span css={Css.db.tc.my5.bgGray400.br4.$}>Content</span>
    </Tooltip>
  );
}
