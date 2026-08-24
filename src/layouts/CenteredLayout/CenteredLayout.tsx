import { CSSProperties, ReactNode } from "react";
import { Css } from "src/Css";
import { useBreakpoint } from "src/hooks";
import { beamLayoutContentPaddingXVar, pageContentPaddingXValue } from "src/layouts/layoutVars";
import { useTestIds } from "src/utils";

export type CenteredLayoutSize = "sm" | "lg";

export type CenteredLayoutProps = {
  /** `sm` = 720px content (768px shell max); `lg` = 1392px content (1440px shell max). Horizontal padding 12px / 24px from `md`. */
  size: CenteredLayoutSize;
  children?: ReactNode;
};

/** Centered body-width shell. Nest inside page-header / stepper layout children — see `docs/layouts.md`. */
export function CenteredLayout(props: CenteredLayoutProps) {
  const { size, children } = props;
  const tid = useTestIds(props, "centeredLayout");
  const { mdAndUp } = useBreakpoint();

  return (
    <div
      css={{ ...Css.w100.maxwPx(centeredShellMaxPx[size]).mxa.$, ...centeredPaddingX }}
      style={
        {
          // layoutContainer descendants (e.g. ContentHeader) read this to inset sticky horizontal chrome within the shell padding.
          [beamLayoutContentPaddingXVar]: mdAndUp ? mdAndUpContentPaddingX : smContentPaddingX,
        } as CSSProperties
      }
      {...tid}
    >
      {children}
    </div>
  );
}

const centeredContentMaxPx = { sm: 720, lg: 1392 } as const;
const mdContentPaddingPx = parseInt(pageContentPaddingXValue, 10);

/** Shell max-width (content + horizontal padding at md+): 768 / 1440. */
const centeredShellMaxPx = {
  sm: centeredContentMaxPx.sm + mdContentPaddingPx * 2,
  lg: centeredContentMaxPx.lg + mdContentPaddingPx * 2,
} as const;

/** Viewport-edge inset below `md`. */
const smContentPaddingX = "12px";

/** Viewport-edge inset from `md` up (`px3` / 24px). */
const mdAndUpContentPaddingX = pageContentPaddingXValue;

const centeredPaddingX = Css.px(smContentPaddingX).ifMdAndUp.px3.$;
