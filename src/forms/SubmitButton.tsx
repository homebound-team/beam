import { ObjectState } from "@homebound/form-state";
import { Button, ButtonProps, useComputed } from "src";

export type SubmitButtonProps<T> = Omit<ButtonProps, "label"> & {
  label?: ButtonProps["label"];
  form: ObjectState<T>;
};

/** Provides a Button that will auto-disable if `formState` is invalid. */
export function SubmitButton<T>(props: SubmitButtonProps<T>) {
  const { form, disabled, onClick, label = "Submit", ...others } = props;
  if (typeof onClick === "string") {
    throw new Error("SubmitButton.onClick doesn't support strings yet");
  }
  // Enable the button whenever the form is dirty, even if the form is partially invalid,
  // because submitting will then force-touch all fields and show all errors instead of
  // just errors-so-far.
  const canSubmit = useComputed(() => {
    return form.dirty || form.isNewEntity;
  }, [form]);
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
