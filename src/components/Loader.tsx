import { Css, Tokens } from "src/Css";
import { useTestIds } from "src/utils/useTestIds";

type LoaderProps = {
  size?: "xs" | "sm" | "md" | "lg";
};

export function Loader(props: LoaderProps) {
  const { size = "lg" } = props;
  const [dimensions, borderSize] = sizeToPixels[size];
  const [bgColor, spinnerColor] = [Tokens.LoaderTrack, Tokens.LoaderSpinner];
  const tid = useTestIds(props, "loader");

  return (
    <div
      aria-label="Loading"
      {...tid}
      css={
        Css.br100.ba
          .sqPx(dimensions)
          .bc(bgColor)
          .bw(`${borderSize}px`)
          .add("borderTopColor", spinnerColor)
          .add("textIndent", "-999px")
          .spin("800ms linear infinite")
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
