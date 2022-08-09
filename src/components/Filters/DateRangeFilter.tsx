import { Key } from "react";
import { Matcher } from "react-day-picker";
import { BaseFilter } from "src/components/Filters/BaseFilter";
import { Filter } from "src/components/Filters/types";
import { Label } from "src/components/Label";
import { DateRangeField, Value } from "src/inputs";
import { DateRange } from "src/types";
import { TestIds } from "src/utils";
import { defaultTestId } from "src/utils/defaultTestId";

export type DateRangeFilterProps<V extends Value, DV extends DateRangeFilterValue<V>> = {
  label: string;
  defaultValue?: DV;
  placeholderText?: string;
  disabledDays?: Matcher | Matcher[];
  // For storybook to support showing dateRange and date filters in same Filter component
  testFieldLabel?: string;
};

// Using op to align with what is expected from DateFilter at this time.
// In the future we should remove that coupling and rely on user to map returned value
export type DateRangeFilterValue<V extends Value> = { op: V; value: DateRange | undefined };

export function dateRangeFilter<V extends Key>(
  props: DateRangeFilterProps<V, DateRangeFilterValue<V>>,
): (key: string) => Filter<DateRangeFilterValue<V>> {
  return (key) => new DateRangeFilter(key, props);
}

class DateRangeFilter<V extends Key, DV extends DateRangeFilterValue<V>>
  extends BaseFilter<DV, DateRangeFilterProps<V, DV>>
  implements Filter<DV>
{
  render(value: DV, setValue: (value: DV | undefined) => void, tid: TestIds, inModal: boolean, vertical: boolean) {
    const { label, placeholderText, disabledDays, testFieldLabel, defaultValue } = this.props;

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
          value={
            value?.value
              ? { from: new Date(value.value.from as Date), to: new Date(value.value.to as Date) }
              : undefined
          }
          onChange={(d) => (d ? setValue({ op: defaultValue?.op, value: d } as DV) : setValue(undefined))}
          disabledDays={disabledDays}
          {...tid[`${defaultTestId(this.label)}_dateField`]}
        />
      </>
    );
  }
}
