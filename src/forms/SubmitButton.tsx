import { ObjectState } from "@homebound/form-state";
import { useLocalObservable } from "mobx-react";
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

  const state = useLocalObservable(() => ({ clicked: false }));

  const canSubmit = useComputed(() => {
    // We generally prefer to "enable when dirty && valid", *but* when creating new entities,
    // showing Save as enabled can be a good way for the user to "try and save" and get all the
    // previously-hidden error messages to show up (b/c `canSave` touches the form fields).
    return form.isNewEntity && !state.clicked ? true : form.dirty && form.valid;
  }, [form]);
  return (
    <Button
      label={label}
      disabled={disabled || !canSubmit}
      onClick={(e) => {
        // canSave will touch any not-yet-keyed-in fields to show errors
        state.clicked = true;
        if (form.canSave()) {
          return onClick(e);
        }
      }}
      {...others}
    />
  );
}
