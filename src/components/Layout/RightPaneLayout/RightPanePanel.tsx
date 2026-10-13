import type { ReactNode } from "react";
import { Button } from "src/components/Button";
import { IconButton } from "src/components/IconButton";
import type { ActionButtonProps } from "src/components/Layout/layoutTypes";
import { type DeleteActionProps, MaybeDeleteAction } from "src/components/Layout/RightPaneLayout/internal/DeleteAction";
import { Css, Tokens } from "src/Css";
import { useTestIds } from "src/utils/useTestIds";
import { useRightPaneActions } from "./useRightPane";

export type RightPanePanelProps = {
  title: string;
  children: ReactNode;
  /** When false, omit the built-in close control (caller provides their own). Default true. */
  withClose?: boolean;
  /** Variant defaults to primary */
  primaryAction?: ActionButtonProps & { variant?: "primary" | "ai" };
  secondaryAction?: ActionButtonProps;
  /** Destructive action as a trash icon; `count > 1` adds `Delete (count)` label. */
  deleteAction?: DeleteActionProps;
};

/** Pane body chrome: title row, close control, scrollable children, and an optional footer. See `docs/layouts.md`. */
export function RightPanePanel(props: RightPanePanelProps) {
  const { title, children, withClose = true, primaryAction, secondaryAction, deleteAction } = props;
  const tid = useTestIds(props, "rightPanePanel");
  const { closeRightPane } = useRightPaneActions();

  return (
    <div css={Css.relative.df.fdc.h100.$} {...tid}>
      <div css={Css.df.aic.jcsb.gap1.px3.py2.bb.bc(Tokens.SurfaceSeparator).fs0.$} {...tid.header}>
        <div css={Css.mdSb.$}>{title}</div>
        {/* Move focus into the pane so it is not left on the control that opened it. */}
        {withClose && <IconButton icon="x" label="Close" autoFocus onClick={closeRightPane} {...tid.close} />}
      </div>
      <div css={Css.fg1.mh0.oya.p3.$} {...tid.body}>
        {children}
      </div>
      {(deleteAction || secondaryAction || primaryAction) && (
        <div css={Css.df.aic.gap2.px3.py2.bt.bc(Tokens.SurfaceSeparator).fs0.$} {...tid.footer}>
          <MaybeDeleteAction {...deleteAction} {...tid.delete} />
          <div css={Css.df.aic.gap(1.5).fs0.mla.$}>
            {secondaryAction && <Button {...secondaryAction} variant="secondary" {...tid.secondaryAction} />}
            {primaryAction && <Button {...primaryAction} {...tid.primaryAction} />}
          </div>
        </div>
      )}
    </div>
  );
}
