import { useMemo, useRef } from "react";
import { mergeProps, useButton, useFocusRing, useHover } from "react-aria";
import { navLink } from "src/components";
import { Icon } from "src/components/Icon";
import { getNavLinkStyles } from "src/components/NavLinks/NavLink";
import { Css, Tokens } from "src/Css";
import { useTestIds } from "src/utils";

export type AppNavGroupTriggerProps = {
  label: string;
  navGroupId: string;
  expanded: boolean;
  onClick: () => void;
  /** True when any leaf link in this group is the current page. */
  active?: boolean;
};

export function AppNavGroupTrigger(props: AppNavGroupTriggerProps) {
  const { label, navGroupId, expanded, onClick, active = false } = props;
  const tid = useTestIds(props, "trigger");
  const ref = useRef<HTMLButtonElement>(null);

  const { buttonProps, isPressed } = useButton({ onPress: onClick, elementType: "button" }, ref);
  const { hoverProps, isHovered } = useHover({});
  const { isFocusVisible, focusProps } = useFocusRing();

  const { baseStyles, focusRingStyles, hoverStyles, pressedStyles } = useMemo(() => getNavLinkStyles("side"), []);

  return (
    <button
      type="button"
      {...mergeProps(buttonProps, focusProps, hoverProps, tid.trigger, {
        ref,
        className: navLink,
        "aria-expanded": expanded,
        "aria-controls": navGroupId,
        ...Css.props({
          ...baseStyles,
          ...(isFocusVisible && focusRingStyles),
          ...(isHovered && hoverStyles),
          ...(isPressed && pressedStyles),
          // Denotes the active group (has a current-page child link)
          ...(active && Css.color(Tokens.NavTextActive).$),
        }),
      })}
    >
      {label}
      <div
        css={{
          ...Css.df.aic.add("marginLeft", "auto").transitionTransform.$,
          ...(props.expanded ? Css.add("transform", "rotate(180deg)").$ : {}),
        }}
      >
        <Icon icon="chevronDown" />
      </div>
    </button>
  );
}
