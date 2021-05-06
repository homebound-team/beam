import { HTMLAttributes, KeyboardEvent, useMemo, useRef } from "react";
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

  function handleKeyDown(e: KeyboardEvent) {
    // switches tabs on left and right arrow key down events
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      const nextTabValue = getNextTabValue(selected, e.key, tabs);
      onChange(nextTabValue);
    }
  }

  return (
    <div css={Css.dif.$} aria-label={ariaLabel} role="tablist" {...testIds}>
      {tabs.map((tab, i) => {
        const { name, value, icon, disabled = false } = tab;
        const testId = testIds[i];

        return (
          <TabImpl
            focusProps={focusProps}
            isFocusVisible={isFocusVisible}
            key={value}
            label={name}
            value={value}
            active={selected === value}
            icon={icon}
            disabled={disabled}
            onChange={onChange}
            onKeyDown={handleKeyDown}
            {...testId}
          />
        );
      })}
    </div>
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
  onKeyDown: (e: KeyboardEvent) => void;
  focusProps: HTMLAttributes<HTMLElement>;
  isFocusVisible: boolean;
}

function TabImpl(props: TabProps) {
  const {
    disabled: isDisabled,
    label,
    value,
    onChange,
    active = false,
    icon = false,
    onKeyDown,
    focusProps,
    isFocusVisible = false,
    ...others
  } = props;
  const ref = useRef<HTMLButtonElement | null>(null);
  const { hoverProps, isHovered } = useHover({ isDisabled });
  const { baseStyles, activeStyles, focusRingStyles, hoverStyles, disabledStyles, activeHoverStyles } = useMemo(
    () => getTabStyles(),
    [],
  );

  return (
    <button
      {...mergeProps(focusProps, hoverProps)}
      {...others}
      role="tab"
      aria-selected={active}
      aria-disabled={isDisabled || undefined}
      tabIndex={active ? 0 : -1}
      ref={ref}
      onClick={() => onChange(value)}
      onKeyDown={onKeyDown}
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
    </button>
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
