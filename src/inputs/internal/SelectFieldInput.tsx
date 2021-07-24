import React, { Fragment, InputHTMLAttributes, LabelHTMLAttributes, MutableRefObject, ReactNode } from "react";
import { mergeProps, useHover } from "react-aria";
import { ComboBoxState } from "react-stately";
import { Icon } from "src/components";
import { HelperText } from "src/components/HelperText";
import { InlineLabel, Label } from "src/components/Label";
import { Css, Palette } from "src/Css";
import { ErrorMessage } from "src/inputs/ErrorMessage";
import { Value, valueToKey } from "src/inputs/Value";
import { maybeCall, useTestIds } from "src/utils";

interface SelectFieldInputProps<O, V extends Value> {
  buttonProps: any;
  buttonRef: MutableRefObject<HTMLButtonElement | null>;
  inputProps: InputHTMLAttributes<HTMLInputElement>;
  inputRef: MutableRefObject<HTMLInputElement | null>;
  inputWrapRef: MutableRefObject<HTMLDivElement | null>;
  compact?: boolean;
  state: ComboBoxState<O>;
  isFocused: boolean;
  isDisabled: boolean;
  isReadOnly: boolean;
  fieldDecoration?: (opt: O) => ReactNode;
  errorMsg?: string;
  helperText?: string | ReactNode;
  onBlur?: () => void;
  onFocus?: () => void;
  inlineLabel?: boolean;
  labelProps: LabelHTMLAttributes<HTMLLabelElement>;
  label?: string;
  labelSuffix?: string;
  selectedOptions: O[];
  getOptionValue: (opt: O) => V;
  sizeToContent: boolean;
}

export function SelectFieldInput<O, V extends Value>(props: SelectFieldInputProps<O, V>) {
  const {
    inputProps,
    inputRef,
    inputWrapRef,
    buttonProps,
    buttonRef,
    compact = false,
    errorMsg,
    helperText,
    state,
    isFocused,
    fieldDecoration,
    isDisabled,
    isReadOnly,
    onBlur,
    onFocus,
    inlineLabel,
    label,
    labelSuffix,
    labelProps,
    selectedOptions,
    getOptionValue,
    sizeToContent,
  } = props;
  const errorMessageId = `${inputProps.id}-error`;
  const { hoverProps, isHovered } = useHover({});
  const hoverStyles = isHovered && !isReadOnly && !isFocused ? Css.bgGray100.$ : {};
  const focusStyles = isFocused && !isReadOnly ? Css.bLightBlue700.$ : {};
  const errorStyles = errorMsg ? Css.bRed500.$ : {};
  const disabledStyles = isDisabled ? Css.gray400.bgGray100.cursorNotAllowed.$ : {};
  const readOnlyStyles = isReadOnly ? Css.bn.pl0.pt0.add("backgroundColor", "unset").$ : {};
  const tid = useTestIds(inputProps); // data-testid comes in through here
  const isMultiSelect = state.selectionManager.selectionMode === "multiple";

  return (
    <Fragment>
      {!inlineLabel && label && <Label labelProps={labelProps} label={label} suffix={labelSuffix} {...tid.label} />}
      <div
        css={{
          ...Css.df.ba.bGray300.br4.px1.itemsCenter.bgWhite.hPx(40).if(compact).hPx(32).$,
          ...hoverStyles,
          ...errorStyles,
          ...focusStyles,
          ...disabledStyles,
          ...readOnlyStyles,
        }}
        {...hoverProps}
        ref={inputWrapRef as any}
      >
        {inlineLabel && label && <InlineLabel labelProps={labelProps} label={label} {...tid.label} />}
        {isMultiSelect && state.selectionManager.selectedKeys.size > 1 && (
          <span css={Css.wPx(16).hPx(16).mr1.fs0.br100.bgLightBlue700.white.tinyEm.df.itemsCenter.justifyCenter.$}>
            {state.selectionManager.selectedKeys.size}
          </span>
        )}
        {fieldDecoration && selectedOptions.length === 1 && (
          <span
            css={{
              ...Css.itemsCenter.br4.fs0.pr1.$,
              ...errorStyles,
              ...hoverStyles,
              ...focusStyles,
            }}
          >
            {fieldDecoration(selectedOptions[0])}
          </span>
        )}
        {/* Add `onInput` event handler to trigger menu to be open when the user types. */}
        <input
          {...mergeProps(inputProps, { "aria-invalid": Boolean(errorMsg), onInput: () => state.open() })}
          {...(errorMsg ? { "aria-errormessage": errorMessageId } : {})}
          ref={inputRef as any}
          css={{
            ...Css.sm.mw0.fg1.pr1.bgWhite.br4.gray900.outline0.$,
            ...hoverStyles,
            ...disabledStyles,
            ...readOnlyStyles,
          }}
          onKeyDown={(e) => {
            // We need to do some custom logic when using MultiSelect, as react-aria/stately Combobox doesn't support multiselect out of the box.
            if (isMultiSelect) {
              // Enter/Tab should toggle the focused item.
              if (e.key === "Enter" || e.key === "Tab") {
                // Prevent form submissions if menu is open.
                if (state.isOpen && e.key === "Enter") {
                  e.preventDefault();
                }

                state.selectionManager.toggleSelection(state.selectionManager.focusedKey);
                return;
              }

              // By default, the Escape key would "revert" changes,
              // but we just want to close the menu and leave the selections as is
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
              // Triggering `Escape` is basically like re-selecting currently selected option, so do that if there is one.
              state.selectionManager.setSelectedKeys(
                selectedOptions.length > 0 ? [valueToKey(getOptionValue(selectedOptions[0]))] : [],
              );
              return;
            }

            inputProps.onKeyDown && inputProps.onKeyDown(e);
          }}
          onBlur={() => {
            // We purposefully override onBlur here instead of using mergeProps, b/c inputProps.onBlur
            // goes into useComboBox's onBlur, which calls setFocused(false), which in useComboBoxState
            // detects a) there is no props.selectedKey (b/c we don't pass it), and b) there is an
            // `inputValue`, so it thinks it needs to call `resetInputValue()`.
            //
            // I assume we don't pass `selectedKey` b/c we support multiple keys.
            maybeCall(onBlur);
            state.close();
          }}
          onFocus={(e) => {
            maybeCall(onFocus);
            if (isReadOnly) return;
            e.target.select();
            state.open();
          }}
          size={
            sizeToContent
              ? isFocused
                ? Math.max(String(inputProps.value || "").length, 20)
                : String(inputProps.value || "").length || 1
              : undefined
          }
        />
        {!isReadOnly && (
          <button
            {...buttonProps}
            disabled={isDisabled}
            ref={buttonRef}
            css={{
              ...Css.br4.outline0.$,
              ...disabledStyles,
            }}
          >
            <Icon icon={state.isOpen ? "chevronUp" : "chevronDown"} color={Palette.Gray700} />
          </button>
        )}
      </div>

      {errorMsg && <ErrorMessage id={errorMessageId} errorMsg={errorMsg} {...tid.errorMsg} />}
      {helperText && <HelperText helperText={helperText} {...tid.helperText} />}
    </Fragment>
  );
}
