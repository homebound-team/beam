import { useResizeObserver } from "@react-aria/utils";
import { useRef, useState } from "react";
import { Button, type ButtonProps } from "src/components/Button";
import { IconButton } from "src/components/IconButton";
import { Css } from "src/Css";
import { noop } from "src/utils/helpers";

export type DeleteActionProps = Pick<ButtonProps, "onClick" | "disabled" | "tooltip"> & { count?: number };

/** Renders nothing without an `onClick`; a trash icon, or `Delete (count)` when `count > 1`. */
export function MaybeDeleteAction(props: Partial<DeleteActionProps>) {
  const { count = 0, onClick, ...buttonProps } = props;
  if (!onClick) return null;
  return count > 1 ? (
    <BulkDeleteAction count={count} onClick={onClick} {...buttonProps} />
  ) : (
    <IconButton icon="trash" label="Delete" onClick={onClick} {...buttonProps} />
  );
}

/** `Delete (count)`, shortened to `(count)` when it doesn't fit beside the CTAs. */
function BulkDeleteAction(props: DeleteActionProps & { count: number }) {
  const { count, ...buttonProps } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [overflows, setOverflows] = useState(false);
  const onResize = () => {
    if (!containerRef.current || !contentRef.current) return;
    setOverflows(contentRef.current.offsetWidth > containerRef.current.clientWidth);
  };
  // `containerRef` narrows when the CTAs grow; `contentRef` widens with `count` or a font swap.
  useResizeObserver({ ref: containerRef, onResize });
  useResizeObserver({ ref: contentRef, onResize });

  return (
    // Offset the Button's padding so the trash aligns with the footer inset.
    <div ref={containerRef} css={Css.relative.fg1.mw0.mlPx(-16).$}>
      {/* Measured instead of the visible button, whose width changes when compacted. */}
      <div aria-hidden css={Css.absolute.top0.left0.w100.oh.visibility("hidden").pen.$}>
        <div ref={contentRef} css={Css.add("width", "max-content").$}>
          <Button variant="quaternary" icon="trash" label={`Delete (${count})`} onClick={noop} />
        </div>
      </div>
      <Button
        variant="quaternary"
        icon="trash"
        // Visually hidden so the accessible name keeps "Delete"; the outer span keeps the space (the button is flex).
        label={
          <span>
            <span css={Css.if(overflows).visuallyHidden.$}>Delete</span> ({count})
          </span>
        }
        {...buttonProps}
      />
    </div>
  );
}
