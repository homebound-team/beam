import React, {
  Fragment,
  InputHTMLAttributes,
  LabelHTMLAttributes,
  MutableRefObject,
  ReactNode,
  useState,
} from "react";
import { mergeProps, useHover } from "react-aria";
import { ComboBoxState } from "react-stately";
import { Icon } from "src/components";
import { HelperText } from "src/components/HelperText";
import { InlineLabel, Label } from "src/components/Label";
import { Css, Palette } from "src/Css";
import { getLabelSuffix } from "src/forms/labelUtils";
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
  isDisabled: boolean;
  isReadOnly: boolean;
  fieldDecoration?: (opt: O) => ReactNode;
  errorMsg?: string;
  required?: boolean;
  helperText?: string | ReactNode;
  onBlur?: () => void;
  onFocus?: () => void;
  inlineLabel?: boolean;
  labelProps: LabelHTMLAttributes<HTMLLabelElement>;
  label?: string;
  hideLabel?: boolean;
  selectedOptions: O[];
  getOptionValue: (opt: O) => V;
  getOptionLabel: (opt: O) => string;
  sizeToContent: boolean;
  contrast?: boolean;
  nothingSelectedText: string;
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
    required,
    helperText,
    state,
    fieldDecoration,
    isDisabled,
    isReadOnly,
    onBlur,
    onFocus,
    inlineLabel,
    label,
    labelProps,
    hideLabel,
    selectedOptions,
    getOptionValue,
    getOptionLabel,
    sizeToContent,
    contrast = false,
    nothingSelectedText,
  } = props;
  const themeStyles = {
    wrapper: Css.bgWhite.bGray300.gray900.if(contrast).bgGray700.bGray700.white.$,
    hover: Css.bgGray100.if(contrast).bgGray600.bGray600.$,
    focus: Css.bLightBlue700.if(contrast).bLightBlue500.$,
    // Not using Truss's inline `if` statement here because `addIn` properties are applied regardless.
    input: !contrast ? Css.bgWhite.$ : Css.bgGray700.addIn("&::selection", Css.bgGray800.$).$,
    disabled: Css.cursorNotAllowed.gray400.bgGray100.if(contrast).gray500.bgGray700.$,
    error: Css.bRed500.if(contrast).bRed400.$,
  };

  const errorMessageId = `${inputProps.id}-error`;
  const [isFocused, setIsFocused] = useState(false);
  const { hoverProps, isHovered } = useHover({});
  const hoverStyles = isHovered && !isReadOnly && !isFocused ? themeStyles.hover : {};
  const focusStyles = isFocused && !isReadOnly ? themeStyles.focus : {};
  const errorStyles = errorMsg ? themeStyles.error : {};
  const disabledStyles = isDisabled ? themeStyles.disabled : {};
  const readOnlyStyles = isReadOnly ? Css.bn.pl0.pt0.add("backgroundColor", "unset").$ : {};
  const tid = useTestIds(inputProps); // data-testid comes in through here
  const isMultiSelect = state.selectionManager.selectionMode === "multiple";
  const labelSuffix = getLabelSuffix(required);

  return (
    <Fragment>
      {!inlineLabel && label && (
        <Label
          labelProps={labelProps}
          label={label}
          suffix={labelSuffix}
          contrast={contrast}
          {...tid.label}
          hidden={hideLabel}
        />
      )}
      <div
        css={{
          ...Css.df.ba.br4.px1.aic.hPx(40).if(compact).hPx(32).$,
          ...themeStyles.wrapper,
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
          <span css={Css.wPx(16).hPx(16).mr1.fs0.br100.bgLightBlue700.white.tinyEm.df.aic.jcc.$}>
            {state.selectionManager.selectedKeys.size}
          </span>
        )}
        {/* For MultiSelect -> Only show the `fieldDecoration` when input is not in focus. */}
        {(!isMultiSelect || (isMultiSelect && !isFocused)) && fieldDecoration && selectedOptions.length === 1 && (
          <span
            css={{
              ...Css.df.aic.br4.fs0.pr1.$,
              ...errorStyles,
              ...hoverStyles,
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
            ...Css.mw0.fg1.pr1.br4.outline0.truncate.w100.sm.if(!inlineLabel).smEm.$,
            ...themeStyles.input,
            ...hoverStyles,
            ...disabledStyles,
            ...readOnlyStyles,
          }}
          onKeyDown={(e) => {
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
            if (isReadOnly) {
              return;
            }
            maybeCall(onBlur);
            state.close();
            setIsFocused(false);

            // Always call `setSelectedKeys` onBlur with its existing selected keys..
            // This ensures the field's `input.value` resets to what it should be in case it doesn't currently match.
            state.selectionManager.setSelectedKeys(state.selectionManager.selectedKeys);
          }}
          onFocus={(e) => {
            if (isReadOnly) return;
            maybeCall(onFocus);
            e.target.select();
            state.open();
            setIsFocused(true);
          }}
          size={
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
            <Icon
              icon={state.isOpen ? "chevronUp" : "chevronDown"}
              color={contrast ? Palette.Gray400 : Palette.Gray700}
            />
          </button>
        )}
      </div>

      {errorMsg && <ErrorMessage id={errorMessageId} errorMsg={errorMsg} contrast={contrast} {...tid.errorMsg} />}
      {helperText && <HelperText helperText={helperText} contrast={contrast} {...tid.helperText} />}
    </Fragment>
  );
}
