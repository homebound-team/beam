import { BaseHeader, BaseHeaderProps } from "src/components/Headers/BaseHeader";
import { RouteTabsProps, Tabs, TabsContentXss, TabsProps } from "src/components/Tabs";
import { Only } from "src/Css";
import { pageContentPaddingX } from "src/layouts/layoutSpacing";
import { useTestIds } from "src/utils";

export type PageHeaderProps<V extends string, X> = Omit<BaseHeaderProps, "bottomSlot"> & {
  tabs?:
    | Omit<TabsProps<V, X>, "contentXss" | "omitFullBleedPadding" | "includeBottomBorder">
    | Omit<RouteTabsProps<V, X>, "contentXss" | "omitFullBleedPadding" | "includeBottomBorder">;
};

export function PageHeader<V extends string, X extends Only<TabsContentXss, X>>(props: PageHeaderProps<V, X>) {
  const { tabs, ...otherProps } = props;
  const tid = useTestIds(otherProps, "header");
  return (
    <BaseHeader
      {...otherProps}
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
