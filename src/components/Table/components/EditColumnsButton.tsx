import { useCallback, useMemo, useRef } from "react";
import { useMenuTrigger } from "react-aria";
import { useMenuTriggerState } from "react-stately";
import { Button } from "src/components/Button";
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
import { CheckboxGroup } from "src/inputs";
import { useTestIds } from "src/utils";
import { defaultTestId } from "src/utils/defaultTestId";

interface EditColumnsButtonProps<R extends Kinded>
  extends Pick<OverlayTriggerProps, "trigger" | "placement" | "disabled" | "tooltip"> {
  columns: GridColumn<R>[];
  title?: string;
  api: GridTableApi<R>;
  // for storybook purposes
  defaultOpen?: boolean;
}

export function EditColumnsButton<R extends Kinded>(props: EditColumnsButtonProps<R>) {
  const { defaultOpen, disabled, columns, trigger, title, api } = props;
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
          ...Css.bgWhite.py5.px3.maxwPx(380).bshBasic.$,
          "&:hover": Css.bshHover.$,
        }}
      >
        <div css={Css.gray500.xsSb.mb1.ttu.$}>{title || "Select columns to show"}</div>
        <CheckboxGroup
          label={title || "Select columns to show"}
          onChange={(values) => setSelectedValues(values)}
          values={selectedValues}
          options={options}
          columns={2}
          labelStyle="hidden"
        />
        <div css={Css.mt1.$}>
          <Button variant={"tertiary"} label={"Clear selections"} onClick={() => setSelectedValues([])} />
        </div>
      </div>
    </OverlayTrigger>
  );
}
