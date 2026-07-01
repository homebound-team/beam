import { FieldState } from "@homebound/form-state";
import { Observer } from "mobx-react";
import { IconProps } from "src/components";
import { SelectCard, SelectCardProps } from "src/inputs";
import { useTestIds } from "src/utils";
import { defaultLabel } from "src/utils/defaultLabel";

export type BoundSelectCardFieldProps = Omit<SelectCardProps, "label" | "selected" | "onChange"> & {
  field: FieldState<boolean | null | undefined>;
  icon: IconProps["icon"];
  /** Make optional so that callers can override if they want to. */
  onChange?: (values: boolean) => void;
  label?: string;
};

/** Wraps `SelectCard` and binds it to a form field. */
export function BoundSelectCardField(props: BoundSelectCardFieldProps) {
  const { icon, field, onChange = (value) => field.set(value), label = defaultLabel(field.key), ...others } = props;
  const testId = useTestIds(props, field.key);
  return (
    <Observer>
      {() => (
        <SelectCard
          icon={icon}
          label={label}
          selected={field.value ?? false}
          onChange={(selected) => {
            // We are triggering blur manually for checkbox fields due to its transactional nature
            onChange(selected);
            field.maybeAutoSave();
          }}
          disabled={field.readOnly}
          {...testId}
          {...others}
        />
      )}
    </Observer>
  );
}
