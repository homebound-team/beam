import { Fragment, useCallback, useMemo, useRef } from "react";
import { useMenuTrigger } from "react-aria";
import { useMenuTriggerState } from "react-stately";
import {
  isIconButton,
  isNavLinkButton,
  isTextButton,
  labelOr,
  OverlayTrigger,
  OverlayTriggerProps,
} from "src/components/internal/OverlayTrigger";
import { GridTableApi } from "src/components/Table/GridTableApi";
import { GridColumn, Kinded } from "src/components/Table/types";
import { Css } from "src/Css";
import { useComputed } from "src/hooks";
import { Switch } from "src/inputs";
import { useTestIds } from "src/utils";
import { defaultTestId } from "src/utils/defaultTestId";

interface EditColumnsButtonProps<R extends Kinded>
  extends Pick<OverlayTriggerProps, "trigger" | "placement" | "disabled" | "tooltip"> {
  columns: GridColumn<R>[];
  api: GridTableApi<R>;
  // for storybook purposes
  defaultOpen?: boolean;
}

export function EditColumnsButton<R extends Kinded>(props: EditColumnsButtonProps<R>) {
  const { defaultOpen, disabled, columns, trigger, api } = props;
  const state = useMenuTriggerState({ isOpen: defaultOpen });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { menuTriggerProps } = useMenuTrigger({ isDisabled: !!disabled }, state, buttonRef);
  const tid = useTestIds(
    props,
    isTextButton(trigger)
      ? labelOr(trigger, "editColumnsButton")
      : isNavLinkButton(trigger)
        ? defaultTestId(trigger.navLabel)
        : isIconButton(trigger)
          ? trigger.icon
          : trigger.name,
  );

  const options = useMemo(
    () =>
      columns
        // Only include options that can be hidden
        .filter((column) => column.canHide)
        // And have the `name` property defined
        .filter((column) => {
          if (!column.name || column.name.length === 0 || !column.id || column.id.length === 0) {
            console.warn("Column is missing 'name' and/or 'id' property required by the Edit Columns button", column);
            return false;
          }
          return true;
        })
        .map((column) => ({ label: column.name!, value: column.id! })),
    [columns],
  );

  const selectedValues = useComputed(() => api.getVisibleColumnIds(), [api]);
  const setSelectedValues = useCallback(
    (ids: string[]) => {
      // Reset column widths before updating visible columns to ensure the table maintains
      // its full width and distributes removed column widths among remaining columns
      // We do this because trying to maintain the size of a removed column and redistribute it was finnicky. But it
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

  return (
    <OverlayTrigger {...props} menuTriggerProps={menuTriggerProps} state={state} buttonRef={buttonRef} {...tid}>
      <div
        css={{
          ...Css.dg.gtc("1fr auto").gap2.bgWhite.p2.maxwPx(326).$,
          "&:hover": Css.bshHover.$,
        }}
      >
        {options.map((option) => (
          <Fragment key={option.value}>
            <div css={Css.sm.truncate.pr1.$}>{option.label}</div>
            <Switch
              compact
              selected={selectedValues.includes(option.value)}
              onChange={(value) =>
                setSelectedValues(
                  value ? [...selectedValues, option.value] : selectedValues.filter((v) => v !== option.value),
                )
              }
              labelStyle="hidden"
              label={option.label}
              {...tid[`option${option.value}`]}
            />
          </Fragment>
        ))}
      </div>
    </OverlayTrigger>
  );
}
