import { Meta } from "@storybook/react";
import { Css } from "src/Css";
import { Placement, Tooltip as TooltipComponent } from "./Tooltip";

export default {
  component: TooltipComponent,
  title: "Components/Tooltip",
} as Meta;

export function Tooltip() {
  const placements: Placement[] = ["auto", "bottom", "left", "right", "top"];
  return (
    <div css={Css.w25.ml("25%").$}>
      {placements.map((placement, i) => (
        <TooltipComponent title="Tooltip Info" placement={placement} key={i} delay={750}>
          <span css={Css.db.tc.my5.bgGray400.br4.$}>
            This tooltip is positioned at: <span css={Css.b.$}>{placement}</span>
          </span>
        </TooltipComponent>
      ))}
    </div>
  );
}
