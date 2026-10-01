import type { ReactNode } from "react";
import { Css, Tokens } from "src/Css";
import { useTestIds } from "src/utils/useTestIds";

export type MenuPanelProps = {
  /** Pinned above the scrolling body, e.g. a search input. */
  header?: ReactNode;
  children: ReactNode;
  /** `anchored` draws the floating surface; `sheet` defers the surface to the BottomSheet. */
  variant?: "anchored" | "sheet";
};

/** Visual surface for menus and listboxes; height is capped by the `--menu-max-height` its overlay writes. */
export function MenuPanel(props: MenuPanelProps) {
  const { header, children, variant = "anchored" } = props;
  const tid = useTestIds(props, "menuPanel");
  return (
    <div css={{ ...panelCss, ...(variant === "anchored" ? anchoredCss : {}) }} {...tid.menuPanel}>
      {header && <div css={Css.fs0.bb.bc(Tokens.SurfaceSeparator).$}>{header}</div>}
      <div css={Css.df.fdc.fg1.mh0.$}>{children}</div>
    </div>
  );
}

const panelCss = Css.df.fdc.w100.oh.color(Tokens.OnSurface).maxh("var(--menu-max-height, 512px)").$;
const anchoredCss = Css.bgColor(Tokens.SurfaceRaised).br4.bshBasic.$;
