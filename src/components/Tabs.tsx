import { camelCase } from "change-case";
import {
  HTMLAttributes,
  KeyboardEvent,
  PropsWithChildren,
  ReactNode,
  ReactPortal,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { mergeProps, useFocusRing, useHover } from "react-aria";
import { createPortal } from "react-dom";
import { matchPath, Route, useLocation } from "react-router";
import { Link } from "react-router-dom";
import type { IconKey } from "src/components";
import { useBeamContext } from "src/components/BeamContext";
import { Css, Margin, Only, Xss } from "src/Css";
import { BeamFocusableProps } from "src/interfaces";
import { useTestIds } from "src/utils";
import { defaultTestId } from "src/utils/defaultTestId";
import { Icon } from "./Icon";

export interface Tab<V extends string = string> {
  name: string;
  value: V;
  // Suffixes label with specified Icon. If `icon` and `endAdornment` are supplied, only the `icon` will be displayed
  icon?: IconKey;
  // Suffixes label with specified node. Expected to be used for cases where the decoration is not just an icon.
  endAdornment?: ReactNode;
  disabled?: boolean;
  render?: () => ReactNode;
}

type TabsContentXss = Xss<Margin>;

export interface TabsProps<V extends string, X> {
  ariaLabel?: string;
  // the selected tab is connected to the contents displayed
  selected: V;
  tabs: Tab<V>[];
  onChange: (value: V) => void;
  contentXss?: X;
  // Allow for showing the tabs even if there is only one enabled tab
  alwaysShowAllTabs?: boolean;
}

// Tabs can be rendered as Links (omit "onChange") and we'll use React-Router for matching (omit "selected")/
export interface RouteTabsProps<V extends string, X> extends Omit<TabsProps<V, X>, "onChange" | "selected" | "tabs"> {
  tabs: RouteTab<V>[];
}
// A Route Tab has a `href` prop rather than a `value` prop
export interface RouteTab<V extends string = string> extends Omit<Tab<V>, "value"> {
  href: V;
  // This is a React-Router path(s) to match the current URL to. Matching on the path(s) is what dictates which TabContent to render
  path: string | string[];
}

export interface TabWithContent<V extends string = string> extends Omit<Tab<V>, "render"> {
  render: () => ReactNode;
}

export interface RouteTabWithContent<V extends string = string> extends Omit<RouteTab<V>, "render"> {
  render: () => ReactNode;
}

interface RequiredRenderTabs<V extends string, X> extends Omit<TabsProps<V, X>, "tabs"> {
  tabs: TabWithContent<V>[];
}

interface RequiredRenderRouteTabs<V extends string, X> extends Omit<RouteTabsProps<V, X>, "tabs"> {
  tabs: RouteTabWithContent<V>[];
}

/**
 * Provides a list of tabs and their content.
 *
 * The caller is responsible for using `selected` / `onChange` to control
 * the current tab.
 *
 * If you want to tease apart Tabs from their TabContent, you can use the `Tab`
 * and `TabContent` components directly.
 */
export function TabsWithContent<V extends string, X extends Only<TabsContentXss, X>>(
  props: RequiredRenderTabs<V, X> | RequiredRenderRouteTabs<V, X>,
) {
  return (
    <>
      <Tabs {...props} />
      <TabContent {...props} />
    </>
  );
}

export function TabContent<V extends string>(
  props: Omit<RequiredRenderTabs<V, {}>, "onChange"> | RequiredRenderRouteTabs<V, {}>,
) {
  const tid = useTestIds(props, "tab");
  const { tabs, contentXss = {} } = props;
  const location = useLocation();
  const selectedTab = isRouteTabs(props)
    ? props.tabs.find((t) => {
        const paths = Array.isArray(t.path) ? t.path : [t.path];
        return paths.some((p) => !!matchPath(location.pathname, { path: t.path, exact: true }));
      }) || tabs[0]
    : props.tabs.find((tab) => tab.value === props.selected) || tabs[0];
  const uniqueValue = uniqueTabValue(selectedTab);

  // Do not apply default top margin styles if the tabs are being hidden. This avoids unnecessary white space being added
  const styles = hideTabs(props) ? {} : Css.mt3.$;

  return (
    <div
      aria-labelledby={`${uniqueValue}-tab`}
      id={`${uniqueValue}-tabPanel`}
      role="tabpanel"
      tabIndex={0}
      {...tid.panel}
      css={{ ...styles, ...contentXss }}
    >
      {isRouteTab(selectedTab) ? <Route path={selectedTab.path} render={selectedTab.render} /> : selectedTab.render()}
    </div>
  );
}

/** The top list of tabs. */
export function Tabs<V extends string>(props: TabsProps<V, {}> | RouteTabsProps<V, {}>) {
  const { tabActionsRef, tabActionsDiv } = useBeamContext();
  const { ariaLabel, tabs, ...others } = props;
  const location = useLocation();
  const selected = isRouteTabs(props)
    ? uniqueTabValue(
        props.tabs.find((t) => !!matchPath(location.pathname, { path: t.path, exact: true })) || props.tabs[0],
      )
    : props.selected;
  const { isFocusVisible, focusProps } = useFocusRing();
  const tid = useTestIds(others, "tabs");
  const [active, setActive] = useState(selected);
  const ref = useRef<HTMLDivElement>(null);

  // Whenever selected changes, reset active
  useEffect(() => setActive(selected), [selected]);

  useEffect(() => {
    if (tabActionsRef && tabActionsDiv) {
      tabActionsRef.current!.appendChild(tabActionsDiv);
    }
  }, [tabActionsRef, tabActionsDiv]);

  // the active tab is highlighted, but not necessarily "selected"
  // the selected tab dictates what is displayed in the content panel
  function onKeyUp(e: KeyboardEvent) {
    // left and right arrow keys update the active tab
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      const nextTabValue = getNextTabValue(active, e.key, tabs);
      setActive(nextTabValue);

      // Ensure the browser's focus follows the active element.
      document.getElementById(`${nextTabValue}-tab`)?.focus();
    }
  }

  // clicking on a tab sets it to selected and active
  function onClick(value: V) {
    !isRouteTabs(props) && props.onChange(value);
  }

  // bluring out resets active to whatever selected is
  function onBlur(e: FocusEvent) {
    // only reset active state if we've moved focus out of the tab list
    if (!(ref.current && ref.current.contains(e.relatedTarget as Node))) {
      setActive(selected);
    }
  }

  return (
    <div css={Css.df.aic.$}>
      {/* Do not show if we should hide the tabs */}
      {!hideTabs(props) && (
        <div ref={ref} css={Css.dif.childGap1.$} aria-label={ariaLabel} role="tablist" {...tid}>
          {tabs.map((tab) => {
            const uniqueValue = uniqueTabValue(tab);
            return (
              <TabImpl
                active={active === uniqueValue}
                focusProps={focusProps}
                isFocusVisible={isFocusVisible}
                key={uniqueValue}
                onClick={onClick}
                onKeyUp={onKeyUp}
                onBlur={onBlur}
                tab={tab}
                {...tid[defaultTestId(uniqueValue)]}
              />
            );
          })}
        </div>
      )}
      {/* ref for actions specific to a tab. Targeting the immediate div (tabActionsEl) to set default styles */}
      <div css={Css.ml("auto").addIn("&>div", Css.df.aic.childGap1.$).$} ref={tabActionsRef} />
    </div>
  );
}

