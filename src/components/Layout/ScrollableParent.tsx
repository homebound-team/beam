import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Css, Properties } from "src/Css";

interface ScrollableParentContextProps {
  scrollableEl: HTMLElement | null;
  pr: string | number;
  pl: string | number;
  setPortalTick: Dispatch<SetStateAction<number>>;
}

const ScrollableParentContext = createContext<ScrollableParentContextProps>({
  scrollableEl: null,
  pr: 0,
  pl: 0,
  setPortalTick: (v) => {},
});

// Allow any css to be applied to the ScrollableParent container.
interface ScrollableParentContextProviderProps {
  xss?: Properties;
  // I.e. for blueprint we use the `main` tag in our layouts.
  tagName?: keyof JSX.IntrinsicElements;
}

/**
 * Provides a pattern for implementing "multiple sticky" components.
 *
 * In css, `position: sticky` is great for pinning 1 element to the top of a container.
 *
 * However, in UX patterns, we're often asked to pin multiple DOM elements that are actually
 * spread across multiple React components. For example:
 *
 * - Sticky a Header (in FooPage)
 * - Sticky the table filter & actions (in FooTable)
 * - Sticky the table header row(s) (in GridTable)
 *
 * Historically the way we did this was passing `stickyOffset`s around, where the header would be
 * `top: 0px`, the filter & actions would be `top: ${headerPx}px`, and the table header rows would
 * be `top: ${headerPx + filterActionsPx}px`.
 *
 * However, this is brittle as the `headerPx` / `filterActionsPx` are likely dynamic.
 *
 * `ScrollableParent` solves this by putting all the stickied content (except the table header rows)
 * into a single div, and then having the page use `ScrollableContent` to mark what should actually
 * scroll, which then we "pull up" to be a sibling div of "everything that was stickied".
 *
 * See [this miro](https://miro.com/app/board/o9J_l-FQ-RU=/) and how we need to "cut the component in half".
 */
export function ScrollableParent(props: PropsWithChildren<ScrollableParentContextProviderProps>) {
  const { children, xss, tagName: Tag = "div" as keyof JSX.IntrinsicElements } = props;
  const scrollableEl = useMemo(() => {
    const el = document.createElement("div");
    // Ensure this wrapping div takes up the full height of its container
    el.style.height = "100%";
    return el;
  }, []);
  const [, setTick] = useState(0);
  const hasScrollableContent = scrollableEl.childNodes.length > 0;
  const scrollableRef = useRef<HTMLDivElement | null>(null);
  const { paddingLeft, paddingRight, ...otherXss } = xss || {};
  const context: ScrollableParentContextProps = {
    scrollableEl,
    pl: paddingLeft ?? 0,
    pr: paddingRight ?? 0,
    setPortalTick: setTick,
  };

  useEffect(() => {
    scrollableRef.current!.appendChild(scrollableEl);
  }, [scrollableEl]);

  return (
    <ScrollableParentContext.Provider value={context}>
      {/* mh0/mw0 will respect the flexbox boundaries of the "flex-direction" if set on a parent.
       * Otherwise, the flex-item's min-height/width is based on the content of the flex-item, which maybe overflow the container.
       * See https://stackoverflow.com/questions/42130384/why-should-i-specify-height-0-even-if-i-specified-flex-basis-0-in-css3-flexbox */}
      <Tag css={{ ...Css.mh0.mw0.fg1.df.fdc.$, ...otherXss }}>
        <div
          css={{
            ...Css.pl(context.pl).pr(context.pr).$,
            ...(!hasScrollableContent ? { ...Css.overflowAuto.h100.$, ...scrollContainerBottomPadding } : undefined),
          }}
        >
          {children}
        </div>
        {/* Set fg1 to take up the remaining space in the viewport.*/}
        <div css={Css.fg1.overflowAuto.$} ref={scrollableRef} />
      </Tag>
    </ScrollableParentContext.Provider>
  );
}

export function useScrollableParent() {
  return useContext(ScrollableParentContext);
}

// Styles to wrap around the scrollable content in order to give padding beneath the content within the scrollable container.
export const scrollContainerBottomPadding = Css.addIn("&:after", Css.contentEmpty.db.h2.$).$;
