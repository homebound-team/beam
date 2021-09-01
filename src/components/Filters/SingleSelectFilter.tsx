import { Key } from "react";
import { Filter } from "src/components/Filters/types";
import { SelectField, SelectFieldProps } from "src/inputs/SelectField";
import { Value } from "src/inputs/Value";
import { defaultLabel } from "src/utils/defaultLabel";
import { defaultTestId } from "src/utils/defaultTestId";
import { TestIds } from "src/utils/useTestIds";

export type SingleFilterProps<O, V extends Value> = Omit<SelectFieldProps<O, V>, "value" | "onSelect"> & {
  defaultValue?: V;
};

export function singleFilter<O, V extends Key>(props: SingleFilterProps<O, V>): (key: string) => Filter<V> {
  return (key) => new SingleFilter(key, props);
}

class SingleFilter<O, V extends Key> implements Filter<V> {
  constructor(private key: string, private props: SingleFilterProps<O, V>) {}

  render(value: V | undefined, setValue: (value: V | undefined) => void, tid: TestIds, inModal: boolean) {
    const { label, defaultValue, ...props } = this.props;
    return (
      <SelectField<O, V>
        {...props}
        compact
        value={value}
        label={this.label}
        inlineLabel
        sizeToContent={!inModal}
        onSelect={(value) => setValue(value || undefined)}
        {...tid[defaultTestId(this.label)]}
      />
    );
  }

  get label(): string {
    return this.props.label || defaultLabel(this.key as string);
  }

  get defaultValue(): V | undefined {
    return this.props.defaultValue;
  }
}