interface TabImplProps<V extends string> extends BeamFocusableProps {
  /** active indicates the current tab is highlighted */
  active: boolean;
  onClick: (value: V) => void;
  onKeyUp: (e: KeyboardEvent) => void;
  onBlur: (e: FocusEvent) => void;
  focusProps: HTMLAttributes<HTMLElement>;
  isFocusVisible: boolean;
  tab: Tab<V> | RouteTab<V>;
}

function TabImpl<V extends string>(props: TabImplProps<V>) {
  const { tab, onClick, active, onKeyUp, onBlur, focusProps, isFocusVisible = false, ...others } = props;
  const { disabled: isDisabled = false, name: label, icon, endAdornment } = tab;
  const { hoverProps, isHovered } = useHover({ isDisabled });
  const { baseStyles, activeStyles, focusRingStyles, hoverStyles, disabledStyles, activeHoverStyles } = useMemo(
    () => getTabStyles(),
    [],
  );
  const uniqueValue = uniqueTabValue(tab);

  const tabProps = {
    "aria-controls": `${uniqueValue}-tabPanel`,
    "aria-selected": active,
    "aria-disabled": isDisabled || undefined,
    id: `${uniqueValue}-tab`,
    role: "tab",
    tabIndex: active ? 0 : -1,
    ...others,
    css: {
      ...baseStyles,
      ...(active && activeStyles),
      ...(isDisabled && disabledStyles),
      ...(isHovered && hoverStyles),
      ...(isHovered && active && activeHoverStyles),
      ...(isFocusVisible && active && focusRingStyles),
    },
  };
  const interactiveProps = mergeProps(focusProps, hoverProps, {
    onKeyUp,
    onBlur,
    ...(isRouteTab(tab) ? {} : { onClick: () => onClick(tab.value) }),
  });

  const tabLabel = (
    <>
      {label}
      {(icon || endAdornment) && <span css={Css.ml1.$}>{icon ? <Icon icon={icon} /> : endAdornment}</span>}
    </>
  );

  return isDisabled ? (
    <div {...tabProps}>{tabLabel}</div>
  ) : isRouteTab(tab) ? (
    <Link {...{ ...tabProps, ...interactiveProps }} className="navLink" to={tab.href}>
      {tabLabel}
    </Link>
  ) : (
    <button {...{ ...tabProps, ...interactiveProps }}>{tabLabel}</button>
  );
}

