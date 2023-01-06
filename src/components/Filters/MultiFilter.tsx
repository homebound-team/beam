import { Key } from "react";
import { BaseFilter } from "src/components/Filters/BaseFilter";
import { Filter } from "src/components/Filters/types";
import { disabledOptionToKeyedTuple } from "src/inputs/internal/SelectFieldBase";
import { MultiSelectField, MultiSelectFieldProps } from "src/inputs/MultiSelectField";
import { ToggleChipGroup } from "src/inputs/ToggleChipGroup";
import { Value } from "src/inputs/Value";
import { defaultTestId } from "src/utils/defaultTestId";
import { TestIds } from "src/utils/useTestIds";

export type MultiFilterProps<O, V extends Value> = Omit<
  MultiSelectFieldProps<O, V>,
  "values" | "onSelect" | "label"
> & {
  defaultValue?: V[];
  label?: string;
};

export function multiFilter<O, V extends Key>(props: MultiFilterProps<O, V>): (key: string) => Filter<V[]> {
  return (key) => new MultiFilter(key, props);
}

class MultiFilter<O, V extends Value> extends BaseFilter<V[], MultiFilterProps<O, V>> implements Filter<V[]> {
  render(
    value: V[] | undefined,
    setValue: (value: V[] | undefined) => void,
    tid: TestIds,
    inModal: boolean,
    vertical: boolean,
  ): JSX.Element {
    if (inModal && this.props.options.length > 0 && this.props.options.length <= 8) {
      const { disabledOptions } = this.props;
      const disabledOptionsWithReasons = Object.fromEntries(disabledOptions?.map(disabledOptionToKeyedTuple) ?? []);
      const disabledKeys = Object.keys(disabledOptionsWithReasons);
      return (
        <ToggleChipGroup
          label={this.label}
          options={this.props.options.map((o: O) => {
            const value = this.props.getOptionValue(o);
            const isDisabled = value && disabledKeys.includes(value.toString());
            const disabledReason = isDisabled ? disabledOptionsWithReasons[value.toString()] : undefined;
            return {
              label: this.props.getOptionLabel(o),
              value: value as string,
              isDisabled,
              disabledReason,
            };
          })}
          onChange={(values) => {
            setValue(values.length === 0 ? undefined : (values as V[]));
          }}
          values={(value as string[]) || []}
          hideLabel={true}
          {...tid[defaultTestId(this.label)]}
        />
      );
    }

    const { defaultValue, ...props } = this.props;
    return (
      <MultiSelectField<O, V>
        {...props}
        compact={!vertical}
        label={this.label}
        values={value || []}
        labelStyle={inModal ? "hidden" : !inModal && !vertical ? "inline" : "above"}
        sizeToContent={!inModal && !vertical}
        onSelect={(values) => {
          setValue(values.length === 0 ? undefined : values);
        }}
        nothingSelectedText="All"
        {...this.testId(tid)}
      />
    );
  }
}
