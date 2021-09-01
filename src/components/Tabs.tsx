import { Fragment, HTMLAttributes, KeyboardEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { mergeProps, useFocusRing, useHover } from "react-aria";
import type { IconKey } from "src/components";
import { Css, Margin, Only, Properties, Xss } from "src/Css";
import { BeamFocusableProps } from "src/interfaces";
import { useTestIds } from "src/utils";
import { Icon } from "./Icon";

export interface Tab<V extends string = string> {
  name: string;
  value: V;
  icon?: IconKey;
  disabled?: boolean;
  render: () => ReactNode;
}

type TabsContentXss = Xss<Margin>;

export interface TabsProps<V extends string, X extends Properties> {
  ariaLabel?: string;
  // the selected tab is connected to the contents displayed
  selected: V;
  tabs: Tab<V>[];
  onChange: (value: V) => void;
  contentXss?: X;
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
export function TabsWithContent<V extends string, X extends Only<TabsContentXss, X>>(props: TabsProps<V, X>) {
  const onlyOneTabEnabled = props.tabs.filter((t) => !t.disabled).length === 1;
  return (
    <Fragment>
      {!onlyOneTabEnabled && <Tabs {...props} />}
      <TabContent {...props} />
    </Fragment>
  );
}

export function TabContent<V extends string>(props: Omit<TabsProps<V, {}>, "onChange">) {
  const tid = useTestIds(props, "tab");
  const { selected, tabs, contentXss = {} } = props;
  const selectedTab = tabs.find((tab) => tab.value === selected) || tabs[0];
  return (
    <div
      aria-labelledby={`${selectedTab.value}-tab`}
      id={`${selectedTab.value}-tabPanel`}
      role="tabpanel"
      tabIndex={0}
      {...tid.panel}
      css={{ ...Css.mt2.$, ...contentXss }}
    >
      {selectedTab.render()}
    </div>
  );
}

/** The top list of tabs. */
export function Tabs<V extends string>(props: TabsProps<V, {}>) {
  const { ariaLabel, onChange, selected, tabs, ...others } = props;
  const { isFocusVisible, focusProps } = useFocusRing();
  const tid = useTestIds(others, "tabs");
  const [active, setActive] = useState(selected);

  // Whenever selected changes, reset active
  useEffect(() => setActive(selected), [selected]);

  // the active tab is highlighted, but not necessarily "selected"
  // the selected tab dictates what is displayed in the content panel
  function handleKeyUp(e: KeyboardEvent) {
    // left and right arrow keys update the active tab
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      const nextTabValue = getNextTabValue(active, e.key, tabs);
      setActive(nextTabValue);
    }
    // hitting enter will select the active tab and display the related contents
    if (e.key === "Enter") {
      onChange(active);
    }
  }

  // clicking on a tab sets it to selected and active
  function handleOnClick(value: V) {
    onChange(value);
    setActive(value);
  }

  // bluring out resets active to whatever selected is
  function handleBlur() {
    setActive(selected);
  }

  // We also check this in TabsWithContent, but if someone is using Tabs standalone, check it here as well
  const onlyOneTabEnabled = props.tabs.filter((t) => !t.disabled).length === 1;
  if (onlyOneTabEnabled) {
    return <></>;
  }

  return (
    <div css={Css.dif.childGap1.$} aria-label={ariaLabel} role="tablist" {...tid}>
      {tabs.map((tab) => {
        const { name, value, icon, disabled = false } = tab;
        return (
          <SingleTab
            active={active === value}
            disabled={disabled}
            focusProps={focusProps}
            icon={icon}
            isFocusVisible={isFocusVisible}
            key={value}
            label={name}
            onClick={disabled ? () => {} : handleOnClick}
            onKeyUp={handleKeyUp}
            onBlur={handleBlur}
            value={value}
            {...tid[value]}
          />
        );
      })}
    </div>
  );
}

interface TabProps<V extends string> extends BeamFocusableProps {
  /** active indicates the current tab is highlighted */
  active: boolean;
  disabled: boolean;
  label: string;
  icon?: IconKey;
  value: V;
  onClick: (value: V) => void;
  onKeyUp: (e: KeyboardEvent) => void;
  onBlur: () => void;
  focusProps: HTMLAttributes<HTMLElement>;
  isFocusVisible: boolean;
}

function SingleTab<V extends string>(props: TabProps<V>) {
  const {
    disabled: isDisabled,
    label,
    value,
    onClick,
    active,
    icon = false,
    onKeyUp,
    onBlur,
    focusProps,
    isFocusVisible = false,
    ...others
  } = props;
  const { hoverProps, isHovered } = useHover({ isDisabled });
  const { baseStyles, activeStyles, focusRingStyles, hoverStyles, disabledStyles, activeHoverStyles } = useMemo(
    () => getTabStyles(),
    [],
  );

  return (
    <div
      aria-controls={`${value}-tabPanel`}
      aria-selected={active}
      aria-disabled={isDisabled || undefined}
      id={`${value}-tab`}
      role="tab"
      tabIndex={active ? 0 : -1}
      {...mergeProps(focusProps, hoverProps, { onKeyUp, onBlur, onClick: () => onClick(value) })}
      {...others}
      css={{
        ...baseStyles,
        ...(active && activeStyles),
        ...(isDisabled && disabledStyles),
        ...(isHovered && hoverStyles),
        ...(isHovered && active && activeHoverStyles),
        ...(isFocusVisible && active && focusRingStyles),
      }}
    >
      {label}
      {icon && (
        <span css={Css.ml1.$}>
          <Icon icon={icon} />
        </span>
      )}
    </div>
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

export function getNextTabValue<V extends string>(selected: V, key: "ArrowLeft" | "ArrowRight", tabs: Tab<V>[]): V {
  const enabledTabs = tabs.filter((tab) => tab.disabled !== true);
  const tabsToScan = key === "ArrowRight" ? enabledTabs : enabledTabs.reverse();
  const currentIndex = tabsToScan.findIndex((tab) => tab.value === selected);
  const nextIndex = currentIndex === tabsToScan.length - 1 ? 0 : currentIndex + 1;
  return tabsToScan[nextIndex].value;
}
