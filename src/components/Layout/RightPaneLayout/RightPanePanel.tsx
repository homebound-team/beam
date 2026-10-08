import { useResizeObserver } from "@react-aria/utils";
import { type ReactNode, useRef, useState } from "react";
import { Button, type ButtonProps } from "src/components/Button";
import { IconButton } from "src/components/IconButton";
import type { ActionButtonProps } from "src/components/Layout/layoutTypes";
import { Css, Tokens } from "src/Css";
import { noop } from "src/utils/helpers";
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
  deleteAction?: Pick<ButtonProps, "onClick" | "disabled" | "tooltip"> & { count?: number };
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

type DeleteActionProps = NonNullable<RightPanePanelProps["deleteAction"]>;

function MaybeDeleteAction(props: Partial<DeleteActionProps>) {
  const { count = 0, onClick, ...buttonProps } = props;
  if (!onClick) return null;
  return count > 1 ? (
    <BulkDeleteAction count={count} onClick={onClick} {...buttonProps} />
  ) : (
    <IconButton icon="trash" label="Delete" onClick={onClick} {...buttonProps} />
  );
}

/** `Delete (count)`, shortened to `(count)` when it doesn't fit beside the CTAs. */
function BulkDeleteAction(props: DeleteActionProps & { count: number }) {
  const { count, ...buttonProps } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [overflows, setOverflows] = useState(false);
  const onResize = () => {
    if (!containerRef.current || !contentRef.current) return;
    setOverflows(contentRef.current.offsetWidth > containerRef.current.clientWidth);
  };
  // The slot narrows when the CTAs grow; the copy widens with `count` or a font swap.
  useResizeObserver({ ref: containerRef, onResize });
  useResizeObserver({ ref: contentRef, onResize });

  return (
    // Offset the Button's padding so the trash aligns with the footer inset.
    <div ref={containerRef} css={Css.relative.fg1.mw0.mlPx(-16).$}>
      {/* Measured instead of the visible button, whose width changes when compacted. */}
      <div aria-hidden css={Css.absolute.top0.left0.w100.oh.visibility("hidden").pen.$}>
        <div ref={contentRef} css={Css.add("width", "max-content").$}>
          <Button variant="quaternary" icon="trash" label={`Delete (${count})`} onClick={noop} />
        </div>
      </div>
      <Button
        variant="quaternary"
        icon="trash"
        // Visually hidden so the accessible name keeps "Delete"; the outer span keeps the space (the button is flex).
        label={
          <span>
            <span css={Css.if(overflows).visuallyHidden.$}>Delete</span> ({count})
          </span>
        }
        {...buttonProps}
      />
    </div>
  );
}
