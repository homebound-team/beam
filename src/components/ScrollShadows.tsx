import { useLayoutEffect } from "@react-aria/utils";
import { ReactNode, useCallback, useRef, useState } from "react";
import { Css, Palette, Properties } from "src";

interface ScrollShadowsProps {
  children: ReactNode;
  /** Allows for styling the container */
  xss?: Properties;
  /** Set to true if the container scrolls horizontally */
  horizontal?: boolean;
  /** Defines the background color for the shadows */
  bgColor?: Palette;
}
export function ScrollShadows(props: ScrollShadowsProps) {
  const { children, xss, horizontal = false, bgColor = Palette.White } = props;
  const { height = "auto", width = "auto" } = xss ?? {};
  // This is admittedly extremely hacky. It expects the background color to be in the format "rgba(255, 255, 255, 1)".
  // If we ever change how we define our color palette in Beam, then this will break and will need to be fixed.
  const transparentBgColor = bgColor.replace(/,1\)$/, ",0)");

  const startShadowStyles = !horizontal ? Css.top0.left0.right0.hPx(40).$ : Css.left0.top0.bottom0.wPx(25).$;
  const endShadowStyles = !horizontal ? Css.bottom0.left0.right0.hPx(40).$ : Css.right0.top0.bottom0.wPx(25).$;
  const startGradientDeg = !horizontal ? 180 : 90;
  const endGradientDeg = !horizontal ? 0 : 270;

  const [scrollProps, setScrollProps] = useState<ScrollProps>({
    scrollTop: 0,
    scrollHeight: 0,
    clientHeight: 0,
    clientWidth: 0,
    scrollLeft: 0,
    scrollWidth: 0,
  });
  const scrollRef = useRef<HTMLDivElement>(null);

  const updateScrollProps = useCallback((el: HTMLDivElement) => {
    const { scrollTop, scrollHeight, clientHeight, scrollWidth, scrollLeft, clientWidth } = el;
    setScrollProps({ scrollTop, scrollHeight, clientHeight, scrollWidth, scrollLeft, clientWidth });
  }, []);

  // Initially set the state dimensions on render to put the shadows in the correct position
  useLayoutEffect(() => {
    scrollRef.current && updateScrollProps(scrollRef.current);
  }, []);

  const { scrollTop, scrollHeight, clientHeight, scrollWidth, scrollLeft, clientWidth } = scrollProps;
  const showStartShadow = !horizontal ? scrollTop > 0 : scrollLeft > 0;
  const showEndShadow = !horizontal ? scrollTop + clientHeight < scrollHeight : scrollLeft + clientWidth < scrollWidth;

  return (
    <div
      css={
        Css.relative.overflowHidden
          .h(height)
          .w(width)
          .df.fd(!horizontal ? "column" : "row").$
      }
    >
      {showStartShadow && (
        <div
          css={{
            ...startShadowStyles,
            ...Css.absolute.add(
              "background",
              `linear-gradient(${startGradientDeg}deg, ${bgColor} 0%, ${transparentBgColor} 92%);`,
            ).$,
          }}
        />
      )}
      {showEndShadow && (
        <div
          css={{
            ...endShadowStyles,
            ...Css.absolute.add(
              "background",
              `linear-gradient(${endGradientDeg}deg, ${bgColor} 0%, ${transparentBgColor} 92%)`,
            ).$,
          }}
        />
      )}

      <div
        css={{
          ...xss,
          ...Css.overflowAuto.fg1.addIn("&::-webkit-scrollbar", { display: "none" }).add("scrollbarWidth", "none").$,
        }}
        onScroll={(e) => updateScrollProps(e.currentTarget)}
        ref={scrollRef}
      >
        {children}
      </div>
    </div>
  );
}

type ScrollProps = {
  scrollTop: number;
  scrollHeight: number;
  clientHeight: number;
  scrollWidth: number;
  clientWidth: number;
  scrollLeft: number;
};
