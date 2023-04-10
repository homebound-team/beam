import { Key } from "react";
import { BaseFilter } from "src/components/Filters/BaseFilter";
import { Filter } from "src/components/Filters/types";
import { TreeSelectField, TreeSelectFieldProps, Value } from "src/inputs";
import { TreeSelectResponse } from "src/inputs/TreeSelectField/utils";
import { TestIds } from "src/utils";

export type TreeFilterProps<O, V extends Value> = Omit<TreeSelectFieldProps<O, V>, "values" | "onSelect" | "label"> & {
  defaultValue?: V[];
  label?: string;
  /** Defines which of the tree values to use in the filter - "root", "leaf", or "all"
   * @default "root" */
  filterBy?: TreeFilterBy;
};

type TreeFilterBy = keyof TreeSelectResponse<any, any>;

export function treeFilter<O, V extends Key>(props: TreeFilterProps<O, V>): (key: string) => Filter<V[]> {
  return (key) => new TreeFilter(key, props);
}

class TreeFilter<O, V extends Value> extends BaseFilter<V[], TreeFilterProps<O, V>> implements Filter<V[]> {
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
        compact={!vertical}
        labelStyle={inModal ? "hidden" : !inModal && !vertical ? "inline" : "above"}
        sizeToContent={!inModal && !vertical}
        onSelect={(options) => setValue(options[filterBy].values)}
        nothingSelectedText={nothingSelectedText ?? "All"}
        {...this.testId(tid)}
      />
    );
  }
}
