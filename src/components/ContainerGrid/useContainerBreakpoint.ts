import { ContainerBreakpoint } from "src/components/ContainerGrid/utils";
import { useCallback, useState } from "react";
import { useResizeObserver } from "@react-aria/utils";
import { useContainerGridContext } from "src/components/ContainerGrid/ContainerGridContext";

export function useContainerBreakpoint(): ContainerBreakpoint | undefined {
  const { lg, md, sm, containerRef: ref } = useContainerGridContext();
  const [matchedBreakpoint, setMatchedBreakpoint] = useState<ContainerBreakpoint>();

  const onResize = useCallback(() => {
    if (ref?.current) {
      const width = ref.current.offsetWidth;
      if (width <= sm) {
        setMatchedBreakpoint("sm");
      } else if (width <= md) {
        setMatchedBreakpoint("md");
      } else if (width <= lg) {
        setMatchedBreakpoint("lg");
      } else {
        setMatchedBreakpoint("xl");
      }
    }
  }, [lg, md, ref, sm]);

  // Choosing not to debounce the callback. This may be fired many times if someone resizes very slow.
  // Though, it will not trigger re-renders unless the `matchedBreakpoint` changes.
  // Choosing to allow for immediate responsive to breakpoint changes vs debouncing.
  useResizeObserver({ ref, onResize });

  return matchedBreakpoint;
}
