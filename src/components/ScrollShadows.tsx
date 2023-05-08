import { useResizeObserver } from "@react-aria/utils";
import { ReactNode, useCallback, useRef, useState } from "react";
import { Css, Palette, Properties, useTestIds } from "src";

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
  const tid = useTestIds(props);

  // This is admittedly extremely hacky. It expects the background color to be in the format "rgba(255, 255, 255, 1)".
  // If we ever change how we define our color palette in Beam, then this will break and will need to be fixed.
  if (!bgColor.includes("rgba")) {
    throw new Error("ScrollShadows: bgColor prop must be in the format 'rgba(255, 255, 255, 1)'");
  }

  const transparentBgColor = bgColor.replace(/,1\)$/, ",0)");
  const startShadowStyles = !horizontal ? Css.top0.left0.right0.hPx(40).$ : Css.left0.top0.bottom0.wPx(25).$;
  const endShadowStyles = !horizontal ? Css.bottom0.left0.right0.hPx(40).$ : Css.right0.top0.bottom0.wPx(25).$;
  const startGradientDeg = !horizontal ? 180 : 90;
  const endGradientDeg = !horizontal ? 0 : 270;

  const [showStartShadow, setShowStartShadow] = useState(false);
  const [showEndShadow, setShowEndShadow] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  const updateScrollProps = useCallback((el: HTMLDivElement) => {
    const { scrollTop, scrollHeight, clientHeight, scrollWidth, scrollLeft, clientWidth } = el;

    const start = horizontal ? scrollLeft : scrollTop;
    const end = horizontal ? scrollWidth : scrollHeight;
    const boxSize = horizontal ? clientWidth : clientHeight;
    setShowStartShadow(start > 0);
    setShowEndShadow(start + boxSize < end);
  }, []);

  // Use a ResizeObserver to update the scroll props to determine if the shadows should be shown.
  // This executes on render and subsequent resizes which could be due to content/`children` changes (such as responses from APIs).
  const onResize = useCallback(() => scrollRef.current && updateScrollProps(scrollRef.current), []);
  useResizeObserver({ ref: scrollRef, onResize });

  return (
    <div
      css={
        Css.relative.overflowHidden
          .h(height)
          .w(width)
          .df.fd(!horizontal ? "column" : "row").$
      }
      {...tid}
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
