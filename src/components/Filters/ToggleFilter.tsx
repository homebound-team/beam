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
    // if the incoming `value` is undefined it means the switch has not been toggled
    // or setValue(...) set it to undefined
    // - set it to false under normal behaviour
    // - set it to true when enabledValue === false
    value = value ?? (enabledValue === false ? true : false);
    return (
      <Switch
        {...props}
        // just like the setValue(...) in onChange,
        // for the visual representation we invert value when enabledValue === false
        selected={enabledValue === false ? !value : value}
        label={this.label}
        labelStyle={inModal ? "filter" : "inline"}
        onChange={(value) => {
          // Basically, when the switch is off we return undefined
          // to signify that no filtering should occur on this field
          // And when the switch is on we return:
          // - true (normal behaviour)
          // - false (if enabledValue is false)
          setValue(enabledValue === false ? (value ? !value : undefined) : (value ? value : undefined));
        }}
        {...this.testId(tid)}
      />
    );
  }

  get hideLabelInModal() {
    return true;
  }
}
