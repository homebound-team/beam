import { PropsWithChildren, ReactNode, useState } from "react";
import { IconButton } from "src/components/IconButton";
import { NestedScrollProvider } from "src/components/Layout/NestedScrollLayoutContext";
import { PreventBrowserScroll } from "src/components/Layout/PreventBrowserScroll";
import { ScrollableContent } from "src/components/Layout/ScrollableContent";
import { Css, Margin, Only, Padding, Xss } from "src/Css";
import { zeroTo } from "src/utils/sb";

/**
 *
 */

export function TestLayout({ children }: PropsWithChildren<{}>) {
  return (
    <PreventBrowserScroll>
      <TestTopNav />
      <NestedScrollProvider>{children}</NestedScrollProvider>
    </PreventBrowserScroll>
  );
}

export function TestProjectLayout({ children }: PropsWithChildren<{}>) {
  return (
    <TestLayout>
      {/* Required to use `overflowHidden` as the prevent the `TestLayout`'s scrollbar from kicking in. */}
      <div css={Css.df.overflowHidden.$}>
        <TestSideNav />
        <NestedScrollProvider xss={Css.fg1.$}>{children}</NestedScrollProvider>
      </div>
    </TestLayout>
  );
}

export function TestTopNav() {
  return <nav css={Css.hPx(56).w100.bgGray800.white.df.aic.px3.fs0.mh0.sticky.top0.z1.$}>Top Level Navigation</nav>;
}

export function TestSideNav() {
  const [showNav, setShowNav] = useState(true);
  return (
    <NestedScrollProvider
      xss={Css.br.bGray200.fg0.fs0.ml0.wPx(224).add("transition", "margin 200ms").if(!showNav).mlPx(-186).$}
    >
      <div css={Css.relative.$}>
        <div css={Css.absolute.top1.rightPx(4).bgGray50.df.aic.jcc.$}>
          <IconButton icon={showNav ? "menuClose" : "menuOpen"} onClick={() => setShowNav(!showNav)} />
        </div>
        {showNav && (
          <>
            <h2 css={Css.bb.bGray200.px2.py3.$}>Scrollable Side Navigation</h2>
            <ScrollableContent>
              <nav>
                <ul css={Css.listReset.df.fdc.childGap5.mt2.px2.$}>
                  {zeroTo(20).map((i) => (
                    <li key={i}>Side Navigation Item</li>
                  ))}
                  <li>Bottom!</li>
                </ul>
              </nav>
            </ScrollableContent>
          </>
        )}
      </div>
    </NestedScrollProvider>
  );
}

const pagePaddingStyles = Css.px3.$;

export function TestHeader({ title }: { title: ReactNode }) {
  return (
    <header css={{ ...Css.py2.bb.bGray200.$, ...pagePaddingStyles }}>
      <h1 css={Css.xlEm.$}>{title}</h1>
    </header>
  );
}

type TestContentXss = Xss<Margin | Padding>;
/** Provides consistent left & right padding between components */
export function TestPageSpacing<X extends Only<TestContentXss, X>>({ children, xss }: PropsWithChildren<{ xss?: X }>) {
  return <div css={{ ...pagePaddingStyles, ...xss }}>{children}</div>;
}
