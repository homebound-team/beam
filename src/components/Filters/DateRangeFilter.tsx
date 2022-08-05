import { Matcher } from "react-day-picker";

import { BaseFilter } from "src/components/Filters/BaseFilter";
import { Filter } from "src/components/Filters/types";
import { Label } from "src/components/Label";
import { DateRangeField } from "src/inputs";
import { TestIds } from "src/utils";
import { defaultTestId } from "src/utils/defaultTestId";
import { DateRange } from "src/types";

export type DateRangeFilterProps = {
  label: string;
  defaultValue?: DateRangeFilterValue;
  placeholderText?: string;
  disabledDays?: Matcher | Matcher[];
  // For storybook to support showing dateRange and date filters in same Filter component
  testFieldLabel?: string
};

export type DateRangeFilterValue = { value: DateRange | undefined};

export function dateRangeFilter(
  props: DateRangeFilterProps,
): (key: string) => Filter<DateRangeFilterValue> {
  return (key) => new DateRangeFilter(key, props);
}

class DateRangeFilter
  extends BaseFilter<DateRangeFilterValue, DateRangeFilterProps>
  implements Filter<DateRangeFilterValue>
{
  render(
    value: DateRangeFilterValue,
    setValue: (value: DateRangeFilterValue | undefined) => void,
    tid: TestIds,
    inModal: boolean,
    vertical: boolean,
  ) {
    const { label, placeholderText, disabledDays, testFieldLabel } = this.props;

    return (
      <>
        {vertical && <Label label={label} />}
        <DateRangeField
          compact
          inlineLabel
          isRangeFilterField
          placeholder={placeholderText}
          label={testFieldLabel ?? "Date"}
          // Making sure that DateRange is Date type and not string before passing. Will never have undefined from/to
          value={value?.value ? { from: new Date(value.value.from as Date), to: new Date(value.value.to as Date) } : undefined}
          onChange={(d) => setValue(d ? { value: d } : undefined) }
          disabledDays={disabledDays}
          {...tid[`${defaultTestId(this.label)}_dateField`]}
        />
      </>
    )
  }
}