import { BaseHeader, BaseHeaderProps } from "src/components/Headers/BaseHeader";
import { HeaderAction, HeaderActions } from "src/components/Headers/HeaderActions";
import { RouteTabsProps, Tabs, TabsContentXss, TabsProps } from "src/components/Tabs";
import { Only } from "src/Css";
import { pageContentPaddingX } from "src/layouts/layoutSpacing";
import { useTestIds } from "src/utils";

export type PageHeaderProps<V extends string, X> = Omit<BaseHeaderProps, "bottomSlot"> & {
  /** Rendered as buttons on desktop; two or more collapse into a `ButtonMenu` at `sm`. */
  actions?: HeaderAction[];
  tabs?:
    | Omit<TabsProps<V, X>, "contentXss" | "omitFullBleedPadding" | "includeBottomBorder">
    | Omit<RouteTabsProps<V, X>, "contentXss" | "omitFullBleedPadding" | "includeBottomBorder">;
};

export function PageHeader<V extends string, X extends Only<TabsContentXss, X>>(props: PageHeaderProps<V, X>) {
  const { tabs, actions, rightSlot, ...otherProps } = props;
  const tid = useTestIds(otherProps, "header");
  return (
    <BaseHeader
      {...otherProps}
      rightSlot={
        <>
          {rightSlot}
          {actions && actions.length > 0 && <HeaderActions actions={actions} collapseOnSm />}
        </>
      }
      bottomSlot={
        tabs && (
          <div css={pageContentPaddingX}>
            <Tabs {...tabs} {...tid.tabs} />
          </div>
        )
      }
    />
  );
}
