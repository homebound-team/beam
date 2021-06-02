import { Meta } from "@storybook/react";
import { Css } from "src/Css";
import { Placement, Tooltip as TooltipComponent } from "./Tooltip";

export default {
  component: TooltipComponent,
  title: "Components/Tooltip",
} as Meta;

export function Tooltip() {
  const placements: Placement[] = ["bottom", "left", "right", "top"];
  return (
    <div css={Css.w25.ml("25%").$}>
      {placements.map((placement, i) => (
        <TooltipComponent tooltip="Tooltip Info" placement={placement} key={i} delay={0}>
          <span css={Css.db.tc.my3.bgGray900.white.br4.px1.$}>
            This tooltip is positioned at: <span css={Css.b.$}>{placement}</span>
          </span>
        </TooltipComponent>
      ))}
    </div>
  );
}
