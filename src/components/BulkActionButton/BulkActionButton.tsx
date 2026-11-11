import { useFocusRing, useHover } from "react-aria";
import { Icon } from "src/components/Icon";
import { Css, type Properties, Tokens } from "src/Css";
import { pluralize } from "src/utils/helpers";
import { useTestIds } from "src/utils/useTestIds";

type Segment = "action" | "clear";

type BulkActionButtonProps = {
  /** The verb, e.g. "Assign" renders "Assign 3 Rows". Defaults to "Edit". */
  label?: string;
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
  const { label = "Edit", count, onClick, onClear, compact = false, __storyState } = props;
  const tid = useTestIds(props, "bulkActionButton");

  return (
    <div css={Css.dif.aic.hPx(40).$} {...tid}>
      <BulkActionCtaButton
        label={label}
        count={count}
        compact={compact}
        onClick={onClick}
        storyHovered={__storyState?.hovered === "action"}
        storyFocused={__storyState?.focused === "action"}
        {...tid.action}
      />
      <BulkActionClearButton
        compact={compact}
        onClick={onClear}
        storyHovered={__storyState?.hovered === "clear"}
        storyFocused={__storyState?.focused === "clear"}
        {...tid.clear}
      />
    </div>
  );
}

type SegmentProps = { compact: boolean; onClick: () => void; storyHovered: boolean; storyFocused: boolean };

/** The action side: opens the bulk action. */
function BulkActionCtaButton(props: SegmentProps & { label: string; count: number }) {
  const { label, count, compact, onClick, storyHovered, storyFocused } = props;
  const tid = useTestIds(props);
  const { hoverProps, isHovered } = useHover({});
  const { focusProps, isFocusVisible } = useFocusRing();
  const fullLabel = `${label} ${count} ${pluralize(count, "Row")}`;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={compact ? fullLabel : undefined}
      css={{
        ...segmentStyles(isHovered || storyHovered, isFocusVisible || storyFocused),
        ...Css.smSb.gap1.add("borderRadius", "8px 0 0 8px").$,
      }}
      {...hoverProps}
      {...focusProps}
      {...tid}
    >
      {!compact && <Icon icon="pencil" inc={2.5} />}
      {compact ? `${label} ${count}` : fullLabel}
    </button>
  );
}

/** The Clear side: deselects every row. */
function BulkActionClearButton(props: SegmentProps) {
  const { compact, onClick, storyHovered, storyFocused } = props;
  const tid = useTestIds(props);
  const { hoverProps, isHovered } = useHover({});
  const { focusProps, isFocusVisible } = useFocusRing();
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Clear selection"
      css={{
        ...segmentStyles(isHovered || storyHovered, isFocusVisible || storyFocused),
        // Overlaps the action's right border, so the two share a 1px divider
        ...Css.sm.mlPx(-1).add("borderRadius", "0 8px 8px 0").$,
      }}
      {...hoverProps}
      {...focusProps}
      {...tid}
    >
      {compact ? <Icon icon="x" inc={2.5} /> : "Clear"}
    </button>
  );
}

/** Each side owns its border and corners, so its focus ring follows them. */
function segmentStyles(hovered: boolean, focused: boolean): Properties {
  return {
    ...Css.df.aic.h100
      .pxPx(12)
      // outline0 drops the browser's own focus ring in favor of ours below
      .wsnw.cursorPointer.outline0.ba.bc(Tokens.SurfaceActiveBorder)
      .bgColor(hovered ? Tokens.SurfaceActiveHover : Tokens.SurfaceActive)
      // Stops the fill at the border, so it doesn't tint the antialiased rounded corners
      .bgClip("padding-box")
      .color(Tokens.TextLinkDefault).$,
    // Figma's 2px ring, drawn over the border as one shape so its rounded corners have no seam, and raised over
    // the shared divider
    ...Css.if(focused).relative.z1.outline(`2px solid ${Tokens.FocusRingInset}`).outlineOffset("-2px").$,
  };
}
