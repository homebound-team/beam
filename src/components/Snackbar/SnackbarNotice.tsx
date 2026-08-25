import { useLayoutEffect, useResizeObserver } from "@react-aria/utils";
import { ReactNode, useCallback, useRef, useState } from "react";
import { Button, ButtonProps } from "src/components/Button";
import { contrastDataTheme } from "src/components/ContrastScope";
import { Icon, IconProps } from "src/components/Icon";
import { IconButton } from "src/components/IconButton";
import { Css, Palette, Tokens } from "src/Css";
import { useTestIds } from "src/utils";

export type SnackbarNoticeTypes = "error" | "warning" | "success" | "info" | "alert";
export type SnackbarNoticeProps = {
  /** Adds action button to the right of the notice */
  action?: Pick<ButtonProps, "label" | "onClick" | "variant">;
  /** Does not allow the user to close the notice manually. Notice will fade away in 10s. Value will be ignored if 'persistent' is set to 'true'. */
  hideCloseButton?: boolean;
  message: ReactNode;
  /** This notice will persist on the screen until systematically closed by the app or by the user clicking the close button. */
  persistent?: boolean;
  /** Defines the icon that will show on the left side of the notification. */
  icon?: SnackbarNoticeTypes;
  /** Unique identifier to allow notice to close itself */
  id: string;
  /** Removes the snackbar notice from the stack */
  onClose: () => void;
};

export function SnackbarNotice(props: SnackbarNoticeProps) {
  const { icon, message, action, hideCloseButton, persistent, onClose } = props;
  const tid = useTestIds(props, "snackbar");
  // Only allow the "close" button to be hidden if not a `persistent` notice. Otherwise we could get in a state where the user cannot remove the notice from the screen.
  const reallyHideClose = hideCloseButton && !persistent;
  const messageRef = useRef<HTMLSpanElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);

  const measureOverflow = useCallback(() => {
    if (!messageRef.current || expanded) return;
    setHasOverflow(messageRef.current.scrollHeight > messageRef.current.clientHeight);
  }, [expanded]);

  useLayoutEffect(measureOverflow, [measureOverflow, message]);
  useResizeObserver({ ref: messageRef, onResize: measureOverflow });

  return (
    <div
      css={{
        ...Css.color(Tokens.OnSurface).bgColor(Tokens.SurfaceRaised).br4.md.df.pyPx(12).maxwPx(noticeMaxWidthPx).aifs.$,
        ...(expanded ? Css.maxw(expandedNoticeMaxWidth).$ : undefined),
      }}
      data-theme={contrastDataTheme}
      {...tid}
      role="alert"
    >
      {icon && (
        <span css={Css.fs0.plPx(12).$}>
          <Icon {...typeToIcon[icon]} {...tid.icon} />
        </span>
      )}

      <div css={Css.fg1.mw0.df.fdc.aifs.gap1.pr2.plPx(icon ? 8 : 16).$}>
        <span
          ref={messageRef}
          css={Css.if(!expanded).lineClamp3.$}
          // Provide a 'title' attribute if we can in case the text is truncated
          {...(typeof message === "string" && !expanded ? { title: message } : undefined)}
          {...tid.message}
        >
          {message}
        </span>
        {hasOverflow && (
          <Button
            variant="text"
            size="sm"
            label={expanded ? "Collapse" : "Expand"}
            aria-expanded={expanded}
            onClick={() => setExpanded((prev) => !prev)}
            {...tid.expand}
          />
        )}
      </div>

      {(action || !reallyHideClose) && (
        <span css={Css.fs0.df.aic.$}>
          {action && (
            <span css={Css.ttu.sm.prPx(!reallyHideClose && action.variant !== "text" ? 4 : 8).$}>
              <Button {...action} {...tid.action} />
            </span>
          )}
          {!reallyHideClose && (
            <span css={Css.pr1.add("lineHeight", 0).$}>
              <IconButton icon="x" onClick={onClose} {...tid.close} />
            </span>
          )}
        </span>
      )}
    </div>
  );
}

const noticeMaxWidthPx = 420;
/** Twice the collapsed width, capped so both sides keep the Snackbar `left3` inset. */
const expandedNoticeMaxWidth = `min(${noticeMaxWidthPx * 2}px, calc(100vw - (2 * var(--t-spacing) * 3)))`;

const typeToIcon: Record<SnackbarNoticeTypes, Pick<IconProps, "icon" | "color">> = {
  // Can change to a Tupple with IconKey and color?
  error: { icon: "xCircle", color: Palette.Red400 },
  warning: { icon: "error", color: Palette.Yellow300 },
  success: { icon: "checkCircle", color: Palette.Green300 },
  info: { icon: "infoCircle", color: Palette.Blue300 },
  alert: { icon: "errorCircle", color: Palette.White },
};
