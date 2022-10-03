import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMenuTrigger } from "react-aria";
import { useMenuTriggerState } from "react-stately";
import { CheckboxGroup, CheckboxGroupItemOption } from "src/inputs";
import { Css } from "../../Css";
import { useTestIds } from "../../utils";
import { Button } from "../Button";
import { isIconButton, isTextButton, OverlayTrigger, OverlayTriggerProps } from "../internal/OverlayTrigger";
import { GridColumn, Kinded } from "./GridTable";
import { GridColumnState } from "./useColumns";

interface EditColumnsButtonProps<R extends Kinded, S>
  extends Pick<OverlayTriggerProps, "trigger" | "placement" | "disabled" | "tooltip"> {
  columns: GridColumn<R, S>[];
  setColumns: Dispatch<SetStateAction<GridColumnState<R, S>>>;
  title?: string;
  // for storybook purposes
  defaultOpen?: boolean;
}

export function EditColumnsButton<R extends Kinded, S = {}>(props: EditColumnsButtonProps<R, S>) {
  const { defaultOpen, disabled, columns, setColumns, trigger, title } = props;
  const state = useMenuTriggerState({ isOpen: defaultOpen });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { menuTriggerProps } = useMenuTrigger({ isDisabled: !!disabled }, state, buttonRef);
  const tid = useTestIds(
    props,
    isTextButton(trigger) ? trigger.label : isIconButton(trigger) ? trigger.icon : trigger.name,
  );

  const editableColumns = useMemo(
    () =>
      columns.filter((column) => {
        if (!column.canHide) return false;
        if (!column.name || column.name.length === 0) {
          console.warn("Column is missing 'name' property required by the Edit Columns button", column);
          return false;
        }
        return true;
      }),
    [columns],
  );

  const selectedColumns: string[] = editableColumns
    .map((column) => {
      if (column.canHide && column.visible) return column.name;
    })
    .filter((column) => !!column) as string[];

  const options: CheckboxGroupItemOption[] = editableColumns.map((column) => ({
    label: column.name!,
    value: column.name!,
  }));

  const [selectedValues, setSelectedValues] = useState<string[]>(selectedColumns ?? []);

  const clearSelections = useCallback(() => {
    // When clearing all selections, all hide-able columns should be filtered out of `visibleColumns`.
    setColumns((prevState) => ({ ...prevState, visibleColumns: columns.filter((column) => !column.canHide) }));
    setSelectedValues([]);
  }, [columns]);

  useEffect(() => {
    setColumns((prevState) => ({
      ...prevState,
      visibleColumns: columns.filter((column) => (column.canHide ? selectedValues.includes(column.name!) : true)),
    }));
  }, [selectedValues]);

  return (
    <OverlayTrigger {...props} menuTriggerProps={menuTriggerProps} state={state} buttonRef={buttonRef} {...tid}>
      <div
        css={{
          ...Css.bgWhite.py5.px3.maxwPx(380).$,
          "&:hover": Css.bshHover.$,
        }}
      >
        <div css={Css.gray500.xsSb.mb1.$}>{title || "Select columns to show"}</div>
        <CheckboxGroup
          label={title || "Select columns to show"}
          onChange={(values) => setSelectedValues(values)}
          values={selectedValues}
          options={options}
          columns={2}
          hideLabel
        />
        <div css={Css.mt1.$}>
         <Button variant={"tertiary"} label={"Clear selections"} onClick={clearSelections}/>
        </div>
      </div>
    </OverlayTrigger>
  );
}
