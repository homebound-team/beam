import { Filter } from "src/components/Filters/types";
import { SelectField } from "src/inputs/SelectField";
import { defaultLabel } from "src/utils/defaultLabel";
import { defaultTestId } from "src/utils/defaultTestId";
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

class BooleanFilter implements Filter<boolean> {
  constructor(private key: string, private props: BooleanFilterProps) {}

  render(
    value: boolean | undefined,
    setValue: (value: boolean | undefined) => void,
    tid: TestIds,
    inModal: boolean,
  ): JSX.Element {
    // Our options are a list of tuples
    const { options = defaultBooleanOptions, label, defaultValue, ...props } = this.props;
    return (
      <SelectField<BooleanOption, string>
        {...props}
        compact
        label={this.label}
        // We use `String(value)` so that `undefined` becomes "undefined"
        value={String(value)}
        inlineLabel
        sizeToContent={!inModal}
        options={options}
        getOptionValue={(o) => String(o[0])}
        getOptionLabel={(o) => o[1]}
        onSelect={(value) => {
          // Change our string "true" / "false" / "undefined" back to boolean | undefined
          const parsedValue = value === "undefined" ? undefined : value === "true";
          setValue(parsedValue);
        }}
        {...tid[defaultTestId(this.label)]}
      />
    );
  }

  get label(): string {
    return this.props.label || defaultLabel(this.key);
  }

  get defaultValue() {
    return this.props.defaultValue;
  }
}

const defaultBooleanOptions: BooleanOption[] = [
  [undefined, "Any"],
  [true, "Yes"],
  [false, "No"],
];
