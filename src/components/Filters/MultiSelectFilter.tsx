import { Key } from "react";
import { Filter } from "src/components/Filters/types";
import { MultiSelectField, MultiSelectFieldProps } from "src/inputs/MultiSelectField";
import { ToggleChipGroup } from "src/inputs/ToggleChipGroup";
import { Value } from "src/inputs/Value";
import { defaultLabel } from "src/utils/defaultLabel";
import { defaultTestId } from "src/utils/defaultTestId";
import { TestIds } from "src/utils/useTestIds";

export type MultiFilterProps<O, V extends Value> = Omit<MultiSelectFieldProps<O, V>, "values" | "onSelect"> & {
  defaultValue?: V[];
};

export function multiFilter<O, V extends Key>(props: MultiFilterProps<O, V>): (key: string) => Filter<V[]> {
  return (key) => new MultiFilter(key, props);
}

class MultiFilter<O, V extends Value> implements Filter<V[]> {
  constructor(private key: string, private props: MultiFilterProps<O, V>) {}

  render(
    value: V[] | undefined,
    setValue: (value: V[] | undefined) => void,
    tid: TestIds,
    inModal: boolean,
  ): JSX.Element {
    if (inModal && this.props.options.length <= 8) {
      return (
        <ToggleChipGroup
          label={this.label}
          options={this.props.options.map((o: O) => ({
            label: this.props.getOptionLabel(o),
            value: this.props.getOptionValue(o) as string,
          }))}
          onChange={(values) => {
            setValue(values.length === 0 ? undefined : (values as V[]));
          }}
          values={(value as string[]) || []}
          hideLabel={true}
          {...tid[defaultTestId(this.label)]}
        />
      );
    }

    const { defaultValue, ...props } = this.props;
    return (
      <MultiSelectField<O, V>
        {...props}
        compact
        label={this.label}
        values={value || []}
        inlineLabel
        sizeToContent={!inModal}
        onSelect={(values) => {
          setValue(values.length === 0 ? undefined : values);
        }}
        nothingSelectedText="All"
        {...tid[defaultTestId(this.label)]}
      />
    );
  }

  get label(): string {
    return this.props.label || defaultLabel(this.key as string);
  }

  get defaultValue(): V[] | undefined {
    return this.props.defaultValue;
  }
}
