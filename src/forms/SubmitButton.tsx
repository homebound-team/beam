import { ObjectState } from "@homebound/form-state";
import { Button, ButtonProps, useComputed } from "src";

export type SubmitButtonProps<T> = Omit<ButtonProps, "label"> & {
  label?: ButtonProps["label"];
  form: ObjectState<T>;
};

/** Provides a Button that will auto-disable if `formState` is invalid. */
export function SubmitButton<T>(props: SubmitButtonProps<T>) {
  const { form, disabled, onClick, label = "Submit", ...others } = props;
  const valid = useComputed(() => form.valid, [form]);
  return (
    <Button
      label={label}
      disabled={!valid || disabled}
      onClick={(e) => {
        // canSave will touch any not-yet-keyed-in fields to show errors
        if (form.canSave()) {
          if (typeof onClick === "string") {
            throw new Error("onClick cannot be a string");
          } else {
            onClick(e);
          }
        }
      }}
      {...others}
    />
  );
}
