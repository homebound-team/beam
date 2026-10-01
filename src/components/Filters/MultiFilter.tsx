import type { JSX } from "react";
import { BaseFilter } from "src/components/Filters/BaseFilter";
import { resolveOptionSelectedFilterLabel } from "src/components/Filters/selectedFilterLabelUtils";
import type { Filter, SelectedFilterLabelValue } from "src/components/Filters/types";
import { disabledOptionToKeyedTuple } from "src/inputs/internal/ComboBoxBase";
import { MenuMultiSelectField, type MenuMultiSelectFieldProps } from "src/inputs/MenuSelectField/MenuMultiSelectField";
import { ToggleChipGroup } from "src/inputs/ToggleChipGroup";
import type { Value } from "src/inputs/Value";
import { defaultTestId } from "src/utils/defaultTestId";
import { defaultOptionLabel, defaultOptionValue } from "src/utils/options";
import type { TestIds } from "src/utils/useTestIds";

export type MultiFilterProps<O, V extends Value> = Omit<
  MenuMultiSelectFieldProps<O, V>,
  "values" | "onSelect" | "label"
> & {
  defaultValue?: V[];
  label?: string;
};

export function multiFilter<O, V extends Value>(props: MultiFilterProps<O, V>): (key: string) => Filter<V[]> {
  return (key) => new MultiFilter(key, props);
}

class MultiFilter<O, V extends Value> extends BaseFilter<V[], MultiFilterProps<O, V>> implements Filter<V[]> {
  formatSelectedFilterLabel(value: SelectedFilterLabelValue<V[]>): string | undefined {
    const {
      options,
      getOptionValue = defaultOptionValue as (opt: O) => V,
      getOptionLabel = defaultOptionLabel as (opt: O) => string,
    } = this.props;
    return resolveOptionSelectedFilterLabel(options, getOptionValue, getOptionLabel, value);
  }

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
      const {
        disabledOptions,
        getOptionValue = defaultOptionValue as (opt: O) => V,
        getOptionLabel = defaultOptionLabel as (opt: O) => string,
      } = this.props;
      const disabledOptionsWithReasons = Object.fromEntries(disabledOptions?.map(disabledOptionToKeyedTuple) ?? []);
      const disabledKeys = Object.keys(disabledOptionsWithReasons);
      return (
        <ToggleChipGroup
          label={this.label}
          options={this.props.options.map((o: O) => {
            const value = getOptionValue(o);
            const disabled = value && disabledKeys.includes(value.toString());
            const disabledReason = disabled ? disabledOptionsWithReasons[value.toString()] : undefined;
            return {
              label: getOptionLabel(o),
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
      <MenuMultiSelectField<O, V>
        {...props}
        label={this.label}
        values={value || []}
        labelStyle={inModal ? "hidden" : !inModal && !vertical ? "inline" : "above"}
        onSelect={(values) => {
          setValue(values.length === 0 ? undefined : values);
        }}
        nothingSelectedText={nothingSelectedText ?? "All"}
        {...this.testId(tid)}
      />
    );
  }
}
