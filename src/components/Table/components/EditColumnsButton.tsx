import { Fragment, type ReactNode, useCallback, useMemo, useRef } from "react";
import { useMenuTrigger } from "react-aria";
import { useMenuTriggerState } from "react-stately";
import { Button } from "src/components/Button";
import { OverlayTrigger, type OverlayTriggerProps } from "src/components/internal/OverlayTrigger";
import { ColumnTooltipIcon } from "src/components/Table/components/ColumnTooltipIcon";
import type { GridTableApi } from "src/components/Table/GridTableApi";
import type { GridColumn, Kinded } from "src/components/Table/types";
import { Css, Tokens } from "src/Css";
import { useBreakpoint } from "src/hooks/useBreakpoint";
import { useComputed } from "src/hooks/useComputed";
import { Switch } from "src/inputs/Switch";
import { useTestIds } from "src/utils/useTestIds";

type EditColumnsButtonProps<R extends Kinded> = {
  columns: GridColumn<R>[];
  api: GridTableApi<R>;
  /** When set, columns that share a name use one Edit Columns switch. */
  shareColumnVisibility?: boolean;
  // for storybook purposes
  defaultOpen?: boolean;
} & Pick<OverlayTriggerProps, "placement" | "disabled" | "tooltip">;

export function EditColumnsButton<R extends Kinded>(props: EditColumnsButtonProps<R>) {
  const { defaultOpen, disabled, columns, api, shareColumnVisibility = false } = props;
  const state = useMenuTriggerState({ defaultOpen });
  const buttonRef = useRef<HTMLButtonElement>(null);

  const { menuTriggerProps } = useMenuTrigger({ isDisabled: !!disabled }, state, buttonRef);
  const tid = useTestIds(props, "columns");
  const { sm } = useBreakpoint();

  const options = useMemo(() => buildColumnOptions(columns, shareColumnVisibility), [columns, shareColumnVisibility]);

  const selectedValues = useComputed(() => api.getVisibleColumnIds(), [api]);
  const setSelectedValues = useCallback(
    (ids: string[]) => {
      // Reset column widths before updating visible columns to ensure the table maintains
      // its full width and distributes removed column widths among remaining columns
      // We do this because trying to maintain the size of a removed column and redistribute it was very finnicky. But it
      // should be possible
      api.resetColumnWidths();
      // Doesn't `options` already filter us to non-hidden/valid-id columns? I.e. could we just do:
      // api.setVisibleColumns(ids);
      api.setVisibleColumns(
        columns.filter((column) => (column.canHide ? ids.includes(column.id!) : true)).map((c) => c.id!),
      );
    },
    [columns, api],
  );
  const hasHiddenColumn = useMemo(
    () => options.some((option) => option.ids.some((id) => !selectedValues.includes(id))),
    [options, selectedValues],
  );

  return (
    <OverlayTrigger
      {...props}
      trigger={
        sm
          ? { icon: hasHiddenColumn ? "columnsBadged" : "columns", variant: "outline" }
          : { icon: hasHiddenColumn ? "columnsBadged" : "columns", label: "", size: "md", variant: "secondaryBlack" }
      }
      menuTriggerProps={menuTriggerProps}
      state={state}
      buttonRef={buttonRef}
      {...tid}
    >
      <div
        css={
          Css.df.fdc
            .bgColor(Tokens.Surface)
            .color(Tokens.OnSurface)
            // As wide as the longest label, then the viewport. Truncation applies only past that cap.
            .w("max-content")
            .maxw("calc(100vw - 32px)")
            .maxhPx(512).bshBasic.onHover.bshHover.$
        }
      >
        {/* Scrollable body — mh0 lets the flex child shrink so the option list scrolls internally instead of overflowing the page */}
        <div css={Css.dg.gtc("1fr auto").gap2.p2.fg1.mh0.oya.$}>
          {options.map((option) => (
            <Fragment key={option.value}>
              <div css={Css.df.aic.gapPx(4).mw0.pr1.$}>
                <span css={Css.sm.mw0.$}>{option.label}</span>
                {option.tooltip ? (
                  <ColumnTooltipIcon
                    {...tid[`tooltip_${option.value}`]}
                    tooltip={closeMenuOnClickTooltip(option.tooltip, state.close)}
                    color={Tokens.TextLinkDefault}
                    label={option.label}
                  />
                ) : null}
              </div>
              <Switch
                compact
                selected={option.ids.every((id) => selectedValues.includes(id))}
                onChange={(value) =>
                  setSelectedValues(
                    value
                      ? [...selectedValues, ...option.ids]
                      : selectedValues.filter((id) => !option.ids.includes(id)),
                  )
                }
                labelStyle="hidden"
                label={option.label}
                {...tid[`option${option.value}`]}
              />
            </Fragment>
          ))}
        </div>
        {/* Pinned footer */}
        <div css={Css.df.jcc.p2.bt.bc(Tokens.SurfaceSeparator).$}>
          <Button variant="tertiary" label="Reset Column Widths" onClick={() => api.resetColumnWidths()} />
        </div>
      </div>
    </OverlayTrigger>
  );
}

type EditColumnOption = {
  label: string;
  /** First column id. Used as the switch test id. */
  value: string;
  ids: string[];
  tooltip?: ReactNode | VoidFunction;
};

function buildColumnOptions<R extends Kinded>(
  columns: GridColumn<R>[],
  shareColumnVisibility: boolean,
): EditColumnOption[] {
  const hideable = columns.filter((column) => {
    if (!column.canHide) return false;
    if (!column.name || column.name.length === 0 || !column.id || column.id.length === 0) {
      console.warn("Column is missing 'name' and/or 'id' property required by the Edit Columns button", column);
      return false;
    }
    return true;
  });

  if (!shareColumnVisibility) {
    return hideable.map((column) => ({
      label: column.name!,
      value: column.id!,
      ids: [column.id!],
      tooltip: column.tooltip,
    }));
  }

  // If shareColumnVisibility is set, we group columns by name
  const byLabel = new Map<string, EditColumnOption>();
  const warnedLabels = new Set<string>();
  for (const column of hideable) {
    const label = leafColumnName(column);
    const existing = byLabel.get(label);
    if (!existing) {
      byLabel.set(label, { label, value: column.id!, ids: [column.id!], tooltip: column.tooltip });
      continue;
    }

    existing.ids.push(column.id!);
    // We can only show a single tooltip per column entry in the menu, so if there are multiple, warn and use the first.
    if (existing.tooltip !== column.tooltip && !warnedLabels.has(label)) {
      warnedLabels.add(label);
      console.warn(`Edit Columns columns labeled "${label}" have different tooltips. Using the first.`);
    }
  }
  return [...byLabel.values()];
}

/** Drops the `groupColumns` prefix so "The Sycamore: Cost" groups with "Cost". */
function leafColumnName<R extends Kinded>(column: Pick<GridColumn<R>, "name" | "groupLabel">): string {
  const { name, groupLabel } = column;
  const prefix = groupLabel ? `${groupLabel}: ` : undefined;
  if (name && prefix && name.startsWith(prefix)) return name.slice(prefix.length);
  return name!;
}

/** Click tooltips close the menu first. React Aria overlays use z-index 100000, so an open menu paints over the modal. Hover content is returned unchanged. */
function closeMenuOnClickTooltip(tooltip: ReactNode | VoidFunction, closeMenu: () => void): ReactNode | VoidFunction {
  if (typeof tooltip !== "function") return tooltip;
  return () => {
    closeMenu();
    tooltip();
  };
}
