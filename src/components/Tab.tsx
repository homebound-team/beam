import { HTMLAttributes, useMemo, useRef } from "react";
import { mergeProps, useFocusRing, useHover } from "react-aria";
import { Css } from "src/Css";
import { BeamFocusableProps } from "src/interfaces";
import { Icon, Icons } from "./Icon";

export type TabType = {
  name: string;
  value: string;
  icon?: keyof typeof Icons;
  disabled?: boolean;
};

type TabListProps = {
  selected: string;
  onChange: (value: string) => void;
  ariaLabel?: string;
  tabs: TabType[];
  id?: string;
};

export function TabList(props: TabListProps) {
  const { ariaLabel, onChange, selected, tabs, id = "tabs" } = props;
  const { isFocusVisible, focusProps } = useFocusRing();

  function handleArrowKeys(e: any) {
    // TODO: skip tab if disabled
    if (e.key === "ArrowLeft") {
      const selectedIndex = tabs.findIndex((tab) => tab.value === selected);
      const prevIndex = selectedIndex === 0 ? tabs.length - 1 : selectedIndex - 1;
      onChange(tabs[prevIndex].value);
    }
    if (e.key === "ArrowRight") {
      const selectedIndex = tabs.findIndex((tab) => tab.value === selected);
      const nextIndex = selectedIndex === tabs.length - 1 ? 0 : selectedIndex + 1;
      onChange(tabs[nextIndex].value);
    }
  }

  return (
    <div css={Css.dif.$} aria-label={ariaLabel} role="tablist">
      {tabs.map((tab, n) => {
        const { name, value, icon, disabled = false } = tab;
        return (
          <Tab
            focusProps={focusProps}
            isFocusVisible={isFocusVisible}
            key={value}
            label={name}
            value={value}
            active={selected === value}
            icon={icon}
            disabled={disabled}
            onChange={onChange}
            handleKeyDown={handleArrowKeys}
          />
        );
      })}
    </div>
  );
}

export interface TabProps extends BeamFocusableProps {
  /** active indicates the user is on the current tab */
  active?: boolean;
  disabled?: boolean;
  label: string;
  icon?: keyof typeof Icons;
  value: string;
  onChange: (value: string) => void;
  handleKeyDown: (e: any) => void;
  focusProps: HTMLAttributes<HTMLElement>;
  isFocusVisible?: boolean;
}

export function Tab(props: TabProps) {
  const {
    disabled: isDisabled,
    label,
    value,
    onChange,
    active = false,
    icon = false,
    handleKeyDown,
    focusProps,
    isFocusVisible = false,
  } = props;
  const ref = useRef<HTMLButtonElement | null>(null);
  const { hoverProps, isHovered } = useHover({ isDisabled });
  const { baseStyles, activeStyles, focusStyles, hoverStyles, disabledStyles, activeHoverStyles } = useMemo(
    () => getTabsStyles(),
    [],
  );

  return (
    <button
      {...mergeProps(focusProps, hoverProps)}
      role="tab"
      aria-selected={active}
      aria-disabled={isDisabled || undefined}
      tabIndex={active ? 0 : -1}
      ref={ref}
      onClick={() => onChange(value)}
      onKeyDown={handleKeyDown}
      css={{
        ...baseStyles,
        ...(active && activeStyles),
        ...(isDisabled && disabledStyles),
        ...(isHovered && hoverStyles),
        ...(isHovered && active && activeHoverStyles),
        ...(isFocusVisible && active && focusStyles),
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

export function getTabsStyles() {
  return {
    baseStyles: Css.df.itemsCenter.hPx(32).pyPx(6).px1.br4.smEm.outline0.gray700.add("width", "fit-content").$,
    activeStyles: Css.lightBlue700.bgLightBlue50.$,
    disabledStyles: Css.gray400.cursorNotAllowed.$,
    focusStyles: Css.bgLightBlue50.bshFocus.$,
    hoverStyles: Css.gray700.bgGray100.$,
    activeHoverStyles: Css.bgLightBlue200.lightBlue700.$,
  };
}
