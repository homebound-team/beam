import { Key } from "react";
import {
  BooleanOption,
  FilterDefs,
  ModalFilterItem,
  MultiFilterProps,
  SingleFilterProps,
  ToggleFilterProps,
} from "src/components/Filters";
import { MultiSelectField, SelectField, Switch } from "src/inputs";
import { ToggleChipGroup } from "src/inputs/ToggleChipGroup";
import { omitKey, safeEntries, useTestIds } from "src/utils";
import { defaultLabel } from "src/utils/defaultLabel";
import { defaultTestId } from "src/utils/defaultTestId";

interface GetFilterComponentsOpts<F> {
  filterDefs: FilterDefs<F>;
  filter: F;
  updateFilter: (f: F, k: keyof F, v: any | undefined) => void;
  inModal?: boolean;
}

export function getFilterComponents<F>(props: GetFilterComponentsOpts<F>) {
  const { filterDefs, filter, updateFilter, inModal } = props;
  const testId = useTestIds(props, filterTestIdPrefix);

  // Need to set `filterDef` as `any` - not sure exactly why yet... but it breaks things.
  return safeEntries(filterDefs).map(([key, filterDef]: [keyof F, any]) => {
    if (filterDef.kind === "boolean") {
      const { kind, label = defaultLabel(key as string), defaultValue, ...props } = filterDef;
      return wrapIfModal(
        <SelectField
          {...props}
          compact
          label={label}
          value={String(filter[key])}
          inlineLabel
          sizeToContent={!inModal}
          onSelect={(value) => {
            const parsedValue = value === "undefined" ? undefined : value === "true" ? true : false;
            updateFilter(filter, key, parsedValue);
          }}
          {...testId[defaultTestId(label)]}
        />,
        inModal,
        label,
      );
    }

    if (filterDef.kind === "toggle") {
      const { kind, label = defaultLabel(key as string), enabledValue = true, defaultValue, ...props } = filterDef;
      return wrapIfModal(
        <Switch
          {...props}
          selected={filter[key] === enabledValue}
          label={label}
          labelStyle={inModal ? "filter" : "inline"}
          onChange={(value) => updateFilter(filter, key, value)}
          {...testId[defaultTestId(label)]}
        />,
        inModal,
      );
    }

    if (filterDef.kind === "single") {
      const { kind, label = defaultLabel(key as string), defaultValue, ...props } = filterDef;
      return wrapIfModal(
        <SelectField
          {...props}
          compact
          value={filter[key]}
          label={label}
          inlineLabel
          sizeToContent={!inModal}
          onSelect={(value) => updateFilter(filter, key, value)}
          {...testId[defaultTestId(label)]}
        />,
        inModal,
        label,
      );
    }

    if (filterDef.kind === "multi") {
      const { kind, label = defaultLabel(key as string), defaultValue, ...props } = filterDef;
      if (inModal && filterDef.options.length <= 8) {
        return wrapIfModal(
          <ToggleChipGroup
            label={label}
            options={filterDef.options.map((o: any) => ({
              label: filterDef.getOptionLabel(o),
              value: filterDef.getOptionValue(o),
            }))}
            onChange={(values) => updateFilter(filter, key, values)}
            values={(filter[key] || []) as string[]}
            hideLabel={true}
            {...testId[defaultTestId(label)]}
          />,
          inModal,
          label,
        );
      }
      return wrapIfModal(
        <MultiSelectField
          {...props}
          compact
          label={label}
          values={filter[key] || []}
          inlineLabel
          sizeToContent={!inModal}
          onSelect={(values) => updateFilter(filter, key, values)}
          nothingSelectedText="All"
          {...testId[defaultTestId(label)]}
        />,
        inModal,
        label,
      );
    }

    throw new Error(`Unsupported filter ${filterDef.kind}`);
  });
}

function wrapIfModal(filterField: JSX.Element, inModal?: boolean, label?: string) {
  return inModal ? <ModalFilterItem label={label}>{filterField}</ModalFilterItem> : filterField;
}

export function filterBuilder<F>(cb: (f: F) => void, filterDefs: FilterDefs<F>) {
  return (currentFilter: F, key: keyof F, value: any | undefined) => {
    const filterDef = filterDefs[key];
    if (
      value === undefined ||
      (Array.isArray(value) && value.length === 0) ||
      (filterDef.kind === "toggle" && value === false)
    ) {
      cb(omitKey(key, currentFilter));
    } else {
      const enabledValue =
        filterDef.kind === "toggle"
          ? typeof filterDef.enabledValue === "boolean"
            ? filterDef.enabledValue
            : true
          : value;

      cb({ ...currentFilter, [key]: enabledValue });
    }
  };
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
  label?: string;
  defaultValue?: undefined | boolean;
}
export function booleanFilter(
  opts: BooleanFilterProps,
): { kind: "boolean" } & SingleFilterProps<BooleanOption, string> {
  const { options = defaultBooleanOptions, label, defaultValue } = opts;
  return {
    kind: "boolean" as const,
    options,
    label,
    getOptionValue: (o) => String(o[0]),
    getOptionLabel: (o) => o[1],
    // The as any is because we want this to be a `boolean | undefined` for usePersistedFilter
    // even though the rest of the singleFilter we mixin expects our munged string values
    defaultValue: (options.find((o) => o[0] === defaultValue) || [])[0] as any,
  };
}

export function toggleFilter(props: ToggleFilterProps): { kind: "toggle" } & ToggleFilterProps {
  return { kind: "toggle" as const, ...props };
}

export const filterTestIdPrefix = "filter";
