import type { Node } from "@react-types/shared";
import { useRef } from "react";
import { mergeProps, useHover, useOption } from "react-aria";
import type { ListState } from "react-stately";
import { Icon } from "src/components/Icon";
import { maybeTooltip } from "src/components/Tooltip";
import { Css, Tokens } from "src/Css";
import { StyledCheckbox } from "src/inputs/CheckboxBase";
import { MixedDot } from "src/inputs/MenuSelectField/internal/MixedLegend";
import type { MenuOptionItem } from "src/inputs/MenuSelectField/types";
import { useTestIds } from "src/utils/useTestIds";

export type OptionRowProps<O> = {
  item: Node<MenuOptionItem<O>>;
  state: ListState<MenuOptionItem<O>>;
  /** DOM id, referenced by the search input's `aria-activedescendant`. */
  id: string;
  disabledReason?: string;
  /** Set when the value is dotted. The legend's DOM id, used as the row's `aria-describedby`. */
  mixedLegendId?: string;
};

/** Per-row tree state the list passes to `TreeOptionRow`. */
export type TreeRowState = {
  level: number;
  hasChildren: boolean;
  isExpanded: boolean;
  /** Some, but not all, descendants are selected. */
  isIndeterminate: boolean;
};

/** Single-select option: label with a trailing check when selected. */
export function SingleOptionRow<O>(props: OptionRowProps<O>) {
  return <BaseOptionRow {...props} variant="check" />;
}

/** Multi-select option: leading checkbox, same look as TreeSelectField rows. */
export function MultiOptionRow<O>(props: OptionRowProps<O>) {
  return <BaseOptionRow {...props} variant="checkbox" />;
}

function BaseOptionRow<O>(
  props: OptionRowProps<O> & { variant: "check" | "checkbox"; indent?: number; isPathRoot?: boolean },
) {
  const { item, state, id, disabledReason, mixedLegendId, variant, indent, isPathRoot } = props;
  const entry = item.value;
  const ref = useRef<HTMLDivElement>(null);
  const tid = useTestIds(props, "option");
  const { hoverProps, isHovered } = useHover({});
  const { optionProps, isDisabled, isFocused, isSelected } = useOption(
    { key: item.key, shouldSelectOnPressUp: true, shouldFocusOnHover: false },
    state,
    ref,
  );
  const highlighted = !isDisabled && (isHovered || isFocused);
  // `Node.value` from React Stately is `T | null`.
  if (!entry) return null;

  return maybeTooltip({
    ...tid.option_tooltip,
    title: disabledReason,
    placement: "top",
    children: (
      <div
        {...mergeProps(optionProps, hoverProps)}
        // Our own id (stable per index) so the search input can point at it.
        id={id}
        aria-describedby={mixedLegendId}
        data-key={entry.valueKey}
        data-label={item.textValue}
        ref={ref}
        css={{
          ...rowCss,
          ...(indent !== undefined ? Css.plPx(indent).$ : {}),
          ...(highlighted ? Css.bgColor(Tokens.SurfaceRaisedHover).$ : {}),
          ...(isDisabled ? Css.cursorNotAllowed.color(Tokens.TextDisabled).$ : {}),
        }}
        {...tid.option}
      >
        {variant === "checkbox" && <StyledCheckbox isSelected={isSelected} isDisabled={isDisabled} />}
        {variant === "checkbox" && mixedLegendId && <MixedDot />}
        {/* The root of a hierarchy path is semibold. Deeper rows stay regular. */}
        <span css={{ ...Css.fg1.mw0.$, ...(isPathRoot ? Css.smSb.$ : {}) }}>{item.rendered}</span>
        {variant === "check" && isSelected && (
          <span css={Css.df.aic.fs0.$}>
            <Icon icon="check" color={isDisabled ? Tokens.TextDisabled : Tokens.SelectionIndicator} />
          </span>
        )}
        {variant === "check" && mixedLegendId && (
          // Centered in the check icon's 24px box.
          <span css={Css.df.aic.jcc.fs0.sqPx(24).$}>
            <MixedDot />
          </span>
        )}
      </div>
    ),
  });
}

type TreeOptionRowProps<O> = OptionRowProps<O> & {
  row: TreeRowState;
  selectionMode: "single" | "multiple";
  onExpandedChange: (expanded: boolean) => void;
};

