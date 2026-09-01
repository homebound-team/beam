import { useResizeObserver } from "@react-aria/utils";
import { ReactNode, useRef, useState } from "react";
import { Icon, IconKey, maybeTooltip } from "src/components";
import { Css, Margin, Only, Palette, Properties, Xss } from "src/Css";
import { useTestIds } from "src/utils";

export type TagXss = Margin | "backgroundColor" | "color";
export type TagType = "info" | "update" | "warning" | "error" | "success" | "neutral" | "ai" | "rejected";
export type TagVariant = "primary" | "secondary";

type TagPropsBase<X> = {
  /** Required even if using `iconOnly + preventTooltip`. In those cases an accessibility friendly message is expected */
  text: ReactNode;
  // Defaults to "neutral". "rejected" additionally dims the tag and strikes through its text.
  type?: TagType;
  /** Defaults to "primary". Secondary is intended for use in TagGroup. */
  variant?: TagVariant;
  xss?: X;
  /** A tooltip will automatically be displayed if the text is truncated. Set to true to prevent this behavior.
   * @default false */
  preventTooltip?: boolean;
};

/** When `iconOnly`, `icon` is required — the tag renders only the icon; `text` stays for tooltip/a11y. */
export type TagProps<X> = TagPropsBase<X> & ({ iconOnly?: false; icon?: IconKey } | { iconOnly: true; icon: IconKey });

/** Tag used for indicating a status */
export function Tag<X extends Only<Xss<TagXss>, X>>(props: TagProps<X>) {
  const { text, type, variant = "primary", xss, preventTooltip = false, iconOnly, icon, ...otherProps } = props;
  const isIconOnly = !!iconOnly && !!icon;
  const isRejected = type === "rejected";
  const { background, iconColor, typography, padding } = getVariantStyles(variant, type);
  const tid = useTestIds(otherProps);
  const [showTooltip, setShowTooltip] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  useResizeObserver({
    ref,
    onResize: () => {
      if (!isIconOnly && ref.current) {
        setShowTooltip(ref.current.offsetHeight < ref.current.scrollHeight);
      }
    },
  });

  const tooltipTitle = !preventTooltip ? (isIconOnly ? text : showTooltip ? text : undefined) : undefined;

  return maybeTooltip({
    title: tooltipTitle,
    children: (
      <span
        {...tid}
        css={{
          ...Css.relative.dif.aic.gapPx(4).pyPx(2).gray900.br4.$,
          ...typography,
          ...(isIconOnly ? Css.pxPx(2).$ : padding),
          ...background,
          ...(isRejected ? Css.o50.$ : {}),
          ...xss,
        }}
      >
        {/* Nesting `lineClamp` styles as the padding bottom set would expose the remainder of the text if applied on the same element */}
        {/* Using `lineClamp1` instead of `truncate` as `truncate` requires a width set to properly truncate and `lineClamp` can smartly do it based on the parent's width */}
        {icon && (
          <span css={Css.fs0.$}>
            <Icon icon={icon} inc={1.75} color={iconColor} />
          </span>
        )}
        {isIconOnly ? (
          <span css={Css.visuallyHidden.$}>{text}</span>
        ) : (
          <span ref={ref} css={Css.lineClamp1.wbba.if(isRejected).tdlt.$}>
            {text}
          </span>
        )}
      </span>
    ),
  });
}

type TagVariantStyles = {
  background: Properties;
  iconColor: Palette;
  typography: Properties;
  padding: Properties;
};

function getVariantStyles(variant: TagVariant, type?: TagType): TagVariantStyles {
  if (variant === "secondary") {
    const isAi = type === "ai";
    return {
      background: isAi ? Css.bgWhite.bcPurple600.bw2.ba.purple800.$ : Css.bgWhite.bcGray300.bw1.ba.$,
      // Note: Ai tags shouldn't be using any icon, the purple outline/text is enough
      iconColor: isAi ? Palette.Purple600 : Palette.Gray700,
      typography: isAi ? Css.xsSb.$ : Css.xs.$,
      padding: Css.pxPx(8).$,
    };
  }

  return {
    ...getPrimaryStyles(type),
    typography: Css.xs2Sb.ttu.$,
    padding: Css.pxPx(6).$,
  };
}

function getPrimaryStyles(type?: TagType): Pick<TagVariantStyles, "background" | "iconColor"> {
  switch (type) {
    case "info":
      return { background: Css.bgBlue100.$, iconColor: Palette.Blue600 };
    case "update":
      return { background: Css.bgYellow200.$, iconColor: Palette.Yellow700 };
    case "warning":
      return { background: Css.bgOrange100.$, iconColor: Palette.Orange700 };
    case "error":
      return { background: Css.bgRed100.$, iconColor: Palette.Orange700 };
    case "success":
      return { background: Css.bgGreen100.$, iconColor: Palette.Green600 };
    // Note: Ai tags shouldn't be using any icon, the purple background is enough
    case "ai":
      return { background: Css.bgPurple200.$, iconColor: Palette.Purple600 };
    default:
      // Neutral case
      return { background: Css.bgGray200.$, iconColor: Palette.Gray700 };
  }
}
