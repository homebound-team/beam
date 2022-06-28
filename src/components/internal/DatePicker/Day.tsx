import React, { useRef } from "react";
import { DayProps, useDayRender } from "react-day-picker";
import { Css } from "src/Css";
import { useTestIds } from "src/utils";

/** Follows the same pattern as defined by the React-Day-Picker 'Day' component, plus sprinkling our own styling */
export function Day(props: DayProps) {
  // Was hoping we could pass the `datePicker` testid through, but was breaking something.
  const tid = useTestIds(props, "datePickerDay");
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { isHidden, isButton, activeModifiers, buttonProps, divProps } = useDayRender(
    props.date,
    props.displayMonth,
    buttonRef,
  );

  if (isHidden) {
    return <></>;
  }
  if (!isButton) {
    return <div {...divProps} />;
  }

  const { className, children, ...otherProps } = buttonProps;
  const {
    selected = false,
    indicatorDot = false,
    disabled = false,
    today = false,
    range_middle = false,
    range_start = false,
    range_end = false,
  } = activeModifiers;

  // It is possible that we have selected only one day for the range. In this case the date will be both the start and end.
  // When this happens, do not show styling as if there is an existing range.
  const showRangeStyles = !(range_end === true && range_start === true);
  const showActiveStyles = !disabled;

  return (
    <button
      {...otherProps}
      ref={buttonRef}
      type="button"
      css={{
        ...Css.relative.pbPx(4).outline0.if(disabled).cursorNotAllowed.$,
        // Do not apply interaction styles for disabled or already selected days.
        ...(!selected &&
          !disabled && {
            "&:hover:not(:active) > div": Css.bgGray100.$,
          }),
        ...(!disabled && { "&:active > div": Css.bgGray400.gray900.$ }),
        "&:focus:not(:active) > div": Css.ba.bLightBlue700.if(selected).bLightBlue900.$,
        ...(showRangeStyles &&
          range_start &&
          Css.addIn(":after", { ...rangeBaseStyles, ...Css.rightPx(-2).wPx(8).$ }).$),
        ...(showRangeStyles && range_end && Css.addIn(":after", { ...rangeBaseStyles, ...Css.wPx(8).leftPx(-2).$ }).$),
        ...(showRangeStyles && range_middle && Css.addIn(":after", { ...rangeBaseStyles, ...Css.leftPx(-2).$ }).$),
      }}
      {...tid}
    >
      <div
        css={{
          ...Css.overflowHidden.gray900.relative.z1.br4.df.aic.jcc.wPx(28).hPx(30).mtPx(2).br4.$,
          ...(today && !range_middle && Css.bgGray100.$),
          ...(selected && !range_middle && Css.white.bgLightBlue700.$),
          ...(disabled && Css.gray500.$),
        }}
      >
        <div css={Css.mtPx(-2).$}>{children}</div>
        {indicatorDot && (
          <div
            // Using `absolute` position as to not change the placement of the day's number when this is introduced
            css={
              Css.absolute
                .bottomPx(4)
                .wPx(4)
                .hPx(4)
                .bgLightBlue700.br4.if(selected && !range_middle).bgWhite.$
            }
            {...tid.indicatorDot}
          />
        )}
      </div>
    </button>
  );
}

const rangeBaseStyles = Css.absolute.topPx(2).contentEmpty.hPx(30).wPx(32).bgLightBlue100.$;
