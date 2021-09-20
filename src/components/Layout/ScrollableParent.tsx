import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useRef } from "react";
import { Css, Properties } from "src/Css";

interface ScrollableParentContextProps {
  scrollableEl: HTMLElement | null;
  pr: string | number;
  pl: string | number;
}

const ScrollableParentContext = createContext<ScrollableParentContextProps>({
  scrollableEl: null,
  pr: 0,
  pl: 0,
});

// Allow any css to be applied to the ScrollableParent container.
interface ScrollableParentContextProviderProps {
  xss?: Properties;
  // I.e. for blueprint we use the `main` tag in our layouts.
  tagName?: keyof JSX.IntrinsicElements;
}

export function ScrollableParent(props: PropsWithChildren<ScrollableParentContextProviderProps>) {
  const { children, xss, tagName: Tag = "div" as keyof JSX.IntrinsicElements } = props;
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
      <Tag css={{ ...Css.mh0.mw0.df.fdc.$, ...otherXss }}>
        <div css={Css.pl(context.pl).pr(context.pr).$}>{children}</div>
        {/* Set fg1 to take up the remaining space in the viewport.*/}
        <div css={Css.fg1.overflowAuto.pl(context.pl).pr(context.pr).$} ref={scrollableRef}></div>
      </Tag>
    </ScrollableParentContext.Provider>
  );
}

export function useScrollableParent() {
  return useContext(ScrollableParentContext);
}
