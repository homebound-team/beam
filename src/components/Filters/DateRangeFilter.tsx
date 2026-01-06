import { Matcher } from "react-day-picker";
import { BaseFilter } from "src/components/Filters/BaseFilter";
import { Filter } from "src/components/Filters/types";
import { Label } from "src/components/Label";
import { DateRangeField } from "src/inputs";
import { DateRange } from "src/types";
import { TestIds } from "src/utils";
import { defaultTestId } from "src/utils/defaultTestId";

export type DateRangeFilterProps<O extends string> = {
  label: string;
  defaultValue?: DateRangeFilterValue<O>;
  placeholderText?: string;
  disabledDays?: Matcher | Matcher[];
  // For storybook to support showing dateRange and date filters in same Filter component
  testFieldLabel?: string;
};

// Using op (as in `op: "between"`) to align with what is expected from DateFilter at this time.
// In the future we should remove that coupling and rely on user to map returned value
export type DateRangeFilterValue<O extends string> = { op: O; value: DateRange | undefined };

export function dateRangeFilter<O extends string>(
  props: DateRangeFilterProps<O>,
): (key: string) => Filter<DateRangeFilterValue<O>> {
  return (key) => new DateRangeFilter(key, props);
}

class DateRangeFilter<O extends string>
  extends BaseFilter<DateRangeFilterValue<O>, DateRangeFilterProps<O>>
  implements Filter<DateRangeFilterValue<O>>
{
  render(
    value: DateRangeFilterValue<O>,
    setValue: (value: DateRangeFilterValue<O> | undefined) => void,
    tid: TestIds,
    inModal: boolean,
    vertical: boolean,
  ) {
    const { label, placeholderText, disabledDays, testFieldLabel, defaultValue } = this.props;
    return (
      <>
        {vertical && <Label label={label} />}
        <DateRangeField
          compact={false}
          labelStyle="inline"
          isRangeFilterField
          placeholder={placeholderText}
          label={testFieldLabel ?? "Date"}
          // Making sure that DateRange is Date type and not string before passing. Will never have undefined from/to
          value={
            value?.value
              ? { from: new Date(value.value.from as Date), to: new Date(value.value.to as Date) }
              : undefined
          }
          onChange={(d) => (d ? setValue({ op: defaultValue?.op, value: d } as any) : setValue(undefined))}
          disabledDays={disabledDays}
          {...tid[`${defaultTestId(this.label)}_dateField`]}
        />
      </>
    );
  }
}