/** Nested option. Single selection checks the row. Multiple selection uses a checkbox and a chevron. */
export function TreeOptionRow<O>(props: TreeOptionRowProps<O>) {
  const { selectionMode, onExpandedChange, ...rowProps } = props;
  if (selectionMode === "single") return <SingleTreeOptionRow {...rowProps} />;
  return <MultiTreeOptionRow {...rowProps} selectionMode={selectionMode} onExpandedChange={onExpandedChange} />;
}

/** Single-select tree row: indented by level, semibold at the path root, with a trailing check. */
function SingleTreeOptionRow<O>({ row, ...rest }: OptionRowProps<O> & { row: TreeRowState }) {
  return (
    <BaseOptionRow
      {...rest}
      variant="check"
      indent={rowPaddingX + row.level * singleTreeIndent}
      isPathRoot={row.level === 0}
    />
  );
}

/** Multiple-select tree row: indented by depth, with a checkbox, a wrapping label, and a chevron. */
function MultiTreeOptionRow<O>(props: TreeOptionRowProps<O>) {
  const { item, state, id, disabledReason, mixedLegendId, row, onExpandedChange } = props;
  const entry = item.value;
  const ref = useRef<HTMLDivElement>(null);
  const tid = useTestIds(props, "option");
  const { hoverProps, isHovered } = useHover({});
  const { optionProps, isDisabled, isFocused, isSelected } = useOption(
    { key: item.key, shouldSelectOnPressUp: true, shouldFocusOnHover: false },
    state,
    ref,
  );
  const highlighted = !isDisabled && (isHovered || isFocused);
  // `Node.value` from React Stately is `T | null`.
  if (!entry) return null;

  return (
    <div
      {...hoverProps}
      css={{
        ...treeRowCss,
        ...Css.plPx(rowPaddingX + row.level * treeIndent).$,
        ...(highlighted ? Css.bgColor(Tokens.SurfaceRaisedHover).$ : {}),
      }}
    >
      {maybeTooltip({
        ...tid.option_tooltip,
        title: disabledReason,
        placement: "top",
        children: (
          <div
            {...optionProps}
            // Our own id (stable per index) so the search input can point at it.
            id={id}
            aria-describedby={mixedLegendId}
            data-key={entry.valueKey}
            data-label={item.textValue}
            ref={ref}
            css={{ ...treeOptionCss, ...(isDisabled ? Css.cursorNotAllowed.color(Tokens.TextDisabled).$ : {}) }}
            {...tid.option}
          >
            <span css={Css.df.fs0.mtPx(2).$}>
              <StyledCheckbox isSelected={isSelected} isIndeterminate={row.isIndeterminate} isDisabled={isDisabled} />
            </span>
            {mixedLegendId && (
              // Centers the 6px dot on the label's 20px first line.
              <span css={Css.df.fs0.mtPx(7).$}>
                <MixedDot />
              </span>
            )}
            <span css={Css.fg1.mw0.$}>{item.rendered}</span>
          </div>
        ),
      })}
      {row.hasChildren && (
        <button
          type="button"
          // Pointer-only; the arrow keys expand and collapse from the list.
          tabIndex={-1}
          aria-label={`${row.isExpanded ? "Collapse" : "Expand"} ${item.textValue}`}
          aria-expanded={row.isExpanded}
          // Keep DOM focus on the search input or list.
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onExpandedChange(!row.isExpanded)}
          css={chevronCss}
          {...tid[`expand_${entry.valueKey}`]}
        >
          <Icon icon={row.isExpanded ? "chevronUp" : "chevronDown"} inc={2.25} />
        </button>
      )}
    </div>
  );
}
/** Minimum row height in px. Rows grow when a label wraps. */
export const menuRowHeight = 40;

const rowPaddingX = 16;
/** Extra left padding per level for a single-select tree. Level 0 keeps the row padding. */
const singleTreeIndent = 16;
/** Puts a child's checkbox roughly under its parent's label. */
const treeIndent = 28;

const rowCss = Css.df.aic.gap1.px2.mhPx(menuRowHeight).outline0.cursorPointer.sm.color(Tokens.OnSurface).$;
const treeRowCss = Css.df.aifs.gap1.prPx(rowPaddingX).pyPx(10).mhPx(menuRowHeight).sm.color(Tokens.OnSurface).$;
const treeOptionCss = Css.df.aifs.gap1.fg1.mw0.outline0.cursorPointer.$;
const chevronCss = Css.df.aic.jcc.fs0.hPx(20).bgTransparent.color(Tokens.OnSurfaceMuted).cursorPointer.$;
