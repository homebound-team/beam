import { mergeProps } from "@react-aria/utils";
import { ComboBoxState } from "@react-stately/combobox";
import React, { Fragment, InputHTMLAttributes, LabelHTMLAttributes, MutableRefObject, ReactNode } from "react";
import { useHover } from "react-aria";
import { Icon } from "src/components";
import { HelperText } from "src/components/HelperText";
import { InlineLabel, Label } from "src/components/Label";
import { Css, Palette } from "src/Css";
import { ErrorMessage } from "src/inputs/ErrorMessage";
import { useTestIds } from "src/utils";

interface ComboBoxInputProps<T extends object> {
  buttonProps: any;
  buttonRef: MutableRefObject<HTMLButtonElement | null>;
  inputProps: InputHTMLAttributes<HTMLInputElement>;
  inputRef: MutableRefObject<HTMLInputElement | null>;
  inputWrapRef: MutableRefObject<HTMLDivElement | null>;
  compact?: boolean;
  state: ComboBoxState<T>;
  isFocused: boolean;
  isDisabled: boolean;
  isReadOnly: boolean;
  fieldDecoration?: (opt: T) => ReactNode;
  errorMsg?: string;
  helperText?: string | ReactNode;
  onBlur?: () => void;
  onFocus?: () => void;
  inlineLabel?: boolean;
  labelProps: LabelHTMLAttributes<HTMLLabelElement>;
  label?: string;
}

export function ComboBoxInput<T extends object>(props: ComboBoxInputProps<T>) {
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
    labelProps,
  } = props;
  const errorMessageId = `${inputProps.id}-error`;
  const { hoverProps, isHovered } = useHover({});
  const hoverStyles = isHovered && !isReadOnly && !isFocused ? Css.bgGray100.$ : {};
  const focusStyles = isFocused && !isReadOnly ? Css.bLightBlue500.$ : {};
  const errorStyles = errorMsg ? Css.bRed500.$ : {};
  const disabledStyles = isDisabled ? Css.gray400.bgGray100.cursorNotAllowed.$ : {};
  const readOnlyStyles = isReadOnly ? Css.bn.pl0.pt0.add("backgroundColor", "unset").$ : {};
  const tid = useTestIds(inputProps); // data-testid comes in through here

  return (
    <Fragment>
      {!inlineLabel && label && <Label labelProps={labelProps} label={label} {...tid.label} />}
      <div
        css={{
          ...Css.df.ba.bGray300.br4.px1.itemsCenter.bgWhite.$,
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
        {state.selectionManager.selectionMode === "multiple" && state.selectionManager.selectedKeys.size > 1 && (
          <span css={Css.wPx(16).hPx(16).mr1.fs0.br100.bgLightBlue700.white.tinyEm.df.itemsCenter.justifyCenter.$}>
            {state.selectionManager.selectedKeys.size}
          </span>
        )}
        {fieldDecoration && state.selectedItem && (
          <span
            css={{
              ...Css.itemsCenter.br4.fs0.pr1.$,
              ...errorStyles,
              ...hoverStyles,
              ...focusStyles,
            }}
          >
            {fieldDecoration(state.selectedItem.value)}
          </span>
        )}
        {/* Add `onInput` event handler to trigger menu to be open when the user types. */}
        <input
          {...mergeProps(inputProps, { "aria-invalid": Boolean(errorMsg), onInput: () => state.open() })}
          {...(errorMsg ? { "aria-errormessage": errorMessageId } : {})}
          ref={inputRef as any}
          css={{
            ...Css.sm.mw0.fg1.pr1.bgWhite.br4.pyPx(10).gray900.outline0.if(compact).pyPx(6).$,
            ...hoverStyles,
            ...disabledStyles,
            ...readOnlyStyles,
          }}
          onBlur={onBlur}
          onFocus={(e) => {
            onFocus && onFocus();
            if (isReadOnly) return;
            e.target.select();
            state.open();
          }}
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
