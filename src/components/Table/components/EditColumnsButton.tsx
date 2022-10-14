import { Dispatch, SetStateAction, useCallback, useMemo, useRef } from "react";
import { useMenuTrigger } from "react-aria";
import { useMenuTriggerState } from "react-stately";
import { Button } from "src/components/Button";
import {
  isIconButton,
  isTextButton,
  OverlayTrigger,
  OverlayTriggerProps,
} from "src/components/internal/OverlayTrigger";
import { GridColumn, Kinded } from "src/components/Table/types";
import { Css } from "src/Css";
import { CheckboxGroup, CheckboxGroupItemOption } from "src/inputs";
import { useTestIds } from "src/utils";

interface EditColumnsButtonProps<R extends Kinded, S>
  extends Pick<OverlayTriggerProps, "trigger" | "placement" | "disabled" | "tooltip"> {
  allColumns: GridColumn<R, S>[];
  selectedColumns: GridColumn<R, S>[];
  setSelectedColumns: Dispatch<SetStateAction<GridColumn<R, S>[]>>;
  title?: string;
  // for storybook purposes
  defaultOpen?: boolean;
}

export function EditColumnsButton<R extends Kinded, S = {}>(props: EditColumnsButtonProps<R, S>) {
  const { defaultOpen, disabled, allColumns, setSelectedColumns, trigger, title, selectedColumns } = props;
  const state = useMenuTriggerState({ isOpen: defaultOpen });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { menuTriggerProps } = useMenuTrigger({ isDisabled: !!disabled }, state, buttonRef);
  const tid = useTestIds(
    props,
    isTextButton(trigger) ? trigger.label : isIconButton(trigger) ? trigger.icon : trigger.name,
  );

  const { options } = useMemo(() => {
    return allColumns.reduce(
      (acc, column) => {
        // Only include options that can be hidden and have the `name` property defined.
        if (!column.canHide) return acc;
        if (!column.id || column.id.length === 0) {
          console.warn("Column is missing 'name' property required by the Edit Columns button", column);
          return acc;
        }

        // Add current column as an option
        return { ...acc, options: acc.options.concat({ label: column.id!, value: column.id! }) };
      },
      { options: [] as CheckboxGroupItemOption[] },
    );
  }, [allColumns]);

  const selectedValues = selectedColumns.map((column) => column.id!);
  const setSelectedValues = useCallback(
    (values: string[]) => {
      setSelectedColumns(allColumns.filter((column) => (column.canHide ? values.includes(column.id!) : true)));
    },
    [allColumns, setSelectedColumns],
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
          hideLabel
        />
        <div css={Css.mt1.$}>
          <Button variant={"tertiary"} label={"Clear selections"} onClick={() => setSelectedValues([])} />
        </div>
      </div>
    </OverlayTrigger>
  );
}
