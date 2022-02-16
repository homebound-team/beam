import React from "react";
import DayPicker, { Modifier, NavbarElementProps, WeekdayElementProps } from "react-day-picker";
import { IconButton } from "src/components/index";
import { Css, Palette } from "src/Css";
import { useTestIds } from "src/utils";
import "./DatePicker.css";

export interface DatePickerProps {
  value?: Date;
  onSelect: (value: Date) => void;
  disabledDays?: Modifier | Modifier[];
}

export function DatePicker(props: DatePickerProps) {
  const { value, onSelect, disabledDays } = props;
  const tid = useTestIds(props, "datePicker");

  return (
    <div
      css={{
        ...Css.dib.bgWhite.xs.$,
        // The S / M / T / W ... heading
        "& .DayPicker-Weekday": Css.pPx(8).xs.gray400.important.$,
        // Un-collapse the borders so we can hover each cell
        "& .DayPicker-Month": Css.add({ borderCollapse: "separate" }).$,
        // // Make the boxes smaller, this ends up being 32x32 which matches figma
        "& .DayPicker-Day": Css.pPx(8).xs.ba.bWhite.br4.$,
        // For today, use a background
        "& .DayPicker-Day--today": Css.bgGray100.$,
        // For selected, use a background - `--outside` modifier is set on placeholder days not within the viewed month
        "& .DayPicker-Day--selected:not(.DayPicker-Day--outside)": Css.bgLightBlue700.white.$,
        // For pressed
        "& .DayPicker-Day:active": Css.bgGray400.$,
        // Make the month title, i.e. "May 2021", match figma; pyPx nudge matches the NavbarElement nudging
        "& .DayPicker-Caption > div": Css.base.pyPx(2).$,
        // For days that are disabled via `disabledDays`,
        "& .DayPicker-Day--disabled": Css.cursorNotAllowed.$,
        // Override `.DayPicker-Day:active` background when the day is disabled
        "& .DayPicker-Day--disabled:active": Css.bgWhite.$,
      }}
      {...tid}
    >
      <DayPicker
        navbarElement={NavbarElement}
        weekdayElement={Weekday}
        selectedDays={[value]}
        initialMonth={value ?? new Date()}
        onDayClick={(day, modifiers) => {
          if (modifiers.disabled) return;
          // Set the day value
          onSelect(day);
        }}
        disabledDays={disabledDays}
      />
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
