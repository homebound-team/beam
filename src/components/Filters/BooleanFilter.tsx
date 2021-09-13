import { BaseFilter } from "src/components/Filters/BaseFilter";
import { Filter } from "src/components/Filters/types";
import { SelectField } from "src/inputs/SelectField";
import { TestIds } from "src/utils/useTestIds";

export type BooleanOption = [boolean | undefined, string];

export interface BooleanFilterProps {
  options?: BooleanOption[];
  label?: string;
  defaultValue?: undefined | boolean;
}

export function booleanFilter(props: BooleanFilterProps): (key: string) => Filter<boolean> {
  return (key) => new BooleanFilter(key, props);
}

class BooleanFilter extends BaseFilter<boolean, BooleanFilterProps> implements Filter<boolean> {
  render(
    value: boolean | undefined,
    setValue: (value: boolean | undefined) => void,
    tid: TestIds,
    inModal: boolean,
    vertical: boolean,
  ): JSX.Element {
    // Our options are a list of tuples
    const { options = defaultBooleanOptions, label, defaultValue, ...props } = this.props;
    return (
      <SelectField<BooleanOption, string>
        {...props}
        compact={!vertical}
        label={this.label}
        // We use `String(value)` so that `undefined` becomes "undefined"
        value={String(value)}
        hideLabel={inModal}
        inlineLabel={!inModal && !vertical}
        sizeToContent={!inModal && !vertical}
        options={options}
        getOptionValue={(o) => String(o[0])}
        getOptionLabel={(o) => o[1]}
        onSelect={(value) => {
          // Change our string "true" / "false" / "undefined" back to boolean | undefined
          const parsedValue = value === "undefined" ? undefined : value === "true";
          setValue(parsedValue);
        }}
        {...this.testId(tid)}
      />
    );
  }
}

const defaultBooleanOptions: BooleanOption[] = [
  [undefined, "Any"],
  [true, "Yes"],
  [false, "No"],
];
