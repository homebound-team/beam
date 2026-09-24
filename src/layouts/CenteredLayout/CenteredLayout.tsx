import type { CSSProperties, ReactNode } from "react";
import { DocumentScrollOverlayRightPaneLayout } from "src/components/Layout/RightPaneLayout/DocumentScrollOverlayRightPaneLayout";
import { resolveWithRightPaneOptions, type WithRightPane } from "src/components/Layout/RightPaneLayout/withRightPane";
import { Css } from "src/Css";
import { useBreakpoint } from "src/hooks/useBreakpoint";
import { ContentInsetProvider } from "src/layouts/ContentInsetContext";
import { pageContentPaddingX } from "src/layouts/layoutSpacing";
import {
  beamLayoutContentPaddingXVar,
  documentScrollRightPaneContentMinCss,
  pageContentPaddingXValue,
  smPageContentPaddingXValue,
} from "src/layouts/layoutVars";
import { useTestIds } from "src/utils/useTestIds";

export type CenteredLayoutSize = "sm" | "lg";

export type CenteredLayoutProps = {
  /** `sm` = 720px content (768px shell max); `lg` = 1392px content (1440px shell max). Horizontal padding 12px / 24px from `md`. */
  size: CenteredLayoutSize;
  children?: ReactNode;
  /**
   * Opt into the document-scroll detail pane (`useRightPane`).
   * Do not also nest another document-scroll right-pane layout (e.g. `FormSectionLayout withRightPane`).
   */
  withRightPane?: WithRightPane;
};

/** Centered body-width shell. Nest inside page-header / stepper layout children — see `docs/layouts.md`. */
export function CenteredLayout(props: CenteredLayoutProps) {
  const { size, children, withRightPane } = props;
  const tid = useTestIds(props, "centeredLayout");
  const { mdAndUp } = useBreakpoint();
  const rightPane = resolveWithRightPaneOptions(withRightPane);

  const shell = (
    <ContentInsetProvider>
      <div
        css={{ ...Css.w100.maxwPx(centeredShellMaxPx[size]).mxa.$, ...pageContentPaddingX }}
        style={
          {
            // layoutContainer descendants (e.g. ContentHeader) read this to inset sticky horizontal chrome within the shell padding.
            [beamLayoutContentPaddingXVar]: mdAndUp ? pageContentPaddingXValue : smPageContentPaddingXValue,
            // Floor while an ancestor overlay pane is open (`0px` when closed). `md+` only — phones must not get a dummy scrollbar.
            ...(mdAndUp ? { minWidth: documentScrollRightPaneContentMinCss() } : undefined),
          } as CSSProperties
        }
        {...tid}
      >
        {children}
      </div>
    </ContentInsetProvider>
  );

  if (!rightPane) return shell;

  return (
    <DocumentScrollOverlayRightPaneLayout paneWidth={rightPane.width}>{shell}</DocumentScrollOverlayRightPaneLayout>
  );
}

const centeredContentMaxPx = { sm: 720, lg: 1392 } as const;
const mdContentPaddingPx = parseInt(pageContentPaddingXValue, 10);

/** Shell max-width (content + horizontal padding at md+): 768 / 1440. */
export const centeredShellMaxPx = {
  sm: centeredContentMaxPx.sm + mdContentPaddingPx * 2,
  lg: centeredContentMaxPx.lg + mdContentPaddingPx * 2,
} as const;
