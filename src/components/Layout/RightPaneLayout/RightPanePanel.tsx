import type { ReactNode } from "react";
import { IconButton } from "src/components/IconButton";
import { Css, Tokens } from "src/Css";
import { useTestIds } from "src/utils/useTestIds";
import { useRightPaneActions } from "./useRightPane";

export type RightPanePanelProps = {
  title: string;
  children: ReactNode;
  /** When false, omit the built-in close control (caller provides their own). Default true. */
  withClose?: boolean;
};

/** Pane body chrome: title row, close control, and scrollable children. See `docs/layouts.md`. */
export function RightPanePanel(props: RightPanePanelProps) {
  const { title, children, withClose = true } = props;
  const tid = useTestIds(props, "rightPanePanel");
  const { closeRightPane } = useRightPaneActions();

  return (
    <div css={Css.relative.df.fdc.h100.$} {...tid}>
      <div css={Css.df.aic.jcsb.gap1.p2.bb.bc(Tokens.SurfaceSeparator).fs0.$} {...tid.header}>
        <div css={Css.mdSb.$}>{title}</div>
        {/* Move focus into the pane so it is not left on the control that opened it. */}
        {withClose && <IconButton icon="x" label="Close" autoFocus onClick={closeRightPane} {...tid.close} />}
      </div>
      <div css={Css.fg1.mh0.oya.p2.$} {...tid.body}>
        {children}
      </div>
    </div>
  );
}
