import type { JSX } from "react";
import { BaseFilter } from "src/components/Filters/BaseFilter";
import { resolveTreeSelectedFilterLabel } from "src/components/Filters/selectedFilterLabelUtils";
import type { Filter, SelectedFilterLabelValue } from "src/components/Filters/types";
import { TreeSelectField, type TreeSelectFieldProps } from "src/inputs/TreeSelectField/TreeSelectField";
import type { TreeSelectResponse } from "src/inputs/TreeSelectField/utils";
import type { Value } from "src/inputs/Value";
import type { TestIds } from "src/utils/useTestIds";

export type TreeFilterProps<O, V extends Value> = Omit<TreeSelectFieldProps<O, V>, "values" | "onSelect" | "label"> & {
  defaultValue?: V[];
  label?: string;
  /** Defines which of the tree values to use in the filter - "root", "leaf", or "all"
   * @default "root" */
  filterBy?: TreeFilterBy;
};

type TreeFilterBy = keyof TreeSelectResponse<any, any>;

export function treeFilter<O, V extends Value>(props: TreeFilterProps<O, V>): (key: string) => Filter<V[]> {
  return (key) => new TreeFilter(key, props);
}

class TreeFilter<O, V extends Value> extends BaseFilter<V[], TreeFilterProps<O, V>> implements Filter<V[]> {
  formatSelectedFilterLabel(value: SelectedFilterLabelValue<V[]>): string | undefined {
    const { options, getOptionValue, getOptionLabel } = this.props;
    return resolveTreeSelectedFilterLabel(options, getOptionValue, getOptionLabel, value);
  }

  render(
    value: V[] | undefined,
    setValue: (value: V[] | undefined) => void,
    tid: TestIds,
    inModal: boolean,
    vertical: boolean,
  ): JSX.Element {
    const { defaultValue, nothingSelectedText, filterBy = "root", ...props } = this.props;
    return (
      <TreeSelectField<O, V>
        {...props}
        label={this.label}
        values={value}
        labelStyle={inModal ? "hidden" : !inModal && !vertical ? "inline" : "above"}
        sizeToContent={!inModal && !vertical}
        onSelect={(options) => {
          const values = options[filterBy].values;
          setValue(values.length === 0 ? undefined : values);
        }}
        nothingSelectedText={nothingSelectedText ?? "All"}
        {...this.testId(tid)}
      />
    );
  }
}
