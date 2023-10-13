import { FieldState } from "@homebound/form-state";
import { IconCard, IconCardProps } from "src/inputs";
import { defaultLabel } from "src/utils/defaultLabel";
import { useTestIds } from "src/utils";
import { Observer } from "mobx-react";
import { IconProps } from "src/components";

export type BoundIconCardFieldProps = Omit<IconCardProps, "label" | "selected" | "onChange"> & {
  field: FieldState<boolean | null | undefined>;
  icon: IconProps["icon"];
  /** Make optional so that callers can override if they want to. */
  onChange?: (values: boolean) => void;
  label?: string;
};

/** Wraps `IconCard` and binds it to a form field. */
export function BoundIconCardField(props: BoundIconCardFieldProps) {
  const { icon, field, onChange = (value) => field.set(value), label = defaultLabel(field.key), ...others } = props;
  const testId = useTestIds(props, field.key);
  return (
    <Observer>
      {() => (
        <IconCard
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
