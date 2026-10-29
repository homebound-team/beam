import { BaseFilter } from "src/components/Filters/BaseFilter";
import { resolveOptionSelectedFilterLabel } from "src/components/Filters/selectedFilterLabelUtils";
import type { Filter, SelectedFilterLabelValue } from "src/components/Filters/types";
import { MenuSelectField } from "src/inputs/MenuSelectField/MenuSelectField";
import type { MenuSelectFieldProps } from "src/inputs/MenuSelectField/types";
import type { Value } from "src/inputs/Value";
import type { TestIds } from "src/utils/useTestIds";

export type SingleFilterProps<O, V extends Value> = Omit<MenuSelectFieldProps<O, V>, "value" | "onSelect" | "label"> & {
  defaultValue?: V;
  label?: string;
};

export function singleFilter<O, V extends Value>(props: SingleFilterProps<O, V>): (key: string) => Filter<V> {
  return (key) => new SingleFilter(key, props);
}

class SingleFilter<O, V extends Value> extends BaseFilter<V, SingleFilterProps<O, V>> implements Filter<V> {
  formatSelectedFilterLabel(value: SelectedFilterLabelValue<V>): string | undefined {
    const { options } = this.props;
    const { getOptionValue, getOptionLabel } = optionReaders(this.props);
    return resolveOptionSelectedFilterLabel(options, getOptionValue, getOptionLabel, value as V);
  }

  render(
    value: V | undefined,
    setValue: (value: V | undefined) => void,
    tid: TestIds,
    inModal: boolean,
    vertical: boolean,
  ) {
    const { label, defaultValue, nothingSelectedText, unsetLabel, ...props } = this.props;

    return (
      <MenuSelectField<O, V>
        {...props}
        unsetLabel={unsetLabel ?? nothingSelectedText ?? "All"}
        value={value}
        label={this.label}
        labelStyle={inModal ? "hidden" : !inModal && !vertical ? "inline" : "above"}
        onSelect={(next) => setValue(next || undefined)}
        {...this.testId(tid)}
      />
    );
  }
}

function optionReaders<O, V extends Value>(props: SingleFilterProps<O, V>) {
  return {
    getOptionValue: props.getOptionValue ?? ((option: O) => (option as { id: V }).id),
    getOptionLabel: props.getOptionLabel ?? ((option: O) => (option as { name: string }).name),
  };
}
