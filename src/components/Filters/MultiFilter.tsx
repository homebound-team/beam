import { BaseFilter } from "src/components/Filters/BaseFilter";
import { Filter } from "src/components/Filters/types";
import { disabledOptionToKeyedTuple } from "src/inputs/internal/ComboBoxBase";
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

// react-aria's Key type (string | number) diverged from React.Key (includes bigint) in v3.33+;
// use Value (string | number | undefined) instead of React.Key to avoid bigint constraint errors
export function multiFilter<O, V extends Value>(props: MultiFilterProps<O, V>): (key: string) => Filter<V[]> {
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
    if (
      inModal &&
      Array.isArray(this.props.options) &&
      this.props.options.length > 0 &&
      this.props.options.length <= 8
    ) {
      const { disabledOptions } = this.props;
      const disabledOptionsWithReasons = Object.fromEntries(disabledOptions?.map(disabledOptionToKeyedTuple) ?? []);
      const disabledKeys = Object.keys(disabledOptionsWithReasons);
      return (
        <ToggleChipGroup
          label={this.label}
          options={this.props.options.map((o: O) => {
            const value = this.props.getOptionValue(o);
            const disabled = value && disabledKeys.includes(value.toString());
            const disabledReason = disabled ? disabledOptionsWithReasons[value.toString()] : undefined;
            return {
              label: this.props.getOptionLabel(o),
              value: value as string,
              disabled: disabledReason ?? disabled,
            };
          })}
          onChange={(values) => {
            setValue(values.length === 0 ? undefined : (values as V[]));
          }}
          values={(value as string[]) || []}
          labelStyle="hidden"
          {...tid[defaultTestId(this.label)]}
        />
      );
    }

    const { defaultValue, nothingSelectedText, ...props } = this.props;
    return (
      <MultiSelectField<O, V>
        {...props}
        label={this.label}
        values={value || []}
        labelStyle={inModal ? "hidden" : !inModal && !vertical ? "inline" : "above"}
        sizeToContent={!inModal && !vertical}
        onSelect={(values) => {
          setValue(values.length === 0 ? undefined : values);
        }}
        nothingSelectedText={nothingSelectedText ?? "All"}
        {...this.testId(tid)}
      />
    );
  }
}
