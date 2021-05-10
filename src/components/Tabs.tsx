import { HTMLAttributes, KeyboardEvent, ReactNode, useMemo, useRef } from "react";
import { mergeProps, useFocusRing, useHover } from "react-aria";
import { Css } from "src/Css";
import { BeamFocusableProps } from "src/interfaces";
import { useTestIds } from "src/utils";
import { Icon, Icons } from "./Icon";

export interface Tab {
  name: string;
  value: string;
  icon?: keyof typeof Icons;
  disabled?: boolean;
  render: () => ReactNode;
}

interface TabsProps {
  selected: string;
  onChange: (value: string) => void;
  ariaLabel?: string;
  tabs: Tab[];
}

export function Tabs(props: TabsProps) {
  const { ariaLabel, onChange, selected, tabs, ...others } = props;
  const { isFocusVisible, focusProps } = useFocusRing();
  const testIds = useTestIds(others, "tabs");

  function handleKeyUp(e: KeyboardEvent) {
    // switches tabs on left and right arrow key down events
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      const nextTabValue = getNextTabValue(selected, e.key, tabs);
      onChange(nextTabValue);
    }
  }

  return (
    <div css={Css.dif.childGap1.$} aria-label={ariaLabel} role="tablist" {...testIds}>
      {tabs.map((tab, i) => {
        const { name, value, icon, disabled = false } = tab;
        const testId = testIds[i];

        return (
          <SingleTab
            active={selected === value}
            isFocusVisible={isFocusVisible}
            disabled={disabled}
            focusProps={focusProps}
            icon={icon}
            key={value}
            label={name}
            onChange={onChange}
            onKeyUp={handleKeyUp}
            value={value}
            {...testId}
          />
        );
      })}
    </div>
  );
}

export function TabsWithContent(props: TabsProps) {
  const { selected, tabs } = props;
  const selectedTab = tabs.find((tab) => tab.value === selected) || tabs[0];

  return (
    <>
      <Tabs {...props} />
      <div
        aria-labelledby={`${selectedTab.value}-tab`}
        data-testid={`${selectedTab.value}-tabContent`}
        id={`${selectedTab.value}-tabPanel`}
        role="tabpanel"
        tabIndex={0}
      >
        {selectedTab.render()}
      </div>
    </>
  );
}

interface TabProps extends BeamFocusableProps {
  /** active indicates the user is on the current tab */
  active: boolean;
  disabled: boolean;
  label: string;
  icon?: keyof typeof Icons;
  value: string;
  onChange: (value: string) => void;
  onKeyUp: (e: KeyboardEvent) => void;
  focusProps: HTMLAttributes<HTMLElement>;
  isFocusVisible: boolean;
}

function SingleTab(props: TabProps) {
  const {
    disabled: isDisabled,
    label,
    value,
    onChange,
    active = false,
    icon = false,
    onKeyUp,
    focusProps,
    isFocusVisible = false,
    ...others
  } = props;
  const ref = useRef<HTMLDivElement | null>(null);
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
      onClick={() => onChange(value)}
      onKeyUp={onKeyUp}
      ref={ref}
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
    baseStyles: Css.df.itemsCenter.hPx(32).pyPx(6).px1.br4.smEm.outline0.gray700.add("width", "fit-content").$,
    activeStyles: Css.lightBlue700.bgLightBlue50.$,
    disabledStyles: Css.gray400.cursorNotAllowed.$,
    focusRingStyles: Css.bgLightBlue50.bshFocus.$,
    hoverStyles: Css.gray700.bgGray100.$,
    activeHoverStyles: Css.bgLightBlue200.lightBlue700.$,
  };
}

export function getNextTabValue(selected: string, key: "ArrowLeft" | "ArrowRight", tabs: Tab[]) {
  const enabledTabs = tabs.filter((tab) => tab.disabled !== true);
  const tabsToScan = key === "ArrowRight" ? enabledTabs : enabledTabs.reverse();
  const currentIndex = tabsToScan.findIndex((tab) => tab.value === selected);
  const nextIndex = currentIndex === tabsToScan.length - 1 ? 0 : currentIndex + 1;
  return tabsToScan[nextIndex].value;
}
