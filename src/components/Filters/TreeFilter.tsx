import type { JSX } from "react";
import { BaseFilter } from "src/components/Filters/BaseFilter";
import { resolveTreeSelectedFilterLabel } from "src/components/Filters/selectedFilterLabelUtils";
import type { Filter, SelectedFilterLabelValue } from "src/components/Filters/types";
import { MenuTreeSelectField, type MenuTreeSelectFieldProps } from "src/inputs/MenuSelectField/MenuTreeSelectField";
import type { TreeSelectionDisplay } from "src/inputs/MenuSelectField/types";
import type { Value } from "src/inputs/Value";
import type { TestIds } from "src/utils/useTestIds";

export type TreeFilterProps<O, V extends Value> = Omit<
  MenuTreeSelectFieldProps<O, V>,
  "values" | "onSelect" | "label" | "selectionDisplay"
> & {
  defaultValue?: V[];
  label?: string;
  /** Which selected values the filter stores: `"root"`, `"leaf"`, or `"all"`. @default "root" */
  filterBy?: TreeSelectionDisplay;
};

export function treeFilter<O, V extends Value>(props: TreeFilterProps<O, V>): (key: string) => Filter<V[]> {
  return (key) => new TreeFilter(key, props);
}

class TreeFilter<O, V extends Value> extends BaseFilter<V[], TreeFilterProps<O, V>> implements Filter<V[]> {
  formatSelectedFilterLabel(value: SelectedFilterLabelValue<V[]>): string | undefined {
    const { options } = this.props;
    const { getOptionValue, getOptionLabel } = optionReaders(this.props);
    return resolveTreeSelectedFilterLabel(options, getOptionValue, getOptionLabel, value);
  }

  render(
    value: V[] | undefined,
    setValue: (value: V[] | undefined) => void,
    tid: TestIds,
    inModal: boolean,
    vertical: boolean,
  ): JSX.Element {
    const { defaultValue, nothingSelectedText, filterBy = "root", defaultExpanded, ...props } = this.props;
    return (
      <MenuTreeSelectField<O, V>
        {...props}
        label={this.label}
        values={value ?? []}
        labelStyle={inModal ? "hidden" : !inModal && !vertical ? "inline" : "above"}
        selectionDisplay={filterBy}
        defaultExpanded={defaultExpanded}
        onSelect={(response) => {
          const values = response[filterBy].values;
          setValue(values.length === 0 ? undefined : values);
        }}
        nothingSelectedText={nothingSelectedText ?? "All"}
        {...this.testId(tid)}
      />
    );
  }
}

function optionReaders<O, V extends Value>(props: TreeFilterProps<O, V>) {
  return {
    getOptionValue: props.getOptionValue ?? ((option: O) => (option as { id: V }).id),
    getOptionLabel: props.getOptionLabel ?? ((option: O) => (option as { name: string }).name),
  };
}
