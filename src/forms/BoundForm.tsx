import { FieldState, ObjectState } from "@homebound/form-state";
import { ReactNode, useMemo } from "react";
import { LoadingSkeleton } from "src/components";
import { Css, Only } from "src/Css";
import { useComputed } from "src/hooks";
import { Value } from "src/inputs/Value";
import { TextFieldXss } from "src/interfaces";
import { fail, safeEntries, useTestIds } from "src/utils";
import { BoundCheckboxField, BoundCheckboxFieldProps } from "./BoundCheckboxField";
import { BoundCheckboxGroupField, BoundCheckboxGroupFieldProps } from "./BoundCheckboxGroupField";
import { BoundDateField, BoundDateFieldProps } from "./BoundDateField";
import { BoundDateRangeField, BoundDateRangeFieldProps } from "./BoundDateRangeField";
import { BoundIconCardField, BoundIconCardFieldProps } from "./BoundIconCardField";
import { BoundIconCardGroupField, BoundIconCardGroupFieldProps } from "./BoundIconCardGroupField";
import { BoundMultiLineSelectField, BoundMultiLineSelectFieldProps } from "./BoundMultiLineSelectField";
import { BoundMultiSelectField, BoundMultiSelectFieldProps } from "./BoundMultiSelectField";
import { BoundNumberField, BoundNumberFieldProps } from "./BoundNumberField";
import { BoundRadioGroupField, BoundRadioGroupFieldProps } from "./BoundRadioGroupField";
import { BoundRichTextField, BoundRichTextFieldProps } from "./BoundRichTextField";
import { BoundSelectField, BoundSelectFieldProps } from "./BoundSelectField";
import { BoundSwitchField, BoundSwitchFieldProps } from "./BoundSwitchField";
import { BoundTextAreaField, BoundTextAreaFieldProps } from "./BoundTextAreaField";
import { BoundTextField, BoundTextFieldProps } from "./BoundTextField";
import { BoundToggleChipGroupField, BoundToggleChipGroupFieldProps } from "./BoundToggleChipGroupField";
import { BoundTreeSelectField, BoundTreeSelectFieldProps } from "./BoundTreeSelectField";
import { FormLines } from "./FormLines";

type BoundFieldInputFnReturn = { component: ReactNode; minWith: string };
type BoundFieldInputFn<F> = (field: ObjectState<F>[keyof F]) => BoundFieldInputFnReturn;

type BoundFormRowInputs<F> = {
  [K in keyof F]: BoundFieldInputFn<F> | ReactNode;
};

export type BoundFormInputConfig<F> = BoundFormRowInputs<F>[];

export type BoundFormProps<F> = {
  /** Either a single "section" config object, or a list of sections */
  inputRows: BoundFormInputConfig<F>;
  formState: ObjectState<F>;
};

/**
 * A wrapper around the "Bound" form components for the form-state library to render a standard (and responsive) form layout.
 * * Each row is an object of bound input components keyed by their formState key, which are rendered in a responsive flex layout.
 * * Example usage:
 * ```tsx
 *    <BoundFormComponent
        inputRows={[
          { firstName: boundTextField(), middleInitial: boundTextField(), lastName: boundTextField() },
          { bio: boundTextAreaField() },
        ]}
        formState={formState}
      />
 * ```
 */
export function BoundForm<F>(props: BoundFormProps<F>) {
  const { inputRows, formState } = props;

  const tid = useTestIds({}, "boundForm");

  return (
    <div {...tid}>
      <FormLines labelSuffix={{ required: "*" }} width="full" gap={4}>
        {inputRows.map((row) => (
          <FormRow key={`fieldGroup-${Object.keys(row).join("-")}`} row={row} formState={formState} />
        ))}
      </FormLines>
    </div>
  );
}

