import React, { Dispatch, SetStateAction, useContext, useMemo, useState } from "react";
import { HasIdAndName, Optional } from "../types";
import { Value } from "./index";
import { BeamSelectFieldBaseProps, NestedOption, SelectFieldBase } from "./internal/SelectFieldBase";

export interface TreeSelectFieldProps<O, V extends Value>
  extends Exclude<BeamSelectFieldBaseProps<O, V>, "unsetLabel"> {
  /** Renders `opt` in the dropdown menu, defaults to the `getOptionLabel` prop. */
  getOptionValue: (opt: O) => V;
  getOptionLabel: (opt: O) => string;
  values: V[];
  onSelect: (values: V[], opts: O[]) => void;
  options: NestedOption<O>[];
}

interface ExpandableChildrenState {
  isExpanded: boolean;
  setIsExpanded: Dispatch<SetStateAction<boolean>>;
}
// create the context to hold the collapsed state, default should be false
export const CollapsedContext = React.createContext<ExpandableChildrenState>({
  isExpanded: false,
  setIsExpanded: () => {},
});

// interface TreeSelectProviderProps extends PropsWithChildren<ExpandableChildrenState> {}
//
// function TreeSelectProvider({ children, isExpanded }: TreeSelectProviderProps) {
//   // const [isExpanded, setIsExpanded] = useState<ExpandableChildrenState>({
//   //   isExpanded: false,
//   //   setIsExpanded: () => {},
//   // });
//
//
// }

// 1. create the context provider separate
// 2. when calling the TreeSelectField component - then that is the "child" that gets rendered... look at ChipTextField
// 3. context holds - isExpanded -

export function TreeSelectField<O, V extends Value>(props: TreeSelectFieldProps<O, V>): JSX.Element;
export function TreeSelectField<O extends HasIdAndName<V>, V extends Value>(
  props: Optional<TreeSelectFieldProps<O, V>, "getOptionValue" | "getOptionLabel">,
): JSX.Element;
export function TreeSelectField<O, V extends Value>(
  props: Optional<TreeSelectFieldProps<O, V>, "getOptionLabel" | "getOptionValue">,
): JSX.Element {
  const {
    getOptionValue = (opt: O) => (opt as any).id, // if unset, assume O implements HasId
    getOptionLabel = (opt: O) => (opt as any).name, // if unset, assume O implements HasName
    options,
    onSelect,
    values,
    isTree,
    ...otherProps
  } = props;
  console.log(options);
  // inside treeSelectField we look at the context - remove or add options depending on if the field is collapsed
  // isExpanded = true, then flat map through the options

  // use the context in TreeOption - in order to conditionally render the options

  const [isExpanded, setIsExpanded] = useState<ExpandableChildrenState>({
    isExpanded: false,
    setIsExpanded: () => {},
  });

  const contextValue = useMemo<ExpandableChildrenState>(
    () => ({
      isExpanded: false,
      setIsExpanded: () => !isExpanded,
    }),
    [isExpanded, setIsExpanded],
  );

  return (
    // <CollapsedContext.Provider value={contextValue}>
    <SelectFieldBase
      multiselect
      isTree
      placeholder="Select Items"
      {...otherProps}
      options={options}
      getOptionLabel={getOptionLabel}
      getOptionValue={getOptionValue}
      values={values}
      onSelect={(values) => {
        const [selectedValues, selectedOptions] = options
          .filter((o) => values.includes(getOptionValue(o)))
          .reduce(
            (acc, o) => {
              acc[0].push(getOptionValue(o));
              acc[1].push(o);
              return acc;
            },
            [[] as V[], [] as NestedOption<O>[]],
          );
        onSelect(selectedValues, selectedOptions);
      }}
    />
    // </CollapsedContext.Provider>
  );
}

export function useTreeSelectFieldProvider() {
  return useContext(CollapsedContext);
}
