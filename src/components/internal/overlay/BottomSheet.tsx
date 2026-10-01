import { type PropsWithChildren, type RefObject, useLayoutEffect, useRef } from "react";
import { FocusScope, mergeProps, useDialog, useOverlay, usePreventScroll } from "react-aria";
import { createPortal } from "react-dom";
import { Button } from "src/components/Button";
import { contrastDataTheme, useContrastScope } from "src/components/ContrastScope";
import { Css, Tokens } from "src/Css";
import { useTestIds } from "src/utils/useTestIds";
import { zIndices } from "src/utils/zIndices";

export type BottomSheetProps = PropsWithChildren<{
  isOpen: boolean;
  onClose: VoidFunction;
  /** Shown in the sheet header and used as the dialog's accessible name. */
  label: string;
}>;

/** Mobile overlay pinned to the bottom of the visual viewport, so content stays above the on-screen keyboard. */
export function BottomSheet(props: BottomSheetProps) {
  const { isOpen, onClose, label, children } = props;
  const frameRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const contrast = useContrastScope();
  const tid = useTestIds(props, "bottomSheet");

  useVisualViewportFrame(frameRef, isOpen);
  usePreventScroll({ isDisabled: !isOpen });
  const { overlayProps, underlayProps } = useOverlay({ isOpen, onClose, isDismissable: true }, sheetRef);
  const { dialogProps } = useDialog({ "aria-label": label }, sheetRef);

  if (!isOpen) return null;

  return createPortal(
    <div ref={frameRef} css={frameCss} data-theme={contrast ? contrastDataTheme : undefined}>
      <div {...underlayProps} css={scrimCss} {...tid.sheetScrim} />
      <FocusScope contain restoreFocus>
        <div {...mergeProps(overlayProps, dialogProps)} ref={sheetRef} css={sheetCss} {...tid.sheet}>
          <div css={Css.df.aic.jcsb.gap1.px2.hPx(sheetHeaderHeight).bb.bc(Tokens.SurfaceSeparator).$}>
            <span css={Css.smSb.truncate.$}>{label}</span>
            <Button label="Done" variant="tertiary" onClick={onClose} {...tid.sheetDone} />
          </div>
          {children}
        </div>
      </FocusScope>
    </div>,
    document.body,
  );
}

/** Keeps `frameRef` sized to the visual viewport (which shrinks under the iOS keyboard) without React renders. */
function useVisualViewportFrame(frameRef: RefObject<HTMLDivElement | null>, isOpen: boolean): void {
  useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!isOpen || !frame) return;
    let raf = 0;
    const apply = () => {
      raf = 0;
      const vv = window.visualViewport;
      const top = vv?.offsetTop ?? 0;
      const height = vv?.height ?? window.innerHeight;
      frame.style.top = `${top}px`;
      frame.style.height = `${height}px`;
      frame.style.setProperty(
        "--menu-max-height",
        `${Math.max(0, Math.round(height * sheetMaxRatio) - sheetHeaderHeight)}px`,
      );
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };
    apply();
    window.visualViewport?.addEventListener("resize", schedule);
    window.visualViewport?.addEventListener("scroll", schedule);
    window.addEventListener("resize", schedule);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.visualViewport?.removeEventListener("resize", schedule);
      window.visualViewport?.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [frameRef, isOpen]);
}

const sheetHeaderHeight = 48;
/** The sheet never covers more than this share of the visible viewport. */
const sheetMaxRatio = 0.85;

const frameCss = Css.fixed.left0.w100.top0.df.fdc.jcfe.z(zIndices.popover).$;
const scrimCss = Css.absolute.inset0.bgColor(Tokens.Scrim).$;
const sheetCss = {
  ...Css.relative.df.fdc.w100.bgColor(Tokens.SurfaceRaised).color(Tokens.OnSurface).bshModal.outline0.bottomPx.$,
  ...Css.add("borderTopLeftRadius", "12px")
    .add("borderTopRightRadius", "12px")
    .add("paddingBottom", "env(safe-area-inset-bottom)").$,
};
