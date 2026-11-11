import type { ReactNode } from "react";
import { useFocusRing, useHover } from "react-aria";
import { Icon } from "src/components/Icon";
import { Css, type Properties, Tokens } from "src/Css";
import { pluralize } from "src/utils/helpers";
import { useTestIds } from "src/utils/useTestIds";

type Segment = "action" | "clear";

type BulkActionButtonProps = {
  /** The verb, e.g. "Edit" renders "Edit 3 Rows". */
  label: string;
  /** How many rows are selected. */
  count: number;
  onClick: () => void;
  onClear: () => void;
  /** Drops the icon and the object and shows Clear as an ×, e.g. "Edit 3", for small screens. "Edit 3 Rows" stays the accessible name. */
  compact?: boolean;
  /** Storybook-only visual state overrides for snapshotting pseudo-interactions. */
  __storyState?: { hovered?: Segment; focused?: Segment };
};

/** Summarizes a selection and opens its bulk action, e.g. "Edit 3 Rows". Clear deselects everything. */
export function BulkActionButton(props: BulkActionButtonProps) {
  const { label, count, onClick, onClear, compact = false, __storyState } = props;
  const tid = useTestIds(props, "bulkActionButton");
  const fullLabel = `${label} ${count} ${pluralize(count, "Row")}`;

  return (
    <div css={Css.dif.aic.hPx(40).$} {...tid}>
      <SegmentButton
        onClick={onClick}
        ariaLabel={compact ? fullLabel : undefined}
        styles={Css.smSb.gap1.add("borderRadius", "8px 0 0 8px").$}
        storyHovered={__storyState?.hovered === "action"}
        storyFocused={__storyState?.focused === "action"}
        tid={tid.action}
      >
        {!compact && <Icon icon="pencil" inc={2.5} />}
        {compact ? `${label} ${count}` : fullLabel}
      </SegmentButton>
      <SegmentButton
        onClick={onClear}
        ariaLabel="Clear selection"
        // Overlaps the action's right border, so the two share a 1px divider
        styles={Css.sm.mlPx(-1).add("borderRadius", "0 8px 8px 0").$}
        storyHovered={__storyState?.hovered === "clear"}
        storyFocused={__storyState?.focused === "clear"}
        tid={tid.clear}
      >
        {compact ? <Icon icon="x" inc={2.5} /> : "Clear"}
      </SegmentButton>
    </div>
  );
}

/** Each side is its own target and tab stop, and owns its border and corners so its focus ring follows them. */
function SegmentButton(props: {
  onClick: () => void;
  ariaLabel: string | undefined;
  styles: Properties;
  storyHovered: boolean;
  storyFocused: boolean;
  tid: object;
  children: ReactNode;
}) {
  const { onClick, ariaLabel, styles, storyHovered, storyFocused, tid, children } = props;
  const { hoverProps, isHovered } = useHover({});
  const { focusProps, isFocusVisible } = useFocusRing();
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      css={{
        ...Css.df.aic.h100
          .pxPx(12)
          // outline0 drops the browser's own focus ring in favor of ours below
          .wsnw.cursorPointer.outline0.ba.bc(Tokens.SurfaceActiveBorder)
          .bgColor(isHovered || storyHovered ? Tokens.SurfaceActiveHover : Tokens.SurfaceActive)
          .color(Tokens.TextLinkDefault).$,
        ...styles,
        // Figma's 2px ring: the border plus a 1px inset, raised over the shared divider
        ...Css.if(isFocusVisible || storyFocused)
          .relative.z1.bc(Tokens.FocusRingInset)
          .boxShadow(`inset 0 0 0 1px ${Tokens.FocusRingInset}`).$,
      }}
      {...hoverProps}
      {...focusProps}
      {...tid}
    >
      {children}
    </button>
  );
}
