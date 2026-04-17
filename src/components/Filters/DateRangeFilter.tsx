import { BaseFilter } from "src/components/Filters/BaseFilter";
import { Filter } from "src/components/Filters/types";
import { Label } from "src/components/Label";
import { DateRangeField } from "src/inputs";
import { type DateMatcher, type DateRange } from "src/types";
import { TestIds } from "src/utils";
import { defaultTestId } from "src/utils/defaultTestId";
import { dehydratePlainDate, parsePersistedPlainDate } from "src/utils/plainDate";

export type DateRangeFilterProps<O extends string> = {
  label: string;
  defaultValue?: DateRangeFilterValue<O>;
  placeholderText?: string;
  disabledDays?: DateMatcher | DateMatcher[];
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
  hydrate(value: unknown): DateRangeFilterValue<O> | undefined {
    if (!isDateRangeFilterValue<O>(value)) return undefined;
    const hydratedValue = hydrateDateRange(value.value);
    return hydratedValue ? { op: value.op, value: hydratedValue } : undefined;
  }

  dehydrate(value: DateRangeFilterValue<O> | undefined): unknown {
    return value
      ? {
          op: value.op,
          value: value.value
            ? { from: dehydratePlainDate(value.value.from), to: dehydratePlainDate(value.value.to) }
            : undefined,
        }
      : undefined;
  }

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
          labelStyle="inline"
          isRangeFilterField
          placeholder={placeholderText}
          label={testFieldLabel ?? "Date"}
          value={value?.value}
          onChange={(d: DateRange | undefined) => {
            if (!d) {
              setValue(undefined);
              return;
            }
            const op = value?.op ?? defaultValue?.op;
            if (op !== undefined) {
              setValue({ op, value: d });
            }
          }}
          disabledDays={disabledDays}
          {...tid[`${defaultTestId(this.label)}_dateField`]}
        />
      </>
    );
  }
}

function isDateRangeFilterValue<O extends string>(value: unknown): value is { op: O; value: unknown } {
  return typeof value === "object" && value !== null && "op" in value && "value" in value;
}

function hydrateDateRange(value: unknown): DateRange | undefined {
  if (typeof value !== "object" || value === null) return undefined;
  const { from, to } = value as { from?: unknown; to?: unknown };
  const hydratedFrom = parsePersistedPlainDate(from);
  const hydratedTo = parsePersistedPlainDate(to);
  if (hydratedFrom === undefined && hydratedTo === undefined) return undefined;
  return { from: hydratedFrom, to: hydratedTo };
}
