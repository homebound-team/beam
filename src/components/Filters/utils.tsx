import { Key } from "react";
import {
  BooleanOption,
  FilterDefs,
  ModalFilterItem,
  MultiFilterProps,
  SingleFilterProps,
} from "src/components/Filters";
import { MultiSelectField, SelectField } from "src/inputs";

interface GetFilterComponentsProps<F> {
  filterKeys: (keyof F)[];
  filterDefs: FilterDefs<F>;
  filter: F;
  updateFilter: (f: F, k: keyof F, v: any | undefined) => void;
  inModal?: boolean;
}

export function getFilterComponents<F>(props: GetFilterComponentsProps<F>) {
  const { filterKeys, filterDefs, filter, updateFilter, inModal } = props;

  return filterKeys.map((key) => {
    const filterDef = filterDefs[key] as any;

    if (filterDef.kind === "boolean") {
      return (
        <WrapIfModal label={filterDef.label} inModal={inModal}>
          <SelectField
            {...filterDef}
            compact
            value={String(filter[key])}
            inlineLabel
            onSelect={(value) => {
              const parsedValue = value === "undefined" ? undefined : value === "true" ? true : false;
              updateFilter(filter, key, parsedValue);
            }}
          />
        </WrapIfModal>
      );
    }

    if (filterDef.kind === "single") {
      return (
        <WrapIfModal label={filterDef.label} inModal={inModal}>
          <SelectField
            {...filterDef}
            compact
            value={filter[key]}
            inlineLabel
            onSelect={(value) => updateFilter(filter, key, value)}
          />
        </WrapIfModal>
      );
    }

    if (filterDef.kind === "multi") {
      return (
        <WrapIfModal label={filterDef.label} inModal={inModal}>
          <MultiSelectField
            {...filterDef}
            compact
            values={filter[key] || []}
            inlineLabel
            onSelect={(values) => updateFilter(filter, key, values)}
          />
        </WrapIfModal>
      );
    }
  });
}

function WrapIfModal({
  inModal,
  label,
  children,
}: {
  inModal?: boolean;
  label?: string;
  children: JSX.Element;
}): JSX.Element {
  return inModal ? <ModalFilterItem label={label}>{children}</ModalFilterItem> : children;
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
