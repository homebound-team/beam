import { createContext, type ReactNode, useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "src/components/Button";
import { ContextTag, type ContextTagProps } from "src/components/ContextTag";
import { IconButton } from "src/components/IconButton";
import type { ActionButtonProps } from "src/components/Layout/layoutTypes";
import { type DeleteActionProps, MaybeDeleteAction } from "src/components/Layout/RightPaneLayout/internal/DeleteAction";
import { setRightPaneConfirmDiscard } from "src/components/Layout/RightPaneLayout/rightPaneStore";
import { ConfirmCloseModal } from "src/components/Modal/ConfirmCloseModal";
import { useModal } from "src/components/Modal/useModal";
import { Tag, type TagProps } from "src/components/Tag";
import { Css, Tokens } from "src/Css";
import { fail } from "src/utils/helpers";
import { useTestIds } from "src/utils/useTestIds";
import { useRightPaneActions } from "./useRightPane";

/** A `ContextTag` by default, or a status `Tag` with `kind: "status"`. */
type RightPaneTag = ({ kind?: "context" } & ContextTagProps) | ({ kind: "status" } & TagProps<undefined>);

export type RightPanePanelProps = {
  title: string;
  children: ReactNode;
  /** Type or status tag on the close-button row; the title moves to its own row below. */
  tag?: RightPaneTag;
  /** When it returns true, closing the pane or opening content with another type or `key` asks to discard changes first. */
  isDirty?: () => boolean;
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
  const { title, children, tag, isDirty, withClose = true, primaryAction, secondaryAction, deleteAction } = props;
  const tid = useTestIds(props, "rightPanePanel");
  const { closeRightPane } = useRightPaneActions();
  const [bannerSlot, setBannerSlot] = useState<HTMLDivElement | null>(null);
  const { openModal } = useModal();

  // Only registers the check; closeRightPane and openRightPane call it directly
  useEffect(() => {
    if (!isDirty) return;
    return setRightPaneConfirmDiscard((proceed) => {
      if (!isDirty()) return proceed();
      openModal({ content: <ConfirmCloseModal title="Discard unsaved changes?" onClose={proceed} /> });
    });
  }, [isDirty, openModal]);

  const tagEl = tag && (tag.kind === "status" ? <Tag {...tag} {...tid.tag} /> : <ContextTag {...tag} {...tid.tag} />);
  const titleEl = (
    <div css={Css.mdSb.lineClamp2.$} {...tid.title}>
      {title}
    </div>
  );
  // Move focus into the pane so it is not left on the control that opened it.
  const closeEl = withClose && <IconButton icon="x" label="Close" autoFocus onClick={closeRightPane} {...tid.close} />;

  return (
    <RightPaneBannerSlotContext.Provider value={bannerSlot}>
      <div css={Css.relative.df.fdc.h100.$} {...tid}>
        <div css={Css.df.fdc.gap2.px3.py2.bb.bc(Tokens.SurfaceSeparator).fs0.$} {...tid.header}>
          <div css={Css.df.aic.jcsb.gap1.$}>
            {tag ? tagEl : titleEl}
            {closeEl}
          </div>
          {tag && titleEl}
        </div>
        <div ref={setBannerSlot} css={Css.fs0.$} {...tid.banner} />
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
    </RightPaneBannerSlotContext.Provider>
  );
}

/** A full-bleed banner under the `RightPanePanel` header. */
export function RightPaneBanner(props: { children: ReactNode }) {
  const { children } = props;
  const slot = useContext(RightPaneBannerSlotContext);
  if (slot === undefined) fail("RightPaneBanner must be rendered inside a RightPanePanel");
  return slot ? createPortal(children, slot) : null;
}

/** `undefined` outside a `RightPanePanel`; `null` until the panel's banner slot mounts. */
const RightPaneBannerSlotContext = createContext<HTMLDivElement | null | undefined>(undefined);
