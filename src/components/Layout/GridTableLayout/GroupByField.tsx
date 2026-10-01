import { MenuSelectField } from "src/inputs/MenuSelectField/MenuSelectField";
import type { Value } from "src/inputs/Value";

export type GroupByFieldProps<G extends Value = string> = {
  value: G;
  setValue: (g: G) => void;
  options: Array<{ id: G; name: string }>;
};

/** Group-by select shared by the filter panel and the desktop inline toolbar control. */
export function GroupByField<G extends Value = string>({ value, setValue, options }: GroupByFieldProps<G>) {
  return (
    <MenuSelectField
      label="Group by"
      labelStyle="inline"
      options={options}
      getOptionValue={(o) => o.id}
      getOptionLabel={(o) => o.name}
      value={value}
      onSelect={(g) => g && setValue(g)}
    />
  );
}
