import { Css, Palette } from "src/Css";
import { useTestIds } from "src/utils";

export function LoadingDots({ contrast }: { contrast: boolean }) {
  const dotCss = Css.hPx(8)
    .wPx(8)
    .br4.bgColor(contrast ? Palette.Gray500 : Palette.Gray300)
    .add("animationName", contrast ? "loadingDotsContrast" : "loadingDots")
    .add("animationDuration", "800ms")
    .add("animationIterationCount", "infinite")
    .add("animationTimingFunction", "linear")
    .add("animationDirection", "alternate").$;
  const tid = useTestIds({});

  return (
    <div css={Css.py2.df.jcc.$} {...tid.loadingDots}>
      <div aria-label="Loading" css={Css.df.gapPx(4).$}>
        <div css={{ ...dotCss, ...Css.add("animationDelay", "0ms").$ }} />
        <div css={{ ...dotCss, ...Css.add("animationDelay", "300ms").$ }} />
        <div css={{ ...dotCss, ...Css.add("animationDelay", "600ms").$ }} />
      </div>
    </div>
  );
}
