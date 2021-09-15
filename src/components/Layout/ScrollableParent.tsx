import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useRef } from "react";
import { Css, Properties } from "src/Css";

interface ScrollableParentContextProps {
  scrollableEl: HTMLElement;
}

const ScrollableParentContext = createContext<ScrollableParentContextProps>({
  scrollableEl: document.createElement("div"),
});

// Allow any css to be applied to the ScrollableParent container.
interface ScrollableParentContextProviderProps {
  xss?: Properties;
}

export function ScrollableParent({ children, xss }: PropsWithChildren<ScrollableParentContextProviderProps>) {
  const scrollableEl = useMemo(() => document.createElement("div"), []);
  const scrollableRef = useRef<HTMLDivElement | null>(null);
  const context: ScrollableParentContextProps = { scrollableEl };

  useEffect(() => {
    scrollableRef.current!.appendChild(scrollableEl);
  }, [scrollableEl]);

  return (
    <ScrollableParentContext.Provider value={context}>
      {/* mh0/mw0 will respect the flexbox boundaries of the "flex-direction" if set on a parent.
       * Otherwise, the flex-item's min-height/width is based on the content of the flex-item, which maybe overflow the container.
       * See https://stackoverflow.com/questions/42130384/why-should-i-specify-height-0-even-if-i-specified-flex-basis-0-in-css3-flexbox */}
      <div css={{ ...Css.mh0.mw0.df.fdc.$, ...xss }}>
        {children}
        <div css={Css.overflowAuto.$} ref={scrollableRef}></div>
      </div>
    </ScrollableParentContext.Provider>
  );
}

export function useScrollableParent() {
  return useContext(ScrollableParentContext);
}
