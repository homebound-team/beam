import { format as dateFnsFormat, parse as dateFnsParse } from "date-fns";
import React, { ReactNode, useRef } from "react";
import { mergeProps, useTextField } from "react-aria";
import { DateUtils, NavbarElementProps, WeekdayElementProps } from "react-day-picker";
import DayPickerInput from "react-day-picker/DayPickerInput";
import { Icon, IconButton } from "src/components";
import { HelperText } from "src/components/HelperText";
import { Label } from "src/components/Label";
import { Css, Palette } from "src/Css";
import { getLabelSuffix } from "src/forms/labelUtils";
import { ErrorMessage } from "src/inputs/ErrorMessage";
import { TextField } from "src/inputs/TextField";
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
    readOnly = false,
    long = false,
    ...others
  } = props;
  const labelSuffix = getLabelSuffix(required);

  const { ...otherProps } = {};
  // We don't really use the inputRef, but `useTextField` needs it. We probably shouldn't
  // use useTextField, it's just a copy/paste crutch
  const inputRef = useRef<HTMLInputElement | null>(null);
  const textFieldProps = { ...otherProps, label: label ?? "date", isDisabled: disabled, isReadOnly: false };
  const { labelProps, inputProps } = useTextField(textFieldProps, inputRef);

  if (readOnly) {
    return (
      <TextField
        label={label}
        readOnly={true}
        errorMsg={errorMsg}
        helperText={helperText}
        onBlur={onBlur}
        onFocus={onFocus}
        required={required}
        disabled={disabled}
        value={value ? (long ? dateFnsFormat(value, longFormat) : formatDate(value)) : ""}
        onChange={() => {}}
        {...others}
      />
    );
  }

  return (
    <div
      css={{
        ...Css.df.fdc.w100.maxw("550px").$,
        "& .DayPickerInput": Css.relative.$,
        // Copy/pasted from TextFieldBase to soften the border, fix our border/padding/height
        "& .DayPickerInput input": {
          ...Css.add("resize", "none").bgWhite.w100.sm.px1.hPx(40).gray900.br4.outline0.ba.bGray300.$,
          // Turn gray when disabled
          ...(disabled ? Css.gray400.bgGray100.cursorNotAllowed.$ : {}),
          ...(errorMsg ? Css.bRed600.$ : {}),
        },
        // Highlight on focus
        "& .DayPickerInput input:focus-within": Css.bLightBlue700.$,
        // The S / M / T / W ... heading
        "& .DayPicker-Weekday": Css.pPx(8).xs.gray400.important.$,
        // Un-collapse the borders so we can hover each cell
        "& .DayPicker-Month": Css.add({ borderCollapse: "separate" }).$,
        // Make the boxes smaller, this ends up being 32x32 which matches figma
        "& .DayPicker-Day": Css.pPx(8).xs.ba.bWhite.br4.$,
        // For today, use a background
        "& .DayPicker-Day--today": Css.bgGray100.$,
        // For selected, use a background
        "& .DayPicker-Day--selected": Css.bgLightBlue700.white.$,
        // For pressed
        "& .DayPicker-Day:active": Css.bgGray400.$,
        // Render over our calendar icon decoration in InputElement
        "& .DayPickerInput-Overlay": Css.br4.z2.topPx(4).$,
        // Make the month title, i.e. "May 2021", match figma; pyPx nudge matches the NavbarElement nudging
        "& .DayPicker-Caption > div": Css.base.pyPx(2).$,
      }}
    >
      {label && <Label labelProps={labelProps} label={label} suffix={labelSuffix} />}
      <DayPickerInput
        onDayChange={onChange as any}
        dayPickerProps={{
          navbarElement: NavbarElement,
          weekdayElement: Weekday,
        }}
        component={InputElement}
        // inputProps comes from react-aria and is how end up getting things like
        // disabled=true passes through to our InputElement
        inputProps={mergeProps(inputProps, { onFocus, onBlur })}
        value={value}
        placeholder=""
        formatDate={formatDate}
        parseDate={parseDate}
        format={format}
      />
      {errorMsg && <ErrorMessage errorMsg={errorMsg} />}
      {helperText && <HelperText helperText={helperText} />}
    </div>
  );
}

/** Customize the prev/next button to be our SVG icons. */
function NavbarElement(props: NavbarElementProps) {
  const { showPreviousButton, showNextButton, onPreviousClick, onNextClick, classNames } = props;
  return (
    <div className={classNames.navBar}>
      <div css={Css.absolute.top(2).right(6.5).$}>
        <IconButton
          color={Palette.Gray700}
          disabled={!showPreviousButton}
          icon="chevronLeft"
          onClick={() => onPreviousClick()}
        />
      </div>
      <div css={Css.absolute.top(2).right(3).$}>
        <IconButton
          color={Palette.Gray700}
          disabled={!showNextButton}
          icon="chevronRight"
          onClick={() => onNextClick()}
        />
      </div>
    </div>
  );
}

/** Customize the weekday names to be only the first letter. */
function Weekday({ weekday, className, localeUtils, locale }: WeekdayElementProps) {
  const weekdayName = localeUtils.formatWeekdayLong(weekday, locale);
  return (
    <div className={className} title={weekdayName}>
      {weekdayName.slice(0, 1)}
    </div>
  );
}

/** Positions the calendar decoration within our text field. */
const InputElement = React.forwardRef((props: any, ref: any) => {
  // This is not explicitly in the react-day-picker's props, but gets passed to via
  // via the inputProps populated by react-aria's useTextField
  const disabled = props["disabled"];
  return (
    <>
      <span
        css={{
          ...Css.absolute.top(1).right(1).z1.$,
          ...Css.if(!disabled).cursorPointer.else.cursorNotAllowed.$,
        }}
        onClick={props["onClick"]}
      >
        <Icon color={Palette.Gray700} icon="calendar" />
      </span>
      <input ref={ref} {...props} />
    </>
  );
});

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

function formatDate(date: Date) {
  return dateFnsFormat(date, format);
}
