import { format as dateFnsFormat, parse as dateFnsParse } from "date-fns";
import React, { ReactNode, useEffect, useRef, useState } from "react";
import { useButton, useOverlayPosition, useOverlayTrigger, useTextField } from "react-aria";
import { DateUtils } from "react-day-picker";
import { useOverlayTriggerState } from "react-stately";
import { Icon } from "src/components";
import { Popover } from "src/components/internal";
import { Css } from "src/Css";
import { DatePickerOverlay } from "src/inputs/internal/DatePickerOverlay";
import { TextFieldBase } from "src/inputs/TextFieldBase";
import { maybeCall, useTestIds } from "src/utils";
import { defaultTestId } from "src/utils/defaultTestId";
import "./DateField.css";

export interface DateFieldProps {
  value: Date | undefined;
  label: string;
  onChange: (value: Date) => void;
  /** Called when the component loses focus */
  onBlur?: () => void;
  /** Called when the component is in focus. */
  onFocus?: () => void;
  disabled?: boolean;
  errorMsg?: string;
  required?: boolean;
  readOnly?: boolean;
  helperText?: string | ReactNode;
  /** Renders the label inside the input field, i.e. for filters. */
  inlineLabel?: boolean;
  placeholder?: string;
  compact?: boolean;
  format?: keyof typeof dateFormats;
  iconLeft?: boolean;
}

export function DateField(props: DateFieldProps) {
  const {
    label,
    disabled = false,
    required,
    value,
    onChange,
    onFocus,
    onBlur,
    errorMsg,
    helperText,
    inlineLabel = false,
    readOnly = false,
    format = "short",
    iconLeft = false,
    ...others
  } = props;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const inputWrapRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const dateFormat = getDateFormat(format);
  const [inputValue, setInputValue] = useState(value ? formatDate(value, dateFormat) : "");
  const tid = useTestIds(props, defaultTestId(label));

  useEffect(() => {
    if (!isFocused) {
      setInputValue(value ? formatDate(value, dateFormat) : "");
    }
  }, [value]);

  const textFieldProps = {
    ...others,
    label,
    isDisabled: disabled,
    isReadOnly: readOnly,
    "aria-haspopup": "dialog" as const,
    value: inputValue,
  };
  const state = useOverlayTriggerState({
    onOpenChange: (isOpen) => {
      // Handling `onBlur` is tricky here. If this closes and the user is still on the input, then do not call `blur`
      if (!isOpen && !isFocused) {
        maybeCall(onBlur);
      }
    },
  });
  const { labelProps, inputProps } = useTextField(
    {
      ...textFieldProps,
      // Open on focus of the input.
      onFocus: () => {
        state.open();
        setIsFocused(true);
        maybeCall(onFocus);
        if (value) {
          setInputValue(formatDate(value, dateFormats.short));
        }
      },
      onBlur: (e) => {
        setIsFocused(false);
        // If we are interacting any other part of the inputWrap (such as the calendar button) return early
        // Or if interacting with the DatePicker then also return early - When the DatePicker closes, it will call `onBlur` if the input is not in focus still
        if (
          (inputWrapRef.current && inputWrapRef.current.contains(e.relatedTarget as Node)) ||
          (overlayRef.current && overlayRef.current.contains(e.relatedTarget as Node))
        ) {
          return;
        }

        // If the user leaves the input and has an invalid date, reset to previous value.
        if (!parseDate(inputValue, dateFormat)) {
          setInputValue(value ? formatDate(value, dateFormat) : "");
        }
        maybeCall(onBlur);
      },
    },
    inputRef,
  );
  const { triggerProps, overlayProps } = useOverlayTrigger({ type: "dialog" }, state, buttonRef);
  const { buttonProps } = useButton(
    {
      ...triggerProps,
      isDisabled: disabled || readOnly,
      // When pressed or focused then move focus the input, which will select the text and trigger the DatePicker to open
      onPress: () => inputRef?.current?.focus(),
      onFocus: () => inputRef?.current?.focus(),
    },
    buttonRef,
  );
  const { overlayProps: positionProps } = useOverlayPosition({
    targetRef: inputWrapRef,
    overlayRef,
    shouldFlip: true,
    isOpen: state.isOpen,
    onClose: state.close,
    placement: "bottom left",
    shouldUpdatePosition: true,
  });

  // If showing the long format of the date, then leave size undefined. Otherwise we're showing it as "01/01/20", so set size to 8.
  // (Setting the size 8 will currently only impact view of the DateField when placed on the "in page" filters. This is due to other styles set within TextFieldBase)
  // TODO: figure this out... seems weird to have now that we support multiple dates....
  const inputSize = format === "long" ? undefined : 8;

  const calendarButton = (
    <button
      ref={buttonRef}
      {...buttonProps}
      disabled={disabled}
      css={Css.if(disabled).cursorNotAllowed.$}
      {...tid.calendarButton}
    >
      <Icon icon="calendar" />
    </button>
  );

  return (
    <>
      <TextFieldBase
        {...textFieldProps}
        readOnly={readOnly}
        errorMsg={errorMsg}
        helperText={helperText}
        required={required}
        labelProps={labelProps}
        inputProps={{ ...triggerProps, ...inputProps, size: inputSize }}
        inputRef={inputRef}
        inputWrapRef={inputWrapRef}
        inlineLabel={inlineLabel}
        onChange={(v) => {
          // hide the calendar if the user is manually entering the date
          state.close();
          if (v) {
            setInputValue(v);
            // If changing the value directly (vs using the DatePicker), then we always use the short format
            const parsed = parseDate(v, dateFormats.short);
            if (parsed) {
              onChange(parsed);
            }
          }
        }}
        endAdornment={!iconLeft && calendarButton}
        startAdornment={iconLeft && calendarButton}
        {...others}
      />
      {state.isOpen && (
        <Popover
          triggerRef={inputWrapRef}
          popoverRef={overlayRef}
          positionProps={{ ...overlayProps, ...positionProps }}
          onClose={() => {
            state.close();
          }}
          isOpen={state.isOpen}
        >
          <DatePickerOverlay
            state={state}
            value={value}
            positionProps={positionProps}
            onChange={(d) => {
              setInputValue(formatDate(d, dateFormat));
              onChange(d);
            }}
            {...tid.datePicker}
          />
        </Popover>
      )}
    </>
  );
}

function formatDate(date: Date, format: string) {
  return dateFnsFormat(date, format);
}

function parseDate(str: string, format: string) {
  // Copy/pasted from react-day-picker so that typing "2/2/2" doesn't turn into "02/02/0002"
  const split = str.split("/");
  if (split.length !== 3) {
    return undefined;
  }
  // Wait for the year to be 2 chars
  if (split[2].length !== 2) {
    return undefined;
  }
  const month = parseInt(split[0], 10) - 1;
  const day = parseInt(split[1], 10);
  let year = parseInt(split[2], 10);
  // This is also ~verbatim copy/pasted from react-day-picker
  if (
    isNaN(year) ||
    String(year).length > 4 ||
    isNaN(month) ||
    isNaN(day) ||
    day <= 0 ||
    day > 31 ||
    month < 0 ||
    month >= 12
  ) {
    return undefined;
  }

  const parsed = dateFnsParse(str, format, new Date());
  if (!DateUtils.isDate(parsed)) {
    return undefined;
  }
  return parsed;
}

const dateFormats = {
  short: "MM/dd/yy",
  medium: "EEE, MMM d",
  long: "EEEE LLLL d, uuuu",
};

function getDateFormat(format: keyof typeof dateFormats | undefined) {
  return format ? dateFormats[format] : dateFormats.short;
}
