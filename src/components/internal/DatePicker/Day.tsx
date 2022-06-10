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
  const { selected = false, indicatorDot = false, disabled = false, today = false } = activeModifiers;

  return (
    <button
      {...otherProps}
      ref={buttonRef}
      type="button"
      css={{
        ...Css.overflowHidden.pbPx(4).if(disabled).cursorNotAllowed.$,
        // Do not apply interaction styles for disabled or already selected days.
        ...(!selected &&
          !disabled && {
            "&:hover:not(:active) > div": Css.bgGray100.$,
            "&:active > div": Css.bgGray400.$,
          }),
      }}
      {...tid}
    >
      <div
        css={{
          ...Css.relative.br4.df.aic.jcc.wPx(28).hPx(30).mtPx(2).br4.$,
          ...(selected && Css.white.bgLightBlue700.$),
          ...(disabled && Css.gray500.$),
          ...(today && Css.bgGray100.$),
        }}
      >
        <div css={Css.mtPx(-2).$}>{children}</div>
        {indicatorDot && (
          <div
            // Using `absolute` position as to not change the placement of the day's number when this is introduced
            css={Css.absolute.bottomPx(4).wPx(4).hPx(4).bgLightBlue700.br4.if(selected).bgWhite.$}
            {...tid.indicatorDot}
          />
        )}
      </div>
    </button>
  );
}
