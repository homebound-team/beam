import { BaseFilter } from "src/components/Filters/BaseFilter";
import { resolveOptionSelectedFilterLabel } from "src/components/Filters/selectedFilterLabelUtils";
import type { Filter, SelectedFilterLabelValue } from "src/components/Filters/types";
import { MenuSelectField, type MenuSelectFieldProps } from "src/inputs/MenuSelectField/MenuSelectField";
import type { Value } from "src/inputs/Value";
import { defaultOptionLabel, defaultOptionValue } from "src/utils/options";
import type { TestIds } from "src/utils/useTestIds";

export type SingleFilterProps<O, V extends Value> = Omit<MenuSelectFieldProps<O, V>, "value" | "onSelect" | "label"> & {
  defaultValue?: V;
  label?: string;
};

export function singleFilter<O, V extends Value>(props: SingleFilterProps<O, V>): (key: string) => Filter<V> {
  return (key) => new SingleFilter(key, props);
}

// Make an option that we'll sneak into every select field
const allOption = {} as any;

class SingleFilter<O, V extends Value> extends BaseFilter<V, SingleFilterProps<O, V>> implements Filter<V> {
  formatSelectedFilterLabel(value: SelectedFilterLabelValue<V>): string | undefined {
    const {
      options,
      getOptionValue = defaultOptionValue as (opt: O) => V,
      getOptionLabel = defaultOptionLabel as (opt: O) => string,
    } = this.props;
    return resolveOptionSelectedFilterLabel(options, getOptionValue, getOptionLabel, value as V);
  }

  render(
    value: V | undefined,
    setValue: (value: V | undefined) => void,
    tid: TestIds,
    inModal: boolean,
    vertical: boolean,
  ) {
    const {
      label,
      defaultValue,
      options: maybeOptions,
      getOptionLabel = defaultOptionLabel as (opt: O) => string,
      getOptionValue = defaultOptionValue as (opt: O) => V,
      nothingSelectedText,
      ...props
    } = this.props;

    const options = Array.isArray(maybeOptions)
      ? [allOption as O, ...maybeOptions]
      : { ...maybeOptions, current: maybeOptions.current };

    return (
      <MenuSelectField<O, V>
        {...props}
        options={options}
        getOptionValue={(o) => (o === allOption ? (undefined as any as V) : getOptionValue(o))}
        getOptionLabel={(o) => (o === allOption ? (nothingSelectedText ?? "All") : getOptionLabel(o))}
        value={value}
        label={this.label}
        labelStyle={inModal ? "hidden" : !inModal && !vertical ? "inline" : "above"}
        nothingSelectedText={nothingSelectedText ?? "All"}
        onSelect={(value) => setValue(value || undefined)}
        {...this.testId(tid)}
      />
    );
  }
}
