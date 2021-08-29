import { Filter } from "src/components/Filters/types";
import { Switch } from "src/inputs/Switch";
import { defaultLabel } from "src/utils/defaultLabel";
import { defaultTestId } from "src/utils/defaultTestId";
import { TestIds } from "src/utils/useTestIds";

export type ToggleFilterProps = { label?: string; enabledValue?: boolean; defaultValue?: boolean };

export function toggleFilter(props: ToggleFilterProps): (key: string) => Filter<boolean> {
  return (key) => new ToggleFilter(key, props);
}

class ToggleFilter implements Filter<boolean> {
  constructor(private key: string, private props: ToggleFilterProps) {}

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
        selected={(value || false) === enabledValue}
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
        {...tid[defaultTestId(this.label)]}
      />
    );
  }

  get label(): string {
    return this.props.label || defaultLabel(this.key);
  }

  get defaultValue(): boolean | undefined {
    return this.props.defaultValue;
  }

  get hideLabelInModal() {
    return true;
  }
}
