import { Key, useState } from "react";
import { BaseFilter } from "src/components/Filters/BaseFilter";
import { Filter } from "src/components/Filters/types";
import { Label } from "src/components/Label";
import { Css } from "src/Css";
import { DateField, SelectField, Value } from "src/inputs";
import { TestIds } from "src/utils";
import { defaultTestId } from "src/utils/defaultTestId";

export type DateFilterProps<O, V extends Value, DV extends DateFilterValue<V>> = {
  label: string;
  operations: O[];
  getOperationValue: (o: O) => V;
  getOperationLabel: (o: O) => string;
  defaultValue?: DV;
};

export type DateFilterValue<V extends Value> = { op: V; value: Date };

export function dateFilter<O, V extends Key>(
  props: DateFilterProps<O, V, DateFilterValue<V>>,
): (key: string) => Filter<DateFilterValue<V>> {
  return (key) => new DateFilter(key, props);
}

// Custom option that allows for not selecting an operation
const anyOption = {} as any;

class DateFilter<O, V extends Key, DV extends DateFilterValue<V>>
  extends BaseFilter<DV, DateFilterProps<O, V, DV>>
  implements Filter<DV>
{
  render(value: DV, setValue: (value: DV | undefined) => void, tid: TestIds, inModal: boolean, vertical: boolean) {
    const { label, operations, getOperationValue, getOperationLabel } = this.props;
    const [focusedEl, setFocusedEl] = useState<"op" | "date" | undefined>();
    const commonStyles = Css.df.aic.fs1.maxwPx(550).bt.bb.bGray300.$;

    // TODO: Maybe make a `CompoundField` component, which could handle the `display: flex` and any sizing requirements per field and focus states.
    return (
      <>
        {vertical && <Label label={label} />}
        <div {...this.testId(tid)} css={Css.df.$}>
          <div
            css={{
              ...commonStyles,
              ...Css.bl.borderRadius("4px 0 0 4px").if(focusedEl === "op").bLightBlue700.$,
            }}
          >
            <SelectField
              compact
              borderless
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
                setValue(op ? ({ op, value: value?.value ? new Date(value.value) : new Date() } as DV) : undefined)
              }
              label={inModal ? `${label} date filter operation` : label}
              inlineLabel={!inModal && !vertical}
              hideLabel={inModal || vertical}
              nothingSelectedText="Any"
              {...tid[`${defaultTestId(this.label)}_dateOperation`]}
              onFocus={() => setFocusedEl("op")}
              onBlur={() => setFocusedEl(undefined)}
            />
          </div>

          {/* Separation line */}
          <div css={Css.wPx(1).flexNone.bgGray300.if(focusedEl !== undefined).bgLightBlue700.$} />

          <div
            css={{
              ...commonStyles,
              ...Css.fg1.br.borderRadius("0 4px 4px 0").if(focusedEl === "date").bLightBlue700.$,
            }}
          >
            <DateField
              borderless
              compact
              inlineLabel
              value={value?.value ? new Date(value.value) : new Date()}
              label="Date"
              onChange={(d) => setValue({ ...value, value: d })}
              disabled={!value}
              {...tid[`${defaultTestId(this.label)}_dateField`]}
              onFocus={() => setFocusedEl("date")}
              onBlur={() => setFocusedEl(undefined)}
            />
          </div>
        </div>
      </>
    );
  }
}
