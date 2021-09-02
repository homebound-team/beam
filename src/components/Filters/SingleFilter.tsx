import { Key } from "react";
import { BaseFilter } from "src/components/Filters/BaseFilter";
import { Filter } from "src/components/Filters/types";
import { SelectField, SelectFieldProps } from "src/inputs/SelectField";
import { Value } from "src/inputs/Value";
import { TestIds } from "src/utils/useTestIds";

export type SingleFilterProps<O, V extends Value> = Omit<SelectFieldProps<O, V>, "value" | "onSelect"> & {
  defaultValue?: V;
};

export function singleFilter<O, V extends Key>(props: SingleFilterProps<O, V>): (key: string) => Filter<V> {
  return (key) => new SingleFilter(key, props);
}

// Make an option that we'll sneak into every select field
const allOption = {} as any;

class SingleFilter<O, V extends Key> extends BaseFilter<V, SingleFilterProps<O, V>> implements Filter<V> {
  render(value: V | undefined, setValue: (value: V | undefined) => void, tid: TestIds, inModal: boolean) {
    const { label, defaultValue, options, getOptionLabel, getOptionValue, ...props } = this.props;
    return (
      <SelectField<O, V>
        {...props}
        options={[
          // We always add "All" as the 1st option, to allow unselecting with a click
          allOption as O,
          ...options,
        ]}
        getOptionValue={(o) => (o === allOption ? (undefined as any as V) : getOptionValue(o))}
        getOptionLabel={(o) => (o === allOption ? "All" : getOptionLabel(o))}
        compact
        value={value}
        label={this.label}
        inlineLabel={!inModal}
        hideLabel={inModal}
        sizeToContent={!inModal}
        nothingSelectedText="All"
        onSelect={(value) => setValue(value || undefined)}
        {...this.testId(tid)}
      />
    );
  }
}
