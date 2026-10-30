import { Css, Tokens } from "src/Css";
import { useTestIds } from "src/utils/useTestIds";

/** The closed field's text, and the legend's title, while records disagree. */
export const mixedLabel = "Mixed";

/** Rendered height of `MixedLegend`, for the list's first paint. */
export const mixedLegendHeight = 59;

/** Explains the dots, as the option list's first block. Dotted rows point `aria-describedby` at its `id`. */
export function MixedLegend(props: { id: string }) {
  const { id } = props;
  const tid = useTestIds(props, "mixedLegend");
  return (
    <div id={id} role="presentation" css={legendCss} {...tid}>
      <div css={Css.df.aic.gapPx(7).sm.fw5.color(Tokens.OnSurfaceActive).$}>
        {mixedLabel}
        <MixedDot />
      </div>
      <div css={Css.xs2.color(Tokens.OnSurface).$}>Selected rows have different values.</div>
    </div>
  );
}

/** Marks a value that some, but not all, records hold. */
export function MixedDot() {
  // Figma's Blue300; there's no semantic token for it yet.
  return <span aria-hidden css={Css.sqPx(6).fs0.br100.bgBlue300.$} />;
}

const legendCss = Css.px2.pyPx(12).bb.bc(Tokens.SurfaceSeparator).$;
