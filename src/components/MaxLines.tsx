import { useLayoutEffect, useResizeObserver } from "@react-aria/utils";
import { PropsWithChildren, useCallback, useEffect, useRef, useState } from "react";
import { Css } from "src";

export type MaxLinesProps = PropsWithChildren<{
  maxLines: number;
}>;

export function MaxLines({ maxLines, children }: MaxLinesProps) {
  const elRef = useRef<HTMLDivElement>(null);
  const [hasMore, setHasMore] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // When first rendered it will not be expanded and we'll have the `lineClamp` styles applied.
  // Determine if we need the show more/less buttons.
  // If the content is larger, then we need to set the height of the collapsed content to return to.
  useLayoutEffect(() => {
    if (!elRef.current) return;
    // If the content overflows, then set the `hasMore` state to true.
    setHasMore(elRef.current.scrollHeight > elRef.current.clientHeight);
  }, []);

  // Whenever the content changes, reset state
  useEffect(() => {
    setExpanded(false);
  }, [children]);

  const onResize = useCallback(() => {
    // Listen for changes in the content height and determine if we still need the "show more/less" buttons.
    // This content can change if the user resizes the window, or if the `props.children` change.
    // The tricky part here is that setting `lineClamp` styles also triggers a resize event.
    // We'll need to be aware of when this is triggered from our own `lineClamp` styles, vs externally.
    if (!elRef.current) return;
    !expanded && setHasMore(elRef.current.scrollHeight > elRef.current.clientHeight);
  }, [expanded]);
  useResizeObserver({ ref: elRef, onResize });

  return (
    <div>
      <div ref={elRef} css={Css.if(!expanded).lineClamp(maxLines).$}>
        {children}
      </div>

      {hasMore && (
        <button css={Css.db.smMd.$} onClick={() => setExpanded((prev) => !prev)}>
          {expanded ? "Show Less" : "Show More"}
        </button>
      )}
    </div>
  );
}
