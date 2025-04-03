import { ObjectState } from "@homebound/form-state";
import { Button, ButtonProps, useComputed } from "src";

export type SubmitButtonProps<T> = Omit<ButtonProps, "label"> & {
  label?: ButtonProps["label"];
  enableOn?: "valid" | "dirty";
  form: ObjectState<T>;
};

/** Provides a Button that will auto-disable if `formState` is invalid. */
export function SubmitButton<T>(props: SubmitButtonProps<T>) {
  const { form, disabled, onClick, label = "Submit", enableOn = "dirty", ...others } = props;
  if (typeof onClick === "string") {
    throw new Error("SubmitButton.onClick doesn't support strings yet");
  }
  // Enable the button whenever the form is dirty, even if the form is partially invalid,
  // because submitting will then force-touch all fields and show all errors instead of
  // just errors-so-far.
  const canSubmit = useComputed(() => {
    return enableOn === "valid" ? form.valid : form.dirty || form.isNewEntity;
  }, [form, enableOn]);
  return (
    <Button
      label={label}
      disabled={disabled || !canSubmit}
      onClick={(e) => {
        // canSave will touch any not-yet-keyed-in fields to show errors
        if (form.canSave()) {
          void onClick(e);
        }
      }}
      {...others}
    />
  );
}
