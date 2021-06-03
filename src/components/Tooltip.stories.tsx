import { Meta } from "@storybook/react";
import { Css } from "src/Css";
import {ForceTooltipsActiveContext, Placement, Popper, Tooltip as TooltipComponent} from "src/components/Tooltip";

export default {
  component: TooltipComponent,
  title: "Components/Tooltip",
} as Meta;

export function TooltipFunctional() {
  return tooltipPermutations();
}

export function TooltipOpen() {
  return tooltipPermutations(true);
}

function tooltipPermutations(forceOpen: boolean = false) {
  const placements: Placement[] = ["auto", "bottom", "left", "right", "top"];
  return (
    <ForceTooltipsActiveContext.Provider value={forceOpen}>
      <div css={Css.w25.ml("25%").$}>
        {placements.map((placement, i) => (
          <TooltipComponent title="Tooltip Info" placement={placement} key={i}>
            <span css={Css.db.tc.my5.bgGray400.br4.$}>
              This tooltip is positioned at: <span css={Css.b.$}>{placement}</span>
            </span>
          </TooltipComponent>
        ))}
      </div>
    </ForceTooltipsActiveContext.Provider>
  );
}
