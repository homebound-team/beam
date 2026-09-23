import { useCallback, type ReactNode } from "react";
import type { IconKey } from "src/components/Icon";
import { IconButton } from "src/components/IconButton";
import { RightPanePanel } from "src/components/Layout/RightPaneLayout/RightPanePanel";
import { useRightPane, useRightPaneActions } from "src/components/Layout/RightPaneLayout/useRightPane";
import { Css } from "src/Css";
import { useBreakpoint } from "src/hooks/useBreakpoint";
import { stickyNavAndHeaderOffset } from "src/layouts/layoutVars";
import { useTestIds } from "src/utils/useTestIds";
import { zIndices } from "src/utils/zIndices";

/** Icon + pane body for `rightPaneTriggers` on workflow layouts. See `docs/layouts.md`. */
export type RightPaneTrigger = {
  icon: IconKey;
  label: string;
  content: ReactNode;
};

/** Page-level trigger chrome: floating stack on desktop (slides off-screen with the pane), header slot on `sm`. */
export function WorkflowPageRightPaneTriggers(props: { triggers: RightPaneTrigger[] }) {
  const { triggers } = props;
  const { sm: isMobile } = useBreakpoint();
  const { isRightPaneOpen } = useRightPane();
  const { openRightPane } = useRightPaneActions();
  const tid = useTestIds(props, "rightPaneTriggers");
  const pageTriggerInsetPx = 24;

  const onClick = useCallback(
    (trigger: RightPaneTrigger) => {
      openRightPane({
        content: <RightPanePanel title={trigger.label}>{trigger.content}</RightPanePanel>,
      });
    },
    [openRightPane],
  );

  return (
    <div
      {...tid}
      aria-hidden={isRightPaneOpen}
      {...(isRightPaneOpen ? { inert: true } : {})}
      css={{
        ...Css.df.aic.gap2.fs0.if(!isMobile).transitionTransform.fdc.$,
        ...(!isMobile &&
          Css.fixed
            .top(stickyNavAndHeaderOffset(pageTriggerInsetPx))
            .rightPx(pageTriggerInsetPx)
            .z(zIndices.rightPaneTriggers).$),
        // Desktop only — on `sm` the full-bleed pane covers the header slot.
        ...(!isMobile &&
          (isRightPaneOpen
            ? Css.transform(`translateX(calc(100% + ${pageTriggerInsetPx}px))`).pen.$
            : Css.transform("translateX(0)").$)),
      }}
    >
      {triggers.map((trigger) => (
        <IconButton
          key={trigger.label}
          icon={trigger.icon}
          label={trigger.label}
          variant="circle"
          compact={isMobile}
          onClick={() => onClick(trigger)}
          {...tid[trigger.icon]}
        />
      ))}
    </div>
  );
}
