import { BaseFilter } from "src/components/Filters/BaseFilter";
import { Filter } from "src/components/Filters/types";
import { Switch } from "src/inputs/Switch";
import { TestIds } from "src/utils/useTestIds";

export type ToggleFilterProps<V> = {
  label?: string;
  onValue?: V | undefined;
  offValue?: V | undefined;
  defaultValue?: V | undefined;
};

/**
 * Provides a two-state "on/off" filter.
 *
 * By default the on/off values are `on === true` and `off === undefined`.
 *
 * You can flip the on/off values by passing `onValue: false`, in which case
 * `on === false` and off === undefined`.
 *
 * Or you can set on/off directly, by passing both `onValue` and `offValue`.
 */
export function toggleFilter<V>(props: ToggleFilterProps<V>): (key: string) => Filter<V> {
  return (key) =>
    new ToggleFilter(key, {
      // If the user has set the offValue, that should be the default b/c we're only a two-state
      defaultValue: props.offValue,
      ...props,
    });
}

class ToggleFilter<V> extends BaseFilter<V, ToggleFilterProps<V>> implements Filter<V> {
  render(value: V | undefined, setValue: (value: V | undefined) => void, tid: TestIds, inModal: boolean): JSX.Element {
    const { defaultValue, onValue = true as any as V, offValue = undefined, ...props } = this.props;
    return (
      <Switch
        {...props}
        selected={value === undefined ? false : value === onValue}
        label={this.label}
        labelStyle={inModal ? "filter" : "inline"}
        onChange={(on) => {
          setValue(on ? onValue : offValue);
        }}
        {...this.testId(tid)}
      />
    );
  }

  get hideLabelInModal() {
    return true;
  }
}
