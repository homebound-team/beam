import { Key, useMemo, useRef } from "react";
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

type LocalTabsProps = {
  selected: string;
  onChange: (value: string) => void;
  ariaLabel?: string;
  tabs: TabType[];
  id?: string;
};

export function LocalTabs(props: LocalTabsProps) {
  const { ariaLabel, onChange, selected, tabs, id = "tabs" } = props;
  return (
    <div css={Css.dif.$} aria-label={ariaLabel}>
      {tabs.map((tab, n) => {
        const { name, value, icon, disabled = false } = tab;
        return <Tab label={name} key={value} active={selected === value} icon={icon} />;
      })}
    </div>
  );
}

export interface TabsProps extends BeamFocusableProps {
  /** active indicates the user is on the current tab */
  active?: boolean;
  disabled?: boolean;
  label: string;
  icon?: keyof typeof Icons;
  key: Key;
}

export function Tab(props: TabsProps) {
  const { disabled: isDisabled, label, key, ...otherProps } = props;
  const ariaProps = { children: label, isDisabled, ...otherProps };
  const { active = false, icon = false } = ariaProps;
  const ref = useRef<HTMLDivElement>();
  const { hoverProps, isHovered } = useHover({ isDisabled });
  const { isFocusVisible, focusProps } = useFocusRing(ariaProps);

  const { baseStyles, activeStyles, focusStyles, hoverStyles, disabledStyles, activeHoverStyles } = useMemo(
    () => getTabsStyles(),
    [],
  );

  return (
    <div
      {...mergeProps(focusProps, hoverProps)}
      ref={ref}
      css={{
        ...baseStyles,
        ...(active && activeStyles),
        ...(isDisabled && disabledStyles),
        ...(isFocusVisible && focusStyles),
        ...(isHovered && hoverStyles),
        ...(isHovered && active && activeHoverStyles),
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
