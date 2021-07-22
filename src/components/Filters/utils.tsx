import { Key } from "react";
import {
  BooleanOption,
  FilterDefs,
  ModalFilterItem,
  MultiFilterProps,
  SingleFilterProps,
} from "src/components/Filters";
import { MultiSelectField, SelectField } from "src/inputs";
import { ToggleChipGroup } from "src/inputs/ToggleChipGroup";
import { safeEntries } from "src/utils";

interface GetFilterComponentsOpts<F> {
  filterDefs: FilterDefs<F>;
  filter: F;
  updateFilter: (f: F, k: keyof F, v: any | undefined) => void;
  inModal?: boolean;
}

export function getFilterComponents<F>(props: GetFilterComponentsOpts<F>) {
  const { filterDefs, filter, updateFilter, inModal } = props;

  // Need to set `filterDef` as `any` - not sure exactly why yet... but it breaks things.
  return safeEntries(filterDefs).map(([key, filterDef]: [keyof F, any]) => {
    if (filterDef.kind === "boolean") {
      return wrapIfModal(
        <SelectField
          {...filterDef}
          compact
          value={String(filter[key])}
          inlineLabel
          sizeToContent={!inModal}
          onSelect={(value) => {
            const parsedValue = value === "undefined" ? undefined : value === "true" ? true : false;
            updateFilter(filter, key, parsedValue);
          }}
        />,
        inModal,
        filterDef.label,
      );
    }

    if (filterDef.kind === "single") {
      return wrapIfModal(
        <SelectField
          {...filterDef}
          compact
          value={filter[key]}
          inlineLabel
          sizeToContent={!inModal}
          onSelect={(value) => updateFilter(filter, key, value)}
        />,
        inModal,
        filterDef.label,
      );
    }

    if (filterDef.kind === "multi") {
      if (inModal && filterDef.options.length <= 8) {
        debugger;
        return wrapIfModal(
          <ToggleChipGroup
            label={filterDef.label}
            options={filterDef.options.map((o: any) => ({
              label: filterDef.getOptionLabel(o),
              value: filterDef.getOptionValue(o),
            }))}
            onChange={(values) => updateFilter(filter, key, values)}
            values={(filter[key] || []) as string[]}
            hideLabel={true}
          />,
          inModal,
          filterDef.label,
        );
      }

      return wrapIfModal(
        <MultiSelectField
          {...filterDef}
          compact
          values={filter[key] || []}
          inlineLabel
          sizeToContent={!inModal}
          onSelect={(values) => updateFilter(filter, key, values)}
          nothingSelectedText="All"
        />,
        inModal,
        filterDef.label,
      );
    }
  });
}

function wrapIfModal(filterField: JSX.Element, inModal?: boolean, label?: string) {
  return inModal ? <ModalFilterItem label={label}>{filterField}</ModalFilterItem> : filterField;
}

export function singleFilter<O, V extends Key>(props: SingleFilterProps<O, V>) {
  return { kind: "single" as const, ...props };
}

export function multiFilter<O, V extends Key>(props: MultiFilterProps<O, V>) {
  return { kind: "multi" as const, ...props };
}

const defaultBooleanOptions: BooleanOption[] = [
  [undefined, "Any"],
  [true, "Yes"],
  [false, "No"],
];

interface BooleanFilterProps {
  options?: BooleanOption[];
  label: string;
}
export function booleanFilter({
  options = defaultBooleanOptions,
  label,
}: BooleanFilterProps): { kind: "boolean" } & SingleFilterProps<BooleanOption, string> {
  return {
    kind: "boolean" as const,
    options,
    label,
    getOptionValue: (o) => String(o[0]),
    getOptionLabel: (o) => o[1],
  };
}