function FormRow<F>({ row, formState }: { row: BoundFormRowInputs<F>; formState: ObjectState<F> }) {
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

  // We can hook into the formState loading state and show a skeleton from that matches the real forms layout
  const isLoading = useComputed(() => formState.loading, [formState]);

  // Prefer to evenly distribute the available space to each item, but leave some room for the "gap" padding
  // Then fall back to each item's "min-width" to allow for input-specific sizing when the available space is small
  const itemFlexBasis = 100 / componentsWithConfig.length - 3;

  return (
    <div css={Css.df.fww.gap2.$}>
      {componentsWithConfig.map(({ component, key, minWith }) => (
        <div css={Css.mw(minWith).fb(`${itemFlexBasis}%`).fg1.$} key={key.toString()}>
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

// We map the `field` to the bound component automatically for the caller.
type KeysToOmit = "field";

// Potential TODO: add type overloads for the different HasIdIsh/HasNameIsh combinations, maybe there's a generic way to introspect those types?
export function boundSelectField<O, V extends Value>(props: Omit<BoundSelectFieldProps<O, V>, KeysToOmit>) {
  return (field: FieldState<any>): BoundFieldInputFnReturn => ({
    component: <BoundSelectField field={field} {...props} />,
    minWith: "200px",
  });
}

export function boundMultiSelectField<O, V extends Value>(props: Omit<BoundMultiSelectFieldProps<O, V>, KeysToOmit>) {
  return (field: FieldState<any>): BoundFieldInputFnReturn => ({
    component: <BoundMultiSelectField field={field} {...props} />,
    minWith: "200px",
  });
}

export function boundMultilineSelectField<O, V extends Value>(
  props: Omit<BoundMultiLineSelectFieldProps<O, V>, KeysToOmit>,
) {
  return (field: FieldState<any>): BoundFieldInputFnReturn => ({
    component: <BoundMultiLineSelectField field={field} {...props} />,
    minWith: "200px",
  });
}

export function boundTextField<X extends Only<TextFieldXss, X>>(props?: Omit<BoundTextFieldProps<X>, KeysToOmit>) {
  return (field: FieldState<any>): BoundFieldInputFnReturn => ({
    component: <BoundTextField field={field} {...props} />,
    minWith: "150px",
  });
}

export function boundTextAreaField<X extends Only<TextFieldXss, X>>(
  props?: Omit<BoundTextAreaFieldProps<X>, KeysToOmit>,
) {
  return (field: FieldState<any>): BoundFieldInputFnReturn => ({
    component: <BoundTextAreaField field={field} {...props} />,
    minWith: "200px",
  });
}

export function boundNumberField(props?: Omit<BoundNumberFieldProps, KeysToOmit>) {
  return (field: FieldState<any>): BoundFieldInputFnReturn => ({
    component: <BoundNumberField field={field} {...props} />,
    minWith: "150px",
  });
}

export function boundDateField(props?: Omit<BoundDateFieldProps, KeysToOmit>) {
  return (field: FieldState<any>): BoundFieldInputFnReturn => ({
    component: <BoundDateField field={field} {...props} />,
    minWith: "150px",
  });
}

export function boundDateRangeField(props?: Omit<BoundDateRangeFieldProps, KeysToOmit>) {
  return (field: FieldState<any>): BoundFieldInputFnReturn => ({
    component: <BoundDateRangeField field={field} {...props} />,
    minWith: "150px",
  });
}

export function boundCheckboxField(props?: Omit<BoundCheckboxFieldProps, KeysToOmit>) {
  return (field: FieldState<any>): BoundFieldInputFnReturn => ({
    component: <BoundCheckboxField field={field} {...props} />,
    minWith: "100px",
  });
}

export function boundCheckboxGroupField(props: Omit<BoundCheckboxGroupFieldProps, KeysToOmit>) {
  return (field: FieldState<any>): BoundFieldInputFnReturn => ({
    component: <BoundCheckboxGroupField field={field} {...props} />,
    minWith: "200px",
  });
}

export function boundIconCardField(props: Omit<BoundIconCardFieldProps, KeysToOmit>) {
  return (field: FieldState<any>): BoundFieldInputFnReturn => ({
    component: <BoundIconCardField field={field} {...props} />,
    minWith: "150px",
  });
}

export function boundIconCardGroupField<V extends Value>(props: Omit<BoundIconCardGroupFieldProps<V>, KeysToOmit>) {
  return (field: FieldState<any>): BoundFieldInputFnReturn => ({
    component: <BoundIconCardGroupField field={field} {...props} />,
    minWith: "100%",
  });
}

export function boundRadioGroupField<K extends string>(props: Omit<BoundRadioGroupFieldProps<K>, KeysToOmit>) {
  return (field: FieldState<any>): BoundFieldInputFnReturn => ({
    component: <BoundRadioGroupField field={field} {...props} />,
    minWith: "200px",
  });
}

export function boundRichTextField(props?: Omit<BoundRichTextFieldProps, KeysToOmit>) {
  return (field: FieldState<any>): BoundFieldInputFnReturn => ({
    component: <BoundRichTextField field={field} {...props} />,
    minWith: "200px",
  });
}

export function boundSwitchField(props?: Omit<BoundSwitchFieldProps, KeysToOmit>) {
  return (field: FieldState<any>): BoundFieldInputFnReturn => ({
    component: <BoundSwitchField field={field} {...props} />,
    minWith: "100px",
  });
}

export function boundToggleChipGroupField(props: Omit<BoundToggleChipGroupFieldProps, KeysToOmit>) {
  return (field: FieldState<any>): BoundFieldInputFnReturn => ({
    component: <BoundToggleChipGroupField field={field} {...props} />,
    minWith: "100%",
  });
}

export function boundTreeSelectField<O, V extends Value>(props: Omit<BoundTreeSelectFieldProps<O, V>, KeysToOmit>) {
  return (field: FieldState<any>): BoundFieldInputFnReturn => ({
    component: <BoundTreeSelectField field={field} {...props} />,
    minWith: "200px",
  });
}
