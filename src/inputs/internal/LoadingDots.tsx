import { Css, Palette } from "src/Css";
import { useTestIds } from "src/utils";

export function LoadingDots({ contrast }: { contrast: boolean }) {
  const circleCss = Css.hPx(8)
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
      <div
        aria-label="Loading"
        css={{
          ...circleCss,
          ...Css.relative
            .add("animationDelay", "300ms")

            .addIn("&:before, &:after", {
              ...circleCss,
              ...Css.add("content", "' '").absolute.dib.$,
            })
            .addIn("&:before", Css.leftPx(-12).add("animationDelay", "0").$)
            .addIn("&:after", Css.rightPx(-12).add("animationDelay", "600ms").$).$,
        }}
      />
    </div>
  );
}
