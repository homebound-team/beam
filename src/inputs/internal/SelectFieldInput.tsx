import React, { InputHTMLAttributes, LabelHTMLAttributes, MutableRefObject, ReactNode, useState } from "react";
import { mergeProps } from "react-aria";
import { ComboBoxState } from "react-stately";
import { Icon } from "src/components";
import { PresentationFieldProps } from "src/components/PresentationContext";
import { Css } from "src/Css";
import { TextFieldBase } from "src/inputs/TextFieldBase";
import { Value } from "src/inputs/Value";
import { Callback } from "src/types";
import { maybeCall } from "src/utils";

interface SelectFieldInputProps<O, V extends Value> extends PresentationFieldProps {
  buttonProps: any;
  buttonRef: MutableRefObject<HTMLButtonElement | null>;
  inputProps: InputHTMLAttributes<HTMLInputElement>;
  inputRef: MutableRefObject<HTMLInputElement | null>;
  inputWrapRef: MutableRefObject<HTMLDivElement | null>;
  state: ComboBoxState<O>;
  fieldDecoration?: (opt: O) => ReactNode;
  errorMsg?: string;
  required?: boolean;
  helperText?: string | ReactNode;
  onBlur?: () => void;
  onFocus?: () => void;
  inlineLabel?: boolean;
  labelProps: LabelHTMLAttributes<HTMLLabelElement>;
  label: string;
  selectedOptions: O[];
  getOptionValue: (opt: O) => V;
  getOptionLabel: (opt: O) => string;
  sizeToContent?: boolean;
  contrast?: boolean;
  nothingSelectedText: string;
  tooltip?: ReactNode;
  resetField: Callback;
}

export function SelectFieldInput<O, V extends Value>(props: SelectFieldInputProps<O, V>) {
  const {
    inputProps,
    buttonProps,
    buttonRef,
    errorMsg,
    state,
    fieldDecoration,
    onBlur,
    onFocus,
    inlineLabel,
    selectedOptions,
    getOptionValue,
    getOptionLabel,
    sizeToContent = false,
    contrast = false,
    nothingSelectedText,
    resetField,
    ...otherProps
  } = props;

  const [isFocused, setIsFocused] = useState(false);
  const isMultiSelect = state.selectionManager.selectionMode === "multiple";
  const showNumSelection = isMultiSelect && state.selectionManager.selectedKeys.size > 1;
  // For MultiSelect only show the `fieldDecoration` when input is not in focus.
  const showFieldDecoration =
    (!isMultiSelect || (isMultiSelect && !isFocused)) && fieldDecoration && selectedOptions.length === 1;

  return (
    <TextFieldBase
      {...otherProps}
      readOnly={inputProps.readOnly}
      inlineLabel={inlineLabel}
      errorMsg={errorMsg}
      contrast={contrast}
      xss={!inlineLabel && !inputProps.readOnly ? Css.fw5.$ : {}}
      startAdornment={
        (showNumSelection && (
          <span css={Css.wPx(16).hPx(16).fs0.br100.bgLightBlue700.white.tinyEm.df.aic.jcc.$}>
            {state.selectionManager.selectedKeys.size}
          </span>
        )) ||
        (showFieldDecoration && fieldDecoration(selectedOptions[0]))
      }
      endAdornment={
        !inputProps.readOnly && (
          <button
            {...buttonProps}
            disabled={inputProps.disabled}
            ref={buttonRef}
            css={{
              ...Css.br4.outline0.gray700.if(contrast).gray400.$,
              ...(inputProps.disabled ? Css.cursorNotAllowed.gray400.if(contrast).gray600.$ : {}),
            }}
          >
            <Icon icon={state.isOpen ? "chevronUp" : "chevronDown"} />
          </button>
        )
      }
      inputProps={{
        ...mergeProps(inputProps, { "aria-invalid": Boolean(errorMsg), onInput: () => state.open() }),
        // Not merging the following as we want them to overwrite existing events
        ...{
          onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
            // We need to do some custom logic when using MultiSelect, as react-aria/stately Combobox doesn't support multiselect out of the box.
            if (isMultiSelect) {
              // Enter should toggle the focused item.
              if (e.key === "Enter") {
                // Prevent form submissions if menu is open.
                if (state.isOpen) {
                  e.preventDefault();
                }

                state.selectionManager.toggleSelection(state.selectionManager.focusedKey);
                return;
              }

              // By default, the Escape key would "revert" changes,
              // but we just want to close the menu and leave the reset of the field state as is.
              if (e.key === "Escape") {
                state.close();
                return;
              }
            }

            // Handle single selection Escape key press
            // When a user hits `Escape`, then react-aria calls `state.revert`, which uses `state.selectedKey` to
            // reset the field to its previous value. However, because we use a the Multiple Selection State manager,
            // then our `state.selectedKey` isn't set. So we need to properly reset the state ourselves.
            if (e.key === "Escape") {
              state.close();
              resetField();
              return;
            }

            inputProps.onKeyDown && inputProps.onKeyDown(e);
          },
          onBlur: (e: React.FocusEvent) => {
            // Do not call onBlur if readOnly or interacting within the input wrapper (such as the menu trigger button).
            if (
              inputProps.readOnly ||
              (props.inputWrapRef.current && props.inputWrapRef.current.contains(e.relatedTarget as HTMLElement))
            ) {
              return;
            }

            // We purposefully override onBlur here instead of using mergeProps, b/c inputProps.onBlur
            // goes into useComboBox's onBlur, which calls setFocused(false), which in useComboBoxState
            // detects a) there is no props.selectedKey (b/c we don't pass it), and b) there is an
            // `inputValue`, so it thinks it needs to call `resetInputValue()`.
            setIsFocused(false);
            maybeCall(onBlur);
            state.close();

            // Always call `resetField` onBlur, this ensures the field's `input.value` resets
            // to what it should be in case it doesn't currently match.
            resetField();
          },
          onFocus: () => {
            if (inputProps.readOnly) return;
            setIsFocused(true);
            maybeCall(onFocus);
            state.open();
          },
          size:
            // If sizeToContent, then, in order of precedence, base it of from:
            // 1. input's value if any
            // 2. If is MultiSelect and only one option is chosen, then use the length of that option to define the width to avoid size jumping on blur.
            // 3. Use `nothingSelectedText`
            // 4. Default to "1"
            // And do not allow it to grow past a size of 20.
            // TODO: Combine logic to determine the input's value. Similar logic is used in SelectFieldBase, though it is intertwined with other state logic. Such as when to open/close menu, or filter the options within that menu, etc...
            sizeToContent
              ? Math.min(
                  String(
                    inputProps.value ||
                      (isMultiSelect && selectedOptions.length === 1 && getOptionLabel(selectedOptions[0])) ||
                      nothingSelectedText ||
                      "",
                  ).length || 1,
                  20,
                )
              : undefined,
        },
      }}
    />
  );
}
