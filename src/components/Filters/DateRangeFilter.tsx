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
  clearable?: boolean;
  placeholderText?: string;
  disabledDays?: Matcher | Matcher[];
};

// Just make equivalent to DateFilter? or use same thing?
// Does this value need to be DateRange type?
export type DateRangeFilterValue = { value: DateRange | undefined };
// export type DateRangeFilterValue = { value: DateRange };

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
    value: DateRangeFilterValue | undefined,
    setValue: (value: DateRangeFilterValue | undefined) => void,
    tid: TestIds,
    inModal: boolean,
    vertical: boolean,
  ) {
    const { label, placeholderText, disabledDays } = this.props;

    return (
      <>
        {vertical && <Label label={label} />}
        <DateRangeField
          compact
          inlineLabel
          isRangeFilterField
          placeholder={placeholderText}
          label="Date"
          value={value?.value}
          onChange={(d) => setValue({ value: d })}
          disabled={!value}
          disabledDays={disabledDays}
          {...tid[`${defaultTestId(this.label)}_dateField`]}
        />
      </>
    )
  }
}