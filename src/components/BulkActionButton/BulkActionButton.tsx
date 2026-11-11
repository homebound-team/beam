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
    <div css={Css.dif.aic.hPx(40).ba.br8.oh.bc(Tokens.SurfaceActiveBorder).bgColor(Tokens.SurfaceActive).$} {...tid}>
      <SegmentButton
        onClick={onClick}
        ariaLabel={compact ? fullLabel : undefined}
        styles={Css.smSb.gap1.$}
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
        styles={Css.sm.bl.bc(Tokens.SurfaceActiveBorder).$}
        storyHovered={__storyState?.hovered === "clear"}
        storyFocused={__storyState?.focused === "clear"}
        tid={tid.clear}
      >
        {compact ? <Icon icon="x" inc={2.5} /> : "Clear"}
      </SegmentButton>
    </div>
  );
}

/** Each side is its own target and tab stop, so hover and focus tint only that side. */
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
        ...Css.df.aic.h100.pxPx(12).wsnw.cursorPointer.color(Tokens.TextLinkDefault).$,
        ...styles,
        ...Css.if(isHovered || storyHovered).bgColor(Tokens.SurfaceActiveHover).$,
        // Figma rings inside the focused side only
        ...Css.if(isFocusVisible || storyFocused).boxShadow(`inset 0 0 0 2px ${Tokens.FocusRingInset}`).$,
      }}
      {...hoverProps}
      {...focusProps}
      {...tid}
    >
      {children}
    </button>
  );
}