export function getTabStyles() {
  return {
    baseStyles: Css.df.aic.hPx(32).pyPx(6).px1.br4.smEm.outline0.gray700.add("width", "fit-content").cursorPointer.$,
    activeStyles: Css.lightBlue700.bgLightBlue50.$,
    disabledStyles: Css.gray400.cursorNotAllowed.$,
    focusRingStyles: Css.bgLightBlue50.bshFocus.$,
    hoverStyles: Css.gray700.bgGray100.$,
    activeHoverStyles: Css.bgLightBlue200.lightBlue700.$,
  };
}

export function getNextTabValue<V extends string>(
  selected: V,
  key: "ArrowLeft" | "ArrowRight",
  tabs: Tab<V>[] | RouteTab<V>[],
): V {
  const enabledTabs: RouteTab<V>[] | Tab<V>[] = (tabs as any[]).filter((tab) => tab.disabled !== true);
  const tabsToScan = key === "ArrowRight" ? enabledTabs : enabledTabs.reverse();
  const currentIndex = tabsToScan.findIndex((tab) => uniqueTabValue(tab) === selected);
  const nextIndex = currentIndex === tabsToScan.length - 1 ? 0 : currentIndex + 1;
  return uniqueTabValue(tabsToScan[nextIndex]);
}

function isRouteTabs(
  props: Omit<TabsProps<any, any>, "onChange"> | RouteTabsProps<any, any>,
): props is RouteTabsProps<any, any> {
  const { tabs } = props;
  return tabs.length > 0 && isRouteTab(tabs[0]);
}

function isRouteTab(tab: Tab<any> | RouteTab<any>): tab is RouteTab<any> {
  return "path" in tab;
}

function uniqueTabValue(tab: Tab<any> | RouteTab<any>) {
  return isRouteTab(tab) ? camelCase(tab.name) : tab.value;
}

export function TabActions({ children }: PropsWithChildren<{}>): ReactPortal {
  const { tabActionsDiv } = useBeamContext();
  if (!tabActionsDiv) {
    throw new Error("Tab Actions element is not defined");
  }
  return createPortal(children, tabActionsDiv);
}

// Determines whether we should hide the Tab panel. Returns true if there is only one enabled tab and `alwaysShowAllTabs` is falsey.
function hideTabs(props: Omit<TabsProps<any, {}>, "onChange"> | RouteTabsProps<any, {}>) {
  return props.alwaysShowAllTabs ? false : (props.tabs as any[]).filter((t) => !t.disabled).length === 1;
}
