import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useRef } from "react";
import { Css, Properties } from "src/Css";

interface ScrollableParentContextProps {
  scrollableEl: HTMLElement;
  paddingX: number;
}

const ScrollableParentContext = createContext<ScrollableParentContextProps>({
  scrollableEl: document.createElement("div"),
  paddingX: 0,
});

// Allow any css to be applied to the ScrollableParent container.
interface ScrollableParentContextProviderProps {
  xss?: Properties;
  paddingX?: number;
}

export function ScrollableParent({ children, xss, paddingX }: PropsWithChildren<ScrollableParentContextProviderProps>) {
  const scrollableEl = useMemo(() => document.createElement("div"), []);
  const scrollableRef = useRef<HTMLDivElement | null>(null);
  const context: ScrollableParentContextProps = { scrollableEl, paddingX: paddingX ?? 0 };

  useEffect(() => {
    scrollableRef.current!.appendChild(scrollableEl);
  }, [scrollableEl]);

  return (
    <ScrollableParentContext.Provider value={context}>
      {/* mh0/mw0 will respect the flexbox boundaries of the "flex-direction" if set on a parent.
       * Otherwise, the flex-item's min-height/width is based on the content of the flex-item, which maybe overflow the container.
       * See https://stackoverflow.com/questions/42130384/why-should-i-specify-height-0-even-if-i-specified-flex-basis-0-in-css3-flexbox */}
      <div css={{ ...Css.mh0.mw0.df.fdc.$, ...xss }}>
        <div css={Css.pxPx(context.paddingX).$}>{children}</div>
        {/* Set fg1 to take up the remaining space in the viewport.*/}
        <div css={{ ...Css.overflowAuto.$, ...Css.pxPx(context.paddingX).$ }} ref={scrollableRef}></div>
      </div>
    </ScrollableParentContext.Provider>
  );
}

export function useScrollableParent() {
  return useContext(ScrollableParentContext);
}
