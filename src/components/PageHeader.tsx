import { AnimatePresence, motion } from "framer-motion";
import { ReactNode, useMemo, useState } from "react";
import { Breadcrumbs, BreadcrumbsProps } from "src/components/Breadcrumbs";
import { RouteTabsProps, Tabs, TabsContentXss, TabsProps } from "src/components/Tabs";
import { Css, Only, Tokens } from "src/Css";
import { useBreakpoint } from "src/hooks";
import { useDocumentTitle } from "src/hooks/useDocumentTitle";
import { useMeasuredHeight } from "src/layouts/useMeasuredHeight";
import { useTestIds } from "src/utils";

export type PageHeaderProps<V extends string, X> = {
  title: string;
  /** Extra segment(s) for `document.title` only; not shown in the visible page heading. */
  documentTitleSuffix?: string;
  rightSlot?: ReactNode;
  tabs?:
    | Omit<TabsProps<V, X>, "contentXss" | "omitFullBleedPadding" | "includeBottomBorder">
    | Omit<RouteTabsProps<V, X>, "contentXss" | "omitFullBleedPadding" | "includeBottomBorder">;
  breadcrumbs?: BreadcrumbsProps;
  collapsed?: boolean;
};

export function PageHeader<V extends string, X extends Only<TabsContentXss, X>>(props: PageHeaderProps<V, X>) {
  const { title, documentTitleSuffix, rightSlot, tabs, breadcrumbs, collapsed = false, ...otherProps } = props;
  const tid = useTestIds(otherProps, "pageHeader");
  useDocumentTitle(title, documentTitleSuffix);
  const { sm } = useBreakpoint();

  const [breadcrumbsInnerEl, setBreadcrumbsInnerEl] = useState<HTMLDivElement | null>(null);
  const breadcrumbsInnerRef = useMemo(() => ({ current: breadcrumbsInnerEl }), [breadcrumbsInnerEl]);
  const breadcrumbsHeight = useMeasuredHeight(breadcrumbsInnerRef, true);

  const [tabsInnerEl, setTabsInnerEl] = useState<HTMLDivElement | null>(null);
  const tabsInnerRef = useMemo(() => ({ current: tabsInnerEl }), [tabsInnerEl]);
  const tabsHeight = useMeasuredHeight(tabsInnerRef, true);

  // Breadcrumbs and rightSlot are desktop-only; on `sm` they never render, collapsed or not.
  const showBreadcrumbs = !!breadcrumbs && !sm;
  const showRightSlot = !!rightSlot && !sm;
  const showTabs = !!tabs && !collapsed;

  return (
    <header
      {...tid}
      css={{
        ...Css.df.fdc.p3.bb
          .bc(Tokens.SurfaceSeparator)
          .bgColor(Tokens.Surface)
          .gap2.add(
            "transition",
            `padding-top ${TRANSITION_MS}ms ${EASING}, padding-bottom ${TRANSITION_MS}ms ${EASING}, row-gap ${TRANSITION_MS}ms ${EASING}`,
          ).$,
        ...Css.if(collapsed).py2.gap0.$,
        ...Css.if(showTabs).pb0.$,
      }}
    >
      <div css={Css.df.jcsb.aife.w100.gap1.$}>
        <div css={Css.mw0.df.fdc.gap1.$}>
          {showBreadcrumbs && (
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  {...tid.breadcrumbsCollapse}
                  aria-hidden={collapsed}
                  css={{ ...Css.oh.$, ...Css.if(collapsed).add("pointerEvents", "none").$ }}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: breadcrumbsHeight, opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={COLLAPSE_TRANSITION}
                >
                  <div ref={setBreadcrumbsInnerEl}>
                    <Breadcrumbs {...breadcrumbs} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
          <h1
            {...tid.title}
            css={
              Css.mw0.truncate.xl
                .add("transition", `font-size ${TRANSITION_MS}ms ${EASING}, line-height ${TRANSITION_MS}ms ${EASING}`)
                .if(collapsed).md.$
            }
          >
            {title}
          </h1>
        </div>
        {showRightSlot && <div css={Css.fs0.hPx(40).$}>{rightSlot}</div>}
      </div>
      {!!tabs && (
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              {...tid.tabsCollapse}
              aria-hidden={collapsed}
              css={{ ...Css.oh.$, ...Css.if(collapsed).add("pointerEvents", "none").$ }}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: tabsHeight, opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={COLLAPSE_TRANSITION}
            >
              <div ref={setTabsInnerEl}>
                <Tabs {...tabs} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </header>
  );
}

const TRANSITION_MS = 220;
const EASING = "cubic-bezier(0.4, 0, 0.2, 1)";

const COLLAPSE_TRANSITION = { duration: 0.2, ease: [0.4, 0, 0.2, 1] } as const;
