import { FieldState, ObjectState } from "@homebound/form-state";
import { Fragment, ReactNode } from "react";
import { IconKey, LoadingSkeleton } from "src/components";
import { Only } from "src/Css";
import { useComputed } from "src/hooks";
import { Value } from "src/inputs/Value";
import { TextFieldXss } from "src/interfaces";
import { fail, safeEntries } from "src/utils";
import { BoundCheckboxField, BoundCheckboxFieldProps } from "./BoundCheckboxField";
import { BoundDateField, BoundDateFieldProps } from "./BoundDateField";
import { BoundMultiSelectField, BoundMultiSelectFieldProps } from "./BoundMultiSelectField";
import { BoundNumberField, BoundNumberFieldProps } from "./BoundNumberField";
import { BoundSelectField, BoundSelectFieldProps } from "./BoundSelectField";
import { BoundTextAreaField, BoundTextAreaFieldProps } from "./BoundTextAreaField";
import { BoundTextField, BoundTextFieldProps } from "./BoundTextField";
import { FormHeading } from "./FormHeading";
import { FieldGroup, FormLines } from "./FormLines";

type BoundFormSectionInputs<F> = {
  [K in keyof F]: ((field: ObjectState<F>[keyof F]) => ReactNode) | ReactNode;
};

type BoundFormSection<F> = {
  title?: string;
  icon?: IconKey;
  rows: BoundFormSectionInputs<F>[];
};

export type BoundFormInputConfig<F> = BoundFormSection<F> | BoundFormSection<F>[];

type BoundFormProps<F> = {
  /** Either a single "section" config object, or a list of sections */
  inputConfig: BoundFormInputConfig<F>;
  formState: ObjectState<F>;
};

export function BoundForm<F>(props: BoundFormProps<F>) {
  const { inputConfig, formState } = props;

  const inputConfigAsArray = Array.isArray(inputConfig) ? inputConfig : [inputConfig];

  return (
    <FormLines labelSuffix={{ required: "*" }} width="full" gap={4}>
      {inputConfigAsArray.map((section, i) => {
        return <Section key={`section-${i}`} formSection={section} formState={formState} />;
      })}
    </FormLines>
  );
}

function Section<F>({ formSection, formState }: { formSection: BoundFormSection<F>; formState: ObjectState<F> }) {
  const { title, icon } = formSection;

  // Maybe not an MVP thing, but we can hook into the formState loading state
  // and show a skeleton from that matches the real forms layout
  const isLoading = useComputed(() => formState.loading, [formState]);

  return (
    <>
      {title && <FormHeading title={title} icon={icon} />}
      {formSection.rows.map((row, i) => (
        <FieldGroup key={`fieldGroup-${Object.keys(row).join("-")}`}>
          {safeEntries(row).map(([key, fieldFnOrCustomNode]) => {
            if (isLoading) return <LoadingSkeleton size="lg" key={key.toString()} />;

            // Pass the `field` from formState to wrapping bound component function
            if (typeof fieldFnOrCustomNode === "function") {
              const field = formState[key] ?? fail(`Field ${key.toString()} not found in formState`);
              return <Fragment key={key.toString()}>{fieldFnOrCustomNode(field)}</Fragment>;
            }

            // Otherwise, render the custom node directly
            return <Fragment key={key.toString()}>{fieldFnOrCustomNode}</Fragment>;
          })}
        </FieldGroup>
      ))}
    </>
  );
}

/**
 * These field component functions are thin wrappers around the `BoundFoo` components which omit
 * certain props that the caller doesn't need to pass or we specifically want to restrict to drive UX consistency.
 */

// Potential TODO: add type overloads for the different HasIdIsh/HasNameIsh combinations, maybe there's a generic way to introspect those types?
export function selectField<O, V extends Value>(props: Omit<BoundSelectFieldProps<O, V>, "field">) {
  return (field: FieldState<any>) => <BoundSelectField field={field} {...props} />;
}

export function multiSelectField<O, V extends Value>(props: Omit<BoundMultiSelectFieldProps<O, V>, "field">) {
  return (field: FieldState<any>) => <BoundMultiSelectField field={field} {...props} />;
}

export function textField<X extends Only<TextFieldXss, X>>(props?: Omit<BoundTextFieldProps<X>, "field">) {
  return (field: FieldState<any>) => <BoundTextField field={field} {...props} />;
}

export function textAreaField<X extends Only<TextFieldXss, X>>(props?: Omit<BoundTextAreaFieldProps<X>, "field">) {
  return (field: FieldState<any>) => <BoundTextAreaField field={field} {...props} />;
}

export function numberField(props?: Omit<BoundNumberFieldProps, "field">) {
  return (field: FieldState<any>) => <BoundNumberField field={field} {...props} />;
}

export function dateField(props?: Omit<BoundDateFieldProps, "field">) {
  return (field: FieldState<any>) => <BoundDateField field={field} {...props} />;
}

export function checkboxField(props?: Omit<BoundCheckboxFieldProps, "field">) {
  return (field: FieldState<any>) => <BoundCheckboxField field={field} {...props} />;
}

// TODO: add the remaining `BoundFoo*` components here
