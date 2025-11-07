import { Meta } from "@storybook/react";
import { Css, Palette } from "src/Css";
import { CountBadge } from "./CountBadge";

export default {
  component: CountBadge,
} as Meta;

export function BasicCounts() {
  return (
    <div css={Css.df.fdc.aifs.gap2.$}>
      <div css={Css.df.aic.gap1.$}>
        <span>Single digit:</span>
        <CountBadge count={5} />
      </div>
      <div css={Css.df.aic.gap1.$}>
        <span>Double digit:</span>
        <CountBadge count={42} />
      </div>
      <div css={Css.df.aic.gap1.$}>
        <span>Three digits:</span>
        <CountBadge count={99} />
      </div>
      <div css={Css.df.aic.gap1.$}>
        <span>Over 100 (18px size):</span>
        <CountBadge count={150} />
      </div>
      <div css={Css.df.aic.gap1.$}>
        <span>Large number (18px size):</span>
        <CountBadge count={999} />
      </div>
    </div>
  );
}

export function CustomColors() {
  return (
    <div css={Css.df.fdc.aifs.gap2.$}>
      <div css={Css.df.aic.gap1.$}>
        <span>Blue (default):</span>
        <CountBadge count={5} />
      </div>
      <div css={Css.df.aic.gap1.$}>
        <span>Red:</span>
        <CountBadge count={12} bgColor={Palette.Red600} />
      </div>
      <div css={Css.df.aic.gap1.$}>
        <span>Green:</span>
        <CountBadge count={8} bgColor={Palette.Green600} />
      </div>
      <div css={Css.df.aic.gap1.$}>
        <span>Gray:</span>
        <CountBadge count={99} bgColor={Palette.Gray700} />
      </div>
      <div css={Css.df.aic.gap1.$}>
        <span>Yellow:</span>
        <CountBadge count={3} bgColor={Palette.Yellow600} />
      </div>
    </div>
  );
}

export function InContext() {
  return (
    <div css={Css.df.fdc.gap2.$}>
      <div css={Css.df.aic.gap1.$}>
        <span>Notifications</span>
        <CountBadge count={7} />
      </div>
      <div css={Css.df.aic.gap1.$}>
        <span>Unread messages</span>
        <CountBadge count={23} bgColor={Palette.Red600} />
      </div>
      <div css={Css.df.aic.gap1.$}>
        <span>Active filters</span>
        <CountBadge count={4} />
      </div>
      <div css={Css.df.aic.gap1.$}>
        <span>Selected items</span>
        <CountBadge count={156} bgColor={Palette.Green600} />
      </div>
    </div>
  );
}

export function WithOpacity() {
  return (
    <div css={Css.df.fdc.gap2.$}>
      <div css={Css.df.aic.gap1.$}>
        <span>Full opacity (default):</span>
        <CountBadge count={5} />
      </div>
      <div css={Css.df.aic.gap1.$}>
        <span>75% opacity:</span>
        <CountBadge count={5} opacity={0.75} />
      </div>
      <div css={Css.df.aic.gap1.$}>
        <span>50% opacity:</span>
        <CountBadge count={5} opacity={0.5} />
      </div>
      <div css={Css.df.aic.gap1.$}>
        <span>25% opacity:</span>
        <CountBadge count={5} opacity={0.25} />
      </div>
      <div css={Css.df.aic.gap1.$}>
        <span>Custom color with opacity:</span>
        <CountBadge count={12} bgColor={Palette.Red600} opacity={0.5} />
      </div>
      <div css={Css.df.aic.gap1.$}>
        <span>Large count with opacity:</span>
        <CountBadge count={150} opacity={0.75} />
      </div>
    </div>
  );
}
