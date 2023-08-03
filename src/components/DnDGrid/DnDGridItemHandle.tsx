import { mergeProps, useFocusRing, useHover } from "react-aria";
import { Css, Icon, IconKey, Palette, useTestIds } from "src";
import { DnDGridItemProps } from "src/components/DnDGrid/useDnDGridItem";

export interface DnDGridItemHandleProps {
  dragHandleProps: DnDGridItemProps["dragHandleProps"];
  icon?: IconKey;
  compact?: boolean;
  color?: Palette;
}

/** Provides a specific handle element for dragging a GridItem. Includes handling behaviors and interactions */
export function DnDGridItemHandle(props: DnDGridItemHandleProps) {
  const { dragHandleProps, icon = "move", compact = false, color } = props;
  const { focusProps, isFocusVisible } = useFocusRing();
  const { hoverProps, isHovered } = useHover({});
  const tid = useTestIds(props, "dragHandle");

  const iconButtonNormal = Css.hPx(28).wPx(28).br8.bw2.$;
  const iconButtonCompact = Css.hPx(18).wPx(18).br4.bw1.$;

  return (
    <button
      css={{
        ...(compact ? iconButtonCompact : iconButtonNormal),
        ...Css.cursor("grab").bTransparent.bsSolid.bgTransparent.outline0.dif.aic.jcc.transition.if(isFocusVisible)
          .bBlue700.$,
        ...(isHovered && Css.bgGray200.$),
      }}
      {...mergeProps(dragHandleProps, focusProps, hoverProps)}
      {...tid}
    >
      <Icon icon={icon} inc={compact ? 2 : undefined} color={color} />
    </button>
  );
}
