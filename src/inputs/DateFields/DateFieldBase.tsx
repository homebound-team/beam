import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { useButton, useOverlayPosition, useOverlayTrigger, useTextField } from "react-aria";
import { isDateRange, Matcher } from "react-day-picker";
import { useOverlayTriggerState } from "react-stately";
import { Icon, IconButton, resolveTooltip } from "src/components";
import { DatePicker, DateRangePicker, Popover } from "src/components/internal";
import { DatePickerOverlay } from "src/components/internal/DatePicker/DatePickerOverlay";
import { Css, Palette, Properties } from "src/Css";
import {
  DateFieldMode,
  dateFormats,
  formatDate,
  formatDateRange,
  getDateFormat,
  isValidDate,
  parseDate,
  parseDateRange,
} from "src/inputs/DateFields/utils";
import { TextFieldBase, TextFieldBaseProps } from "src/inputs/TextFieldBase";
import { DateRange } from "src/types";
import { maybeCall, useTestIds } from "src/utils";
import { defaultTestId } from "src/utils/defaultTestId";

export interface DateFieldBaseProps
  extends Pick<TextFieldBaseProps<Properties>, "borderless" | "visuallyDisabled" | "labelStyle" | "compact"> {
  label: string;
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
  placeholder?: string;
  format?: keyof typeof dateFormats;
  iconLeft?: boolean;
  hideCalendarIcon?: boolean;
  /**
   * Set custom logic for individual dates or date ranges to be disabled in the picker
   * exposed from `react-day-picker`: https://react-day-picker.js.org/api/DayPicker#modifiers
   */
  disabledDays?: Matcher | Matcher[];
  onEnter?: VoidFunction;
  /** for storybook */
  defaultOpen?: boolean;
  onChange: ((value: Date | undefined) => void) | ((value: DateRange | undefined) => void);
  mode: DateFieldMode;
  /** Range filters should only allow a full DateRange or nothing */
  isRangeFilterField?: boolean;
}

export interface DateSingleFieldBaseProps extends DateFieldBaseProps {
  mode: "single";
  value: Date | undefined;
  onChange: (value: Date | undefined) => void;
}

export interface DateRangeFieldBaseProps extends DateFieldBaseProps {
  mode: "range";
  value: DateRange | undefined;
  onChange: (value: DateRange | undefined) => void;
}

