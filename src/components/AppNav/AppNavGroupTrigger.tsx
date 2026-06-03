import { useMemo, useRef } from "react";
import { mergeProps, useButton, useFocusRing, useHover } from "react-aria";
import { navLink } from "src/components";
import { Icon } from "src/components/Icon";
import { getNavLinkStyles } from "src/components/NavLinks/NavLink";
import { Css } from "src/Css";
import { useTestIds } from "src/utils";

export type AppNavGroupTriggerProps = {
  label: string;
  navGroupId: string;
  expanded: boolean;
  onClick: () => void;
};

export function AppNavGroupTrigger(props: AppNavGroupTriggerProps) {
  const { label, navGroupId, expanded, onClick } = props;
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
        }),
      })}
    >
      {label}
      <span
        css={{
          ...Css.df.aic.add("marginLeft", "auto").transitionTransform.$,
          ...(props.expanded ? Css.add("transform", "rotate(180deg)").$ : {}),
        }}
      >
        <Icon icon="chevronDown" />
      </span>
    </button>
  );
}
