import { Css, Tokens } from "src/Css";
import { useTestIds } from "src/utils/useTestIds";

export function LoadingDots() {
  const dotCss = Css.sqPx(8).br4.bgColor(Tokens.LoaderFill).$;
  const tid = useTestIds({});

  // The 2nd time in each shorthand is the delay, so each dot starts later than the one before it.
  return (
    <div css={Css.py2.df.jcc.$} {...tid.loadingDots}>
      <div aria-label="Loading" css={Css.df.gapPx(4).$}>
        <div css={{ ...dotCss, ...Css.loadingDots("800ms linear 0ms infinite alternate").$ }} />
        <div css={{ ...dotCss, ...Css.loadingDots("800ms linear 300ms infinite alternate").$ }} />
        <div css={{ ...dotCss, ...Css.loadingDots("800ms linear 600ms infinite alternate").$ }} />
      </div>
    </div>
  );
}
