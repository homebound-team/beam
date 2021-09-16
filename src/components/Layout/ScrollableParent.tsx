import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useRef } from "react";
import { Css, Properties } from "src/Css";

interface ScrollableParentContextProps {
  scrollableEl: HTMLElement;
  pr: string | number;
  pl: string | number;
}

const ScrollableParentContext = createContext<ScrollableParentContextProps>({
  scrollableEl: document.createElement("div"),
  pr: 0,
  pl: 0,
});

// Allow any css to be applied to the ScrollableParent container.
interface ScrollableParentContextProviderProps {
  xss?: Properties;
}

export function ScrollableParent({ children, xss }: PropsWithChildren<ScrollableParentContextProviderProps>) {
  const scrollableEl = useMemo(() => {
    const el = document.createElement("div");
    // Ensure this wrapping div takes up the full height of its container
    el.style.height = "100%";
    return el;
  }, []);
  const scrollableRef = useRef<HTMLDivElement | null>(null);
  const { paddingLeft, paddingRight, ...otherXss } = xss || {};
  const context: ScrollableParentContextProps = { scrollableEl, pl: paddingLeft ?? 0, pr: paddingRight ?? 0 };

  useEffect(() => {
    scrollableRef.current!.appendChild(scrollableEl);
  }, [scrollableEl]);

  return (
    <ScrollableParentContext.Provider value={context}>
      {/* mh0/mw0 will respect the flexbox boundaries of the "flex-direction" if set on a parent.
       * Otherwise, the flex-item's min-height/width is based on the content of the flex-item, which maybe overflow the container.
       * See https://stackoverflow.com/questions/42130384/why-should-i-specify-height-0-even-if-i-specified-flex-basis-0-in-css3-flexbox */}
      <div css={{ ...Css.mh0.mw0.df.fdc.$, ...otherXss }}>
        <div css={Css.pl(context.pl).pr(context.pr).$}>{children}</div>
        {/* Set fg1 to take up the remaining space in the viewport.*/}
        <div css={Css.fg1.overflowAuto.pl(context.pl).pr(context.pr).$} ref={scrollableRef}></div>
      </div>
    </ScrollableParentContext.Provider>
  );
}

export function useScrollableParent() {
  return useContext(ScrollableParentContext);
}
