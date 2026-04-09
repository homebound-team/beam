import { BaseFilter } from "src/components/Filters/BaseFilter";
import { Filter } from "src/components/Filters/types";
import { CompoundField } from "src/components/internal/CompoundField";
import { Label } from "src/components/Label";
import { DateField, SelectField, Value } from "src/inputs";
import { type PlainDate } from "src/types";
import { TestIds } from "src/utils";
import { defaultTestId } from "src/utils/defaultTestId";
import { dehydratePlainDate, parsePersistedPlainDate, todayPlainDate } from "src/utils/plainDate";

export type DateFilterProps<O, V extends Value, DV extends DateFilterValue<V>> = {
  label: string;
  operations: O[];
  getOperationValue: (o: O) => V;
  getOperationLabel: (o: O) => string;
  defaultValue?: DV;
};

export type DateFilterValue<V extends Value> = { op: V; value: PlainDate };

export function dateFilter<O, V extends Value>(
  props: DateFilterProps<O, V, DateFilterValue<V>>,
): (key: string) => Filter<DateFilterValue<V>> {
  return (key) => new DateFilter(key, props);
}

// Custom option that allows for not selecting an operation
const anyOption = {} as any;

class DateFilter<O, V extends Value, DV extends DateFilterValue<V>>
  extends BaseFilter<DV, DateFilterProps<O, V, DV>>
  implements Filter<DV>
{
  hydrate(value: unknown): DV | undefined {
    if (!isDateFilterValue<V>(value)) return undefined;
    const hydratedValue = parsePersistedPlainDate(value.value);
    return hydratedValue ? ({ op: value.op, value: hydratedValue } as DV) : undefined;
  }

  dehydrate(value: DV | undefined): unknown {
    return value ? { op: value.op, value: dehydratePlainDate(value.value) } : undefined;
  }

  render(value: DV, setValue: (value: DV | undefined) => void, tid: TestIds, inModal: boolean, vertical: boolean) {
    const { label, operations, getOperationValue, getOperationLabel } = this.props;

    return (
      <>
        {vertical && <Label label={label} />}
        <CompoundField>
          <SelectField
            sizeToContent
            options={[
              // Always show the 'Any' option
              anyOption as O,
              ...operations,
            ]}
            getOptionValue={(o) => (o === anyOption ? (undefined as any) : getOperationValue(o))}
            getOptionLabel={(o) => (o === anyOption ? "Any" : getOperationLabel(o))}
            value={value?.op}
            onSelect={(op) =>
              // default the selected date to today if it doesn't exist in the filter's value
              setValue(op ? ({ op, value: value?.value ?? todayPlainDate() } as DV) : undefined)
            }
            label={inModal ? `${label} date filter operation` : label}
            labelStyle={!inModal && !vertical ? "inline" : inModal || vertical ? "hidden" : "above"}
            nothingSelectedText="Any"
            {...tid[`${defaultTestId(this.label)}_dateOperation`]}
          />
          <DateField
            labelStyle="inline"
            value={value?.value ?? todayPlainDate()}
            label="Date"
            onChange={(d) => {
              if (d && value) {
                setValue({ ...value, value: d });
              }
            }}
            disabled={!value}
            {...tid[`${defaultTestId(this.label)}_dateField`]}
          />
        </CompoundField>
      </>
    );
  }
}

function isDateFilterValue<V extends Value>(value: unknown): value is { op: V; value: unknown } {
  return typeof value === "object" && value !== null && "op" in value && "value" in value;
}
