import { FieldState, ObjectState } from "@homebound/form-state";
import { ReactNode, useMemo } from "react";
import { IconKey, LoadingSkeleton } from "src/components";
import { Css, Only } from "src/Css";
import { useComputed } from "src/hooks";
import { Value } from "src/inputs/Value";
import { TextFieldXss } from "src/interfaces";
import { fail, safeEntries } from "src/utils";
import { BoundCheckboxField, BoundCheckboxFieldProps } from "./BoundCheckboxField";
import { BoundCheckboxGroupField, BoundCheckboxGroupFieldProps } from "./BoundCheckboxGroupField";
import { BoundDateField, BoundDateFieldProps } from "./BoundDateField";
import { BoundMultiSelectField, BoundMultiSelectFieldProps } from "./BoundMultiSelectField";
import { BoundNumberField, BoundNumberFieldProps } from "./BoundNumberField";
import { BoundSelectField, BoundSelectFieldProps } from "./BoundSelectField";
import { BoundTextAreaField, BoundTextAreaFieldProps } from "./BoundTextAreaField";
import { BoundTextField, BoundTextFieldProps } from "./BoundTextField";
import { FormHeading } from "./FormHeading";
import { FormLines } from "./FormLines";

type BoundFieldInputFn<F> = (field: ObjectState<F>[keyof F]) => { component: ReactNode; minWith?: string };

type BoundFormSectionInputs<F> = {
  [K in keyof F]: BoundFieldInputFn<F> | ReactNode;
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

  return (
    <>
      {title && <FormHeading title={title} icon={icon} />}
      {formSection.rows.map((row) => (
        <FormRow key={`fieldGroup-${Object.keys(row).join("-")}`} row={row} formState={formState} />
      ))}
    </>
  );
}

function FormRow<F>({ row, formState }: { row: BoundFormSectionInputs<F>; formState: ObjectState<F> }) {
  /**  Extract the bound input components with their sizing config or render any "custom" JSX node as-is */
  const componentsWithConfig = useMemo(() => {
    return safeEntries(row).map(([key, fieldFnOrCustomNode]) => {
      if (typeof fieldFnOrCustomNode === "function") {
        const field = formState[key] ?? fail(`Field ${key.toString()} not found in formState`);
        const { component, minWith } = fieldFnOrCustomNode(field);

        return { component, key, minWith };
      }

      return { component: fieldFnOrCustomNode as ReactNode, key };
    });
  }, [row, formState]);

  // Maybe not an MVP thing, but we can hook into the formState loading state
  // and show a skeleton from that matches the real forms layout
  const isLoading = useComputed(() => formState.loading, [formState]);

  // Prefer to evenly distribute the available space to each item, but leave some room for the "gap" padding
  // Then fall back to each item's "min-width" to allow for input-specific sizing when the available space is small
  const itemFlexBasis = 100 / componentsWithConfig.length - 3;

  return (
    <div css={Css.df.fww.gap2.$}>
      {componentsWithConfig.map(({ component, key, minWith }) => (
        <div css={Css.mw(minWith ?? "100px").fb(`${itemFlexBasis}%`).fg1.$} key={key.toString()}>
          {isLoading ? <LoadingSkeleton size="lg" /> : component}
        </div>
      ))}
    </div>
  );
}

/**
 * These field component functions are thin wrappers around the `BoundFoo` components which omit
 * certain props that the caller doesn't need to pass or we specifically want to restrict to drive UX consistency.
 */

// Potential TODO: add type overloads for the different HasIdIsh/HasNameIsh combinations, maybe there's a generic way to introspect those types?
export function selectField<O, V extends Value>(props: Omit<BoundSelectFieldProps<O, V>, "field">) {
  return (field: FieldState<any>) => ({ component: <BoundSelectField field={field} {...props} />, minWith: "200px" });
}

export function multiSelectField<O, V extends Value>(props: Omit<BoundMultiSelectFieldProps<O, V>, "field">) {
  return (field: FieldState<any>) => ({
    component: <BoundMultiSelectField field={field} {...props} />,
    minWith: "200",
  });
}

export function textField<X extends Only<TextFieldXss, X>>(props?: Omit<BoundTextFieldProps<X>, "field">) {
  return (field: FieldState<any>) => ({ component: <BoundTextField field={field} {...props} />, minWith: "150px" });
}

export function textAreaField<X extends Only<TextFieldXss, X>>(props?: Omit<BoundTextAreaFieldProps<X>, "field">) {
  return (field: FieldState<any>) => ({ component: <BoundTextAreaField field={field} {...props} />, minWith: "200px" });
}

export function numberField(props?: Omit<BoundNumberFieldProps, "field">) {
  return (field: FieldState<any>) => ({ component: <BoundNumberField field={field} {...props} />, minWith: "150px" });
}

export function dateField(props?: Omit<BoundDateFieldProps, "field">) {
  return (field: FieldState<any>) => ({ component: <BoundDateField field={field} {...props} />, minWith: "150px" });
}

export function checkboxField(props?: Omit<BoundCheckboxFieldProps, "field">) {
  return (field: FieldState<any>) => ({ component: <BoundCheckboxField field={field} {...props} />, minWith: "100px" });
}

export function checkboxGroupField(props: Omit<BoundCheckboxGroupFieldProps, "field">) {
  return (field: FieldState<any>) => ({
    component: <BoundCheckboxGroupField field={field} {...props} />,
    minWith: "200px",
  });
}

// TODO: add the remaining `BoundFoo*` components here
