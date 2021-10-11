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

const format = "MM/dd/yy";
const longFormat = "EEEE LLLL	d, uuuu";

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
  /** Renders as `Monday, January 1, 2018` when in read-only mode. */
  long?: boolean;
  /** Renders the label inside the input field, i.e. for filters. */
  inlineLabel?: boolean;
  placeholder?: string;
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
    long = false,
    ...others
  } = props;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const inputWrapRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const [inputValue, setInputValue] = useState(
    value ? (long && readOnly ? dateFnsFormat(value, longFormat) : formatDate(value)) : "",
  );
  const tid = useTestIds(props, defaultTestId(label));

  useEffect(() => {
    setInputValue(value ? (long && readOnly ? dateFnsFormat(value, longFormat) : formatDate(value)) : "");
  }, [value]);

  const textFieldProps = {
    ...others,
    label,
    isDisabled: disabled,
    isReadOnly: false,
    "aria-haspopup": "dialog" as const,
    value: inputValue,
  };
  const state = useOverlayTriggerState({});
  const { labelProps, inputProps } = useTextField(
    {
      ...textFieldProps,
      // Open on focus of the input.
      onFocus: (e) => {
        state.open();
        maybeCall(onFocus, e);
      },
      onBlur: (e) => {
        // If we are interacting any other part of the inputWrap (such as the calendar button) return early
        if (e.relatedTarget && inputWrapRef.current && inputWrapRef.current.contains(e.relatedTarget as Node)) {
          return;
        }
        // I want to avoid calling `onBlur` if interacting with the DatePickerOverlay, but almost seems impossible, because we still want to fire the blur when the user leaves the field.
        // One idea I had was to restore focus to the input when the overlay is closed, but how can we know that only on a certain focus event should open the DatePicker.
        // So for now, just leaving it as "once you interact with the Datepicker, you've 'blurred' the field.
        // ((overlayRef.current && overlayRef.current.contains(e.relatedTarget as Node))

        // If the user leaves the input and has an invalid date, reset to previous value.
        if (!parseDate(inputValue, format)) {
          setInputValue(value ? formatDate(value) : "");
        }
        maybeCall(onBlur, e);
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

  return (
    <>
      <TextFieldBase
        {...textFieldProps}
        readOnly={readOnly}
        errorMsg={errorMsg}
        helperText={helperText}
        required={required}
        labelProps={labelProps}
        inputProps={{ ...triggerProps, ...inputProps }}
        inputRef={inputRef}
        inputWrapRef={inputWrapRef}
        inlineLabel={inlineLabel}
        onChange={(v) => {
          // hide the calendar if the user is manually entering the date
          state.close();
          if (v) {
            setInputValue(v);
            const parsed = parseDate(v, format);
            if (parsed) {
              onChange(parsed);
            }
          }
        }}
        endAdornment={
          <button
            ref={buttonRef}
            {...buttonProps}
            disabled={disabled}
            css={Css.if(disabled).cursorNotAllowed.$}
            {...tid.calendarButton}
          >
            <Icon icon="calendar" />
          </button>
        }
        {...others}
      />
      {state.isOpen && (
        <Popover
          triggerRef={inputWrapRef}
          popoverRef={overlayRef}
          positionProps={{ ...overlayProps, ...positionProps }}
          onClose={state.close}
          isOpen={state.isOpen}
        >
          <DatePickerOverlay
            state={state}
            value={value}
            positionProps={positionProps}
            onChange={(d) => {
              setInputValue(formatDate(d));
              onChange(d);
            }}
            {...tid.datePicker}
          />
        </Popover>
      )}
    </>
  );
}

function formatDate(date: Date) {
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
