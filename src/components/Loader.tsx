import { Css, Palette } from "src/Css";

interface LoaderProps {
  size?: "xs" | "sm" | "md" | "lg";
  contrast?: boolean;
}

export function Loader({ size = "lg", contrast = false }: LoaderProps) {
  const [dimensions, borderSize] = sizeToPixels[size];
  const [bgColor, spinnerColor] = contrast ? [Palette.Gray600, Palette.Gray200] : [Palette.White, Palette.LightBlue700];

  return (
    <div
      aria-label="Loading"
      css={
        Css.br100.ba
          .hPx(dimensions)
          .wPx(dimensions)
          .bc(bgColor)
          .bw(`${borderSize}px`)
          .add("borderTopColor", spinnerColor)
          .add("textIndent", "-999px")
          .add("animationName", "spin")
          .add("animationDuration", "800ms")
          .add("animationIterationCount", "infinite")
          .add("animationTimingFunction", "linear")
          .add("transform", "translateZ(0)").$
      }
    />
  );
}

type LoaderSize = "xs" | "sm" | "md" | "lg";
const sizeToPixels: Record<LoaderSize, [number, number]> = {
  xs: [16, 2],
  sm: [32, 4],
  md: [64, 8],
  lg: [96, 12],
};
