import { Dispatch, SetStateAction, useRef } from "react";
import { useMenuTrigger } from "react-aria";
import { useMenuTriggerState } from "react-stately";
import { Checkbox } from "src/inputs";
import { Css, px } from "../../Css";
import { useTestIds } from "../../utils";
import { Button } from "../Button";
import { isIconButton, isTextButton, OverlayTrigger, OverlayTriggerProps } from "../internal/OverlayTrigger";
import { GridColumn, Kinded } from "./GridTable";
import { Columns } from "./useColumns";

interface EditColumnsButtonProps<R extends Kinded, S>
  extends Pick<OverlayTriggerProps, "trigger" | "placement" | "disabled" | "tooltip"> {
  columns: GridColumn<R, S>[];
  setColumns: Dispatch<SetStateAction<Columns<R, S>>>;
  title?: string;
  buttonText?: string;
  // for storybook purposes
  defaultOpen?: boolean;
}

export function EditColumnsButton<R extends Kinded, S = {}>(props: EditColumnsButtonProps<R, S>) {
  const { defaultOpen, disabled, columns, setColumns, trigger, title, buttonText } = props;
  const state = useMenuTriggerState({ isOpen: defaultOpen });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { menuTriggerProps } = useMenuTrigger({ isDisabled: !!disabled }, state, buttonRef);
  const tid = useTestIds(
    props,
    isTextButton(trigger) ? trigger.label : isIconButton(trigger) ? trigger.icon : trigger.name,
  );

  function clearSelections() {
    columns.map((column) => (column.visible = false));
    setColumns((prevState) => ({
      ...prevState,
      visibleColumns: columns.filter((column) => (column.canHide && column.visible) || !column.canHide),
    }));
  }

  return (
    <OverlayTrigger {...props} menuTriggerProps={menuTriggerProps} state={state} buttonRef={buttonRef} {...tid}>
      <div
        css={{
          ...Css.df.fdc.bgWhite.py3.px2.maxw(px(380)).$,
          "&:hover": Css.bshHover.$,
        }}
      >
        <div css={Css.gray500.sm.ttu.$}>{title || "Select columns to show"}</div>
        <div css={Css.df.add({ flexWrap: "wrap" }).gap2.py2.$}>
          {columns.map((column, i) => {
            return (
              column.canHide && (
                <div css={Css.add({ flex: "40%" }).ttc.$} key={i}>
                  <Checkbox
                    label={column.name || ""}
                    selected={!!column.visible}
                    onChange={(value) => {
                      column.visible = value;
                      setColumns((prevState) => ({
                        ...prevState,
                        visibleColumns: columns.filter(
                          (column) => (column.canHide && column.visible) || !column.canHide,
                        ),
                      }));
                    }}
                  />
                </div>
              )
            );
          })}
        </div>
        <div css={Css.smMd.$}>
          <Button size="sm" variant={"text"} label={buttonText || "Clear selections"} onClick={clearSelections} />
        </div>
      </div>
    </OverlayTrigger>
  );
}
