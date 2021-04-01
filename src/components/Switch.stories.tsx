import { Meta } from "@storybook/react";
import { useState } from "react";
import { Css } from "../Css";
import {
  Switch as SwitchComponent,
  switchFocusStyles,
  switchHoverStyles,
  SwitchProps,
  switchSelectedHoverStyles,
} from "./Switch";

export default {
  component: SwitchComponent,
  title: "Components/Switch",
} as Meta<SwitchProps>;

// TODO: Args is causing the inner state to not update
export const Switch = (args: SwitchProps) => {
  return (
    <div css={{ h1: Css.xl4Em.mb4.$, h2: Css.xl2Em.$ }}>
      <h1>Switch</h1>
      <div css={Css.df.gap4.flexColumn.$}>
        <h2>Switch Buttons</h2>
        <div
          css={Css.dg.gapPx(64).gtc("repeat(auto-fit, 115px)").$}
          // style={{
          //   // TODO: @KoltonG potentially add this to Truss too
          //   // TODO: .add is not handling these nicely, must be the name parsing
          //   gridAutoFlow: "column",
          //   gridAutoColumns: "max-content",
          // }}
        >
          {/* TODO: @KoltonG Add gapX and gapY to Truss */}
          {/* TODO: @KoltonG Story builder would be useful here */}
          <div css={Css.dg.gtc("max-content max-content").gap("16px 32px").$}>
            <SwitchWrapper />
            <SwitchWrapper selected />
            <SwitchWrapper isHovered />
            <SwitchWrapper isHovered selected />
            <SwitchWrapper isFocused />
            <SwitchWrapper isFocused selected />
            <SwitchWrapper disabled />
          </div>
          <div css={Css.dg.gtc("max-content max-content").gap("16px 32px").$}>
            <SwitchWrapper withIcon />
            <SwitchWrapper withIcon selected />
            <SwitchWrapper withIcon isHovered />
            <SwitchWrapper withIcon isHovered selected />
            <SwitchWrapper withIcon isFocused />
            <SwitchWrapper withIcon isFocused selected />
            <SwitchWrapper withIcon disabled />
          </div>
          <div css={Css.dg.gtc("max-content max-content").gap("16px 32px").$}>
            <SwitchWrapper compact />
            <SwitchWrapper compact selected />
            <SwitchWrapper compact isHovered />
            <SwitchWrapper compact isHovered selected />
            <SwitchWrapper compact isFocused />
            <SwitchWrapper compact isFocused selected />
            <SwitchWrapper compact disabled />
          </div>
          <div css={Css.dg.gtc("max-content max-content").gap("16px 32px").$}>
            <SwitchWrapper withIcon compact />
            <SwitchWrapper withIcon compact selected />
            <SwitchWrapper withIcon compact isHovered />
            <SwitchWrapper withIcon compact isHovered selected />
            <SwitchWrapper withIcon compact isFocused />
            <SwitchWrapper withIcon compact isFocused selected />
            <SwitchWrapper withIcon compact disabled />
          </div>
        </div>
        <h2>Switch</h2>
        <div
          css={Css.dg.gapPx(64).gtc("repeat(auto-fit, 400px)").$}
          // style={{
          //   // TODO: @KoltonG potentially add this to Truss too
          //   // TODO: .add is not handling these nicely, must be the name parsing
          //   gridAutoFlow: "column",
          //   gridAutoColumns: "max-content",
          // }}
        >
          <div css={Css.dg.gtc("max-content max-content").gap("16px 32px").$}>
            <SwitchWrapper label="Remember me?" />
            <SwitchWrapper label="Remember me?" selected />
            <SwitchWrapper label="Remember me?" isHovered />
            <SwitchWrapper label="Remember me?" isHovered selected />
            <SwitchWrapper label="Remember me?" isFocused />
            <SwitchWrapper label="Remember me?" isFocused selected />
            <SwitchWrapper label="Remember me?" disabled />
          </div>
          <div css={Css.dg.gtc("max-content max-content").gap("16px 32px").$}>
            <SwitchWrapper label="Remember me?" withIcon />
            <SwitchWrapper label="Remember me?" withIcon selected />
            <SwitchWrapper label="Remember me?" withIcon isHovered />
            <SwitchWrapper label="Remember me?" withIcon isHovered selected />
            <SwitchWrapper label="Remember me?" withIcon isFocused />
            <SwitchWrapper label="Remember me?" withIcon isFocused selected />
            <SwitchWrapper label="Remember me?" withIcon disabled />
          </div>
          <div css={Css.dg.gtc("max-content max-content").gap("16px 32px").$}>
            <SwitchWrapper label="Remember me?" compact />
            <SwitchWrapper label="Remember me?" compact selected />
            <SwitchWrapper label="Remember me?" compact isHovered />
            <SwitchWrapper label="Remember me?" compact isHovered selected />
            <SwitchWrapper label="Remember me?" compact isFocused />
            <SwitchWrapper label="Remember me?" compact isFocused selected />
            <SwitchWrapper label="Remember me?" compact disabled />
          </div>
          <div css={Css.dg.gtc("max-content max-content").gap("16px 32px").$}>
            <SwitchWrapper label="Remember me?" withIcon compact />
            <SwitchWrapper label="Remember me?" withIcon compact selected />
            <SwitchWrapper label="Remember me?" withIcon compact isHovered />
            <SwitchWrapper label="Remember me?" withIcon compact isHovered selected />
            <SwitchWrapper label="Remember me?" withIcon compact isFocused />
            <SwitchWrapper label="Remember me?" withIcon compact isFocused selected />
            <SwitchWrapper label="Remember me?" withIcon compact disabled />
          </div>
        </div>
      </div>
    </div>
  );
};

type StoryStates = {
  isHovered?: boolean;
  isFocused?: boolean;
};

function SwitchWrapper({ isHovered, isFocused, ...props }: SwitchProps & StoryStates) {
  const [selected, setSelected] = useState<boolean>(props.selected);

  return (
    <div
      css={{
        "label > div:nth-of-type(2)": {
          ...(isHovered && switchHoverStyles),
          ...(props.selected && isHovered && switchSelectedHoverStyles),
          ...(isFocused && switchFocusStyles),
        },
      }}
    >
      <SwitchComponent {...props} selected={selected} onChange={setSelected} />
    </div>
  );
}
