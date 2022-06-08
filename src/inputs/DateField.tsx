import { format as dateFnsFormat, isDate, parse as dateFnsParse } from "date-fns";
import React, { ReactNode, useEffect, useRef, useState } from "react";
import { useButton, useOverlayPosition, useOverlayTrigger, useTextField } from "react-aria";
import { Matcher } from "react-day-picker";
import { useOverlayTriggerState } from "react-stately";
import { Icon, resolveTooltip } from "src/components";
import { Popover } from "src/components/internal";
import { DatePickerOverlay } from "src/components/internal/DatePicker/DatePickerOverlay";
import { Css, Palette } from "src/Css";
import { TextFieldBase, TextFieldBaseProps } from "src/inputs/TextFieldBase";
import { maybeCall, useTestIds } from "src/utils";
import { defaultTestId } from "src/utils/defaultTestId";

export interface DateFieldProps
  extends Pick<TextFieldBaseProps<{}>, "borderless" | "visuallyDisabled" | "hideLabel" | "compact"> {
  value: Date | undefined;
  label: string;
  onChange: (value: Date) => void;
  /** Called when the component loses focus */
  onBlur?: () => void;
  /** Called when the component is in focus. */
  onFocus?: () => void;
  /** Whether the field is disabled. If a ReactNode, it's treated as a "disabled reason" that's shown in a tooltip. */
  disabled?: boolean | ReactNode;
  errorMsg?: string;
  required?: boolean;
  /** Whether the field is readOnly. If a ReactNode, it's treated as a "readOnly reason" that's shown in a tooltip. */
  readOnly?: boolean | ReactNode;
  helperText?: string | ReactNode;
  /** Renders the label inside the input field, i.e. for filters. */
  inlineLabel?: boolean;
  placeholder?: string;
  format?: keyof typeof dateFormats;
  iconLeft?: boolean;
  /**
   * Set custom logic for individual dates or date ranges to be disabled in the picker
   * exposed from `react-day-picker`: https://react-day-picker.js.org/api/DayPicker#modifiers
   */
  disabledDays?: Matcher | Matcher[];
  onEnter?: VoidFunction;
  // for storybook
  defaultOpen?: boolean;
}

export function DateField(props: DateFieldProps) {
  const {
    label,
    disabled,
    required,
    value,
    onChange,
    onFocus,
    onBlur,
    errorMsg,
    helperText,
    inlineLabel = false,
    readOnly,
    format = "short",
    iconLeft = false,
    disabledDays,
    onEnter,
    defaultOpen,
    ...others
  } = props;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const inputWrapRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  // Local focus state to conditionally call onBlur when the date picker closes.
  // E.g. If the picker closes due to focus going back to the input field then don't call onBlur. Also used to avoid updating WIP values
  const [isFocused, setIsFocused] = useState(false);
  const dateFormat = getDateFormat(format);
  const [inputValue, setInputValue] = useState(value ? formatDate(value, dateFormat) : "");
  const tid = useTestIds(props, defaultTestId(label));
  const isDisabled = !!disabled;
  const isReadOnly = !!readOnly;

  // Handle case where the input value is updated from outside the component.
  useEffect(() => {
    // Avoid updating any WIP values.
    if (!isFocused) {
      setInputValue(value ? formatDate(value, dateFormat) : "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps - Do not include `isFocused`, we don't want to update the internal `inputValue` back to `value` just because focus state changes
  }, [value, dateFormat]);

  const textFieldProps = {
    ...others,
    label,
    isDisabled,
    isReadOnly,
    "aria-haspopup": "dialog" as const,
    value: inputValue,
  };
  const state = useOverlayTriggerState({
    onOpenChange: (isOpen) => {
      // Handles calling `onBlur` for the case where the user interacts with the overlay, removing focus from the input field, and eventually closes the overlay (whether clicking away, or selecting a date)
      if (!isOpen && !isFocused) {
        maybeCall(onBlur);
      }
    },
    isOpen: defaultOpen,
  });
  const { labelProps, inputProps } = useTextField(
    {
      ...textFieldProps,
      onFocus: () => {
        // Open overlay on focus of the input.
        state.open();
        setIsFocused(true);
        maybeCall(onFocus);

        if (value) {
          // When focused, change to use the "short" date format, as it is simpler to update by hand and parse.
          setInputValue(formatDate(value, dateFormats.short));
        }
      },
      onBlur: (e) => {
        setIsFocused(false);

        // If we are interacting any other part of `inputWrap` ref (such as the calendar button) return early as clicking anywhere within there will push focus to the input field.
        // Or if interacting with the DatePicker then also return early. The overlay will handle calling `onBlur` once it closes.
        if (
          (inputWrapRef.current && inputWrapRef.current.contains(e.relatedTarget as Node)) ||
          (overlayRef.current && overlayRef.current.contains(e.relatedTarget as Node))
        ) {
          return;
        }

        const parsedDate = parseDate(inputValue, dateFormats.short);
        // If the user leaves the input and has an invalid date, reset to previous value.
        if (!parsedDate) {
          setInputValue(value ? formatDate(value, dateFormat) : "");
        } else if (dateFormat !== dateFormats.short) {
          // Or if we need to reset the dateFormat back from `short` to whatever the user specified
          setInputValue(formatDate(parsedDate, dateFormat));
        }
        state.close();
        maybeCall(onBlur);
      },
      onKeyDown: (e) => {
        if (e.key === "Enter") {
          maybeCall(onEnter);
          inputRef.current?.blur();
        }
      },
    },
    inputRef,
  );
  const { triggerProps, overlayProps } = useOverlayTrigger({ type: "dialog" }, state, buttonRef);
  const { buttonProps } = useButton(
    {
      ...triggerProps,
      isDisabled: isDisabled || isReadOnly,
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
    offset: 4,
  });

  // If showing the short date format, "01/01/20", so set size to 8. If medium (Wed, Nov 23) use 10 characters (leaving out the `,` character in the count because it is so small)
  // Otherwise the long format can be `undefined`.
  // Setting the size attribute only impacts the fields when displayed in a container that doesn't allow the field to grow to its max width, such as in an inline container.
  // TODO: figure this out... seems weird to have now that we support multiple dates formats....
  // How do other applications handle this defined sizing? Appears they use hard coded widths depending on format, which is similar here (using `size` instead of css `width`).
  // But would also need to allow for the input to be `fullWidth`, which is basically also what we're accomplishing here... so maybe fine?
  const inputSize = format === "short" ? 8 : format === "medium" ? 10 : undefined;

  const calendarButton = (
    <button
      ref={buttonRef}
      {...buttonProps}
      disabled={isDisabled}
      css={Css.if(isDisabled).cursorNotAllowed.$}
      tabIndex={-1}
      {...tid.calendarButton}
    >
      <Icon icon="calendar" color={Palette.Gray700} />
    </button>
  );

  return (
    <>
      <TextFieldBase
        {...textFieldProps}
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
        tooltip={resolveTooltip(disabled, undefined, readOnly)}
        {...others}
      />
      {state.isOpen && (
        <Popover
          triggerRef={inputWrapRef}
          popoverRef={overlayRef}
          positionProps={positionProps}
          onClose={state.close}
          isOpen={state.isOpen}
        >
          <DatePickerOverlay
            value={value}
            onSelect={(d) => {
              setInputValue(formatDate(d, dateFormat));
              onChange(d);
            }}
            state={state}
            disabledDays={disabledDays}
            overlayProps={overlayProps}
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
  if (!isDate(parsed)) {
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
