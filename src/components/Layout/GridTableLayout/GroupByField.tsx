import { SelectField } from "src/inputs/SelectField";
import { Value } from "src/inputs/Value";

export type GroupByFieldProps<G extends Value = string> = {
  value: G;
  setValue: (g: G) => void;
  options: Array<{ id: G; name: string }>;
};

/** Group-by select shared by the filter panel and the desktop inline toolbar control. */
export function GroupByField<G extends Value = string>({ value, setValue, options }: GroupByFieldProps<G>) {
  return (
    <SelectField
      label="Group by"
      labelStyle="inline"
      sizeToContent
      options={options}
      getOptionValue={(o) => o.id}
      getOptionLabel={(o) => o.name}
      value={value}
      onSelect={(g) => g && setValue(g)}
    />
  );
}
