import { BaseFilter } from "src/components/Filters/BaseFilter";
import { Filter } from "src/components/Filters/types";
import { CompoundField } from "src/components/internal/CompoundField";
import { Label } from "src/components/Label";
import { TestIds } from "src/utils";
import { defaultTestId } from "src/utils/defaultTestId";
import { Css } from "../../Css";
import { NumberField, NumberFieldType } from "../../inputs/NumberField";

export type NumberRangeFilterProps<DV extends NumberRangeFilterValue> = {
  label: string;
  numberFieldType?: NumberFieldType;
  defaultValue?: DV;
};

export type NumberRangeFilterValue = { min: number; max: number };

export function numberRangeFilter(
  props: NumberRangeFilterProps<NumberRangeFilterValue>,
): (key: string) => Filter<NumberRangeFilterValue> {
  return (key) => new NumberRangeFilter(key, props);
}

class NumberRangeFilter<DV extends NumberRangeFilterValue>
  extends BaseFilter<DV, NumberRangeFilterProps<DV>>
  implements Filter<DV>
{
  render(value: DV, setValue: (value: DV | undefined) => void, tid: TestIds, inModal: boolean, vertical: boolean) {
    const { label, numberFieldType } = this.props;
    const min = value?.min ?? undefined;
    const max = value?.max ?? undefined;

    return (
      <>
        {/* In vertical view, we stack the number fields */}
        {vertical && (
          <div {...tid}>
            <Label label={label} />
            <div css={Css.pb1.$}>
              <NumberField
                labelStyle="inline"
                clearable
                label="Min"
                value={min}
                type={numberFieldType}
                onChange={(minVal) => {
                  const maxValue = max ? { max } : {};
                  setValue(minVal || max ? ({ min: minVal, ...maxValue } as DV) : undefined);
                }}
                {...tid[`${defaultTestId(label)}_min_vertical`]}
              />
            </div>
            <NumberField
              labelStyle="inline"
              clearable
              label="Max"
              value={max}
              type={numberFieldType}
              onChange={(maxVal) => {
                const minValue = min ? { min } : {};
                setValue(maxVal || min ? ({ max: maxVal, ...minValue } as DV) : undefined);
              }}
              {...tid[`${defaultTestId(label)}_max_vertical`]}
            />
          </div>
        )}

        {/* In horizontal / modal view, we wrap the number fields in a compound field */}
        {!vertical && (
          <CompoundField {...tid}>
            <NumberField
              compact
              sizeToContent={!inModal}
              labelStyle="inline"
              clearable
              // When in horizontal view, we combine the filter label with the min / max labels as all filter labels are displayed inline
              label={!inModal ? `${label} Min` : "Min"}
              value={min}
              type={numberFieldType}
              onChange={(minVal) => {
                const maxValue = max ? { max } : {};
                setValue(minVal || max ? ({ min: minVal, ...maxValue } as DV) : undefined);
              }}
              {...tid[`${defaultTestId(label)}_min`]}
            />
            <NumberField
              compact
              sizeToContent={!inModal}
              labelStyle="inline"
              clearable
              label={!inModal ? `${label} Max` : "Max"}
              value={max}
              type={numberFieldType}
              onChange={(maxVal) => {
                const minValue = min ? { min } : {};
                setValue(maxVal || min ? ({ max: maxVal, ...minValue } as DV) : undefined);
              }}
              {...tid[`${defaultTestId(label)}_max`]}
            />
          </CompoundField>
        )}
      </>
    );
  }
}