export function DateFieldBase(props: DateRangeFieldBaseProps | DateSingleFieldBaseProps) {
  const {
    label,
    disabled,
    required,
    value,
    onFocus,
    onBlur,
    // Pull `onChange` out of the props, but we're not directly using it. Do not want to keep it in `...others`
    onChange: _onChange,
    errorMsg,
    helperText,
    readOnly,
    format = "short",
    iconLeft = false,
    hideCalendarIcon = false,
    disabledDays,
    onEnter,
    defaultOpen,
    mode,
    isRangeFilterField = false,
    ...others
  } = props;

  const isRangeMode = mode === "range";
  const inputRef = useRef<HTMLInputElement | null>(null);
  const inputWrapRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  // Local focus state to conditionally call onBlur when the date picker closes.
  // E.g. If the picker closes due to focus going back to the input field then don't call onBlur. Also used to avoid updating WIP values
  const [isFocused, setIsFocused] = useState(false);
  const dateFormat = getDateFormat(format);
  // The `wipValue` allows the "range" mode to set the value to `undefined`, even if the `onChange` response cannot be undefined.
  // This makes working within the DateRangePicker much more user friendly.
  const [wipValue, setWipValue] = useState(value);
  const [inputValue, setInputValue] = useState(
    (isRangeMode ? formatDateRange(props.value, dateFormat) : formatDate(props.value, dateFormat)) ?? "",
  );
  const tid = useTestIds(props, defaultTestId(label));
  const isDisabled = !!disabled;
  const isReadOnly = !!readOnly;

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

        if (wipValue && dateFormat !== dateFormats.short) {
          // When focused, change to use the "short" date format, as it is simpler to update by hand and parse.
          setInputValue(
            (isRangeMode
              ? formatDateRange(props.value, dateFormats.short)
              : formatDate(props.value, dateFormats.short)) ?? "",
          );
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

        const parsedDate = isRangeMode
          ? parseDateRange(inputValue, dateFormats.short)
          : parseDate(inputValue, dateFormats.short);
        // If the user leaves the input and has an invalid date, reset to previous value.
        if (!isParsedDateValid(parsedDate)) {
          setWipValue(value);
          setInputValue(
            (isRangeMode ? formatDateRange(props.value, dateFormat) : formatDate(props.value, dateFormat)) ?? "",
          );
        } else if (dateFormat !== dateFormats.short) {
          // Or if we need to reset the dateFormat back from `short` to whatever the user specified
          setInputValue(
            (isRangeMode ? formatDateRange(props.value, dateFormat) : formatDate(props.value, dateFormat)) ?? "",
          );
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

  // Handle case where the input value is updated from outside the component.
  useEffect(() => {
    // Avoid updating any WIP values.
    if (!isFocused && !state.isOpen) {
      setWipValue(value);
      setInputValue(
        (isRangeMode ? formatDateRange(props.value, dateFormat) : formatDate(props.value, dateFormat)) ?? "",
      );
    }
    // We don't want to update the internal `wipValue` or `inputValue` back to `value` just because focus state changes or the overlay opens
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, dateFormat]);

  // Create a type safe `onChange` to handle both Single and Range date fields.
  const onChange = useCallback(
    (d: Date | DateRange | undefined) => {
      setWipValue(d);
      if (d && isParsedDateValid(d)) {
        if (isRangeMode && isDateRange(d)) {
          props.onChange(d);
          return;
        }

        if (!isRangeMode && !isDateRange(d)) {
          props.onChange(d);
          return;
        }
      } else {
        props.onChange(undefined);
        return;
      }
    },
    [isRangeMode, props.onChange],
  );

  // If showing the short date format, "01/01/20", so set size to 8. If medium (Wed, Nov 23) use 10 characters (leaving out the `,` character in the count because it is so small)
  // Otherwise the long format can be `undefined`.
  // Setting the size attribute only impacts the fields when displayed in a container that doesn't allow the field to grow to its max width, such as in an inline container.
  // TODO: figure this out... seems weird to have now that we support multiple dates formats....
  // How do other applications handle this defined sizing? Appears they use hard coded widths depending on format, which is similar here (using `size` instead of css `width`).
  // But would also need to allow for the input to be `fullWidth`, which is basically also what we're accomplishing here... so maybe fine?
  const inputSize = !isRangeMode ? (format === "short" ? 8 : format === "medium" ? 10 : undefined) : undefined;

  // Support input range filter field w/ a clear btn that will appear when overlay is closed and input is not focused
  const clearButton = (
    <>
      {inputValue !== "" && !state.isOpen && (
        <IconButton
          icon="xCircle"
          color={Palette.Gray700}
          onClick={() => {
            setInputValue("");
            onChange(undefined);
          }}
        />
      )}
    </>
  );

  const calendarButton = (
    <button
      ref={buttonRef}
      {...buttonProps}
      disabled={isDisabled}
      css={Css.if(isDisabled).cursorNotAllowed.$}
      tabIndex={-1}
      {...tid.calendarButton}
    >
      <Icon icon="calendar" color={isDisabled ? Palette.Gray400 : Palette.Gray700} />
    </button>
  );

  const EndFieldButtons = (
    <>
      {isRangeFilterField && clearButton}
      {!hideCalendarIcon && calendarButton}
    </>
  );

  return (
    <>
      <TextFieldBase
        {...textFieldProps}
        errorMsg={errorMsg}
        helperText={helperText}
        required={required}
        labelProps={labelProps}
        inputProps={{ ...inputProps, size: inputSize }}
        inputRef={inputRef}
        inputWrapRef={inputWrapRef}
        onChange={(v) => {
          // hide the calendar if the user is manually entering the date
          state.close();
          if (v) {
            setInputValue(v);
            // If changing the value directly (vs using the DatePicker), then we always use the short format
            const parsed = isRangeMode ? parseDateRange(v, dateFormats.short) : parseDate(v, dateFormats.short);
            onChange(parsed);
          }
          // User has deleted all text in field
          else if (v === undefined) {
            setInputValue("");
          }
        }}
        endAdornment={!iconLeft && EndFieldButtons}
        startAdornment={!hideCalendarIcon && iconLeft && calendarButton}
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
          <DatePickerOverlay overlayProps={overlayProps}>
            {isRangeMode ? (
              <DateRangePicker
                range={wipValue as DateRange | undefined}
                disabledDays={disabledDays}
                onSelect={(dr) => {
                  // Note: Do not close date range picker on select to allow the user to select multiple dates at a time
                  setInputValue(formatDateRange(dr, dateFormats.short) ?? "");
                  onChange(dr);
                }}
                useYearPicker={isRangeFilterField}
                {...tid.datePicker}
              />
            ) : (
              <DatePicker
                value={wipValue as Date | undefined}
                disabledDays={disabledDays}
                onSelect={(d) => {
                  setInputValue(formatDate(d, dateFormats.short) ?? "");
                  onChange(d);
                  state.close();
                }}
                {...tid.datePicker}
              />
            )}
          </DatePickerOverlay>
        </Popover>
      )}
    </>
  );
}

function isParsedDateValid(d: DateRange | Date | undefined): boolean {
  // Only consider a DateRange valid when both `from` and `to` values are valid dates
  return d !== undefined && (!isDateRange(d) || (isDateRange(d) && isValidDate(d.from) && isValidDate(d.to)));
}
