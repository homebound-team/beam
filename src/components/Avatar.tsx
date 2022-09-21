import { useState } from "react";
import { Css, Typography } from "src/Css";
import { useTestIds } from "src/utils";

export interface AvatarProps {
  src: string | undefined;
  name: string;
  size?: AvatarSize;
  showName?: boolean;
}

export function Avatar({ src, name, size = "md", showName = false, ...others }: AvatarProps) {
  const tid = useTestIds(others, "avatar");
  const px = sizeToPixel[size];
  const [showFallback, setShowFallback] = useState(src === undefined);
  const styles = Css.br100.wPx(px).hPx(px).overflowHidden.$;

  const img = showFallback ? (
    <div css={{ ...styles, ...Css[sizeToFallbackTypeScale[size]].bgLightBlue700.white.df.aic.jcc.$ }} {...tid}>
      {nameToInitials(name)}
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

  return showName ? (
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
      .map((n) => n[0].toUpperCase())
      .join("")
      // Return at most 3 initials
      .slice(0, 3)
  );
}
