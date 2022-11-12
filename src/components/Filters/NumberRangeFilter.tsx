import { Key } from "react";
import { BaseFilter } from "src/components/Filters/BaseFilter";
import { Filter } from "src/components/Filters/types";
import { CompoundField } from "src/components/internal/CompoundField";
import { Label } from "src/components/Label";
import { Value } from "src/inputs";
import { TestIds } from "src/utils";
import { defaultTestId } from "src/utils/defaultTestId";
import { Css } from "../../Css";
import { NumberField, NumberFieldType } from "../../inputs/NumberField";

export type NumberRangeFilterProps<V extends Value, DV extends NumberRangeFilterValue<V>> = {
  label: string;
  numberFieldType?: NumberFieldType;
  defaultValue?: DV;
};

export type NumberRangeFilterValue<V extends Value> = { min: V; max: V };

export function numberRangeFilter<V extends Key>(
  props: NumberRangeFilterProps<V, NumberRangeFilterValue<V>>,
): (key: string) => Filter<NumberRangeFilterValue<V>> {
  return (key) => new NumberRangeFilter(key, props);
}

class NumberRangeFilter<V extends Key, DV extends NumberRangeFilterValue<V>>
  extends BaseFilter<DV, NumberRangeFilterProps<V, DV>>
  implements Filter<DV>
{
  render(value: DV, setValue: (value: DV | undefined) => void, tid: TestIds, inModal: boolean, vertical: boolean) {
    const { label, numberFieldType } = this.props;
    const max = (value?.max as number) ?? undefined;
    const min = (value?.min as number) ?? undefined;

    return (
      <>
        {/* In vertical view, we stack the number fields */}
        {vertical && (
          <div {...tid}>
            <Label label={label} />
            <div css={Css.pb1.$}>
              <NumberField
                inlineLabel
                clearable
                label="Min"
                value={min}
                type={numberFieldType}
                onChange={(minVal) => {
                  const maxValue = max ? { max } : {};
                  setValue(minVal || max ? ({ min: minVal, ...maxValue } as DV) : undefined);
                }}
                {...tid[`${defaultTestId(this.label)}_min_vertical`]}
              />
            </div>
            <NumberField
              inlineLabel
              clearable
              label="Max"
              value={max}
              type={numberFieldType}
              onChange={(maxVal) => {
                const minValue = min ? { min } : {};
                setValue(maxVal || min ? ({ max: maxVal, ...minValue } as DV) : undefined);
              }}
              {...tid[`${defaultTestId(this.label)}_max_vertical`]}
            />
          </div>
        )}

        {/* In horizontal / modal view, we wrap the number fields in a compound field */}
        {!vertical && (
          <CompoundField {...tid}>
            <NumberField
              compact
              sizeToContent={!inModal}
              inlineLabel
              clearable
              // When in horizontal view, we combine the filter label with the min / max labels as they are displayed inline
              // i.e. "Price Min" / "Price Max"
              label={!inModal ? `${this.label} Min` : "Min"}
              value={min}
              type={numberFieldType}
              onChange={(minVal) => {
                const maxValue = max ? { max } : {};
                setValue(minVal || max ? ({ min: minVal, ...maxValue } as DV) : undefined);
              }}
              {...tid[`${defaultTestId(this.label)}_min`]}
            />
            <NumberField
              compact
              sizeToContent={!inModal}
              inlineLabel
              clearable
              label={!inModal ? `${this.label} Max` : "Max"}
              value={max}
              type={numberFieldType}
              onChange={(maxVal) => {
                const minValue = min ? { min } : {};
                setValue(maxVal || min ? ({ max: maxVal, ...minValue } as DV) : undefined);
              }}
              {...tid[`${defaultTestId(this.label)}_max`]}
            />
          </CompoundField>
        )}
      </>
    );
  }
}
