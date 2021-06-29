import { HTMLAttributes, KeyboardEvent, ReactNode, useMemo, useState } from "react";
import { mergeProps, useFocusRing, useHover } from "react-aria";
import { Css, Margin, Only, Properties, Xss } from "src/Css";
import { BeamFocusableProps } from "src/interfaces";
import { useTestIds } from "src/utils";
import { Icon, Icons } from "./Icon";

export interface Tab<T extends string = string> {
  name: string;
  value: T;
  icon?: keyof typeof Icons;
  disabled?: boolean;
  render: () => ReactNode;
}

type TabsContentXss = Xss<Margin>;

export interface TabsProps<T extends string, X extends Properties> {
  ariaLabel?: string;
  // the selected tab is connected to the contents displayed
  selected: T;
  tabs: Tab<T>[];
  onChange: (value: T) => void;
  contentXss?: X;
}

/**
 * Provides a list of tabs and their content.
 *
 * The caller is responsible for using `selected` / `onChange` to control
 * the current tab.
 */
export function TabsWithContent<T extends string, X extends Only<TabsContentXss, X>>(props: TabsProps<T, X>) {
  const { selected, tabs, contentXss = {}, ...others } = props;
  const selectedTab = tabs.find((tab) => tab.value === selected) || tabs[0];
  const tid = useTestIds(others, "tab");

  return (
    <div>
      <Tabs {...props} />
      <div
        aria-labelledby={`${selectedTab.value}-tab`}
        id={`${selectedTab.value}-tabPanel`}
        role="tabpanel"
        tabIndex={0}
        {...tid.panel}
        css={{
          ...Css.mt2.$,
          ...contentXss,
        }}
      >
        {selectedTab.render()}
      </div>
    </div>
  );
}

/** The top list of tabs. */
function Tabs<T extends string>(props: TabsProps<T, {}>) {
  const { ariaLabel, onChange, selected, tabs, ...others } = props;
  const { isFocusVisible, focusProps } = useFocusRing();
  const tid = useTestIds(others, "tabs");
  const [active, setActive] = useState(selected);

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
  function handleOnClick(value: T) {
    onChange(value);
    setActive(value);
  }

  return (
    <div css={Css.dif.childGap1.$} aria-label={ariaLabel} role="tablist" {...tid}>
      {tabs.map((tab, i) => {
        const { name, value, icon, disabled = false } = tab;
        const testId = tid[i];

        return (
          <SingleTab
            active={active === value}
            disabled={disabled}
            focusProps={focusProps}
            icon={icon}
            isFocusVisible={isFocusVisible}
            key={value}
            label={name}
            onClick={handleOnClick}
            onKeyUp={handleKeyUp}
            value={value}
            {...testId}
          />
        );
      })}
    </div>
  );
}

interface TabProps<T extends string> extends BeamFocusableProps {
  /** active indicates the current tab is highlighted */
  active: boolean;
  disabled: boolean;
  label: string;
  icon?: keyof typeof Icons;
  value: T;
  onClick: (value: T) => void;
  onKeyUp: (e: KeyboardEvent) => void;
  focusProps: HTMLAttributes<HTMLElement>;
  isFocusVisible: boolean;
}

function SingleTab<T extends string>(props: TabProps<T>) {
  const {
    disabled: isDisabled,
    label,
    value,
    onClick,
    active = false,
    icon = false,
    onKeyUp,
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
      onClick={() => onClick(value)}
      onKeyUp={onKeyUp}
      role="tab"
      tabIndex={active ? 0 : -1}
      {...mergeProps(focusProps, hoverProps)}
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
    baseStyles: Css.df.itemsCenter.hPx(32).pyPx(6).px1.br4.smEm.outline0.gray700.add("width", "fit-content")
      .cursorPointer.$,
    activeStyles: Css.lightBlue700.bgLightBlue50.$,
    disabledStyles: Css.gray400.cursorNotAllowed.$,
    focusRingStyles: Css.bgLightBlue50.bshFocus.$,
    hoverStyles: Css.gray700.bgGray100.$,
    activeHoverStyles: Css.bgLightBlue200.lightBlue700.$,
  };
}

export function getNextTabValue<T extends string>(selected: T, key: "ArrowLeft" | "ArrowRight", tabs: Tab<T>[]): T {
  const enabledTabs = tabs.filter((tab) => tab.disabled !== true);
  const tabsToScan = key === "ArrowRight" ? enabledTabs : enabledTabs.reverse();
  const currentIndex = tabsToScan.findIndex((tab) => tab.value === selected);
  const nextIndex = currentIndex === tabsToScan.length - 1 ? 0 : currentIndex + 1;
  return tabsToScan[nextIndex].value;
}
