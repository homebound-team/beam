import { BaseFilter } from "src/components/Filters/BaseFilter";
import { Filter } from "src/components/Filters/types";
import { Switch } from "src/inputs/Switch";
import { TestIds } from "src/utils/useTestIds";

export type ToggleFilterProps = { label?: string; enabledValue?: boolean; defaultValue?: boolean };

export function toggleFilter(props: ToggleFilterProps): (key: string) => Filter<boolean> {
  return (key) => new ToggleFilter(key, props);
}

class ToggleFilter extends BaseFilter<boolean, ToggleFilterProps> implements Filter<boolean> {
  render(
    value: boolean | undefined,
    setValue: (value: boolean | undefined) => void,
    tid: TestIds,
    inModal: boolean,
  ): JSX.Element {
    const { defaultValue, enabledValue = true, ...props } = this.props;
    return (
      <Switch
        {...props}
        selected={(value ?? enabledValue) === enabledValue}
        label={this.label}
        labelStyle={inModal ? "filter" : "inline"}
        onChange={(value) => {
          // The switch being "off" might actually mean "true" to the backend.
          // I.e. "Hide do not use" being "off" --> { includeDoNotUse: true }
          const backendValue = !value ? !enabledValue : enabledValue;
          // If the backend value is already the enabled value (i.e. the default), drop it
          // I.e. `{ includeDoNotUse: false }` --> drop it, otherwise keep it.
          setValue(backendValue === enabledValue ? undefined : backendValue);
        }}
        {...this.testId(tid)}
      />
    );
  }

  get hideLabelInModal() {
    return true;
  }
}
