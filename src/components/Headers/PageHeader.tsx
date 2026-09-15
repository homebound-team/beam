import { AutoSaveIndicator } from "src/components/AutoSaveIndicator";
import { BaseHeader, type BaseHeaderProps } from "src/components/Headers/BaseHeader";
import { type HeaderAction, HeaderActions, splitHeaderActionsOnSm } from "src/components/Headers/HeaderActions";
import { type RouteTabsProps, Tabs, type TabsContentXss, type TabsProps } from "src/components/Tabs";
import { Css, type Only } from "src/Css";
import { useBreakpoint } from "src/hooks/useBreakpoint";
import { pageContentPaddingX } from "src/layouts/layoutSpacing";
import { useTestIds } from "src/utils/useTestIds";

export type PageHeaderProps<V extends string, X> = Omit<BaseHeaderProps, "bottomSlot"> & {
  /** Buttons on desktop; two or more collapse into a overflow menu at `sm`. `keepVisible` actions stay in the bottom slot on mobile. */
  actions?: HeaderAction[];
  tabs?:
    | Omit<TabsProps<V, X>, "contentXss" | "omitFullBleedPadding" | "includeBottomBorder">
    | Omit<RouteTabsProps<V, X>, "contentXss" | "omitFullBleedPadding" | "includeBottomBorder">;
};

export function PageHeader<V extends string, X extends Only<TabsContentXss, X>>(props: PageHeaderProps<V, X>) {
  const { tabs, actions, rightSlot, ...otherProps } = props;
  const tid = useTestIds(otherProps, "header");
  const { sm } = useBreakpoint();
  const { bottomSlotActions, rightSlotActions } = splitHeaderActionsOnSm(actions, sm);
  return (
    <BaseHeader
      {...otherProps}
      rightSlot={
        <div css={Css.df.gap2.fs0.$} {...tid.actions}>
          {/* Hidden while idle so pages that never auto-save stay clean. */}
          <AutoSaveIndicator hideOnIdle />
          {rightSlot}
          {rightSlotActions.length > 0 && <HeaderActions actions={rightSlotActions} collapseOnSm />}
        </div>
      }
      bottomSlot={
        (bottomSlotActions.length > 0 || tabs) && (
          <>
            {bottomSlotActions.length > 0 && (
              <div css={pageContentPaddingX} {...tid.bottomSlot}>
                <HeaderActions actions={bottomSlotActions} />
              </div>
            )}
            {tabs && (
              <div css={pageContentPaddingX}>
                <Tabs {...tabs} {...tid.tabs} />
              </div>
            )}
          </>
        )
      }
    />
  );
}
