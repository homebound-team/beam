import React, { useMemo, useRef, useState } from "react";
import { mergeProps, useButton, useFocus, useOverlayPosition, useSelect } from "react-aria";
import { Item, useSelectState } from "react-stately";
import { Icon } from "src/components";
import { Popover } from "src/components/internal";
import { Label } from "src/components/Label";
import { usePresentationContext } from "src/components/PresentationContext";
import { Css } from "src/Css";
import { ListBox } from "src/inputs/internal/ListBox";
import { Value, valueToKey } from "src/inputs/Value";
import { HasIdAndName, Optional } from "src/types";
import { maybeCall, useTestIds } from "src/utils";

export interface ChipSelectFieldProps<O, V extends Value> {
  label: string;
  value: V;
  options: O[];
  placeholder?: string;
  onSelect: (value: V, opt: O | undefined) => void;
  getOptionValue: (opt: O) => V;
  getOptionLabel: (opt: O) => string;
  // Callback fired when focus removes from the input
  onBlur?: () => void;
  // Callback fired when focus is set to the input
  onFocus?: () => void;
  // Whether to show the "X"/clear button on the Chip
  clearable?: boolean;
}

export function ChipSelectField<O, V extends Value>(props: ChipSelectFieldProps<O, V>): JSX.Element;
export function ChipSelectField<O extends HasIdAndName<V>, V extends Value>(
  props: Optional<ChipSelectFieldProps<O, V>, "getOptionValue" | "getOptionLabel">,
): JSX.Element;
export function ChipSelectField<O, V extends Value>(
  props: Optional<ChipSelectFieldProps<O, V>, "getOptionLabel" | "getOptionValue">,
): JSX.Element {
  const { fieldProps } = usePresentationContext();
  const {
    label,
    value,
    placeholder = "Select an option",
    options,
    onSelect,
    getOptionValue = (opt: O) => (opt as any).id, // if unset, assume O implements HasId
    getOptionLabel = (opt: O) => (opt as any).name, // if unset, assume O implements HasName
    onFocus,
    onBlur,
    clearable = false,
  } = props;
  const tid = useTestIds(props, "chipSelectField");
  const typeScale = fieldProps?.typeScale ?? "sm";
  const showClearButton = clearable && !!value;

  const [isFocused, setIsFocused] = useState(false);
  const [isClearFocused, setIsClearFocused] = useState(false);
  const { focusProps } = useFocus({
    onFocus: (e) => {
      // Do not call `onFocus` if focus was returned to the trigger element from the Popover
      if (popoverRef.current && popoverRef.current.contains(e.relatedTarget as HTMLElement)) {
        return;
      }

      maybeCall(onFocus);
    },
    // Do not call onBlur if we just opened the menu
    onBlur: () => !state.isOpen && maybeCall(onBlur),
    // Do not change focus state if select menu is opened
    onFocusChange: (isFocused) => !state.isOpen && setIsFocused(isFocused),
  });
  const { focusProps: clearFocusProps } = useFocus({ onFocusChange: setIsClearFocused });

  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const listBoxRef = useRef(null);

  const chipStyles = Css[typeScale].bgGray300.gray900.br16.pxPx(10).pyPx(2).$;

  const selectChildren = useMemo(
    () =>
      options.map((o) => (
        <Item key={valueToKey(getOptionValue(o))} textValue={getOptionLabel(o)}>
          <span css={chipStyles}>{getOptionLabel(o)}</span>
        </Item>
      )),
    [options],
  );

  const state = useSelectState<any>({
    label,
    children: selectChildren,
    autoFocus: false,
    selectedKey: valueToKey(value),
    onSelectionChange: (key) => {
      const selectedItem = options.find((o) => getOptionValue(o) === key);
      if (selectedItem) {
        onSelect(key as V, selectedItem);
      }
    },
    onOpenChange: (isOpen) => {
      if (!isOpen && buttonRef.current) {
        // When closing reset the focus to the button element.
        buttonRef.current.focus();
      }
    },
  });

  const { labelProps, triggerProps, valueProps, menuProps } = useSelect(
    { label, children: selectChildren },
    state,
    buttonRef,
  );

  const { buttonProps } = useButton(triggerProps, buttonRef);
  const { overlayProps: positionProps } = useOverlayPosition({
    targetRef: buttonRef,
    overlayRef: popoverRef,
    shouldFlip: true,
    scrollRef: listBoxRef,
    isOpen: state.isOpen,
    onClose: state.close,
    placement: "bottom left",
  });

  positionProps.style = {
    ...positionProps.style,
    width: buttonRef?.current?.clientWidth,
    // Ensures the menu never gets too small.
    minWidth: 200,
  };

  return (
    <>
      <div
        css={{
          ...chipStyles,
          ...Css.dif.p0.mwPx(32).if(!value).bgGray200.$,
          ...(isFocused ? Css.bshFocus.$ : {}),
        }}
      >
        <Label label={label} labelProps={labelProps} hidden {...tid.label} />
        <button
          {...mergeProps(focusProps, buttonProps)}
          ref={buttonRef}
          css={{
            ...Css.br16.pxPx(10).pyPx(2).outline0.if(showClearButton).prPx(4).borderRadius("16px 0 0 16px").$,
            "&:hover": Css.bgGray400.if(!value).bgGray300.$,
          }}
          {...tid}
        >
          <span {...valueProps}>{state.selectedItem ? state.selectedItem.textValue : placeholder}</span>
        </button>
        {showClearButton && (
          // Apply a tabIndex=-1 to remove need for addresses this focus behavior separately from the rest of the button.
          // This will require the user to click on the button if they want to remove it.
          <button
            {...clearFocusProps}
            css={{
              ...Css.prPx(4).borderRadius("0 16px 16px 0").outline0.$,
              "&:hover": Css.bgGray400.$,
              ...(isClearFocused ? Css.boxShadow(`0px 0px 0px 2px rgba(3,105,161,1)`).$ : {}),
            }}
            onClick={() => {
              onSelect(undefined as any, undefined as any);
              setIsClearFocused(false);
            }}
            aria-label="Remove"
            {...tid.clearButton}
          >
            <Icon icon="x" inc={typeScale === "xs" ? 2 : undefined} />
          </button>
        )}
      </div>
      {state.isOpen && (
        <Popover
          triggerRef={buttonRef}
          popoverRef={popoverRef}
          positionProps={positionProps}
          onClose={state.close}
          isOpen={state.isOpen}
          shouldCloseOnBlur={true}
        >
          <ListBox
            {...menuProps}
            listBoxRef={listBoxRef}
            state={state}
            getOptionLabel={getOptionLabel}
            getOptionValue={getOptionValue}
            positionProps={positionProps}
          />
        </Popover>
      )}
    </>
  );
}
