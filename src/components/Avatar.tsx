import { useState } from "react";
import { Icon } from "src/components/Icon";
import { Css, Typography } from "src/Css";
import { useTestIds } from "src/utils";

export interface AvatarProps {
  src: string | undefined;
  name?: string;
  size?: AvatarSize;
  showName?: boolean;
}

export function Avatar({ src, name, size = "md", showName = false, ...others }: AvatarProps) {
  const tid = useTestIds(others, "avatar");
  const px = sizeToPixel[size];
  const [showFallback, setShowFallback] = useState(src === undefined);
  // Define min-width as well as width to prevent the image from shrinking when displayed within a flex-child that allows shrinking.
  const styles = Css.br100.wPx(px).hPx(px).mwPx(px).overflowHidden.$;

  const img = showFallback ? (
    <div css={{ ...styles, ...Css[sizeToFallbackTypeScale[size]].bgGray400.gray100.df.aic.jcc.$ }} {...tid}>
      {name ? nameToInitials(name) : <Icon icon="userCircle" inc={sizeToIconInc[size]} />}
    </div>
  ) : (
    <img
      src={src}
      alt={name}
      css={{ ...styles, ...Css.objectCover.$ }}
      onError={() => setShowFallback(true)}
      loading="lazy"
      {...tid}
    />
  );

  return showName && name ? (
    <div css={Css.dif.aic.gap1.if(size === "lg" || size === "xl").fdc.$}>
      {img}
      <span css={Css[sizeToTypeScale[size]].$}>{name}</span>
    </div>
  ) : (
    img
  );
}

export type AvatarSize = "sm" | "md" | "lg" | "xl";

const sizeToPixel = {
  sm: 24,
  md: 36,
  lg: 48,
  xl: 72,
};

const sizeToFallbackTypeScale: Record<AvatarSize, Typography> = {
  sm: "tiny",
  md: "sm",
  lg: "lg",
  xl: "xl3",
};

const sizeToIconInc = {
  sm: 2.5,
  md: 4,
  lg: 5,
  xl: 8,
};

const sizeToTypeScale: Record<AvatarSize, Typography> = {
  sm: "baseMd",
  md: "baseMd",
  lg: "lg",
  xl: "xl3",
};

function nameToInitials(name: string) {
  return (
    name
      .split(" ")
      .map((n) => (n.length > 0 ? n[0].toUpperCase() : ""))
      .join("")
      // Return at most 3 initials
      .slice(0, 3)
  );
}
