import React from "react";
import { FocusScope } from "react-aria";
import DayPicker, { NavbarElementProps, WeekdayElementProps } from "react-day-picker";
import { OverlayTriggerState } from "react-stately";
import { IconButton } from "src/components";
import { Css, Palette } from "src/Css";
import { useTestIds } from "src/utils";

interface DatePickerOverlayProps {
  value: Date | undefined;
  state: OverlayTriggerState;
  positionProps: React.HTMLAttributes<Element>;
  onChange: (value: Date) => void;
}

export function DatePickerOverlay(props: DatePickerOverlayProps) {
  const { value, state, positionProps, onChange } = props;
  // We define some spacing between the Calendar overlay and the trigger element, and depending on where the overlay renders (above or below) we need to adjust the spacing.
  // We can determine if the position was flipped based on what style is defined, `top` (for positioned below the trigger), and `bottom` (for above the trigger).
  // The above assumption regarding `top` and `bottom` is true as long as we use `bottom` as our default `OverlayPosition.placement` (set in DateField).
  // The reason the placement may not be on bottom even though we set `bottom` is because also set `shouldFlip: true`
  const isPositionedAbove = !positionProps.style?.top;
  const tid = useTestIds(props, "datePicker");

  return (
    // Wrap in `FocusScope` to move focus immediately into this overlay (autoFocus).
    // This allows the DateField to work properly within a Modal, which has its own FocusScope and did not like allowing the user to interact with another overlay.
    // Also using `contain` to ensure tabbing only moves within this overlay, otherwise you could tab out of the overlay and it'd stay open.
    <FocusScope contain autoFocus>
      <div
        css={{
          ...Css.bgWhite.xs.br4.bshModal.$,
          ...(isPositionedAbove ? Css.mbPx(4).$ : Css.mtPx(4).$),
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
        }}
        {...tid}
      >
        <DayPicker
          navbarElement={NavbarElement}
          weekdayElement={Weekday}
          selectedDays={[value]}
          initialMonth={value ?? new Date()}
          onDayClick={(day) => {
            // Set the day value, and close the picker.
            onChange(day);
            state.close();
          }}
        />
      </div>
    </FocusScope>
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
